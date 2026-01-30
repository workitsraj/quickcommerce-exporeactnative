import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const deviceInfo = {
        deviceType: 'android', // or 'ios'
        deviceId: 'device-uuid',
      };

      await login({ email, password }, deviceInfo);
      // Navigation will be handled automatically by auth state change
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'An error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    Alert.alert('Coming Soon', `${provider} login will be available soon`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Login to continue shopping</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email or Phone"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            onPress={() => handleSocialLogin('Google')}
          >
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, styles.facebookButton]}
            onPress={() => handleSocialLogin('Facebook')}
          >
            <Text style={styles.socialButtonText}>Continue with Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, styles.appleButton]}
            onPress={() => handleSocialLogin('Apple')}
          >
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  dividerText: {
    marginHorizontal: 10,
    color: COLORS.gray,
  },
  socialButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
  },
  googleButton: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.lightGray,
  },
  facebookButton: {
    backgroundColor: '#1877F2',
    borderColor: '#1877F2',
  },
  appleButton: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: COLORS.gray,
  },
  signupLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
