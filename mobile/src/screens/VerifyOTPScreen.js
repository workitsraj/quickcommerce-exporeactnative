import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants';
import * as authService from '../services/authService';

const VerifyOTPScreen = ({ route, navigation }) => {
  const { verifyOTP } = useAuth();
  const { userId, email, phone } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const deviceInfo = {
        deviceType: 'android',
        deviceId: 'device-uuid',
      };

      await verifyOTP(userId, otp, deviceInfo);
      // Navigation will be handled automatically by auth state change
    } catch (error) {
      Alert.alert(
        'Verification Failed',
        error.response?.data?.message || 'Invalid OTP'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    try {
      await authService.resendOTP(userId);
      Alert.alert('Success', 'OTP has been resent to your email and phone');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}
          {email} and {phone}
        </Text>

        <TextInput
          style={styles.otpInput}
          placeholder="Enter OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
        />

        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.verifyButtonText}>Verify</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResendOTP} disabled={resending}>
            <Text style={styles.resendLink}>
              {resending ? 'Resending...' : 'Resend'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    padding: 20,
    paddingTop: 100,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 40,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 15,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 10,
    width: '80%',
    marginBottom: 30,
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
  },
  verifyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  resendText: {
    color: COLORS.gray,
  },
  resendLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default VerifyOTPScreen;
