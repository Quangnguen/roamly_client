import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, SafeAreaView, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { BACKGROUND, PRIMARY } from '@/src/const/constants';
import AddressDetails from '@/src/types/addressDetailInterface';
import Post from '../components/post';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { getDestinationById, toggleFavoriteDestination, untoggleFavoriteDestination, getReviewsByDestinationId, addReviewDestination } from '../redux/slices/destinationSlice';
import { useAppSelector } from '../redux/hook';
import { Destination } from '@/src/types/DestinationInterface';
import ReviewsModal from '../components/ReviewsModal';
import AddReviewModal from '../components/modals/AddReviewModal';
import DestinationHeader from '../components/address/DestinationHeader';
import DestinationInfo from '../components/address/DestinationInfo';
import DestinationActions from '../components/address/DestinationActions';
import DestinationDescription from '../components/address/DestinationDescription';
import DestinationMedia from '../components/address/DestinationMedia';
import DestinationSubLocations from '../components/address/DestinationSubLocations';
import { getPostByDestinationId } from '../redux/slices/postSlice';

const { width } = Dimensions.get('window');

type ImageItem = {
    id: string;
    uri: string;
};

const AddressDetailPage = () => {
    const route = useRoute();
    const { id, destinationData } = route.params as { id: string; destinationData?: Destination };
    const dispatch = useDispatch<AppDispatch>();
    const { destinationPosts, loading } = useSelector((state: RootState) => state.post);

    // Select destination detail state FIRST
    const {
        destinationDetail,
        destinationDetailLoading,
        destinationDetailError,
        reviews,
        reviewsLoading,
        reviewsError,
        addReviewLoading
    } = useAppSelector(state => ({
        destinationDetail: state.destination.destinationDetail,
        destinationDetailLoading: state.destination.destinationDetailLoading,
        destinationDetailError: state.destination.destinationDetailError,
        reviews: state.destination.reviews,
        reviewsLoading: state.destination.reviewsLoading,
        reviewsError: state.destination.reviewsError,
        addReviewLoading: state.destination.addReviewLoading,
        addReviewError: state.destination.addReviewError
    }));

    const [isFollowing, setIsFollowing] = useState((destinationDetail || destinationData)?.isLiked || false);
    const [isReviewsModalVisible, setIsReviewsModalVisible] = useState(false);
    const [isAddReviewModalVisible, setIsAddReviewModalVisible] = useState(false);

    // Load destination detail khi component mount
    useEffect(() => {
        // Always fetch from API for latest data, but destinationData can provide immediate display
        dispatch(getDestinationById(id));
        dispatch(getPostByDestinationId(id));
        dispatch(getReviewsByDestinationId(id));
    }, [dispatch, id]);

    // Update isFollowing state when destinationDetail or destinationData changes (sync with server)
    useEffect(() => {
        const data = destinationDetail || destinationData;
        if (data) {
            setIsFollowing(data.isLiked);
        }
    }, [destinationDetail, destinationData]);

    // // Handle API errors - revert optimistic updates if needed
    // useEffect(() => {
    //     if (destinationDetailError) {
    //         console.error('Destination API error:', destinationDetailError);
    //         // Note: For now, we rely on Redux to handle state consistency
    //         // If needed, we can add more sophisticated error handling here
    //     }
    // }, [destinationDetailError]);


    const toggleFollow = () => {
        // Optimistic update - update local state immediately
        const newIsFollowing = !isFollowing;
        setIsFollowing(newIsFollowing);

        // Dispatch API call
        if (newIsFollowing) {
            dispatch(toggleFavoriteDestination({ targetId: id, type: 'destination' }));
        } else {
            dispatch(untoggleFavoriteDestination({ targetId: id, type: 'destination' }));
        }
    };


    const openReviewsModal = () => {
        setIsReviewsModalVisible(true);
        // Load reviews if not already loaded
        if (reviews.length === 0 && !reviewsLoading) {
            dispatch(getReviewsByDestinationId(id));
        }
    };

    const closeReviewsModal = () => {
        setIsReviewsModalVisible(false);
    };

    const openAddReviewModal = () => {
        setIsAddReviewModalVisible(true);
        setIsReviewsModalVisible(false); // Close reviews modal when opening add review
    };

    const closeAddReviewModal = () => {
        setIsAddReviewModalVisible(false);
    };

    const handleSubmitReview = async (reviewData: {
        rating: number;
        comment: string;
        visitDate: string;
        images: string[];
    }) => {
        try {
            // Create FormData for API call
            const formData = new FormData();
            formData.append('rating', reviewData.rating.toString());
            formData.append('comment', reviewData.comment);
            formData.append('visitDate', reviewData.visitDate);

            // Add images if any
            if (reviewData.images && reviewData.images.length > 0) {
                for (let i = 0; i < reviewData.images.length; i++) {
                    const imageUri = reviewData.images[i];
                    // Convert image URI to blob for FormData
                    try {
                        const response = await fetch(imageUri);
                        const blob = await response.blob();
                        const fileName = `image_${i + 1}.jpg`;

                        formData.append('images', {
                            uri: imageUri,
                            type: blob.type || 'image/jpeg',
                            name: fileName,
                        } as any);
                    } catch (error) {
                        console.error('Error processing image:', imageUri, error);
                        // Skip this image if processing fails
                    }
                }
            }

            // Dispatch the action
            await dispatch(addReviewDestination({
                id,
                images: formData,
                rating: reviewData.rating,
                comment: reviewData.comment,
                visitDate: reviewData.visitDate
            })).unwrap();

            Alert.alert('Thành công', 'Cảm ơn bạn đã đánh giá!', [
                {
                    text: 'OK',
                    onPress: () => {
                        // Refresh destination data and reviews after successful submission
                        dispatch(getDestinationById(id));
                        dispatch(getReviewsByDestinationId(id));
                    }
                }
            ]);
        } catch (error) {
            console.error('Failed to submit review:', error);
            Alert.alert('Lỗi', 'Không thể gửi đánh giá. Vui lòng thử lại.');
        }
    };

    // 🎯 Images giờ được lấy từ API destinationDetail.imageUrl

    // 🎯 Tạo placeDetails từ destinationDetail hoặc destinationData (API data)
    // Ưu tiên destinationDetail (từ API), fallback sang destinationData (từ navigation)
    const displayData = destinationDetail || destinationData;
    const placeDetails: AddressDetails = displayData ? {
        id: displayData.id,
        name: displayData.title,
        numberFollowers: displayData.visitCount,
        address: `${displayData.location}, ${displayData.city}, ${displayData.country}`,
        description: displayData.description,
        images: displayData.imageUrl?.map(url => ({ uri: url })) || [],
        isFollowing: displayData.isLiked,
        rating: displayData.rating,
        reviewsCount: displayData.reviewCount,
        numberLikes: displayData.likeCount,
        homestayes: displayData.subLocations?.map(sub => ({
            id: sub.id,
            name: sub.title,
            address: sub.location,
            imageUri: sub.imageUrl?.[0] || 'default-image',
            rating: sub.rating,
            numberOfReviews: sub.reviewCount,
        })) || [],
        subLocations: displayData.subLocations || [],
    } : {
        // Fallback khi chưa load được data
        id: id,
        name: "Loading...",
        numberFollowers: 0,
        address: "",
        description: "",
        images: [],
        isFollowing: false,
        rating: 0,
        reviewsCount: 0,
        numberLikes: 0,
        homestayes: [],
        subLocations: [],
    };



    // 🎯 Tạo render function cho header content (tất cả content trừ posts)
    const renderHeader = useCallback(() => (
        <>
            {/* Header với ảnh và nút back */}
            <DestinationHeader
                imageUrl={placeDetails.images.length > 0 ? placeDetails.images[0].uri : undefined}
                title={placeDetails.name}
            />

            {/* Thông tin cơ bản */}
            <DestinationInfo
                title={placeDetails.name}
                visitCount={placeDetails.numberFollowers}
                likeCount={placeDetails.numberLikes}
                address={placeDetails.address}
            />

            {/* Actions (yêu thích, rating) */}
            <DestinationActions
                isLiked={isFollowing}
                onToggleLike={toggleFollow}
                rating={placeDetails.rating}
                reviewCount={placeDetails.reviewsCount}
                onViewReviews={openReviewsModal}
                onAddReview={openAddReviewModal}
            />

            {/* Content sections */}
            <View style={styles.contentContainer}>
                <DestinationDescription
                    description={placeDetails.description}
                    openingHours={displayData?.openingHours}
                    entryFee={displayData?.entryFee}
                    bestTimeToVisit={displayData?.bestTimeToVisit}
                    facilities={displayData?.facilities}
                />

                {/* Ảnh */}
                <DestinationMedia images={placeDetails.images.map((img: any) => img.uri)} />

                {/* Sub-locations */}
                <DestinationSubLocations
                    homestays={placeDetails.homestayes}
                    travelPlaces={placeDetails.subLocations || []}
                />

                {/* Separator và tiêu đề cho phần posts */}
                <View style={styles.postsSection}>
                    <Text style={styles.sectionTitle}>Bài viết liên quan</Text>
                </View>
            </View>
        </>
    ), [
        placeDetails,
        isFollowing,
        toggleFollow,
        displayData,
        openReviewsModal,
        openAddReviewModal
    ]);

    // Render function cho mỗi post
    const renderPost = useCallback(({ item: post }: { item: any }) => (
        <Post
            key={post.id}
            postId={post.id}
            username={post.author.username}
            location={post.location}
            images={post.imageUrl.map((url: string, index: number) => ({
                id: index.toString(),
                uri: url
            }))}
            commentCount={post.commentCount}
            likeCount={post.likeCount}
            sharedCount={post.sharedCount}
            caption={post.caption}
            author={post.author}
            isPublic={post.isPublic}
            isVerified={false}
            authorId={post.authorId}
            isLike={post.isLike}
        />
    ), []);

    // Show loading when destination detail is loading
    if (destinationDetailLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={PRIMARY} />
                    <Text style={styles.loadingText}>Đang tải thông tin địa điểm...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Show error if destination detail failed to load
    if (destinationDetailError) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Không thể tải thông tin địa điểm</Text>
                    <Text style={styles.errorSubtext}>{destinationDetailError}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => dispatch(getDestinationById(id))}
                    >
                        <Text style={styles.retryButtonText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={destinationPosts}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={3}
                windowSize={5}
                initialNumToRender={3}
                onEndReachedThreshold={0.5}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    loading ? (
                        <View style={styles.emptyContainer}>
                            <ActivityIndicator size="large" color="#888" />
                            <Text style={styles.emptyText}>Đang tải bài viết...</Text>
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
                        </View>
                    )
                }
            />

            <ReviewsModal
                visible={isReviewsModalVisible}
                onClose={closeReviewsModal}
                reviews={reviews}
                loading={reviewsLoading}
                error={reviewsError}
                destinationName={placeDetails.name}
                onRetry={() => dispatch(getReviewsByDestinationId(id))}
                onAddReview={openAddReviewModal}
            />

            <AddReviewModal
                visible={isAddReviewModalVisible}
                onClose={closeAddReviewModal}
                onSubmit={handleSubmitReview}
                destinationName={placeDetails.name}
                loading={addReviewLoading}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: BACKGROUND,
    },
    contentContainer: {
        paddingHorizontal: 16,
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: width,
        height: 250,
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    infoContainer: {
        padding: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 16,
        marginLeft: 12,
        color: '#333',
    },
    followButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: PRIMARY,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginVertical: 16,
    },
    followingButton: {
        backgroundColor: '#FFECEC',
        borderColor: '#FF3B30',
        borderWidth: 1,
    },
    followButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    followingButtonText: {
        color: '#FF3B30',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#444',
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    amenityText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#333',
    },
    bottomBar: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    actionButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    mainButton: {
        flex: 1,
        height: 50,
        backgroundColor: PRIMARY,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    readMoreText: {
        color: PRIMARY,
        marginTop: 4,
    },
    horizontalScrollView: {
        marginTop: 8,
    },
    smallImage: {
        width: 100,
        height: 100,
        marginRight: 8,
        borderRadius: 10,
    },
    fullScreenPreview: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'black',
        zIndex: 1000,
        height: width, // Sử dụng width để tạo hình vuông
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
    section: {
        marginBottom: 24,
        position: 'relative',
    },
    galleryImage: {
        width: 200,
        height: 150,
        borderRadius: 8,
        marginRight: 8,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: BACKGROUND,
    },
    loadingText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 16,
    },
    postsLoadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    postsSection: {
        marginTop: 16,
        marginBottom: 8,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: BACKGROUND,
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF3B30',
        textAlign: 'center',
        marginBottom: 8,
    },
    errorSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: PRIMARY,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    ratingText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    reviewsSection: {
        marginVertical: 8,
    },
    noReviewsContainer: {
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        marginVertical: 8,
    },
    noReviewsText: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
        marginBottom: 12,
        textAlign: 'center',
    },
    addFirstReviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: PRIMARY,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    addFirstReviewText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    additionalInfoContainer: {
        marginTop: 16,
        marginBottom: 8,
    },
    facilitiesContainer: {
        marginTop: 12,
    },
    facilitiesTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    facilitiesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    facilityItem: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    facilityText: {
        fontSize: 14,
        color: '#666',
    },
});

export default AddressDetailPage;
