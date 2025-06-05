import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ImageSourcePropType,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { BACKGROUND } from '@/src/const/constants';
import ImageView from 'react-native-image-viewing';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { deletePost } from '../redux/slices/postSlice';
import { likePost, unlikePost, initializeLikeStatus } from '../redux/slices/likeSlice';
import Toast from 'react-native-toast-message';
import { navigate } from 'expo-router/build/global-state/routing';
import { useNavigation } from 'expo-router';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Định nghĩa kiểu dữ liệu cho ảnh
type ImageItem = {
  id: string;
  uri: string | ImageSourcePropType;
};

interface PostProps {
  username: string;
  isVerified?: boolean;
  location?: string | null;
  images: ImageItem[];
  commentCount: number;
  likeCount: number;
  sharedCount: number;
  caption: string;
  author: {
    username: string;
    profilePic: string | null;
  };
  isPublic: boolean;
  isOwner?: boolean;
  onEditPost?: () => void;
  onDeletePost?: () => void;
  isLoading?: boolean;
  postId?: string;
  authorId?: string;
  isLike?: boolean;
}

const Post: React.FC<PostProps> = ({
  username = 'joshua_J',
  isVerified = true,
  location = 'Tokyo, Japan',
  images = [
    {
      id: '1',
      uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-LhKXgWZZXVwVm29H8Ay2tt6J90DBga.png'
    }
  ],
  commentCount = 1236,
  likeCount = 44686,
  sharedCount = 0,
  caption = 'The game in Japan was amazing and I want to share some photos',
  author = {
    username: 'joshua_J',
    profilePic: 'https://randomuser.me/api/portraits/men/43.jpg',
  },
  isPublic = true,
  isOwner = false,
  onEditPost,
  onDeletePost,
  isLoading = false,
  postId,
  authorId,
  isLike = false,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const [isOptionsMenuVisible, setIsOptionsMenuVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();
  const user = useSelector((state: RootState) => state.auth);

  // Lấy trạng thái like từ Redux store
  const isLiked = useSelector((state: RootState) =>
    state.like.likedPosts.includes(postId || '')
  );

  // Lấy likeCount từ Redux store
  const currentPost = useSelector((state: RootState) =>
    state.post.posts.find(post => post.id === postId) ||
    state.post.myPosts.find(post => post.id === postId)
  );

  const currentLikeCount = currentPost?.likeCount ?? likeCount;

  // Khởi tạo trạng thái like khi component mount
  useEffect(() => {
    if (postId) {
      dispatch(initializeLikeStatus({ postId, isLiked: isLike }));
    }
  }, [dispatch, postId, isLike]);

  const goToImage = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      flatListRef.current?.scrollToOffset({
        offset: index * width,
        animated: true
      });
      setActiveImageIndex(index);
    }
  }, [images.length]);

  const handleImagePress = useCallback((index: number) => {
    setActiveImageIndex(index);
    setIsImageViewVisible(true);
  }, []);

  const handleOptionsPress = useCallback(() => {
    setIsOptionsMenuVisible(true);
  }, []);

  const handleCloseOptionsMenu = useCallback(() => {
    setIsOptionsMenuVisible(false);
  }, []);

  const handleEditPost = useCallback(() => {
    setIsOptionsMenuVisible(false);
    onEditPost?.();
  }, [onEditPost]);

  const handleDeletePost = useCallback(async () => {
    setIsOptionsMenuVisible(false);

    if (!postId) {
      Toast.show({
        type: 'error',
        text1: 'Không thể xóa bài viết',
        text2: 'ID bài viết không hợp lệ',
      });
      return;
    }

    Alert.alert(
      'Xóa bài viết',
      'Bạn có chắc chắn muốn xóa bài viết này không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await dispatch(deletePost(postId));
              if (result.meta.requestStatus === 'fulfilled') {
                Toast.show({
                  type: 'success',
                  text1: 'Đã xóa bài viết thành công',
                });
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Không thể xóa bài viết',
                  text2: 'Vui lòng thử lại sau',
                });
              }
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Có lỗi xảy ra khi xóa bài viết',
              });
            }
          },
        },
      ]
    );
  }, [dispatch, postId]);

  const renderImageItem = useCallback(({ item, index }: { item: ImageItem; index: number }) => (
    <View style={{ width }}>
      <TouchableOpacity activeOpacity={1} onPress={() => handleImagePress(index)}>
        <Image
          source={typeof item.uri === 'string' ? { uri: item.uri } : item.uri}
          style={styles.postImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
      {images.length > 1 && (
        <View style={styles.carouselIndicator}>
          {images.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => goToImage(idx)}
            >
              <View
                style={[
                  styles.dot,
                  idx === activeImageIndex && styles.activeDot
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  ), [activeImageIndex, images.length, goToImage, handleImagePress]);

  const handleScrollBegin = useCallback(() => {
    setIsScrolling(true);
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isScrolling) {
      const slideSize = width;
      const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
      if (index >= 0 && index < images.length) {
        setActiveImageIndex(index);
      }
    }
  }, [isScrolling, images.length]);

  const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsScrolling(false);
    const slideSize = width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    if (index >= 0 && index < images.length) {
      setActiveImageIndex(index);
    }
  }, [images.length]);

  // Chuyển đổi mảng images để phù hợp với ImageView
  const imageViewImages = images.map(img => ({
    uri: typeof img.uri === 'string' ? img.uri : Image.resolveAssetSource(img.uri).uri
  }));

  return (
    <View style={styles.container}>
      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Đang đăng bài...</Text>
        </View>
      )}

      {/* Overlay để đóng menu khi click bên ngoài */}
      {isOptionsMenuVisible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleCloseOptionsMenu}
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.userInfo} onPress={() => {
          if (user.profile?.id === authorId) {
            navigation.navigate('InApp', { screen: 'Account' });
          } else {
            navigation.navigate('InfoAccPage', {
              id: authorId || ''
            });
          }
        }}>
          <Image
            source={{
              uri: author.profilePic || 'https://randomuser.me/api/portraits/men/43.jpg',
            }}
            style={styles.profilePic}
          />
          <View style={styles.userTextContainer}>
            <View style={styles.usernameContainer}>
              <Text style={styles.username}>{author.username}</Text>
              {isVerified && (
                <View style={styles.verifiedBadge}>
                  <FontAwesome name="check" size={8} color="#fff" />
                </View>
              )}
            </View>
            <Text style={styles.location}>{location}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.optionsContainer}>
          <TouchableOpacity onPress={handleOptionsPress}>
            <Feather name="more-horizontal" size={24} color="#262626" />
          </TouchableOpacity>

          {/* Dropdown Menu */}
          {isOptionsMenuVisible && (
            <View style={styles.dropdownMenu}>
              {isOwner && (
                <>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={handleEditPost}
                  >
                    <Feather name="edit" size={18} color="#262626" />
                    <Text style={styles.dropdownText}>Chỉnh sửa bài viết</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dropdownItem, styles.deleteItem]}
                    onPress={handleDeletePost}
                  >
                    <Feather name="trash-2" size={18} color="#e74c3c" />
                    <Text style={[styles.dropdownText, styles.deleteText]}>Xóa bài viết</Text>
                  </TouchableOpacity>
                </>
              )}

              {!isOwner && (
                <>
                  <TouchableOpacity style={styles.dropdownItem}>
                    <Feather name="flag" size={18} color="#262626" />
                    <Text style={styles.dropdownText}>Báo cáo bài viết</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.dropdownItem}>
                    <Feather name="user-x" size={18} color="#262626" />
                    <Text style={styles.dropdownText}>Chặn người dùng</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Caption */}
      <View style={styles.captionContainer}>
        <Text style={styles.caption}>
          {caption}
        </Text>
      </View>

      {/* Image Carousel */}
      <View style={styles.imageContainer}>
        <FlatList
          ref={flatListRef}
          data={images}
          renderItem={renderImageItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={width}
          snapToAlignment="center"
          decelerationRate={0.9}
          onScrollBeginDrag={handleScrollBegin}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          keyExtractor={(item) => item.id}
          disableIntervalMomentum={true}
          snapToOffsets={images.map((_, index) => index * width)}
          scrollEventThrottle={16}
        />

        {images.length > 1 && (
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {activeImageIndex + 1}/{images.length}
            </Text>
          </View>
        )}
      </View>

      {/* Image Viewer Modal */}
      <ImageView
        images={imageViewImages}
        imageIndex={activeImageIndex}
        visible={isImageViewVisible}
        onRequestClose={() => setIsImageViewVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
      />

      {/* Likes */}
      <View style={styles.likesContainer}>
        <Text style={styles.bold}>{currentLikeCount.toLocaleString()} likes</Text>
        <Text style={styles.bold}>  {commentCount.toLocaleString()} comments</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton} onPress={async () => {
            try {
              if (isLiked) {
                await dispatch(unlikePost(postId || '')).unwrap();
              } else {
                await dispatch(likePost(postId || '')).unwrap();
              }
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Có lỗi xảy ra',
                text2: 'Không thể thực hiện thao tác này',
              });
            }
          }}>
            <FontAwesome name={isLiked ? 'heart' : 'heart-o'} size={24} color={isLiked ? '#e74c3c' : '#262626'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="message-circle" size={24} color="#262626" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="send" size={24} color="#262626" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity>
          <Feather name="bookmark" size={24} color="#262626" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: BACKGROUND,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    borderTopColor: "#000",
    borderTopWidth: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: 50,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  userTextContainer: {
    justifyContent: 'center',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
    marginRight: 4,
  },
  verifiedBadge: {
    backgroundColor: '#3897f0',
    borderRadius: 10,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  location: {
    fontSize: 12,
    color: '#262626',
  },
  imageContainer: {
    position: 'relative',
  },
  postImage: {
    width: width,
    height: width,
  },
  imageCounter: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  imageCounterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  leftActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginRight: 16,
  },
  carouselIndicator: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 2,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  likesContainer: {
    paddingHorizontal: 12,
    marginBottom: 6,
    flexDirection: 'row',
  },
  likes: {
    fontSize: 14,
  },
  bold: {
    fontWeight: '600',
  },
  captionContainer: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  caption: {
    fontSize: 14,
    lineHeight: 18,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  optionsContainer: {
    position: 'relative',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 30,
    right: 0,
    backgroundColor: BACKGROUND,
    borderRadius: 8,
    paddingVertical: 4,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 8,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#262626',
  },
  deleteItem: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 4,
    paddingTop: 8,
  },
  deleteText: {
    color: '#e74c3c',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
});

export default Post;