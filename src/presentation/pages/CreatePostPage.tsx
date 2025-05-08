import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome, Feather } from '@expo/vector-icons';
import { NavigationProp } from '@/src/utils/PropsNavigate';
import { useNavigation } from 'expo-router';
import { BACKGROUND } from '@/src/const/constants';

const CreatePostPage = () => {
  const [postText, setPostText] = useState('');
  const navigation: NavigationProp<'Home'> = useNavigation()
  const handleCancelPress = () => {
    navigation.goBack()
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelPress}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Thread mới</Text>
            <View style={styles.rightIcons}>
              <TouchableOpacity style={styles.headerIcon}>
                <Ionicons name="document-outline" size={24} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIcon}>
                <Ionicons name="happy-outline" size={24} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.userSection}>
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.username}>_aaron_3006</Text>
                <Text style={styles.addTopic}>Thêm chủ đề</Text>
              </View>
            </View>

            <TextInput
              style={styles.postInput}
              placeholder="Có gì mới?"
              placeholderTextColor="#777777"
              multiline
              value={postText}
              onChangeText={setPostText}
            />

            <Text style={styles.addToThread}>Thêm vào thread</Text>

            {/* Media Icons */}
            <View style={styles.mediaIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="images-outline" size={24}/>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="camera-outline" size={24} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="gif" size={24}/>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <FontAwesome name="microphone" size={22}/>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="list-outline" size={24}/>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="location-outline" size={24}/>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Bất kỳ ai cũng có thể trả lời và trích dẫn
            </Text>
            <TouchableOpacity
              style={[styles.postButton, postText.length > 0 ? styles.postButtonActive : {}]}
              disabled={postText.length === 0}
            >
              <Text style={[styles.postButtonText, postText.length > 0 ? styles.postButtonTextActive : {}]}>
                Đăng
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  cancelButton: {
    width: 60,
  },
  cancelText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  rightIcons: {
    flexDirection: 'row',
    width: 60,
    justifyContent: 'flex-end',
  },
  headerIcon: {
    marginLeft: 15,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    justifyContent: 'center',
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
  },
  addTopic: {
    color: '#000',
    fontSize: 14,
  },
  postInput: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  addToThread: {
    color: '#777777',
    fontSize: 14,
    marginVertical: 16,
  },
  mediaIcons: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
    paddingTop: 16,
  },
  iconButton: {
    marginRight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
  },
  footerText: {
    color: '#777777',
    fontSize: 14,
    flex: 1,
  },
  postButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#333333',
  },
  postButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  postButtonTextActive: {
    color: '#000000',
  },
});

export default CreatePostPage;