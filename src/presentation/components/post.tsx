import React, { useRef, useState, useCallback, useEffect, use } from 'react';
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
import { clearComments, createComment, getComments } from '../redux/slices/commentSlice';
import { socketService } from '../../services/socketService'; // Import socket instance
import TypingIndicator from './TypingIndicator';

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

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyingToUsername, setReplyingToUsername] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const commentInputRef = useRef<TextInput>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();
  const user = useSelector((state: RootState) => state.auth);
  const { comments: reduxComments, loading: loadingComment } = useSelector((state: RootState) => state.comment);

  useEffect(() => {
    console.log('Post component mounted with postId:', user.profile);
  }, [])

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
  var currentCommentCount = currentPost?._count?.comments ?? currentPost?.commentCount ?? commentCount;

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
    if (postId) {
    console.log('📋 Fetching comments for post:', postId);
    dispatch(getComments(postId));
    console.log('✅ Comments fetched successfully', reduxComments);
  }
}, [postId, dispatch]);

  const handleCloseCommentsModal = useCallback(() => {
    setIsCommentsModalVisible(false);
    setNewComment('');
    dispatch({
      type: 'comment/clearCommentsOnly', // Tạo action mới
      payload: null
    });
  }, []);

  const handleCommentLike = useCallback((commentId: string) => {
    console.log('🔍 Handling comment like for commentId:', commentId);
  }, []);

  // ✅ Setup socket listeners
  useEffect(() => {
    console.log('🔍 Socket service check:', {
      socketService: !!socketService,
      socketExists: typeof socketService.isConnected === 'function' ? true : false,
      socketConnected: typeof socketService.isConnected === 'function' ? socketService.isConnected() : false,
      postId: postId
    });

    if (!socketService) {
      console.warn('❌ SocketService is null/undefined');
      return;
    }

    if (typeof socketService.isConnected !== 'function' || !socketService.isConnected()) {
      console.warn('❌ Socket is not connected');
      return;
    }

    console.log('✅ Socket is ready, setting up listeners for postId:', postId);

    const handleNewComment = (data: { postId: string, comment: any, commentCount: number }) => {
      console.log('🔥 Real-time new comment received:', data);
      console.log('🔍 Current postId:', postId, 'Received postId:', data.postId);
      
      // Chỉ update nếu comment thuộc về post hiện tại
      if (data.postId === postId) {
        console.log('✅ PostId matches, updating UI');
        
        // ✅ Thêm comment vào Redux store (bao gồm cả parent và reply)
        dispatch({
          type: 'comment/addRealTimeComment',
          payload: data.comment
        });

        // ✅ Update comment count
        dispatch({
          type: 'post/updateCommentCount',
          payload: {
            postId: data.postId,
            commentCount: data.commentCount
          }
        });

        // ✅ Hiển thị toast nếu không phải người dùng hiện tại
        if (data.comment.authorId !== user.profile?.id) {
          const isReply = data.comment.parentId ? ' (trả lời)' : '';
          Toast.show({
            type: 'info',
            text1: `Bình luận mới${isReply}`,
            text2: `${data.comment.author.username}: ${data.comment.content.substring(0, 50)}${data.comment.content.length > 50 ? '...' : ''}`,
            visibilityTime: 2000,
          });
        }
      } else {
        console.log('⚠️ PostId does not match, ignoring comment');
      }
    };

    const handleCommentDeleted = (data: { commentId: string, postId: string }) => {
      console.log('🗑️ Real-time comment deleted:', data);
      if (data.postId === postId) {
        dispatch({
          type: 'comment/removeComment',
          payload: data.commentId
        });
      }
    };

    // ✅ Register listeners với logging
    console.log('📡 Registering socket listeners...');
    socketService.on('new_comment_auth', handleNewComment);
    socketService.on('comment_deleted', handleCommentDeleted);

    // Test listener bằng cách emit một event test

    // ✅ Cleanup listeners
    return () => {
      console.log('🧹 Cleaning up socket listeners for postId:', postId);
      socketService.off('new_comment_auth', handleNewComment);
      socketService.off('comment_deleted', handleCommentDeleted);
    };
  }, [postId, dispatch, user.profile?.id]);

  // ✅ Optimistic + Real-time comment handling
  const handleAddComment = useCallback(async () => {
    if (newComment.trim() && postId) {
      const commentText = newComment.trim();
      const parentId = replyingTo; // Use replyingTo as parentId
    
      // ✅ Tạo optimistic comment/reply
      const optimisticItem = {
        id: `temp-${Date.now()}`,
        content: commentText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: user.profile?.id || '',
          username: user.profile?.username || 'You',
          profilePic: user.profile?.profilePic || 'https://randomuser.me/api/portraits/men/10.jpg',
        },
        authorId: user.profile?.id || '',
        postId: postId,
        parentId: parentId || null,
        likeCount: 0,
        isLiked: false,
        isOptimistic: true,
        isEdited: false,
      };

      try {
        // // ✅ Thêm optimistic comment ngay lập tức
        // dispatch({
        //   type: 'comment/addOptimisticComment',
        //   payload: optimisticItem
        // });

        setNewComment('');
        setIsTyping(false);
        commentInputRef.current?.blur();
        
        // Clear reply state
        setReplyingTo(null);
        setReplyingToUsername('');

        // ✅ Gửi request đến server
        const result = await dispatch(createComment({
          postId: postId,
          content: commentText,
          parentId: parentId || undefined
        })).unwrap();

        console.log('✅ Comment/Reply created successfully:', result);

        // ✅ Remove optimistic comment
        dispatch({
          type: 'comment/removeOptimisticComment',
          payload: optimisticItem.id
        });

      } catch (error: any) {
        // ✅ Remove optimistic comment nếu thất bại
        dispatch({
          type: 'comment/removeOptimisticComment',
          payload: optimisticItem.id
        });

        setNewComment(commentText);
        
        // Restore reply state if was replying
        if (parentId) {
          setReplyingTo(parentId);
          setReplyingToUsername(replyingToUsername);
        }
        
        Toast.show({
          type: 'error',
          text1: 'Không thể thêm bình luận',
          text2: error || 'Vui lòng thử lại sau',
          visibilityTime: 3000,
        });
      }
    }
  }, [newComment, postId, replyingTo, replyingToUsername, dispatch, user.profile]);

  const handleKeyPress = useCallback((e: any) => {
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  }, [handleAddComment]);

  const handleReplyPress = useCallback((commentId: string, username: string) => {
    setReplyingTo(commentId);
    setReplyingToUsername(username);
    setNewComment(`@${username} `);
    commentInputRef.current?.focus();
  }, []);

  // ✅ Component render reply item
  const renderReplyItem = useCallback(({ reply }: { reply: any }) => {
    if (!reply || !reply.id || !reply.content || !reply.author) {
      return null;
    }

    return (
      <View style={styles.replyItem}>
        <View style={styles.replyLine} />
        <Image 
          source={{ 
            uri: reply.author.profilePic || 'https://randomuser.me/api/portraits/men/10.jpg' 
          }} 
          style={styles.replyProfilePic} 
        />
        <View style={styles.replyContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentUsername}>
              {reply.author.username}
            </Text>
            <Text style={styles.commentTime}>
              {reply.createdAt ? new Date(reply.createdAt).toLocaleDateString() : ''}
            </Text>
          </View>
          <Text style={styles.commentText}>
            {reply.content}
          </Text>
          <View style={styles.commentActions}>
            <TouchableOpacity
              style={styles.commentLikeButton}
              onPress={() => handleCommentLike(reply.id)}
            >
              <FontAwesome
                name={reply.isLiked ? 'heart' : 'heart-o'}
                size={12}
                color={reply.isLiked ? '#e74c3c' : '#8e8e8e'}
              />
              <Text style={[styles.commentLikeCount, reply.isLiked && styles.commentLikeCountActive]}>
                {reply.likeCount || 0}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.commentReplyButton}
              onPress={() => handleReplyPress(reply.parentId, reply.author.username)}
            >
              <Text style={styles.commentReplyText}>Trả lời</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }, [handleCommentLike, handleReplyPress]);

  // ✅ Cập nhật renderCommentItem để hiển thị nested
  const renderCommentItem = useCallback(({ item, index }: { item: any; index: number }) => {
    // Validation
    if (!item || !item.id || !item.content || !item.author || !item.author.username) {
      return null;
    }

    // ✅ Kiểm tra nếu đây là reply (có parentId) thì không render ở top level
    if (item.parentId) {
      return null;
    }

    // ✅ Tìm tất cả replies cho comment này
    const replies = reduxComments?.filter(comment => 
      comment.parentId === item.id
    ) || [];

    return (
      <View style={styles.commentItemContainer}>
        {/* Parent Comment */}
        <View style={styles.commentItem}>
          <Image 
            source={{ 
              uri: item.author.profilePic || 'https://randomuser.me/api/portraits/men/10.jpg' 
            }} 
            style={styles.commentProfilePic} 
          />
          <View style={styles.commentContent}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentUsername}>
                {item.author.username}
              </Text>
              <Text style={styles.commentTime}>
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
              </Text>
              {item.isOptimistic && (
                <ActivityIndicator size="small" color="#3897f0" style={{ marginLeft: 8 }} />
              )}
            </View>
            <Text style={[styles.commentText, item.isOptimistic && styles.optimisticText]}>
              {item.content}
            </Text>
            {!item.isOptimistic && (
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
                    {item.likeCount || 0}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.commentReplyButton}
                  onPress={() => handleReplyPress(item.id, item.author.username)}
                >
                  <Text style={styles.commentReplyText}>Trả lời</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* ✅ Replies Section */}
        {replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {replies.map((reply, replyIndex) => (
              <View key={reply.id || `reply-${replyIndex}`}>
                {renderReplyItem({ reply })}
              </View>
            ))}
          </View>
        )}

        {/* ✅ Show reply indicator if currently replying to this comment */}
        {replyingTo === item.id && (
          <View style={styles.replyingIndicator}>
            <View style={styles.replyLine} />
            <Text style={styles.replyingText}>Đang soạn trả lời...</Text>
          </View>
        )}
      </View>
    );
  }, [handleCommentLike, handleReplyPress, replyingTo, reduxComments, renderReplyItem]);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
    setReplyingToUsername('');
    setNewComment('');
    commentInputRef.current?.blur();
  }, []);

  const handleInputChange = useCallback((text: string) => {
    setNewComment(text);
    
    // ✅ Show typing animation
    setIsTyping(true);
    
    // ✅ Hide typing animation after 1 second of no typing
    const timer = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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

          {/* {loadingComment ? (
            <View style={styles.loadingCommentsContainer}>
              <ActivityIndicator size="large" color="#3897f0" />
              <Text style={styles.loadingCommentsText}>Đang tải bình luận...</Text>
            </View>
          ) : ( */}
            <FlatList
              data={reduxComments || []}
              renderItem={renderCommentItem}
              keyExtractor={(item, index) => {
                // ✅ Đảm bảo key luôn unique và valid
                if (item?.id) {
                  return item.id.toString();
                }
                // Fallback cho các comment không có id
                return `comment-${index}-${Date.now()}`;
              }}
              style={styles.commentsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyCommentsContainer}>
                  <Text style={styles.emptyCommentsText}>Chưa có bình luận nào</Text>
                </View>
              }
              removeClippedSubviews={false} // ✅ Tắt để tránh lỗi render
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              windowSize={10}
            />
          {/* )} */}

          <View style={styles.commentInputContainer}>
            {/* ✅ Reply indicator - bật lại */}
            {/* {replyingTo && (
              <View style={styles.replyIndicator}>
                <Text style={styles.replyText}>
                  Đang trả lời <Text style={styles.replyUsername}>@{replyingToUsername}</Text>
                </Text>
                <TouchableOpacity onPress={handleCancelReply}>
                  <Feather name="x" size={16} color="#8e8e8e" />
                </TouchableOpacity>
              </View>
            )} */}
            
            {/* ✅ Input row - sửa lại flexDirection */}
            <View style={styles.inputRow}>
              <Image
                source={{
                  uri: user.profile?.profilePic || 'https://randomuser.me/api/portraits/men/10.jpg',
                }}
                style={styles.commentInputProfilePic}
              />
              <TextInput
                ref={commentInputRef}
                style={styles.commentInput}
                placeholder={replyingTo ? `Trả lời ${replyingToUsername}...` : "Thêm bình luận..."}
                value={newComment}
                onChangeText={handleInputChange}
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={handleAddComment}
                enablesReturnKeyAutomatically={true}
                multiline
                // blurOnSubmit is not needed because multiline is always true
              />
              <TouchableOpacity
                style={[
                  styles.commentSendButton,
                  newComment.trim() && !loadingComment ? styles.commentSendButtonActive : {}
                ]}
                onPress={handleAddComment}
                disabled={!newComment.trim() || loadingComment}
              >
                {loadingComment ? (
                  <ActivityIndicator size="small" color="#3897f0" />
                ) : (
                  <Feather
                    name="send"
                    size={20}
                    color={newComment.trim() ? '#3897f0' : '#8e8e8e'}
                  />
                )}
              </TouchableOpacity>
            </View>
            
            {/* ✅ Typing Indicator */}
            {/* <TypingIndicator isVisible={isTyping} /> */}
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
  commentItemContainer: {
    marginBottom: 16,
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
    marginRight: 8, // ✅ Giảm margin
  },
  commentInput: {
    flex: 1, // ✅ Đảm bảo input chiếm hết không gian còn lại
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 80,
    minHeight: 36, // ✅ Thêm minHeight
    fontSize: 14,
    backgroundColor: '#f8f8f8',
    marginRight: 8, // ✅ Thêm margin right
  },
  commentSendButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    // ✅ Bỏ marginLeft
  },
  commentSendButtonActive: {
    backgroundColor: 'rgba(56, 151, 240, 0.1)',
    borderRadius: 16,
  },
  loadingCommentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingCommentsText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyCommentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyCommentsText: {
    fontSize: 14,
    color: '#999',
  },
  optimisticText: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
  replyIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3897f0',
  },
  replyText: {
    fontSize: 12,
    color: '#1976d2',
  },
  replyUsername: {
    fontWeight: '600',
    color: '#3897f0',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    // ✅ Bỏ flex: 1 ở đây
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
  },
  typingProfilePic: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  typingBubble: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666',
    marginHorizontal: 1,
  },
  repliesContainer: {
    marginLeft: 44, // Indent replies (32px avatar + 12px margin)
    marginTop: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#f0f0f0',
    paddingLeft: 12,
  },
  replyItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    position: 'relative',
  },
  replyLine: {
    position: 'absolute',
    left: -14,
    top: 0,
    bottom: '50%',
    width: 2,
    backgroundColor: '#e0e0e0',
  },
  replyProfilePic: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 44,
    marginTop: 4,
    paddingVertical: 4,
    paddingLeft: 12,
  },
  replyingText: {
    fontSize: 12,
    color: '#3897f0',
    fontStyle: 'italic',
    marginLeft: 8,
  },
});

export default Post;