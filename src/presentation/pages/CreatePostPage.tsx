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
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome, Feather } from '@expo/vector-icons';
import { NavigationProp } from '@/src/utils/PropsNavigate';
import { useNavigation } from 'expo-router';
import { BACKGROUND } from '@/src/const/constants';
import * as ImagePicker from 'expo-image-picker';

const CreatePostPage = () => {
  const [postText, setPostText] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isEditingTopic, setIsEditingTopic] = useState(false); // State để kiểm soát chế độ chỉnh sửa
  const [topic, setTopic] = useState('');

  const navigation: NavigationProp<'Home'> = useNavigation();
  
  const handleCancelPress = () => {
    navigation.goBack();
    setPostText(''); // Xóa nội dung bài viết khi quay lại
    setSelectedImages([]); // Xóa ảnh đã chọn khi quay lại
    setIsEditingTopic(false); // Đặt lại chế độ chỉnh sửa chủ đề
    setTopic(''); // Xóa chủ đề khi quay lại
  };

  const handlePickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Bạn cần cấp quyền truy cập thư viện ảnh để sử dụng tính năng này.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setSelectedImages((prev) => [...prev, ...uris]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // Điều chỉnh khoảng cách khi bàn phím bật
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelPress}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Bài viết mới</Text>
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

                {/* Thêm chủ đề */}
                {isEditingTopic ? (
                  <TextInput
                    style={styles.topicInput}
                    value={topic}
                    onChangeText={setTopic}
                    onBlur={() => setIsEditingTopic(false)} // Khi mất focus, chuyển lại thành Text
                    placeholder="Nhập chủ đề..."
                    placeholderTextColor="#777"
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss(); // Ẩn bàn phím và xóa focus khỏi "Có gì mới?"
                      setIsEditingTopic(true); // Bật chế độ chỉnh sửa chủ đề
                    }}
                  >
                    <Text style={styles.addTopic}>
                      {topic || 'Thêm chủ đề'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* TextInput "Có gì mới?" */}
            <TextInput
              style={styles.postInput}
              placeholder="Có gì mới?"
              placeholderTextColor="#777777"
              multiline
              value={postText}
              onChangeText={setPostText}
              onFocus={() => setIsEditingTopic(false)} // Tắt chế độ chỉnh sửa chủ đề khi focus vào đây
            />

            <Text style={styles.addToThread}>Thêm vào thread</Text>

            {/* Media Icons */}
            <View style={styles.mediaIcons}>
              <TouchableOpacity style={styles.iconButton} onPress={handlePickImages}>
                <Ionicons name="images-outline" size={24} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="camera-outline" size={24} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="gif" size={24} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <FontAwesome name="microphone" size={22} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="list-outline" size={24} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="location-outline" size={24} />
              </TouchableOpacity>
            </View>

            {/* Hiển thị danh sách ảnh đã chọn */}
            {selectedImages.length > 0 && (
              <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ScrollView
                  horizontal
                  style={styles.selectedImagesContainer}
                  contentContainerStyle={{ paddingHorizontal: 10, flexGrow: 1 }}
                  showsHorizontalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled" // Đảm bảo cuộn không bị chặn
                  scrollEventThrottle={16}
                >
                  {/* Thêm khoảng trống ở đầu */}
                  <View style={{ width: 10 }} />
                  {selectedImages.map((uri, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image source={{ uri }} style={styles.selectedImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => {
                          setSelectedImages((prev) => prev.filter((image, i) => i !== index));
                        }}
                      >
                        <Ionicons name="close" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {/* Thêm khoảng trống ở cuối */}
                  <View style={{ width: 10 }} />
                </ScrollView>
              </TouchableWithoutFeedback>
            )}
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
  selectedImagesContainer: {
    marginTop: 16,
    flexDirection: 'row',
    paddingHorizontal: 10, // Thêm khoảng cách ngang
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10, // Khoảng cách giữa các ảnh
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
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
  topicInput: {
    fontSize: 14,
    color: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 2,
    marginTop: 4,
  },
});

export default CreatePostPage;