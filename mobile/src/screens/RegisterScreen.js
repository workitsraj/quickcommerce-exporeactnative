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
  Picker,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, ROLES } from '../constants';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: ROLES.CUSTOMER,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async () => {
    const { name, email, phone, password, confirmPassword, role } = formData;

    // Validation
    if (!name || !email || !phone || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await register({
        name,
        email,
        phone,
        password,
        role,
      });

      if (response.success) {
        // Navigate to OTP verification
        navigation.navigate('VerifyOTP', {
          userId: response.data.userId,
          email: response.data.email,
          phone: response.data.phone,
        });
      }
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || 'An error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join QuickCommerce today</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number (+919876543210)"
            value={formData.phone}
            onChangeText={(value) => handleChange('phone', value)}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(value) => handleChange('confirmPassword', value)}
            secureTextEntry
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Account Type</Text>
            <Picker
              selectedValue={formData.role}
              style={styles.picker}
              onValueChange={(value) => handleChange('role', value)}
            >
              <Picker.Item label="Customer" value={ROLES.CUSTOMER} />
              <Picker.Item
                label="Delivery Partner"
                value={ROLES.DELIVERY_PARTNER}
              />
              <Picker.Item label="Store Manager" value={ROLES.STORE_MANAGER} />
            </Picker>
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.registerButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
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
  pickerContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 5,
  },
  picker: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: COLORS.gray,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
