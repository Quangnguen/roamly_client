import React, { useState, useRef, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Dimensions, FlatList, ActivityIndicator, ImageSourcePropType, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import Post from '../components/post';
import { BACKGROUND } from '@/src/const/constants';

// Định nghĩa kiểu params cho trang chi tiết homestay
type HomeStayDetailPageRouteProp = RouteProp<RootStackParamList, 'HomeStayDetailPage'>;

// Mô hình dữ liệu cho ảnh
type ImageItem = {
    id: string;
    uri: string | ImageSourcePropType;
};

// Mô hình dữ liệu cho đánh giá
type ReviewItem = {
    id: string;
    user: string;
    avatar: string;
    rating: number;
    comment: string;
    date?: string;
};

const posts = [
    {
        id: '1',
        username: 'joshua_J',
        isVerified: true,
        location: 'Tokyo, Japan',
        images: [
            { id: '1', uri: require('../../../assets/images/natural1.jpg') }
        ],
        likedBy: 'craig_love',
        likesCount: 44686,
        caption: 'The game in Japan was amazing and I want to share some photos',
    },
    {
        id: '2',
        username: 'joshua_J',
        isVerified: true,
        location: 'Tokyo, Japan',
        images: [
            { id: '1', uri: 'https://ik.imagekit.io/tvlk/blog/2024/07/canh-dep-viet-nam-6.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2' }
        ],
        likedBy: 'craig_love',
        likesCount: 44686,
        caption: 'The game in Japan was amazing and I want to share some photos',
    },
    {
        id: '3',
        username: 'joshua_J',
        isVerified: true,
        location: 'Tokyo, Japan',
        images: [
            { id: '1', uri: require('../../../assets/images/natural1.jpg') },
            { id: '2', uri: 'https://static.vinwonders.com/production/homestay-la-gi-thumb.jpg' }
        ],
        likedBy: 'craig_love',
        likesCount: 44686,
        caption: 'The game in Japan was amazing and I want to share some photos',
    },
    {
        id: '4',
        username: 'joshua_J',
        isVerified: true,
        location: 'Tokyo, Japan',
        images: [
            { id: '1', uri: 'https://ik.imagekit.io/tvlk/blog/2024/07/canh-dep-viet-nam-6.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2' }
        ],
        likedBy: 'craig_love',
        likesCount: 44686,
        caption: 'The game in Japan was amazing and I want to share some photos',
    },
    {
        id: '5',
        username: 'joshua_J',
        isVerified: true,
        location: 'Tokyo, Japan',
        images: [
            { id: '1', uri: require('../../../assets/images/natural1.jpg') }
        ],
        likedBy: 'craig_love',
        likesCount: 44686,
        caption: 'The game in Japan was amazing and I want to share some photos',
    },
    {
        id: '6',
        username: 'joshua_J',
        isVerified: true,
        location: 'Tokyo, Japan',
        images: [
            { id: '1', uri: 'https://ik.imagekit.io/tvlk/blog/2024/07/canh-dep-viet-nam-6.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2' }
        ],
        likedBy: 'craig_love',
        likesCount: 44686,
        caption: 'The game in Japan was amazing and I want to share some photos',
    },
];

// Thêm mockImages để demo vuốt ảnh
const mockImages: ImageItem[] = [
    { id: '1', uri: 'https://static.vinwonders.com/production/homestay-la-gi-thumb.jpg' },
    { id: '2', uri: 'https://vatlieuhousing.com/wp-content/uploads/2024/03/homestay-chuong-my.jpg' },
    { id: '3', uri: 'https://tourdulichmangden.vn/upload/news/homestay-mang-den-0-8434.jpg' },
];

// Mở rộng danh sách đánh giá để demo
const mockReviews: ReviewItem[] = [
    {
        id: '1',
        user: 'Nguyễn Văn A',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        rating: 5,
        comment: 'Homestay rất đẹp, sạch sẽ và chủ nhà thân thiện!',
        date: '12/08/2023',
    },
    {
        id: '2',
        user: 'Trần Thị B',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        rating: 4,
        comment: 'Vị trí thuận tiện, phòng ốc ổn, sẽ quay lại!',
        date: '05/09/2023',
    },
    {
        id: '3',
        user: 'Lê Văn C',
        avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
        rating: 3,
        comment: 'Ổn trong tầm giá, nhưng phòng hơi nhỏ.',
        date: '21/10/2023',
    },
    {
        id: '4',
        user: 'Phạm Thị D',
        avatar: 'https://randomuser.me/api/portraits/women/66.jpg',
        rating: 5,
        comment: 'Cực kỳ hài lòng với dịch vụ, phòng rộng rãi và thoáng mát.',
        date: '15/11/2023',
    },
    {
        id: '5',
        user: 'Hoàng Văn E',
        avatar: 'https://randomuser.me/api/portraits/men/30.jpg',
        rating: 4,
        comment: 'View rất đẹp, trang thiết bị hiện đại.',
        date: '30/12/2023',
    },
    {
        id: '6',
        user: 'Vũ Thị F',
        avatar: 'https://randomuser.me/api/portraits/women/31.jpg',
        rating: 5,
        comment: 'Đồ ăn sáng ngon, chủ nhà nhiệt tình hỗ trợ. Sẽ quay lại lần sau!',
        date: '10/01/2024',
    },
];

// Mock data cho tiện nghi
const amenities = [
    { id: '1', icon: 'wifi', name: 'Wi-Fi' },
    { id: '2', icon: 'tv', name: 'TV' },
    { id: '3', icon: 'car', name: 'Bãi đỗ xe' },
    { id: '4', icon: 'snowflake-o', name: 'Điều hòa' },
    { id: '5', icon: 'coffee', name: 'Bữa sáng' },
    { id: '6', icon: 'paw', name: 'Thú cưng' },
    { id: '7', icon: 'paw', name: 'Bếp' },
    { id: '6', icon: 'paw', name: 'Bình nóng lạnh' },
];

const { width: screenWidth } = Dimensions.get('window');

const HomeStayDetailPage: React.FC = () => {
    const route = useRoute<HomeStayDetailPageRouteProp>();
    const navigation = useNavigation();
    const { id } = route.params;

    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState('');
    const [sending, setSending] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [visibleReviewsCount, setVisibleReviewsCount] = useState(3);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);

    const flatListRef = useRef<FlatList>(null);

    const handleScrollBegin = useCallback(() => {
        setIsScrolling(true);
    }, []);

    const handleImageScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (isScrolling) {
            const slideSize = screenWidth;
            const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
            if (index >= 0 && index < mockImages.length) {
                setActiveImageIndex(index);
            }
        }
    }, [isScrolling, mockImages.length, screenWidth]);

    const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        setIsScrolling(false);
        const slideSize = screenWidth;
        const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
        if (index >= 0 && index < mockImages.length) {
            setActiveImageIndex(index);
        }
    }, [mockImages.length, screenWidth]);

    const goToImage = useCallback((index: number) => {
        if (index >= 0 && index < mockImages.length) {
            flatListRef.current?.scrollToOffset({
                offset: index * screenWidth,
                animated: true
            });
            setActiveImageIndex(index);
        }
    }, [mockImages.length, screenWidth]);

    // Xử lý khi người dùng bấm yêu thích
    const toggleFavorite = useCallback(() => {
        setIsFavorite(prev => !prev);
    }, []);

    const renderImageItem = useCallback(({ item }: { item: ImageItem }) => (
        <View style={{ width: screenWidth }}>
            <Image
                source={typeof item.uri === 'string' ? { uri: item.uri } : item.uri}
                style={{ width: '100%', height: 280 }}
                resizeMode="cover"
            />
        </View>
    ), [screenWidth]);

    const handleSendReview = useCallback(() => {
        if (!userRating || !userComment.trim()) return;
        setSending(true);
        setTimeout(() => {
            setSending(false);
            setUserRating(0);
            setUserComment('');
            // Có thể thêm logic cập nhật danh sách đánh giá nếu muốn
            alert('Gửi đánh giá thành công!');
        }, 1000);
    }, [userRating, userComment]);

    // Xử lý khi tải thêm đánh giá
    const loadMoreReviews = useCallback(() => {
        // Tăng số lượng hiển thị thêm 10 đánh giá, nhưng không vượt quá tổng số
        setVisibleReviewsCount(prev => Math.min(prev + 10, mockReviews.length));
    }, []);

    // Xử lý khi reset về hiển thị ban đầu (3 đánh giá)
    const resetReviews = useCallback(() => {
        setVisibleReviewsCount(3);
    }, []);

    // Hiển thị số đánh giá tương ứng
    const displayedReviews = mockReviews.slice(0, visibleReviewsCount);

    // Tạo component riêng cho render đánh giá để tăng tính tái sử dụng
    const renderReviewItem = useCallback(({ item }: { item: ReviewItem }) => (
        <View key={item.id} style={styles.reviewItem}>
            <Image source={{ uri: item.avatar }} style={styles.reviewAvatar} />
            <View style={{ flex: 1 }}>
                <View style={styles.reviewHeader}>
                    <Text style={styles.reviewUser}>{item.user}</Text>
                    <View style={styles.reviewStars}>
                        {Array.from({ length: 5 }).map((_, idx) => (
                            <Ionicons
                                key={idx}
                                name={idx < item.rating ? 'star' : 'star-outline'}
                                size={14}
                                color={idx < item.rating ? '#FFD700' : '#ccc'}
                            />
                        ))}
                    </View>
                </View>
                <Text style={styles.reviewComment}>{item.comment}</Text>
                {item.date && (
                    <Text style={styles.reviewDate}>{item.date}</Text>
                )}
            </View>
        </View>
    ), []);

    // Hiển thị tiện nghi của homestay
    const renderAmenity = useCallback(({ item }: { item: typeof amenities[0] }) => (
        <View style={styles.amenityItem}>
            <FontAwesome name={item.icon as any} size={20} color="#666" />
            <Text style={styles.amenityText}>{item.name}</Text>
        </View>
    ), []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Slide ảnh có thể vuốt - full width và đẩy lên đầu trang */}
                <View style={styles.imageSliderContainer}>
                    <FlatList
                        ref={flatListRef}
                        data={mockImages}
                        renderItem={renderImageItem}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={screenWidth}
                        snapToAlignment="center"
                        decelerationRate={0.9}
                        onScrollBeginDrag={handleScrollBegin}
                        onScroll={handleImageScroll}
                        onMomentumScrollEnd={handleScrollEnd}
                        keyExtractor={(item) => item.id}
                        disableIntervalMomentum={true}
                        snapToOffsets={mockImages.map((_, index) => index * screenWidth)}
                        scrollEventThrottle={16}
                    />

                    {/* Nút quay lại đặt bên trong hình */}
                    <TouchableOpacity
                        style={styles.backButtonOverlay}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    {/* Nút yêu thích */}
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={toggleFavorite}
                    >
                        <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#FF385C" : "#fff"} />
                    </TouchableOpacity>

                    {/* Hiển thị số thứ tự ảnh */}
                    <View style={styles.paginationContainer}>
                        <View style={styles.paginationDot}>
                            <Text style={styles.paginationText}>
                                {activeImageIndex + 1}/{mockImages.length}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.contentContainer}>
                    {/* Header thông tin */}
                    <View>
                        <Text style={styles.title}>Homstay A</Text>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={{ fontSize: 14, color: '#666', marginRight: 16 }}>
                            <Text style={{ fontWeight: 'bold', color: '#222' }}>123</Text> lượt thích
                        </Text>
                        <Text style={{ fontSize: 14, color: '#666' }}>
                            <Text style={{ fontWeight: 'bold', color: '#222' }}>45</Text> Following
                        </Text>
                        </View>
                        {/* Rating với giao diện mới */}
                        <View style={styles.ratingContainer}>
                            <View style={styles.starsContainer}>
                                {Array.from({ length: 5 }).map((_, idx) => (
                                    <Ionicons
                                        key={idx}
                                        name={idx < 5 ? "star" : "star-outline"}
                                        size={22}
                                        color={idx < 5 ? "#FFD700" : "#ccc"}
                                        style={{ marginRight: 2 }}
                                    />
                                ))}
                            </View>
                            <View style={styles.ratingCountContainer}>
                                <Text style={styles.ratingCount}>5</Text>
                                <Text style={styles.ratingTotal}>(100 đánh giá)</Text>
                            </View>
                        </View>

                        {/* Thêm địa chỉ */}
                        <View style={styles.locationContainer}>
                            <Ionicons name="location-outline" size={18} color="#666" />
                            <Text style={styles.locationText}>Đường Hoàng Hoa Thám, Phường 12, Quận Tân Bình</Text>
                        </View>
                    </View>

                    {/* Box giá */}
                    <View style={styles.priceContainer}>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Giá</Text>
                            <Text style={styles.priceValue}>1.200.000đ<Text style={styles.priceUnit}>/đêm</Text></Text>
                        </View>
                        <Text style={styles.priceNote}>Đã bao gồm thuế và phí</Text>
                    </View>

                    {/* Mô tả với tiêu đề */}
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.descriptionTitle}>Mô tả</Text>
                        <Text
                            style={styles.description}
                            numberOfLines={showFullDescription ? undefined : 3}
                        >
                            Dưới đây là fake data mẫu cho trang HomeStayDetailPage, bạn có thể thay thế các biến như title, description, rating, totalRaters, ... bằng dữ liệu này để hiển thị đúng với từng homestay theo id.
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowFullDescription(!showFullDescription)}
                            style={styles.readMoreButton}
                        >
                            <Text style={styles.readMoreText}>
                                {showFullDescription ? 'Ẩn bớt' : 'Xem thêm...'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tiện nghi */}
                    <View style={styles.amenitiesContainer}>
                        <Text style={styles.sectionTitle}>Tiện nghi</Text>
                        <View style={styles.amenitiesList}>
                            {amenities.map(item => renderAmenity({ item }))}
                        </View>
                    </View>

                    {/* Đánh giá và bình luận */}
                    <View style={{ width: '100%' }}>
                        <View style={styles.reviewsHeader}>
                            <Text style={styles.sectionTitle}>Đánh giá & Bình luận</Text>
                            <Text style={styles.reviewsCount}>{mockReviews.length} đánh giá</Text>
                        </View>

                        {/* Danh sách đánh giá */}
                        {displayedReviews.map(item => renderReviewItem({ item }))}

                        {/* Nút tải thêm đánh giá */}
                        {visibleReviewsCount < mockReviews.length ? (
                            <TouchableOpacity
                                style={styles.viewMoreButton}
                                onPress={loadMoreReviews}
                            >
                                <Text style={styles.viewMoreText}>
                                    Tải thêm 10 đánh giá
                                </Text>
                            </TouchableOpacity>
                        ) : visibleReviewsCount > 3 ? (
                            <TouchableOpacity
                                style={styles.viewMoreButton}
                                onPress={() => setVisibleReviewsCount(3)}
                            >
                                <Text style={styles.viewMoreText}>
                                    Thu gọn
                                </Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    {/* Phần nhập đánh giá mới */}
                    <View style={styles.addReviewBox}>
                        <Text style={styles.addReviewTitle}>Đánh giá của bạn</Text>
                        <View style={styles.starsRow}>
                            {Array.from({ length: 5 }).map((_, idx) => (
                                <TouchableOpacity key={idx} onPress={() => setUserRating(idx + 1)}>
                                    <Ionicons
                                        name={idx < userRating ? 'star' : 'star-outline'}
                                        size={28}
                                        color={idx < userRating ? '#FFD700' : '#ccc'}
                                        style={{ marginHorizontal: 2 }}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.inputBox}>
                            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Bình luận</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập bình luận của bạn..."
                                    value={userComment}
                                    onChangeText={setUserComment}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[styles.sendButton, (!userRating || !userComment.trim()) && { backgroundColor: '#ccc' }]}
                            onPress={handleSendReview}
                            disabled={!userRating || !userComment.trim() || sending}
                        >
                            <Text style={styles.sendButtonText}>{sending ? 'Đang gửi...' : 'Gửi đánh giá'}</Text>
                        </TouchableOpacity>
                    </View>

                </View>
                {posts.map((post) => (
                    <Post
                        key={post.id}
                        username={post.username}
                        isVerified={post.isVerified}
                        location={post.location}
                        images={post.images}
                        likedBy={post.likedBy}
                        likesCount={post.likesCount}
                        caption={post.caption}
                    />
                ))}
            </ScrollView>

            {/* Nút đặt phòng cố định ở dưới */}
            <View style={styles.bookingButtonContainer}>
                <TouchableOpacity style={styles.bookingButton}>
                    <Text style={styles.bookingButtonText}>Đặt phòng ngay</Text>
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
    contentContainer: {
        paddingHorizontal: 20,
    },
    imageSliderContainer: {
        height: 280,
        width: '100%',
        marginBottom: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    backButtonOverlay: {
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
    favoriteButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    paginationContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 5,
    },
    paginationDot: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    paginationText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    // headerContainer: {
    //     marginBottom: 16,
    // },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        // marginTop: 16,
        marginBottom: 8,
        color: '#222',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    starsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    ratingCount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    ratingTotal: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 18,
    },
    locationText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 6,
        flex: 1,
        lineHeight: 20,
    },
    priceContainer: {
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#eee',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    priceLabel: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    priceValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF385C',
    },
    priceUnit: {
        fontSize: 14,
        color: '#666',
        fontWeight: 'normal',
    },
    priceNote: {
        fontSize: 12,
        color: '#666',
        marginTop: 8,
    },
    descriptionContainer: {
        marginBottom: 24,
    },
    descriptionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#222',
    },
    description: {
        fontSize: 15,
        color: '#444',
        lineHeight: 22,
    },
    readMoreButton: {
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    readMoreText: {
        color: '#4DA6FF',
        fontWeight: '600',
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 16,
        alignSelf: 'flex-start',
        color: '#222',
    },
    amenitiesContainer: {
        marginBottom: 24,
    },
    amenitiesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        marginBottom: 12,
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 8,
    },
    amenityText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#444',
    },
    reviewsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    reviewsCount: {
        fontSize: 14,
        color: '#666',
    },
    reviewItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        backgroundColor: '#f7f7f7',
        borderRadius: 10,
        padding: 12,
        width: '100%',
    },
    reviewAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    reviewUser: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#222',
    },
    reviewStars: {
        flexDirection: 'row',
    },
    reviewComment: {
        fontSize: 14,
        color: '#444',
        marginTop: 4,
        marginBottom: 4,
    },
    reviewDate: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    viewMoreButton: {
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
    },
    viewMoreText: {
        color: '#4DA6FF',
        fontWeight: '600',
        fontSize: 14,
    },
    addReviewBox: {
        width: '100%',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 16,
        marginTop: 10,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    addReviewTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#222',
    },
    starsRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    inputBox: {
        marginBottom: 10,
    },
    inputWrapper: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        padding: 6,
    },
    input: {
        minHeight: 40,
        fontSize: 15,
        color: '#222',
        padding: 0,
    },
    sendButton: {
        backgroundColor: '#4DA6FF',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    bookingButtonContainer: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    bookingButton: {
        backgroundColor: '#FF385C',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    bookingButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default HomeStayDetailPage;
