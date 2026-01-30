import { useStripe } from '@stripe/stripe-react-native';

export const useStripePayment = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const initializePaymentSheet = async (paymentIntentClientSecret, merchantDisplayName = 'QuickCommerce') => {
    const { error } = await initPaymentSheet({
      merchantDisplayName,
      paymentIntentClientSecret,
      allowsDelayedPaymentMethods: true,
    });

    if (error) {
      throw error;
    }
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      throw error;
    }

    return { success: true };
  };

  return {
    initializePaymentSheet,
    openPaymentSheet,
  };
};
