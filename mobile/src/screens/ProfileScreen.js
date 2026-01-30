import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants';
import * as ImagePicker from 'expo-image-picker';
import * as authService from '../services/authService';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateUserProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
    }
  }, [user]);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateUserProfile(formData);
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Need camera roll permission to upload photo');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      try {
        await authService.uploadProfilePicture(result.assets[0].uri);
        Alert.alert('Success', 'Profile picture updated');
      } catch (error) {
        Alert.alert('Error', 'Failed to upload image');
      }
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePickImage}>
          <View style={styles.avatarContainer}>
            {user?.profilePicture ? (
              <Image
                source={{ uri: user.profilePicture }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>✎</Text>
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.role}>{user?.role?.replace('_', ' ').toUpperCase()}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={formData.name}
              onChangeText={(value) => handleChange('name', value)}
              editable={editing}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              editable={editing}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={formData.phone}
              onChangeText={(value) => handleChange('phone', value)}
              editable={editing}
            />
          </View>

          {editing ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setEditing(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleUpdate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(true)}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Addresses')}
          >
            <Text style={styles.menuItemText}>Manage Addresses</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Text style={styles.menuItemText}>Change Password</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Sessions')}
          >
            <Text style={styles.menuItemText}>Active Sessions</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.accent,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadgeText: {
    color: COLORS.white,
    fontSize: 16,
  },
  role: {
    color: COLORS.white,
    fontSize: 14,
    marginTop: 10,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  field: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputDisabled: {
    backgroundColor: COLORS.background,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  cancelButtonText: {
    color: COLORS.gray,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  menuItemText: {
    fontSize: 16,
  },
  menuItemArrow: {
    fontSize: 24,
    color: COLORS.gray,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
