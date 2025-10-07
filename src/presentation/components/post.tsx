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
    ScrollView,
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { BACKGROUND } from '@/src/const/constants';
import ImageView from 'react-native-image-viewing';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { deletePost, incrementCommentCount } from '../redux/slices/postSlice';
import { likePost, unlikePost, initializeLikeStatus } from '../redux/slices/likeSlice';
import Toast from 'react-native-toast-message';
import { useNavigation } from 'expo-router';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import EditPostModal from './modals/EditPostModal';
import CommentSection from './CommentSection';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

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
    isToday?: boolean;
    isFollowing?: boolean;
    isSelf?: boolean;
    createdAt?: string;
    updatedAt?: string;
    tags?: string[];
}

// Thêm function format time ở đầu component hoặc tạo utility function
const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const createdTime = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - createdTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
        return `${diffInSeconds}s`;
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d`;
    } else if (diffInSeconds < 2592000) {
        const weeks = Math.floor(diffInSeconds / 604800);
        return `${weeks}w`;
    } else {
        // Hiển thị ngày/tháng nếu quá lâu
        return createdTime.toLocaleDateString('vi-VN', { 
            day: '2-digit', 
            month: '2-digit' 
        });
    }
};

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
    tags,
    createdAt
}) => {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isImageViewVisible, setIsImageViewVisible] = useState(false);
    const [isOptionsMenuVisible, setIsOptionsMenuVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isCommentsModalVisible, setIsCommentsModalVisible] = useState(false);
    const [isExpandedCaption, setIsExpandedCaption] = useState(false);
    const [shouldShowSeeMore, setShouldShowSeeMore] = useState(false);

    const flatListRef = useRef<FlatList>(null);
    const [isScrolling, setIsScrolling] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation<NavigationProp>();
    const user = useSelector((state: RootState) => state.auth);

    // Lấy likeCount từ Redux store
    const currentPost = useSelector((state: RootState) => {
        const feedPost = state.post.feedPosts.find(post => post.id === postId);
        if (feedPost) return feedPost;

        const post = state.post.posts.find(post => post.id === postId);
        if (post) return post;

        const myPost = state.post.myPosts.find(post => post.id === postId);
        return myPost;
    });


    const isLiked = currentPost?.isLike ?? isLike ?? false;
    const currentLikeCount = currentPost?._count?.likes ?? currentPost?.likeCount ?? likeCount;
    const currentCommentCount = currentPost?._count?.comments ?? currentPost?.commentCount ?? commentCount;

    // Khởi tạo trạng thái like
    useEffect(() => {
        if (postId) {
            dispatch(initializeLikeStatus({ postId, isLiked: isLiked }));
        }
    }, [dispatch, postId, isLiked]);


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
                            await dispatch(deletePost(postId)).unwrap();
                            Toast.show({
                                type: 'success',
                                text1: 'Đã xóa bài viết',
                                text2: 'Bài viết của bạn đã được xóa thành công',
                            });
                        } catch (error) {
                            Toast.show({
                                type: 'error',
                                text1: 'Không thể xóa bài viết',
                                text2: 'Vui lòng thử lại sau',
                            });
                        }
                    },
                },
            ]
        );
    }, [postId, dispatch]);

    const handleCommentsPress = useCallback(() => {
        setIsCommentsModalVisible(true);
    }, []);

    const handleCloseCommentsModal = useCallback(() => {
        setIsCommentsModalVisible(false);
    }, []);

    const handleLikePress = useCallback(async () => {
        if (!postId) return;

        try {
            if (isLiked) {
                await dispatch(unlikePost(postId)).unwrap();
            } else {
                await dispatch(likePost(postId)).unwrap();
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể thực hiện thao tác này',
            });
        }
    }, [dispatch, postId, isLiked]);

    const handleScrollBegin = useCallback(() => {
        setIsScrolling(true);
    }, []);

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / width);
        setActiveImageIndex(index);
    }, []);

    const handleScrollEnd = useCallback(() => {
        setIsScrolling(false);
    }, []);

    const renderImageItem = useCallback(({ item, index }: { item: ImageItem; index: number }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleImagePress(index)}
        >
            <Image
                source={typeof item.uri === 'string' ? { uri: item.uri } : item.uri}
                style={styles.postImage}
                resizeMode="cover"
            />
        </TouchableOpacity>
    ), [handleImagePress]);

    const imageViewImages = images.map(img => ({
        uri: typeof img.uri === 'string' ? img.uri : Image.resolveAssetSource(img.uri).uri
    }));

    const handleCaptionTextLayout = useCallback((event: any) => {
        const { lines } = event.nativeEvent;
        if (lines.length > 3) {
            setShouldShowSeeMore(true);
        }
    }, []);

    const toggleCaptionExpansion = useCallback(() => {
        setIsExpandedCaption(!isExpandedCaption);
    }, [isExpandedCaption]);

    const renderCaption = () => {
        if (!shouldShowSeeMore) {
            return (
                <Text style={styles.caption} onTextLayout={handleCaptionTextLayout}>
                    {caption}
                </Text>
            );
        }

        if (isExpandedCaption) {
            return (
                <Text style={styles.caption}>
                    {caption}
                    <Text style={styles.seeMoreText} onPress={toggleCaptionExpansion}>
                        {' '}Thu gọn
                    </Text>
                </Text>
            );
        }

        // Truncate caption for collapsed state
        const truncatedCaption = caption.length > 100 ? 
            caption.substring(0, 100) + '...' : caption;

        return (
            <Text style={styles.caption}>
                {truncatedCaption}
                <Text style={styles.seeMoreText} onPress={toggleCaptionExpansion}>
                    {' '}Xem thêm
                </Text>
            </Text>
        );
    };

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
                        <Text style={styles.location}>
                            {createdAt ? formatTimeAgo(createdAt) : ''}
                        </Text>
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
                {renderCaption()}
            </View>

            {/* Tagged destinations (if any) */}
            {((currentPost?.taggedDestinations && currentPost.taggedDestinations.length > 0) ||
              (tags && tags.length > 0)) && (
              <View style={styles.taggedContainer}>
                <Feather name="map-pin" size={16} color="#262626" accessibilityLabel="Địa điểm gắn" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 12 }}>
                  {((currentPost?.taggedDestinations?.length ? currentPost.taggedDestinations : tags) || []).map((t: any, i: number) => {
                    const title =
                      typeof t === 'string'
                        ? t
                        : t.destination
                        ? t.destination.title
                        : t.title || 'Địa điểm';
                        
                    // Get destination data and id
                    const destinationData = typeof t === 'string' ? null : (t.destination || t);
                    const destinationId = destinationData?.id;
                    const parentId = destinationData?.parentId;
                    
                    const handleTagPress = () => {
                      if (!destinationId) return; // Skip if no ID available
                      
                      if (!parentId || parentId === null) {
                        // Navigate to AddressDetailPage
                        navigation.navigate('AddressDetailPage' as any, { 
                          id: destinationId, 
                          destinationData: destinationData 
                        });
                      } else {
                        // Navigate to TravelPlaceDetailPage
                        navigation.navigate('TravelPlaceDetailPage' as any, { 
                          id: destinationId, 
                          destinationData: destinationData 
                        });
                      }
                    };
                    
                    return (
                      <TouchableOpacity key={i} onPress={handleTagPress} style={styles.tagItemContainer}>
                        <Text numberOfLines={1} style={styles.tagItemText}>{title}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

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
                    <TouchableOpacity style={styles.actionButton} onPress={handleLikePress}>
                        <FontAwesome
                            name={isLiked ? "heart" : "heart-o"}
                            size={24}
                            color={isLiked ? "#e74c3c" : "#262626"}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={handleCommentsPress}>
                        <Feather name="message-circle" size={24} color="#262626" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Feather name="send" size={24} color="#262626" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.actionButton}>
                    <Feather name="bookmark" size={24} color="#262626" />
                </TouchableOpacity>
            </View>

            {/* Comment Section */}
            {postId && (
                <CommentSection
                    postId={postId}
                    currentCommentCount={currentCommentCount}
                    isVisible={isCommentsModalVisible}
                    onClose={handleCloseCommentsModal}
                />
            )}
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
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    dropdownText: {
        marginLeft: 12,
        fontSize: 16,
        color: '#262626',
    },
    deleteItem: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        minWidth: 200,
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'center',
    },
    loadingSubText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        marginTop: 4,
        textAlign: 'center',
    },
    taggedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    taggedLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginRight: 8,
    },
    tagItem: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
    },
    tagItemContainer: {
        // backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
    },
    tagItemText: {
        fontSize: 13,
        color: '#000',
        fontWeight: '500',
        textAlign: 'center',
        opacity: 0.6,
    },
    seeMoreText: {
        fontSize: 14,
        color: '#8e8e8e',
        fontWeight: '500',
    },
});

export default Post;