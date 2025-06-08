import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Dimensions, FlatList, ActivityIndicator, ImageSourcePropType, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import Post from '../components/post';
import { BACKGROUND } from '@/src/const/constants';
import BookingCalendarModal from '../components/BookingCalendarModal';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { getPosts } from '../redux/slices/postSlice';

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

// Mô hình dữ liệu cho lịch đặt phòng
type BookingDay = {
    date: string;
    status: 'available' | 'limited' | 'full';
    availableRooms?: Room[];
};

// Mô hình dữ liệu cho phòng
type Room = {
    id: string;
    name: string;
    available: boolean;
};

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
    { id: '8', icon: 'paw', name: 'Bình nóng lạnh' },
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
    const [showBookingCalendar, setShowBookingCalendar] = useState(false);

    const flatListRef = useRef<FlatList>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { posts, loading } = useSelector((state: RootState) => state.post);

    useEffect(() => {
        dispatch(getPosts());
    }, [dispatch]);

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
    const renderAmenities = () => (
        <View style={styles.amenitiesSection}>
            <Text style={styles.sectionTitle}>Tiện nghi</Text>
            <View style={styles.amenitiesContainer}>
                {amenities.map((item) => (
                    <View key={item.id} style={styles.amenityItem}>
                        <FontAwesome name={item.icon as any} size={24} color="#666" />
                        <Text style={styles.amenityText}>{item.name}</Text>
                    </View>
                ))}
            </View>
            <TouchableOpacity
                style={styles.bookingCalendarButton}
                onPress={() => setShowBookingCalendar(true)}
            >
                <Text style={styles.bookingCalendarButtonText}>Xem lịch đặt phòng</Text>
            </TouchableOpacity>
        </View>
    );

    // Mock data cho lịch đặt phòng
    const mockBookingData: BookingDay[] = [
        // Tháng 4
        { date: '1/4', status: 'available' },
        {
            date: '2/4',
            status: 'limited',
            availableRooms: [
                { id: '1', name: 'Phòng Deluxe', available: true },
                { id: '2', name: 'Phòng Superior', available: true }
            ]
        },
        { date: '3/4', status: 'full' },
        { date: '4/4', status: 'available' },
        {
            date: '5/4',
            status: 'limited',
            availableRooms: [
                { id: '3', name: 'Phòng Suite', available: true }
            ]
        },
        { date: '6/4', status: 'full' },
        { date: '7/4', status: 'available' },
        {
            date: '8/4',
            status: 'limited',
            availableRooms: [
                { id: '1', name: 'Phòng Deluxe', available: true },
                { id: '4', name: 'Phòng Family', available: true }
            ]
        },
        { date: '9/4', status: 'full' },
        { date: '10/4', status: 'available' },
        {
            date: '11/4',
            status: 'limited',
            availableRooms: [
                { id: '2', name: 'Phòng Superior', available: true }
            ]
        },
        { date: '12/4', status: 'full' },
        { date: '13/4', status: 'available' },
        {
            date: '14/4',
            status: 'limited',
            availableRooms: [
                { id: '3', name: 'Phòng Suite', available: true },
                { id: '4', name: 'Phòng Family', available: true }
            ]
        },
        { date: '15/4', status: 'full' },
        { date: '16/4', status: 'available' },
        {
            date: '17/4',
            status: 'limited',
            availableRooms: [
                { id: '1', name: 'Phòng Deluxe', available: true }
            ]
        },
        { date: '18/4', status: 'full' },
        { date: '19/4', status: 'available' },
        {
            date: '20/4',
            status: 'limited',
            availableRooms: [
                { id: '2', name: 'Phòng Superior', available: true },
                { id: '3', name: 'Phòng Suite', available: true }
            ]
        },
        { date: '21/4', status: 'full' },
        { date: '22/4', status: 'available' },
        {
            date: '23/4',
            status: 'limited',
            availableRooms: [
                { id: '4', name: 'Phòng Family', available: true }
            ]
        },
        { date: '24/4', status: 'full' },
        { date: '25/4', status: 'available' },
        {
            date: '26/4',
            status: 'limited',
            availableRooms: [
                { id: '1', name: 'Phòng Deluxe', available: true },
                { id: '2', name: 'Phòng Superior', available: true }
            ]
        },
        { date: '27/4', status: 'full' },
        { date: '28/4', status: 'available' },
        {
            date: '29/4',
            status: 'limited',
            availableRooms: [
                { id: '3', name: 'Phòng Suite', available: true }
            ]
        },
        { date: '30/4', status: 'full' },

        // Tháng 5
        { date: '1/5', status: 'available' },
        {
            date: '2/5',
            status: 'limited',
            availableRooms: [
                { id: '1', name: 'Phòng Deluxe', available: true },
                { id: '3', name: 'Phòng Suite', available: true }
            ]
        },
        { date: '3/5', status: 'available' },
        { date: '4/5', status: 'available' },
        { date: '5/5', status: 'full' },
        {
            date: '6/5',
            status: 'limited',
            availableRooms: [
                { id: '4', name: 'Phòng Family', available: true }
            ]
        },
        { date: '7/5', status: 'available' },
        { date: '8/5', status: 'available' },
        { date: '9/5', status: 'full' },
        { date: '10/5', status: 'available' },
        {
            date: '11/5',
            status: 'limited',
            availableRooms: [
                { id: '1', name: 'Phòng Deluxe', available: true },
                { id: '2', name: 'Phòng Superior', available: true }
            ]
        },
        { date: '12/5', status: 'available' },
        { date: '13/5', status: 'full' },
        { date: '14/5', status: 'available' },
        { date: '15/5', status: 'available' },
        {
            date: '16/5',
            status: 'limited',
            availableRooms: [
                { id: '3', name: 'Phòng Suite', available: true }
            ]
        },
        { date: '17/5', status: 'full' },
        { date: '18/5', status: 'available' },
        { date: '19/5', status: 'available' },
        { date: '20/5', status: 'full' },
        {
            date: '21/5',
            status: 'limited',
            availableRooms: [
                { id: '2', name: 'Phòng Superior', available: true },
                { id: '4', name: 'Phòng Family', available: true }
            ]
        },
        { date: '22/5', status: 'available' },
        { date: '23/5', status: 'available' },
        { date: '24/5', status: 'full' },
        { date: '25/5', status: 'available' },
        {
            date: '26/5',
            status: 'limited',
            availableRooms: [
                { id: '1', name: 'Phòng Deluxe', available: true }
            ]
        },
        { date: '27/5', status: 'available' },
        { date: '28/5', status: 'full' },
        { date: '29/5', status: 'available' },
        { date: '30/5', status: 'available' },
        { date: '31/5', status: 'full' },

        // Tháng 6
        { date: '1/6', status: 'available' },
        { date: '2/6', status: 'full' },
        {
            date: '3/6',
            status: 'limited',
            availableRooms: [
                { id: '3', name: 'Phòng Suite', available: true },
                { id: '4', name: 'Phòng Family', available: true }
            ]
        },
        { date: '4/6', status: 'available' },
        { date: '5/6', status: 'available' },
        { date: '6/6', status: 'full' },
        {
            date: '7/6',
            status: 'limited',
            availableRooms: [
                { id: '1', name: 'Phòng Deluxe', available: true },
                { id: '2', name: 'Phòng Superior', available: true }
            ]
        },
        { date: '8/6', status: 'available' },
        { date: '9/6', status: 'available' },
        { date: '10/6', status: 'full' },
        { date: '11/6', status: 'available' },
        {
            date: '12/6',
            status: 'limited',
            availableRooms: [
                { id: '4', name: 'Phòng Family', available: true }
            ]
        },
        { date: '13/6', status: 'available' },
        { date: '14/6', status: 'full' },
        { date: '15/6', status: 'available' },
        {
            date: '16/6',
            status: 'limited',
            availableRooms: [
                { id: '1', name: 'Phòng Deluxe', available: true },
                { id: '3', name: 'Phòng Suite', available: true }
            ]
        },
        { date: '17/6', status: 'available' },
        { date: '18/6', status: 'available' },
        { date: '19/6', status: 'full' },
        { date: '20/6', status: 'available' },
        {
            date: '21/6',
            status: 'limited',
            availableRooms: [
                { id: '2', name: 'Phòng Superior', available: true }
            ]
        },
        { date: '22/6', status: 'available' },
        { date: '23/6', status: 'full' },
        { date: '24/6', status: 'available' },
        { date: '25/6', status: 'available' },
        {
            date: '26/6',
            status: 'limited',
            availableRooms: [
                { id: '3', name: 'Phòng Suite', available: true },
                { id: '4', name: 'Phòng Family', available: true }
            ]
        },
        { date: '27/6', status: 'available' },
        { date: '28/6', status: 'full' },
        { date: '29/6', status: 'available' },
        { date: '30/6', status: 'available' }
    ];

    // Tạo render function cho header content (tất cả content trừ posts)
    const renderHeader = useCallback(() => (
        <>
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
                {renderAmenities()}

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

                {/* Separator và tiêu đề cho phần posts */}
                <View style={styles.postsSection}>
                    <Text style={styles.sectionTitle}>Bài viết liên quan</Text>
                </View>
            </View>
        </>
    ), [
        mockImages,
        renderImageItem,
        screenWidth,
        handleScrollBegin,
        handleImageScroll,
        handleScrollEnd,
        activeImageIndex,
        isFavorite,
        toggleFavorite,
        showFullDescription,
        renderAmenities,
        displayedReviews,
        renderReviewItem,
        visibleReviewsCount,
        mockReviews.length,
        loadMoreReviews,
        userRating,
        userComment,
        handleSendReview,
        sending
    ]);

    // Render function cho mỗi post
    const renderPost = useCallback(({ item: post }: { item: any }) => (
        <Post
            key={post.id}
            postId={post.id}
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
            authorId={post.authorId}
            isLike={post.isLike}
        />
    ), []);

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
                contentContainerStyle={{ paddingBottom: 80 }}
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

            {/* Nút đặt phòng cố định ở dưới */}
            <View style={styles.bookingButtonContainer}>
                <TouchableOpacity style={styles.bookingButton}>
                    <Text style={styles.bookingButtonText}>Đặt phòng ngay</Text>
                </TouchableOpacity>
            </View>

            {/* Thêm BookingCalendarModal */}
            <BookingCalendarModal
                isVisible={showBookingCalendar}
                onClose={() => setShowBookingCalendar(false)}
                bookingData={mockBookingData}
            />
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
    amenitiesSection: {
        marginVertical: 16,
        paddingHorizontal: 16,
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12,
    },
    amenityItem: {
        width: '25%',
        alignItems: 'center',
        marginBottom: 16,
    },
    amenityText: {
        marginTop: 8,
        fontSize: 12,
        textAlign: 'center',
        color: '#666',
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
    bookingCalendarButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
        alignItems: 'center',
    },
    bookingCalendarButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    postsSection: {
        marginTop: 20,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 10,
    },
});

export default HomeStayDetailPage;
