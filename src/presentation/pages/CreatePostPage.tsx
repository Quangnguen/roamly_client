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
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { NavigationProp } from '@/src/utils/PropsNavigate';
import { useNavigation } from 'expo-router';
import { BACKGROUND, PRIMARY } from '@/src/const/constants';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const CreatePostPage = () => {
  const [postText, setPostText] = useState('');
  const [selectedImages, setSelectedImages] = useState<Array<{ uri: string }>>([]);
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [topic, setTopic] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);

  const navigation: NavigationProp<'Home'> = useNavigation();

  const handleCancelPress = () => {
    navigation.goBack();
    setPostText('');
    setSelectedImages([]);
    setIsEditingTopic(false);
    setTopic('');
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Xin lỗi, chúng tôi cần quyền truy cập thư viện ảnh để thực hiện chức năng này!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      const newImages = result.assets.map(image => ({ uri: image.uri }));
      setSelectedImages(prevImages => [...prevImages, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prevImages => prevImages.filter((_, i) => i !== index));
    if (currentImageIndex >= index && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const imageIndex = Math.round(contentOffset.x / width);
    setCurrentImageIndex(imageIndex);
  };

  const toggleFullScreenPreview = () => {
    setIsFullScreenPreview(!isFullScreenPreview);
  };

  return (
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

      {/* Scrollable Content */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                      onBlur={() => setIsEditingTopic(false)}
                      placeholder="Nhập chủ đề..."
                      placeholderTextColor="#777"
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        Keyboard.dismiss();
                        setIsEditingTopic(true);
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
                onFocus={() => setIsEditingTopic(false)}
              />

              <Text style={styles.addToThread}>Thêm vào thread</Text>

              {/* Media Icons */}
              <View style={styles.mediaIcons}>
                <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
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

              {/* Selected Images */}
              {selectedImages.length > 0 && (
                <View style={styles.selectedImagesSection}>
                  {isFullScreenPreview ? (
                    <View style={styles.fullScreenPreview}>
                      <TouchableOpacity
                        style={styles.closeFullScreenButton}
                        onPress={toggleFullScreenPreview}
                      >
                        <Ionicons name="close" size={24} color="#fff" />
                      </TouchableOpacity>
                      <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                      >
                        {selectedImages.map((image, index) => (
                          <View key={index} style={styles.fullScreenImageWrapper}>
                            <Image source={{ uri: image.uri }} style={styles.fullScreenImage} />
                          </View>
                        ))}
                      </ScrollView>
                      {selectedImages.length > 1 && (
                        <View style={styles.imageCounter}>
                          <Text style={styles.imageCounterText}>
                            {currentImageIndex + 1}/{selectedImages.length}
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <ScrollView
                      horizontal
                      style={styles.selectedImagesContainer}
                      contentContainerStyle={{ paddingHorizontal: 10 }}
                      showsHorizontalScrollIndicator={false}
                    >
                      {selectedImages.map((image, index) => (
                        <View key={index} style={styles.imageWrapper}>
                          <TouchableOpacity onPress={toggleFullScreenPreview}>
                            <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => {
                              setSelectedImages((prev) => prev.filter((_, i) => i !== index));
                            }}
                          >
                            <Ionicons name="close" size={20} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  )}
                </View>
              )}

              {/* Add some padding at the bottom for better scrolling */}
              <View style={{ height: 100 }} />
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer - Outside of KeyboardAvoidingView */}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
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
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
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
  fullScreenPreview: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    zIndex: 1000,
  },
  fullScreenImageWrapper: {
    width: width,
    height: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: width,
    resizeMode: 'contain',
  },
  closeFullScreenButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1001,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCounter: {
    position: 'absolute',
    top: 16,
    right: 70,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  captionContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  captionInput: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    ...Platform.select({
      ios: {
        paddingTop: 0,
      },
    }),
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  addMoreText: {
    marginLeft: 8,
    fontSize: 16,
    color: PRIMARY,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
    backgroundColor: BACKGROUND,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  selectedImagesSection: {
    marginTop: 16,
    minHeight: 120,
  },
});

export default CreatePostPage;