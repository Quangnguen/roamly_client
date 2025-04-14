import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView, 
  StatusBar,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const EditProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState({
    name: 'Jacob West',
    username: 'jacob_w',
    website: '',
    bio: 'Digital goodies designer @pixsellz.\nEverything is designed.',
    email: 'jacob.west@gmail.com',
    phone: '+1 202 555 0147',
    gender: 'Male'
  });
  
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
        <TouchableOpacity>
          <Text style={styles.doneButton}>Done</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Profile Photo */}
        <View style={styles.profilePhotoContainer}>
          <Image 
            source={{ uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-hiZZ98WEvmBOkk3oAqffc3ReiwtEIO.png' }} 
            style={styles.profilePhoto} 
          />
          <TouchableOpacity>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>
        
        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.formRow}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={profileData.name}
              onChangeText={(text) => handleChange('name', text)}
            />
          </View>
          
          <View style={styles.formRow}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={profileData.username}
              onChangeText={(text) => handleChange('username', text)}
            />
          </View>
          
          <View style={styles.formRow}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              value={profileData.website}
              placeholder="Website"
              placeholderTextColor="#C7C7CC"
              onChangeText={(text) => handleChange('website', text)}
            />
          </View>
          
          <View style={styles.formRow}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={styles.input}
              value={profileData.bio}
              multiline={true}
              onChangeText={(text) => handleChange('bio', text)}
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
              onChangeText={(text) => handleChange('email', text)}
            />
          </View>
          
          <View style={styles.formRow}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={profileData.phone}
              onChangeText={(text) => handleChange('phone', text)}
            />
          </View>
          
          <View style={styles.formRow}>
            <Text style={styles.label}>Gender</Text>
            <TextInput
              style={styles.input}
              value={profileData.gender}
              onChangeText={(text) => handleChange('gender', text)}
            />
          </View>
        </View>
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
    paddingVertical: 6,
  },
  profilePhoto: {
    width: 90,
    height: 90,
    borderRadius: 45,
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
    width: 90,
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
});

export default EditProfilePage;