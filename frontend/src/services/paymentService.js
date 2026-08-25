import apiClient from './api';

/**
 * Create a payment gateway intent for an order.
 * @param {Object} params
 * @param {string} params.orderNumber
 * @param {string} params.gateway - 'razorpay' | 'card_instant' | 'stripe' | 'cod'
 * @returns {Promise<Object>} Gateway intent credentials and order details
 */
export const createPaymentIntent = async ({ orderNumber, gateway = 'razorpay' }) => {
  const response = await apiClient.post('/payments/create-intent/', {
    order_number: orderNumber,
    gateway,
  });
  return response.data;
};

/**
 * Verify payment signature or transaction token.
 * @param {Object} params
 * @param {string} params.orderNumber
 * @param {string} params.gateway
 * @param {string} params.gatewayOrderId
 * @param {string} params.gatewayPaymentId
 * @param {string} params.gatewaySignature
 * @returns {Promise<Object>} Verification status and transaction receipt
 */
export const verifyPayment = async ({
  orderNumber,
  gateway = 'razorpay',
  gatewayOrderId = '',
  gatewayPaymentId = '',
  gatewaySignature = '',
}) => {
  const response = await apiClient.post('/payments/verify/', {
    order_number: orderNumber,
    gateway,
    gateway_order_id: gatewayOrderId,
    gateway_payment_id: gatewayPaymentId,
    gateway_signature: gatewaySignature,
  });
  return response.data;
};

/**
 * Get payment transactions and receipts for an order.
 * @param {string} orderNumber
 * @returns {Promise<Array>} List of payment transactions
 */
export const getOrderPayments = async (orderNumber) => {
  const response = await apiClient.get(`/payments/${orderNumber}/`);
  return response.data;
};

export default {
  createPaymentIntent,
  verifyPayment,
  getOrderPayments,
};
