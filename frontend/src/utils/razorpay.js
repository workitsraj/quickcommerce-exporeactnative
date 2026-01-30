import RazorpayCheckout from 'react-native-razorpay';

export const processRazorpayPayment = async (orderData, onSuccess, onFailure) => {
  const options = {
    description: `Payment for Order ${orderData.orderId}`,
    image: 'https://your-logo-url.com/logo.png',
    currency: orderData.currency || 'INR',
    key: 'YOUR_RAZORPAY_KEY_ID', // Replace with actual key from config
    amount: orderData.amount * 100, // Amount in paise
    name: 'QuickCommerce',
    order_id: orderData.gatewayOrderId,
    prefill: {
      email: orderData.email || '',
      contact: orderData.phone || '',
      name: orderData.name || '',
    },
    theme: { color: '#528FF0' },
  };

  try {
    const data = await RazorpayCheckout.open(options);
    // Payment success
    onSuccess({
      razorpay_payment_id: data.razorpay_payment_id,
      razorpay_order_id: data.razorpay_order_id,
      razorpay_signature: data.razorpay_signature,
    });
  } catch (error) {
    // Payment failure
    onFailure(error);
  }
};
