import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Vibration,
  Modal, // <-- added
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { BACKGROUND, PRIMARY } from '@/src/const/constants';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { createPost, clearMessage, addOptimisticPost } from '../redux/slices/postSlice';
import { AppDispatch, RootState } from '../redux/store';
import Toast from 'react-native-toast-message';
import { getPopularDestinations, searchDestinations, clearSearchResults } from '../redux/slices/destinationSlice'; // <-- added

const { width } = Dimensions.get('window');


const CreatePostPage = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  const [caption, setCaption] = useState('');
  const [selectedImages, setSelectedImages] = useState<Array<{ uri: string }>>([]);
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);

  const navigation: NativeStackNavigationProp<RootStackParamList, 'Home'> = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, message, status } = useSelector((state: RootState) => state.post);
  const { profile } = useSelector((state: RootState) => state.auth);

  // destination modal / search state
  const [destModalVisible, setDestModalVisible] = useState(false);
  const [destinationQuery, setDestinationQuery] = useState('');
  const [debouncedDestQuery, setDebouncedDestQuery] = useState('');
  const [selectedDestinations, setSelectedDestinations] = useState<Array<{ id: string; title?: string }>>([]);

  const destinations = useSelector((state: RootState) =>
    (state.destination.searchResults && state.destination.searchResults.length > 0)
      ? state.destination.searchResults
      : state.destination.destinations
  );
  const destLoading = useSelector((state: RootState) => state.destination.searchLoading || state.destination.loading);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedDestQuery(destinationQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [destinationQuery]);

  useEffect(() => {
    if (debouncedDestQuery) {
      dispatch(searchDestinations({ params: { keyword: debouncedDestQuery, page: 1, limit: 20 } }));
    } else {
      dispatch(clearSearchResults());
      dispatch(getPopularDestinations());
    }
  }, [debouncedDestQuery, dispatch]);

  const toggleSelectDestination = (dest: any) => {
    const exists = selectedDestinations.find(d => d.id === dest.id);
    if (exists) {
      setSelectedDestinations(prev => prev.filter(d => d.id !== dest.id));
    } else {
      setSelectedDestinations(prev => [...prev, { id: dest.id, title: dest.title }]);
    }
  };

  useEffect(() => {
    if (message && status === 'success') {
      Toast.show({
        type: 'success',
        text1: message,
        visibilityTime: 3000,
        onHide: () => {
          dispatch(clearMessage());
        },
      });
    } else if (message && status === 'error') {
      Toast.show({
        type: 'error',
        text1: message,
        visibilityTime: 4000,
        onHide: () => {
          dispatch(clearMessage());
        },
      });
    }
  }, [message, status]);

  const handlePost = async () => {
    if (!caption.trim() && selectedImages.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Vui lòng nhập nội dung hoặc chọn ảnh',
      });
      return;
    }

    try {
      // Haptic feedback khi đăng bài
      if (Platform.OS === 'ios') {
        Vibration.vibrate(100);
      }

      // Thêm post tạm thời vào Redux store ngay lập tức (include taggedDestinations)
      dispatch(addOptimisticPost({
        authorId: profile?.id || '',
        imageUrls: selectedImages.map(img => img.uri),
        caption: caption.trim(),
        location: location,
        taggedDestinations: selectedDestinations.map(d => d.id), // <-- added
        author: {
          username: profile?.username || 'nam',
          profilePic: profile?.profilePic || null,
        },
      }));

      // Hiển thị toast thông báo đang đăng
      Toast.show({
        type: 'info',
        text1: 'Đang đăng bài viết...',
        text2: 'Bài viết của bạn đã được thêm vào feed',
        visibilityTime: 2000,
      });

      // Reset form trước khi quay về
      const currentCaption = caption.trim();
      const currentImages = [...selectedImages];
      const currentLocation = location;
      const currentTagged = selectedDestinations.map(d => d.id); // <-- added

      setCaption('');
      setSelectedImages([]);
      setLocation(null);
      setSelectedDestinations([]); // <-- clear selected destinations

      // Quay về home ngay lập tức
      navigation.goBack();

      const formData = new FormData();

      // Thêm ảnh vào formData
      currentImages.forEach((image) => {
        const localUri = image.uri;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image';

        formData.append('images', {
          uri: localUri,
          name: filename,
          type,
        } as any);
      });

      formData.append('caption', currentCaption);
      if (currentLocation) formData.append('location', currentLocation);

      // Append taggedDestinations as repeated multipart fields (optional)
      if (currentTagged && currentTagged.length > 0) {
        currentTagged.forEach(id => {
          formData.append('taggedDestinations', id);
        });
      }

      // Dispatch action trong background - không await để không block UI
      dispatch(createPost({
        images: formData,
        caption: currentCaption,
        location: currentLocation,
        taggedDestinations: currentTagged, // <-- include array in thunk payload
      }));

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Có lỗi xảy ra khi đăng bài',
      });
    }
  };

  const handleCancelPress = () => {
    navigation.goBack();
    setCaption('');
    setSelectedImages([]);
    setIsEditingTopic(false);
    setLocation(null);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Xin lỗi, chúng tôi cần quyền truy cập thư viện ảnh để thực hiện chức năng này!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
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

      {/* Modal: search & select destinations */}
      <Modal
        visible={destModalVisible}
        animationType="slide"
        onRequestClose={() => setDestModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 0.5 }}>
            <TouchableOpacity onPress={() => setDestModalVisible(false)} style={{ padding: 8 }}>
              <Text>Đóng</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <TextInput
                value={destinationQuery}
                onChangeText={setDestinationQuery}
                placeholder="Tìm địa điểm..."
                autoFocus
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              />
            </View>
            <TouchableOpacity onPress={() => { setDestinationQuery(''); }} style={{ padding: 8, marginLeft: 8 }}>
              <Text>Xóa</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            {destLoading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
              </View>
            ) : destinations && destinations.length > 0 ? (
              <ScrollView contentContainerStyle={{ padding: 12 }}>
                {destinations.map((dest: any) => {
                  const selected = !!selectedDestinations.find(d => d.id === dest.id);
                  return (
                    <TouchableOpacity
                      key={dest.id}
                      onPress={() => toggleSelectDestination(dest)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 10,
                        borderBottomWidth: 0.5,
                        borderColor: '#eee',
                      }}
                    >
                      <Image
                        source={dest.imageUrl && dest.imageUrl.length > 0 ? { uri: dest.imageUrl[0] } : require('../../../assets/images/natural2.jpg')}
                        style={{ width: 56, height: 56, borderRadius: 8, marginRight: 12 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '600' }}>{dest.title || 'Địa điểm'}</Text>
                        <Text style={{ color: '#666', marginTop: 2 }}>{dest.location || dest.city || ''}</Text>
                      </View>
                      {selected && (
                        <View style={{ backgroundColor: '#000', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                          <Text style={{ color: '#fff', fontSize: 12 }}>Đã chọn</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#777' }}>Không tìm thấy địa điểm</Text>
              </View>
            )}
          </View>

          <View style={{ padding: 12, borderTopWidth: 0.5 }}>
            <TouchableOpacity
              onPress={() => setDestModalVisible(false)}
              style={{ backgroundColor: PRIMARY || '#333', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff' }}>Xong</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

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

      {/* Main Content with KeyboardAvoidingView */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.content}>
              <View style={styles.userSection}>
                <Image
                  source={{ uri: profile?.profilePic || 'https://randomuser.me/api/portraits/men/32.jpg' }}
                  style={styles.avatar}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.username}>{profile?.username || 'nam'}</Text>

                  {/* Thêm địa điểm - mở modal chọn */}
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss();
                      setDestModalVisible(true);
                    }}
                  >
                    <Text style={styles.addTopic}>
                      {selectedDestinations.length > 0 ? selectedDestinations.map(d => d.title).join(', ') : (location || 'Thêm địa điểm')}
                    </Text>
                  </TouchableOpacity>
                  {/* selected chips */}
                  {/* {selectedDestinations.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                      {selectedDestinations.map(d => (
                        <View key={d.id} style={{ backgroundColor: '#eee', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, marginRight: 8 }}>
                          <Text>{d.title}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  )} */}
                </View>
              </View>

              {/* TextInput "Có gì mới?" */}
              <TextInput
                style={styles.postInput}
                placeholder="Có gì mới?"
                placeholderTextColor="#777777"
                multiline
                value={caption}
                onChangeText={setCaption}
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
                            onPress={() => removeImage(index)}
                          >
                            <Ionicons name="close" size={20} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  )}
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>

        {/* Footer - Inside KeyboardAvoidingView để được đẩy lên */}
        <View style={isKeyboardVisible
          ? [styles.footer, { marginBottom: 20 }] : styles.footer}>
          <Text style={styles.footerText}>
            Bất kỳ ai cũng có thể trả lời và trích dẫn
          </Text>
          <TouchableOpacity
            style={[
              styles.postButton,
              (caption.length > 0 || selectedImages.length > 0) ? styles.postButtonActive : {},
              loading && styles.postButtonDisabled
            ]}
            disabled={caption.length === 0 && selectedImages.length === 0 || loading}
            onPress={handlePost}
          >
            {loading ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text
                style={[
                  styles.postButtonText,
                  (caption.length > 0 || selectedImages.length > 0) ? styles.postButtonTextActive : {}
                ]}
              >
                Đăng
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
    backgroundColor: BACKGROUND,
    minHeight: 70,
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
    minWidth: 60,
  },
  postButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
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
  postButtonDisabled: {
    opacity: 0.7,
  }
});

export default CreatePostPage;