import { verifyPayment } from '../services/paymentService';

/**
 * Dynamically load Razorpay Checkout SDK script
 * @returns {Promise<boolean>}
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay Checkout SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Launch Razorpay Standard Checkout Popup Modal
 * @param {Object} params
 * @param {Object} params.paymentIntent - Response payload from /api/v1/payments/create-intent/
 * @param {Function} params.onSuccess - Callback upon successful verification (passes server response)
 * @param {Function} params.onError - Callback on payment failure or verification error
 * @param {Function} params.onDismiss - Callback when user cancels or closes the checkout popup
 */
export const openRazorpayCheckout = async ({
  paymentIntent,
  onSuccess,
  onError,
  onDismiss,
}) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    if (onError) {
      onError(new Error('Razorpay SDK could not be loaded. Please check your internet connection.'));
    }
    return;
  }

  const keyId =
    paymentIntent.key_id ||
    import.meta.env.VITE_RAZORPAY_KEY_ID ||
    'rzp_test_TV1JcZlkdJ5SZh';

  const options = {
    key: keyId,
    amount: paymentIntent.amount_in_paise,
    currency: paymentIntent.currency || 'INR',
    name: 'AuraStore',
    description: `Payment for Order #${paymentIntent.order_number}`,
    image: '/vite.svg',
    order_id: paymentIntent.gateway_order_id,
    prefill: {
      name: paymentIntent.customer?.name || '',
      email: paymentIntent.customer?.email || '',
      contact: paymentIntent.customer?.phone || '',
    },
    notes: {
      order_number: paymentIntent.order_number,
      ...(paymentIntent.notes || {}),
    },
    theme: {
      color: '#6366f1', // Indigo Brand Color
    },
    handler: async function (response) {
      try {
        const verifyRes = await verifyPayment({
          orderNumber: paymentIntent.order_number,
          gateway: 'razorpay',
          gatewayOrderId: response.razorpay_order_id || paymentIntent.gateway_order_id,
          gatewayPaymentId: response.razorpay_payment_id,
          gatewaySignature: response.razorpay_signature,
        });

        if (onSuccess) {
          onSuccess(verifyRes);
        }
      } catch (err) {
        console.error('Payment verification failed:', err);
        if (onError) {
          onError(err);
        }
      }
    },
    modal: {
      ondismiss: function () {
        if (onDismiss) {
          onDismiss();
        }
      },
    },
  };

  try {
    const rzpInstance = new window.Razorpay(options);
    rzpInstance.on('payment.failed', function (failResponse) {
      console.warn('Razorpay payment failed event:', failResponse);
      if (onError) {
        onError(failResponse.error || new Error('Payment was declined or failed.'));
      }
    });
    rzpInstance.open();
  } catch (err) {
    console.error('Failed to initialize Razorpay checkout instance:', err);
    if (onError) {
      onError(err);
    }
  }
};
