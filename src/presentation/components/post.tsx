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
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { BACKGROUND } from '@/src/const/constants';
import ImageView from 'react-native-image-viewing';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { deletePost } from '../redux/slices/postSlice';
import { likePost, unlikePost, initializeLikeStatus, handleSocketPostLiked, handleSocketPostUnliked } from '../redux/slices/likeSlice';
import Toast from 'react-native-toast-message';
import { navigate } from 'expo-router/build/global-state/routing';
import { useNavigation } from 'expo-router';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import EditPostModal from './modals/EditPostModal';
import { useSocket } from '@/src/hook/useSocket';
import { socketService } from '@/src/services/socketService';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Định nghĩa kiểu dữ liệu cho ảnh
type ImageItem = {
  id: string;
  uri: string | ImageSourcePropType;
};

// Định nghĩa kiểu dữ liệu cho bình luận
type Comment = {
  id: string;
  author: {
    username: string;
    profilePic: string;
  };
  content: string;
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
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
  isToday?: boolean;
  isFollowing?: boolean;
  isSelf?: boolean;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
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
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCommentsModalVisible, setIsCommentsModalVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const commentInputRef = useRef<TextInput>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();
  const user = useSelector((state: RootState) => state.auth);

  // Dữ liệu giả cho bình luận
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: {
        username: 'alice_wonder',
        profilePic: 'https://randomuser.me/api/portraits/women/1.jpg',
      },
      content: 'Những bức ảnh tuyệt vời! Nhật Bản thật đẹp 😍',
      createdAt: '2 giờ trước',
      likeCount: 12,
      isLiked: false,
    },
    {
      id: '2',
      author: {
        username: 'david_travel',
        profilePic: 'https://randomuser.me/api/portraits/men/2.jpg',
      },
      content: 'Mình cũng muốn đến Tokyo quá! Có thể chia sẻ thêm kinh nghiệm không?',
      createdAt: '1 giờ trước',
      likeCount: 8,
      isLiked: true,
    },
    {
      id: '3',
      author: {
        username: 'sarah_photo',
        profilePic: 'https://randomuser.me/api/portraits/women/3.jpg',
      },
      content: 'Góc chụp này ở đâu vậy? Mình cũng muốn check-in 📸',
      createdAt: '45 phút trước',
      likeCount: 5,
      isLiked: false,
    },
    {
      id: '4',
      author: {
        username: 'mike_adventures',
        profilePic: 'https://randomuser.me/api/portraits/men/4.jpg',
      },
      content: 'Amazing shots! Japan is definitely on my bucket list now 🇯🇵',
      createdAt: '30 phút trước',
      likeCount: 15,
      isLiked: false,
    },
    {
      id: '5',
      author: {
        username: 'jenny_foodie',
        profilePic: 'https://randomuser.me/api/portraits/women/5.jpg',
      },
      content: 'Có thử món nào ngon ở Tokyo không? Chia sẻ cho mình với! 🍜',
      createdAt: '15 phút trước',
      likeCount: 3,
      isLiked: false,
    },
  ]);

  // Lấy likeCount từ Redux store - ưu tiên non-optimistic posts
  const currentPost = useSelector((state: RootState) => {
    // Tìm trong feedPosts trước (vì đây là nguồn chính cho HomePage)
    const feedPost = state.post.feedPosts.find(post => post.id === postId);
    if (feedPost) return feedPost;

    // Sau đó tìm trong posts
    const post = state.post.posts.find(post => post.id === postId);
    if (post) return post;

    // Cuối cùng tìm trong myPosts
    const myPost = state.post.myPosts.find(post => post.id === postId);
    return myPost;
  });

  // Sử dụng isLike từ Redux store post hoặc fallback to prop
  const isLiked = currentPost?.isLike ?? isLike ?? false;

  // Ưu tiên _count từ Redux, fallback theo thứ tự: Redux _count -> Redux likeCount -> prop likeCount
  const currentLikeCount = currentPost?._count?.likes ?? currentPost?.likeCount ?? likeCount;

  // Defensive coding cho commentCount
  const currentCommentCount = currentPost?._count?.comments ?? currentPost?.commentCount ?? commentCount;

  // Khởi tạo và sync trạng thái like
  useEffect(() => {
    if (postId) {
      // Sync với likeSlice để tracking
      dispatch(initializeLikeStatus({ postId, isLiked: isLiked }));
    }
  }, [dispatch, postId, isLiked]);

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
    setIsEditModalVisible(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalVisible(false);
  }, []);

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

  const handleCommentsPress = useCallback(() => {
    setIsCommentsModalVisible(true);
  }, []);

  const handleCloseCommentsModal = useCallback(() => {
    setIsCommentsModalVisible(false);
    setNewComment('');
  }, []);

  const handleCommentLike = useCallback((commentId: string) => {
    setComments(prevComments =>
      prevComments.map(comment =>
        comment.id === commentId
          ? {
            ...comment,
            isLiked: !comment.isLiked,
            likeCount: comment.isLiked ? comment.likeCount - 1 : comment.likeCount + 1
          }
          : comment
      )
    );
  }, []);

  const handleAddComment = useCallback(() => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: {
          username: user.profile?.username || 'current_user',
          profilePic: user.profile?.profilePic || 'https://randomuser.me/api/portraits/men/10.jpg',
        },
        content: newComment.trim(),
        createdAt: 'Vừa xong',
        likeCount: 0,
        isLiked: false,
      };
      setComments(prevComments => [comment, ...prevComments]);
      setNewComment('');
      // Blur input để tắt bàn phím sau khi gửi
      commentInputRef.current?.blur();
    }
  }, [newComment, user.profile]);

  const handleKeyPress = useCallback((e: any) => {
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  }, [handleAddComment]);

  const renderCommentItem = useCallback(({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Image source={{ uri: item.author.profilePic }} style={styles.commentProfilePic} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUsername}>{item.author.username}</Text>
          <Text style={styles.commentTime}>{item.createdAt}</Text>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.commentLikeButton}
            onPress={() => handleCommentLike(item.id)}
          >
            <FontAwesome
              name={item.isLiked ? 'heart' : 'heart-o'}
              size={12}
              color={item.isLiked ? '#e74c3c' : '#8e8e8e'}
            />
            <Text style={[styles.commentLikeCount, item.isLiked && styles.commentLikeCountActive]}>
              {item.likeCount}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.commentReplyButton}>
            <Text style={styles.commentReplyText}>Trả lời</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ), [handleCommentLike]);

  return (
    <View style={styles.container}>
      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Đang đăng bài...</Text>
            <Text style={styles.loadingSubText}>Vui lòng đợi trong giây lát</Text>
          </View>
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

      {/* Edit Post Modal */}
      {postId && (
        <EditPostModal
          visible={isEditModalVisible}
          onClose={handleCloseEditModal}
          post={{
            caption,
            location: location || null,
            isPublic,
            images: images.map(img => ({
              uri: typeof img.uri === 'string' ? img.uri : Image.resolveAssetSource(img.uri).uri
            }))
          }}
          postId={postId}
        />
      )}

      {/* Likes */}
      <View style={styles.likesContainer}>
        <Text style={styles.bold}>{currentLikeCount.toLocaleString()} lượt thích</Text>
        <TouchableOpacity onPress={handleCommentsPress}>
          <Text style={styles.bold}>  {currentCommentCount.toLocaleString()} bình luận</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton} onPress={async () => {
            if (!postId) {
              Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không tìm thấy ID bài viết',
              });
              return;
            }

            if (postId.startsWith('temp-')) {
              Toast.show({
                type: 'info',
                text1: 'Đợi một chút',
                text2: 'Bài viết đang được đăng, vui lòng đợi...',
              });
              return;
            }

            try {
              if (isLiked) {
                await dispatch(unlikePost(postId)).unwrap();
              } else {
                await dispatch(likePost(postId)).unwrap();
              }
              
              // ✅ Backend sẽ tự động emit socket events
              // Client chỉ cần lắng nghe và cập nhật UI
              
            } catch (error) {
              console.error('❌ Like/Unlike error:', error);
              Toast.show({
                type: 'error',
                text1: 'Có lỗi xảy ra',
                text2: 'Không thể thực hiện thao tác này',
              });
            }
          }}>
            <FontAwesome name={isLiked ? 'heart' : 'heart-o'} size={24} color={isLiked ? '#e74c3c' : '#262626'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleCommentsPress}>
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

      {/* Comments Modal */}
      <Modal
        visible={isCommentsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseCommentsModal}
      >
        <View style={styles.commentsModal}>
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>Bình luận</Text>
            <TouchableOpacity onPress={handleCloseCommentsModal}>
              <Feather name="x" size={24} color="#262626" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={comments}
            renderItem={renderCommentItem}
            keyExtractor={(item) => item.id}
            style={styles.commentsList}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.commentInputContainer}>
            <Image
              source={{
                uri: user.profile?.profilePic || 'https://randomuser.me/api/portraits/men/10.jpg',
              }}
              style={styles.commentInputProfilePic}
            />
            <TextInput
              ref={commentInputRef}
              style={styles.commentInput}
              placeholder="Thêm bình luận..."
              value={newComment}
              onChangeText={setNewComment}
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleAddComment}
              enablesReturnKeyAutomatically={true}
            />
            <TouchableOpacity
              style={[
                styles.commentSendButton,
                newComment.trim() ? styles.commentSendButtonActive : {}
              ]}
              onPress={handleAddComment}
              disabled={!newComment.trim()}
            >
              <Feather
                name="send"
                size={20}
                color={newComment.trim() ? '#3897f0' : '#8e8e8e'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginTop: 8,
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
    fontSize: 16,
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
  loadingContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  loadingSubText: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  // Comments Modal Styles
  commentsModal: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#262626',
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  commentProfilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    fontWeight: '600',
    fontSize: 14,
    color: '#262626',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#8e8e8e',
  },
  commentText: {
    fontSize: 14,
    color: '#262626',
    lineHeight: 18,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  commentLikeCount: {
    fontSize: 12,
    color: '#8e8e8e',
    marginLeft: 4,
  },
  commentLikeCountActive: {
    color: '#e74c3c',
  },
  commentReplyButton: {
    paddingVertical: 2,
  },
  commentReplyText: {
    fontSize: 12,
    color: '#8e8e8e',
    fontWeight: '500',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: BACKGROUND,
  },
  commentInputProfilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 80,
    fontSize: 14,
    backgroundColor: '#f8f8f8',
  },
  commentSendButton: {
    marginLeft: 12,
    padding: 8,
  },
  commentSendButtonActive: {
    backgroundColor: 'rgba(56, 151, 240, 0.1)',
    borderRadius: 16,
  },
});

export default Post;