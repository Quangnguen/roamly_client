import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, updateUserProfile } from '../redux/slices/userSlice';
import { RootState, AppDispatch } from '../redux/store';
import { launchImageLibraryAsync, MediaTypeOptions, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';

const EditProfilePage: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error } = useSelector((state: RootState) => state.user);
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const [isAccountLocked, setIsAccountLocked] = useState<boolean>(!!profile?.private);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    })();
  }, []);

  const [profileData, setProfileData] = useState({

    name: profile?.name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    email: profile?.email || '',
    private: profile?.private || false,
    phoneNumber: profile?.phoneNumber || '',
    profilePic: profile?.profilePic || 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-hiZZ98WEvmBOkk3oAqffc3ReiwtEIO.png',
  })

  const handleDone = () => {
    dispatch(updateUserProfile({
      name: profileData.name,
      email: profileData.email,
      username: profileData.username,
      bio: profileData.bio,
      private: isAccountLocked,
      profilePic: profileData.profilePic,
    }));
    navigation.goBack();
  };

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    setIsAccountLocked(!!profile?.private);
  }, [profile?.private]);

  const navigation = useNavigation();
  const handleChange = (field: any, value: any) => {
    setProfileData({
      ...profileData,
      [field]: value
    });
  };

  const handleCancelEdit = () => {
    navigation.goBack();

  }



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.cancelButton} onPress={handleCancelEdit}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleDone}>
          <Text style={styles.doneButton}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Photo */}
        <View style={styles.profilePhotoContainer}>
          <Image
            source={{
              uri: profileData.profilePic,
              cache: 'reload'
            }}
            style={styles.profilePhoto}
            resizeMode="cover"
          />
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.formRow}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={profileData.name}
              onChangeText={(text: string) => handleChange('name', text)}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={profileData.username}
              onChangeText={(text: string) => handleChange('username', text)}
            />
          </View>

          {/* <View style={styles.formRow}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              value={profileData.website}
              placeholder="Website"
              placeholderTextColor="#C7C7CC"
              onChangeText={(text) => handleChange('website', text)}
            />
          </View> */}

          <View style={styles.formRow}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={styles.input}
              value={profileData.bio}
              multiline={true}
              onChangeText={(text: string) => handleChange('bio', text)}
            />
          </View>
        </View>

        {/* Professional Account Button */}
        <TouchableOpacity style={styles.professionalButton}>
          <Text style={styles.professionalButtonText}>Switch to Professional Account</Text>
        </TouchableOpacity>

        {/* Private Information Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Private Information</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.formRow}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={profileData.email}
              onChangeText={(text: string) => handleChange('email', text)}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={profileData.phoneNumber}
              onChangeText={(text: string) => handleChange('phoneNumber', text)}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Gender</Text>
            <TextInput
              style={styles.input}
              value="Male"
              onChangeText={(text: string) => handleChange('gender', text)}
            />
          </View>
          <View style={styles.formRow}>
            <Text style={styles.label}>Tài khoản cá nhân</Text>
            <Switch
              value={isAccountLocked}
              onValueChange={setIsAccountLocked}
            />
          </View>
        </View>

        {/* Khóa tài khoản */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 17,
    color: '#000000',
  },
  doneButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  profilePhotoContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  profilePhoto: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f0f0f0',
  },
  changePhotoText: {
    color: '#007AFF',
    fontSize: 14,
    marginTop: 10,
  },
  formContainer: {
    paddingHorizontal: 16,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  label: {
    width: 120,
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  professionalButton: {
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  professionalButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  sectionHeader: {
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
  },
  lockAccountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#E0E0E0',
    marginTop: 16,
  },
  lockAccountLabel: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  loader: {
    marginTop: 10,
  },
});

export default EditProfilePage;