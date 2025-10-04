import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator, FlatList, SafeAreaView } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { BACKGROUND, PRIMARY } from '@/src/const/constants';
import ImageViewing from 'react-native-image-viewing';
import AddressDetails from '@/src/types/addressDetailInterface';
import SquareCard from '../components/squareCardForHomeStay';
import Post from '../components/post';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { getPosts } from '../redux/slices/postSlice';
import { getDestinationById, toggleFavoriteDestination, untoggleFavoriteDestination } from '../redux/slices/destinationSlice';
import { useAppSelector } from '../redux/hook';
import { Destination } from '@/src/types/DestinationInterface';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ImageItem = {
    id: string;
    uri: string;
};

const AddressDetailPage = () => {
    const route = useRoute();
    const navigation = useNavigation<NavigationProp>();
    const { id, destinationData } = route.params as { id: string; destinationData?: Destination };
    const dispatch = useDispatch<AppDispatch>();
    const { posts, loading } = useSelector((state: RootState) => state.post);

    // Select destination detail state FIRST
    const { destinationDetail, destinationDetailLoading, destinationDetailError } = useAppSelector(state => ({
        destinationDetail: state.destination.destinationDetail,
        destinationDetailLoading: state.destination.destinationDetailLoading,
        destinationDetailError: state.destination.destinationDetailError
    }));

    const [isFollowing, setIsFollowing] = useState((destinationDetail || destinationData)?.isLiked || false);
    const [isVisible, setIsVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);

    // Load destination detail khi component mount
    useEffect(() => {
        // Always fetch from API for latest data, but destinationData can provide immediate display
        dispatch(getDestinationById(id));
    }, [dispatch, id]);

    // Update isFollowing state when destinationDetail or destinationData changes (sync with server)
    useEffect(() => {
        const data = destinationDetail || destinationData;
        if (data) {
            setIsFollowing(data.isLiked);
        }
    }, [destinationDetail, destinationData]);

    // Handle API errors - revert optimistic updates if needed
    useEffect(() => {
        if (destinationDetailError) {
            console.error('Destination API error:', destinationDetailError);
            // Note: For now, we rely on Redux to handle state consistency
            // If needed, we can add more sophisticated error handling here
        }
    }, [destinationDetailError]);


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

    const handleImageScroll = (event: any) => {
        const contentOffset = event.nativeEvent.contentOffset;
        const imageIndex = Math.round(contentOffset.x / width);
        setCurrentIndex(imageIndex);
    };

    const toggleFullScreenPreview = () => {
        setIsFullScreenPreview(!isFullScreenPreview);
    };

    // 🎯 Images giờ được lấy từ API destinationDetail.imageUrl

    // 🎯 Tạo placeDetails từ destinationDetail hoặc destinationData (API data)
    // Ưu tiên destinationDetail (từ API), fallback sang destinationData (từ navigation)
    const displayData = destinationDetail || destinationData;
    const placeDetails: AddressDetails = displayData ? {
        id: displayData.id,
        name: displayData.title,
        numberFollowers: displayData.likeCount,
        address: `${displayData.location}, ${displayData.city}, ${displayData.country}`,
        description: displayData.description,
        images: displayData.imageUrl?.map(url => ({ uri: url })) || [],
        isFollowing: displayData.isLiked,
        rating: displayData.rating,
        reviewsCount: displayData.reviewCount,
        homestayes: displayData.subLocations?.map(sub => ({
            id: sub.id,
            name: sub.title,
            address: sub.location,
            imageUri: sub.imageUrl?.[0] || 'default-image',
            rating: sub.rating,
            numberOfReviews: sub.reviewCount,
        })) || [],
        travelPlaces: [],
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
        homestayes: [],
        travelPlaces: [],
    };


    // Tạo render function cho header content (tất cả content trừ posts)
    const renderHeader = useCallback(() => (
        <>
            {/* Ảnh địa điểm với nút quay lại */}
            <View style={styles.imageContainer}>
                <Image
                    source={placeDetails.images.length > 0 ? { uri: placeDetails.images[0].uri } : require('../../../assets/images/natural2.jpg')}
                    style={styles.image}
                    resizeMode="cover"
                />
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Thông tin cơ bản */}
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{placeDetails.name}</Text>
                <View style={styles.infoRow}>
                    <Ionicons name="person" size={20} color={PRIMARY} />
                    <Text style={styles.infoText}>{placeDetails.numberFollowers} người theo dõi</Text>
                </View>
                {/* Địa chỉ */}
                <View style={styles.infoRow}>
                    <FontAwesome name="map-marker" size={20} color={PRIMARY} style={{ paddingLeft: 2 }} />
                    <Text style={styles.infoText}>{placeDetails.address}</Text>
                </View>

                {/* Nút yêu thích */}
                <TouchableOpacity
                    style={[styles.followButton, isFollowing && styles.followingButton]}
                    onPress={toggleFollow}
                    activeOpacity={0.7}
                >
                    <Ionicons name={isFollowing ? "heart" : "heart-outline"} size={16} color={isFollowing ? "#FF3B30" : "#fff"} />
                    <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                        {isFollowing ? 'Đã thích' : 'Yêu thích'}
                    </Text>
                </TouchableOpacity>

                {/* Rating và Reviews */}
                {placeDetails.rating > 0 && (
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={20} color="#FFD700" />
                        <Text style={styles.ratingText}>
                            {placeDetails.rating.toFixed(1)} ({placeDetails.reviewsCount} đánh giá)
                        </Text>
                    </View>
                )}

                {/* Mô tả */}
                <Text style={styles.sectionTitle}>Giới thiệu</Text>
                <Text style={styles.description}
                    numberOfLines={isExpanded ? undefined : 4}
                    onPress={() => setIsExpanded(!isExpanded)}
                >
                    {placeDetails.description}
                </Text>

                <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                    <Text style={styles.readMoreText}>
                        {isExpanded ? 'Thu gọn' : 'Xem thêm...'}
                    </Text>
                </TouchableOpacity>

                {/* Thông tin thêm từ API */}
                {displayData && (
                    <View style={styles.additionalInfoContainer}>
                        {displayData.openingHours && (
                            <View style={styles.infoRow}>
                                <Ionicons name="time" size={20} color={PRIMARY} />
                                <Text style={styles.infoText}>{displayData.openingHours}</Text>
                            </View>
                        )}
                        {displayData.entryFee && (
                            <View style={styles.infoRow}>
                                <Ionicons name="cash" size={20} color={PRIMARY} />
                                <Text style={styles.infoText}>
                                    {displayData.entryFee.adult.toLocaleString()} VND (người lớn), {displayData.entryFee.child.toLocaleString()} VND (trẻ em)
                                </Text>
                            </View>
                        )}
                        {displayData.bestTimeToVisit && (
                            <View style={styles.infoRow}>
                                <Ionicons name="calendar" size={20} color={PRIMARY} />
                                <Text style={styles.infoText}>Thời điểm tốt nhất: {displayData.bestTimeToVisit}</Text>
                            </View>
                        )}
                        {displayData.facilities && displayData.facilities.length > 0 && (
                            <View style={styles.facilitiesContainer}>
                                <Text style={styles.facilitiesTitle}>Tiện ích:</Text>
                                <View style={styles.facilitiesList}>
                                    {displayData.facilities.map((facility, index) => (
                                        <View key={index} style={styles.facilityItem}>
                                            <Text style={styles.facilityText}>{facility}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* Ảnh */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ảnh</Text>
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                        {placeDetails.images.map((image, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    setCurrentIndex(index);
                                    setIsVisible(true);
                                }}
                            >
                                <Image
                                    source={{ uri: image.uri }}
                                    style={styles.galleryImage}
                                />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Image Viewer */}
                <ImageViewing
                    images={placeDetails.images}
                    imageIndex={currentIndex}
                    visible={isVisible}
                    onRequestClose={() => setIsVisible(false)}
                />

                <View>
                    <Text style={styles.sectionTitle}>Địa điểm du lịch</Text>
                    <ScrollView horizontal={true} style={styles.horizontalScrollView}
                        showsHorizontalScrollIndicator={false}
                    >
                        {placeDetails.travelPlaces.map((travelPlace) => (
                            <SquareCard
                                key={travelPlace.id}
                                imageUri={travelPlace.imageUri}
                                name={travelPlace.name}
                                id={travelPlace.id}
                                numberOfLikes={travelPlace.numberOfLikes}
                                type='place'
                                onPress={() => navigation.navigate('TravelPlaceDetailPage', {
                                    id: travelPlace.id,
                                })}
                            />
                        ))}
                    </ScrollView>
                </View>
                <View>
                    <Text style={styles.sectionTitle}>Homestay</Text>
                    <ScrollView horizontal={true} style={styles.horizontalScrollView}
                        showsHorizontalScrollIndicator={false}
                    >
                        {placeDetails.homestayes.map((homestay) => (
                            <SquareCard
                                key={homestay.id}
                                address={homestay.address}
                                imageUri={homestay.imageUri}
                                name={homestay.name}
                                rating={homestay.rating}
                                id={homestay.id}
                                numberOfReviews={homestay.numberOfReviews}
                                type='homestay'
                                onPress={() => navigation.navigate('HomeStayDetailPage', {
                                    id: homestay.id,
                                })}
                            />
                        ))}
                    </ScrollView>
                </View>

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
        isExpanded,
        currentIndex,
        isVisible,
        navigation
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
                data={posts}
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: BACKGROUND,
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
