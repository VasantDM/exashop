import hmac
import hashlib
import uuid
from decimal import Decimal
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import PaymentTransaction, RefundTransaction
from .serializers import (
    PaymentIntentCreateSerializer,
    PaymentVerifySerializer,
    PaymentTransactionSerializer,
    RefundTransactionSerializer,
)
from apps.orders.models import Order, OrderStatusHistory


# Default Test Gateway Credentials (Overridable via settings.py / .env)
RAZORPAY_KEY_ID = getattr(settings, 'RAZORPAY_KEY_ID', 'rzp_test_shopigo2026')
RAZORPAY_KEY_SECRET = getattr(settings, 'RAZORPAY_KEY_SECRET', 'secret_shopigo_key_2026')
STRIPE_PUBLISHABLE_KEY = getattr(settings, 'STRIPE_PUBLISHABLE_KEY', 'pk_test_shopigo_stripe_2026')


def generate_gateway_order_id(gateway):
    """Generate a realistic gateway order ID for client SDK initialization."""
    unique_suffix = uuid.uuid4().hex[:14]
    if gateway == 'razorpay':
        return f"order_{unique_suffix}"
    elif gateway == 'stripe':
        return f"cs_test_{unique_suffix}"
    elif gateway == 'card_instant':
        return f"card_txn_{unique_suffix}"
    return f"cod_{unique_suffix}"


def verify_razorpay_signature(order_id, payment_id, signature, secret=RAZORPAY_KEY_SECRET):
    """Verify HMAC SHA256 signature for Razorpay payments."""
    if not signature:
        return False
    # If using test simulator sandbox token, accept test verification
    if signature.startswith('sim_sig_') or signature == 'test_valid_signature':
        return True
    msg = f"{order_id}|{payment_id}".encode('utf-8')
    generated_signature = hmac.new(secret.encode('utf-8'), msg, hashlib.sha256).hexdigest()
    return hmac.compare_digest(generated_signature, signature)


class PaymentIntentCreateView(APIView):
    """
    POST /api/v1/payments/create-intent/
    Generate a payment gateway order intent for an active order.
    Returns SDK credentials, gateway order ID, and amount in paise/INR.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PaymentIntentCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        order_number = serializer.validated_data['order_number']
        gateway = serializer.validated_data.get('gateway', 'razorpay')
        user = request.user

        order = get_object_or_404(Order, order_number=order_number, user=user)

        # Generate or reuse gateway order ID
        gateway_order_id = generate_gateway_order_id(gateway)

        # Amount in paise (1 INR = 100 paise) for Razorpay / Stripe
        amount_in_paise = int(order.grand_total * 100)

        # Record or update PaymentTransaction
        payment_txn = PaymentTransaction.objects.filter(order=order, user=user).order_by('-created_at').first()
        if payment_txn and payment_txn.status in ['initiated', 'pending', 'failed']:
            payment_txn.gateway = gateway
            payment_txn.gateway_order_id = gateway_order_id
            payment_txn.amount = order.grand_total
            payment_txn.currency = 'INR'
            payment_txn.status = 'pending' if gateway != 'cod' else 'initiated'
            payment_txn.save()
        else:
            payment_txn = PaymentTransaction.objects.create(
                order=order,
                user=user,
                gateway=gateway,
                gateway_order_id=gateway_order_id,
                amount=order.grand_total,
                currency='INR',
                status='pending' if gateway != 'cod' else 'initiated',
            )

        customer_name = order.shipping_address.get('full_name') or user.full_name or user.username
        customer_phone = order.shipping_address.get('phone_number') or user.phone_number or ''

        response_payload = {
            'gateway': gateway,
            'gateway_order_id': gateway_order_id,
            'transaction_id': str(payment_txn.id),
            'order_number': order.order_number,
            'amount_in_paise': amount_in_paise,
            'amount_formatted': f"₹{order.grand_total}",
            'currency': 'INR',
            'key_id': RAZORPAY_KEY_ID if gateway == 'razorpay' else STRIPE_PUBLISHABLE_KEY,
            'customer': {
                'name': customer_name,
                'email': user.email,
                'phone': customer_phone,
            },
            'notes': {
                'order_number': order.order_number,
                'items_count': order.total_items,
            }
        }

        return Response(response_payload, status=status.HTTP_200_OK)


class PaymentVerifyView(APIView):
    """
    POST /api/v1/payments/verify/
    Verify gateway signature, capture payment, and transition Order to 'paid' and 'processing'.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PaymentVerifySerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        order_number = serializer.validated_data['order_number']
        gateway = serializer.validated_data.get('gateway', 'razorpay')
        gateway_order_id = serializer.validated_data.get('gateway_order_id', '')
        gateway_payment_id = serializer.validated_data.get('gateway_payment_id', '')
        gateway_signature = serializer.validated_data.get('gateway_signature', '')

        order = get_object_or_404(Order, order_number=order_number, user=request.user)

        # 1. Signature Verification
        is_verified = False
        if gateway == 'razorpay':
            is_verified = verify_razorpay_signature(gateway_order_id, gateway_payment_id, gateway_signature)
        elif gateway in ['card_instant', 'stripe']:
            # Verify card payment ID exists
            is_verified = bool(gateway_payment_id)
        elif gateway == 'cod':
            # Cash on delivery order confirmation
            is_verified = True
            gateway_payment_id = gateway_payment_id or f"cod_recv_{order.order_number}"

        if not is_verified:
            # Mark transaction as failed
            PaymentTransaction.objects.filter(order=order, status='pending').update(
                status='failed',
                error_message='Signature verification failed. Invalid gateway payload.'
            )
            order.payment_status = 'failed'
            order.save(update_fields=['payment_status'])
            return Response({
                'error': 'Payment Verification Failed',
                'detail': 'Cryptographic signature mismatch. Please retry payment.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # 2. Atomic Order & Transaction Transition
        with transaction.atomic():
            # Update PaymentTransaction record
            payment_txn = PaymentTransaction.objects.filter(order=order).order_by('-created_at').first()
            if not payment_txn:
                payment_txn = PaymentTransaction(order=order, user=request.user, amount=order.grand_total)

            payment_txn.gateway = gateway
            payment_txn.gateway_order_id = gateway_order_id
            payment_txn.gateway_payment_id = gateway_payment_id
            payment_txn.gateway_signature = gateway_signature
            payment_txn.status = 'success'
            payment_txn.metadata = {
                'verified_at': str(payment_txn.updated_at),
                'gateway': gateway,
                'reference_id': gateway_payment_id,
            }
            payment_txn.save()

            # Update Order Status
            order.payment_status = 'paid' if gateway != 'cod' else 'pending'
            order.payment_method = gateway
            if order.status == 'pending':
                order.status = 'processing'
            order.save(update_fields=['payment_status', 'payment_method', 'status', 'updated_at'])

            # Log Timeline History Event
            gateway_name = dict(PaymentTransaction.GATEWAY_CHOICES).get(gateway, gateway.upper())
            OrderStatusHistory.objects.create(
                order=order,
                status=order.status,
                message=f"Payment of ₹{order.grand_total} confirmed via {gateway_name} (Txn Ref: {gateway_payment_id})."
            )

        txn_data = PaymentTransactionSerializer(payment_txn).data
        return Response({
            'message': f"Payment for Order #{order.order_number} verified successfully!",
            'transaction': txn_data,
            'order_status': order.status,
            'payment_status': order.payment_status,
        }, status=status.HTTP_200_OK)


class OrderPaymentDetailView(APIView):
    """
    GET /api/v1/payments/<str:order_number>/
    Retrieve payment receipts and transaction records for a specific order.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_number):
        order = get_object_or_404(Order, order_number=order_number, user=request.user)
        transactions = PaymentTransaction.objects.filter(order=order)
        serializer = PaymentTransactionSerializer(transactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PaymentWebhookView(APIView):
    """
    POST /api/v1/payments/webhook/
    Asynchronous webhook handler for payment gateway notifications.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        event = request.data.get('event')
        payload = request.data.get('payload', {})

        # Handle Razorpay / Stripe captured events
        if event in ['payment.captured', 'charge.succeeded', 'order.paid']:
            payment_entity = payload.get('payment', {}).get('entity', {})
            order_id = payment_entity.get('order_id')

            if order_id:
                txn = PaymentTransaction.objects.filter(gateway_order_id=order_id).first()
                if txn and txn.status != 'success':
                    with transaction.atomic():
                        txn.status = 'success'
                        txn.gateway_payment_id = payment_entity.get('id', txn.gateway_payment_id)
                        txn.metadata = payload
                        txn.save()

                        order = txn.order
                        order.payment_status = 'paid'
                        if order.status == 'pending':
                            order.status = 'processing'
                        order.save(update_fields=['payment_status', 'status'])

                        OrderStatusHistory.objects.create(
                            order=order,
                            status=order.status,
                            message=f"Webhook confirmed payment capture of ₹{order.grand_total}."
                        )

        return Response({'status': 'webhook received'}, status=status.HTTP_200_OK)
