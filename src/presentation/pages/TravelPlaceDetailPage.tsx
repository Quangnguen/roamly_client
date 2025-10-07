import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator, SafeAreaView, FlatList } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { BACKGROUND, PRIMARY } from '@/src/const/constants';
import ImageViewing from 'react-native-image-viewing';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Post from '../components/post';
// Redux & destination helpers
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { getPosts } from '../redux/slices/postSlice';
import { getDestinationById } from '../redux/slices/destinationSlice';
// Reuse AddressDetailPage subcomponents for consistent UI
import DestinationHeader from '../components/address/DestinationHeader';
import DestinationInfo from '../components/address/DestinationInfo';
import DestinationActions from '../components/address/DestinationActions';
import DestinationDescription from '../components/address/DestinationDescription';
import DestinationMedia from '../components/address/DestinationMedia';
import DestinationSubLocations from '../components/address/DestinationSubLocations';
// Reviews / Add review (same behavior as AddressDetailPage)
import ReviewsModal from '../components/ReviewsModal';
import AddReviewModal from '../components/modals/AddReviewModal';
import { toggleFavoriteDestination, untoggleFavoriteDestination, getReviewsByDestinationId, addReviewDestination } from '../redux/slices/destinationSlice';
import { useAppSelector } from '../redux/hook';
import { de } from 'date-fns/locale';

const { width } = Dimensions.get('window');


type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TravelPlaceDetailPage = () => {
    const route = useRoute();
    const navigation = useNavigation<NavigationProp>();
    const { id } = route.params as { id: string };
    const [isVisible, setIsVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const { posts, loading } = useSelector((state: RootState) => state.post);

    // destination detail from store (use same selectors as AddressDetailPage)
    const {
      destinationDetail,
      destinationDetailLoading,
      destinationDetailError
    } = useSelector((state: RootState) => ({
      destinationDetail: state.destination.destinationDetail,
      destinationDetailLoading: state.destination.destinationDetailLoading,
      destinationDetailError: state.destination.destinationDetailError,
    }));

    const {
      reviews,
      reviewsLoading,
      reviewsError,
      addReviewLoading,
      addReviewError
    } = useAppSelector(state => ({
      reviews: state.destination.reviews,
      reviewsLoading: state.destination.reviewsLoading,
      reviewsError: state.destination.reviewsError,
      addReviewLoading: state.destination.addReviewLoading,
      addReviewError: state.destination.addReviewError
    }));

    const [isReviewsModalVisible, setIsReviewsModalVisible] = useState(false);
    const [isAddReviewModalVisible, setIsAddReviewModalVisible] = useState(false);

    // fetch destination detail + related posts
    useEffect(() => {
        dispatch(getDestinationById(id));
        dispatch(getPosts()); // keep fetching posts if you still want related posts
    }, [dispatch, id]);

    // build placeDetails from destinationDetail if available, otherwise fallback to previous mock
    const display = destinationDetail;

    const placeDetails = display ? {
        id: display.id,
        name: display.title,
        description: display.description,
        address: [display.location, display.city, display.country].filter(Boolean).join(', '),
        rating: display.rating ?? 0,
        reviewsCount: display.reviewCount ?? 0,
        images: (display.imageUrl || []).map((u: string) => ({ uri: u })),
        openTime:  '',
        closeTime:  '',
        ticketPrice: display.entryFee ?? '',
        features: display.facilities?.map((f: any, i:number) => ({ id: String(i), icon: 'map-signs', name: f })) || [],
    } : {
        // fallback mock (keeps previous UI until data loads)
        id,
        name: "Loading...",
        description: "",
        address: "",
        rating: 0,
        reviewsCount: 0,
        images: [],
        openTime: "",
        closeTime: "",
        ticketPrice: "",
        features: [],
    };

    // sync favorite button state with loaded data
    useEffect(() => {
      if (display) setIsFavorite(!!display.isLiked);
    }, [display]);

    const openReviewsModal = () => {
      setIsReviewsModalVisible(true);
      if (reviews.length === 0 && !reviewsLoading) {
        dispatch(getReviewsByDestinationId(id));
      }
    };

    const closeReviewsModal = () => setIsReviewsModalVisible(false);
    const openAddReviewModal = () => {
      setIsAddReviewModalVisible(true);
      setIsReviewsModalVisible(false);
    };
    const closeAddReviewModal = () => setIsAddReviewModalVisible(false);

    const handleSubmitReview = async (reviewData: {
      rating: number;
      comment: string;
      visitDate: string;
      images: string[];
    }) => {
      try {
        const formData = new FormData();
        formData.append('rating', reviewData.rating.toString());
        formData.append('comment', reviewData.comment);
        formData.append('visitDate', reviewData.visitDate);

        if (reviewData.images && reviewData.images.length > 0) {
          for (let i = 0; i < reviewData.images.length; i++) {
            const imageUri = reviewData.images[i];
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
              console.error('Error processing review image:', imageUri, error);
            }
          }
        }

        await dispatch(addReviewDestination({
          id: display?.id || id,
          images: formData,
          rating: reviewData.rating,
          comment: reviewData.comment,
          visitDate: reviewData.visitDate
        })).unwrap();

        // refresh destination & reviews
        dispatch(getDestinationById(id));
        dispatch(getReviewsByDestinationId(id));
        setIsAddReviewModalVisible(false);
      } catch (e) {
        console.error('Failed to submit review', e);
      }
    };

    const toggleFavorite = () => {
        const newVal = !isFavorite;
        setIsFavorite(newVal);
        if (newVal) {
          dispatch(toggleFavoriteDestination({ targetId: id, type: 'destination' }));
        } else {
          dispatch(untoggleFavoriteDestination({ targetId: id, type: 'destination' }));
        }
    };

    if (destinationDetailLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={PRIMARY} />
                <Text style={styles.loadingText}>Đang tải thông tin địa điểm...</Text>
            </SafeAreaView>
        );
    }

    if (destinationDetailError) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>Không thể tải thông tin địa điểm</Text>
                <Text style={styles.errorSubtext}>{destinationDetailError}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(getDestinationById(id))}>
                  <Text style={styles.retryButtonText}>Thử lại</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Use same header/components as AddressDetailPage for consistent layout */}
            <DestinationHeader
                imageUrl={placeDetails.images.length > 0 ? placeDetails.images[0].uri : undefined}
                title={placeDetails.name}
            />
            <View style={styles.contentContainer}>
                <DestinationInfo
                    title={placeDetails.name}
                    visitCount={display?.visitCount ?? 0}
                    likeCount={display?.likeCount ?? 0}
                    address={placeDetails.address}
                />
                <DestinationActions
                    isLiked={isFavorite}
                    onToggleLike={toggleFavorite}
                    rating={placeDetails.rating}
                    reviewCount={placeDetails.reviewsCount}
                    onViewReviews={openReviewsModal}
                    onAddReview={openAddReviewModal}
                />
                <DestinationDescription
                    description={placeDetails.description}
                    openingHours={display?.openingHours}
                    entryFee={display?.entryFee}
                    bestTimeToVisit={display?.bestTimeToVisit}
                    facilities={display?.facilities}
                />
                <DestinationMedia images={placeDetails.images.map((i: any) => i.uri)} />
                <DestinationSubLocations
                    homestays={display?.subLocations?.map((s:any) => ({
                        id: s.id,
                        name: s.title,
                        address: s.location,
                        imageUri: s.imageUrl?.[0] || '',
                        rating: s.rating,
                        numberOfReviews: s.reviewCount,
                    })) || []}
                    travelPlaces={display?.subLocations || []}
                />

                <View style={styles.postsSection}>
                    <Text style={styles.sectionTitle}>Bài viết liên quan</Text>
                </View>

                <View style={{ marginBottom: 30 }}>
                  {posts.map((post) => (
                      <Post
                          key={post.id}
                          username={post.author.username}
                          location={post.location}
                          images={post.imageUrl.map((url: string, index: number) => ({ id: index.toString(), uri: url }))}
                          commentCount={post.commentCount}
                          likeCount={post.likeCount}
                          sharedCount={post.sharedCount}
                          caption={post.caption}
                          author={post.author}
                          isPublic={post.isPublic}
                          isVerified={false}
                      />
                  ))}
                </View>
            </View>

            {/* Reviews Modal */}
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
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 300,
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        padding: 16,
        marginTop: -20,
        backgroundColor: BACKGROUND,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    stars: {
        flexDirection: 'row',
        marginRight: 8,
    },
    ratingText: {
        fontSize: 14,
        color: '#666',
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    addressText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
    },
    infoBox: {
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    infoTextContainer: {
        marginLeft: 12,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginTop: 2,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
        color: '#444',
    },
    readMoreText: {
        color: PRIMARY,
        marginTop: 8,
        fontSize: 14,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        paddingHorizontal: 8,
        marginBottom: 16,
    },
    featureText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#444',
    },
    galleryImage: {
        width: 200,
        height: 150,
        borderRadius: 8,
        marginRight: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: BACKGROUND,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: BACKGROUND,
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF385C',
    },
    errorSubtext: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 24,
    },
    retryButton: {
        marginTop: 16,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        backgroundColor: PRIMARY,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    postsSection: {
        marginTop: 32,
        marginBottom: 16,
    },
});

export default TravelPlaceDetailPage;