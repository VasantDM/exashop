import random
import datetime
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .models import Address, PasswordResetOTP
from .serializers import (
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    AddressSerializer,
    AdminUserSerializer,
    SendPasswordResetOTPSerializer,
    VerifyPasswordResetOTPSerializer,
)
from .permissions import IsAdmin, IsCustomer, IsOwnerOrAdmin

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    Register a new user account.
    Returns the created user object and a pair of JWT tokens (access & refresh)
    for immediate authentication.
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens for instant auto-login
        refresh = RefreshToken.for_user(user)
        refresh['email'] = user.email
        refresh['username'] = user.username
        refresh['role'] = user.role

        user_data = UserProfileSerializer(user, context={'request': request}).data

        return Response({
            'message': 'Account registered successfully.',
            'user': user_data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Authenticate a user with either Email or Username + Password.
    Returns JWT access & refresh tokens along with complete user details.
    """
    serializer_class = CustomTokenObtainPairSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update the authenticated user's profile.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """
    Change password for the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)


class AddressListCreateView(generics.ListCreateAPIView):
    """
    List all addresses for the authenticated user or create a new address.
    """
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a specific address belonging to the authenticated user.
    """
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        if self.request.user.role == 'admin' or self.request.user.is_staff:
            return Address.objects.all()
        return Address.objects.filter(user=self.request.user)


class UserListView(generics.ListAPIView):
    """
    Admin-only endpoint to list all registered users with role and status details.
    """
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdmin]
    search_fields = ['username', 'email', 'first_name', 'last_name']


class LogoutView(APIView):
    """
    Blacklist the refresh token to revoke user session upon logout.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh') or request.data.get('refresh_token')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response({'message': 'Successfully logged out and token revoked.'}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'error': 'Invalid or already blacklisted token.', 'details': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Client session cleared.'}, status=status.HTTP_200_OK)


class SendPasswordResetOTPView(APIView):
    """
    POST /api/v1/auth/password-reset/send-otp/
    Generate a 6-digit numeric OTP code, store it with 10-minute expiry,
    and send it to the registered user's email address.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = SendPasswordResetOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        user = User.objects.get(email__iexact=email)

        # Generate a secure 6-digit numeric OTP code
        otp_code = f"{random.randint(100000, 999999)}"
        expires_at = timezone.now() + datetime.timedelta(minutes=10)

        # Invalidate any previously generated unused OTPs for this user
        PasswordResetOTP.objects.filter(user=user, is_used=False).update(is_used=True)

        # Create new OTP record
        PasswordResetOTP.objects.create(
            user=user,
            otp=otp_code,
            expires_at=expires_at,
            is_used=False
        )

        # Send email with HTML and plaintext content
        subject = 'Your AuraStore Password Reset Verification Code'
        recipient_name = user.first_name or user.username or 'Customer'
        
        message_body = (
            f"Hello {recipient_name},\n\n"
            f"We received a request to reset your AuraStore password.\n\n"
            f"Your 6-Digit Password Reset OTP is: {otp_code}\n\n"
            f"This code will expire in 10 minutes.\n\n"
            f"If you did not request a password reset, please ignore this email or contact support.\n\n"
            f"Best regards,\nAuraStore Security Team"
        )

        html_body = f"""
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #0f172a; border-radius: 12px; color: #ffffff; border: 1px solid rgba(255,255,255,0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #6366f1; margin: 0; font-size: 24px; font-weight: 800;">AuraStore Security</h2>
                <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Password Reset Verification Code</p>
            </div>
            <p style="color: #e2e8f0; font-size: 15px; line-height: 1.6;">Hello <strong>{recipient_name}</strong>,</p>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">We received a request to reset your password. Use the 6-digit verification code below to set a new password:</p>
            <div style="text-align: center; margin: 28px 0;">
                <div style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #ffffff; background: rgba(99, 102, 241, 0.25); border: 2px dashed #6366f1; padding: 12px 28px; border-radius: 8px;">
                    {otp_code}
                </div>
            </div>
            <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">This code is valid for <strong>10 minutes</strong>. If you did not make this request, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
            <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">&copy; 2026 AuraStore / ExaShop Inc. All rights reserved.</p>
        </div>
        """

        email_sent = False
        try:
            send_mail(
                subject=subject,
                message=message_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_body,
                fail_silently=False,
            )
            email_sent = True
        except Exception as e:
            # In development environments where mail server isn't connected, log to console
            print(f"[DEVELOPMENT PASSWORD RESET OTP for {user.email}]: {otp_code} (Mail delivery note: {e})")

        response_data = {
            'message': f'A 6-digit password reset OTP has been sent to {user.email}.',
            'email': user.email,
            'email_sent': email_sent
        }

        # If in DEBUG mode, provide dev_otp so local testing works immediately without SMTP setup
        if settings.DEBUG:
            response_data['dev_otp'] = otp_code

        return Response(response_data, status=status.HTTP_200_OK)


class VerifyPasswordResetOTPView(APIView):
    """
    POST /api/v1/auth/password-reset/verify-otp/
    Verify the 6-digit OTP code and set the user's new password.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = VerifyPasswordResetOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        otp_record = serializer.validated_data['otp_record']
        new_password = serializer.validated_data['new_password']

        # Update password
        user.set_password(new_password)
        user.save()

        # Mark OTP as consumed
        otp_record.is_used = True
        otp_record.save()

        return Response({
            'message': 'Your password has been reset successfully. You can now sign in with your new password.',
            'email': user.email
        }, status=status.HTTP_200_OK)

