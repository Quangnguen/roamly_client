import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
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

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ImageItem = {
    id: string;
    uri: string;
};

const AddressDetailPage = () => {
    const route = useRoute();
    const navigation = useNavigation<NavigationProp>();
    const { id } = route.params as { id: string };
    const [isFollowing, setIsFollowing] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
    const [shouldLoadPosts, setShouldLoadPosts] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const { posts, loading } = useSelector((state: RootState) => state.post);

    // Auto-load posts khi scroll đến gần cuối trang
    const handleScroll = (event: any) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const scrollPosition = contentOffset.y + layoutMeasurement.height;
        const contentHeight = contentSize.height;

        // Khi scroll đến 80% chiều cao trang thì load posts
        if (scrollPosition > contentHeight * 0.8 && !shouldLoadPosts) {
            setShouldLoadPosts(true);
            dispatch(getPosts());
        }
    };

    // Sử dụng useFocusEffect thay vì useEffect để tối ưu
    useFocusEffect(
        React.useCallback(() => {
            // Reset state khi vào trang
            setShouldLoadPosts(false);
        }, [])
    );

    const toggleFollow = () => {
        setIsFollowing(prev => !prev);
    };

    const handleImageScroll = (event: any) => {
        const contentOffset = event.nativeEvent.contentOffset;
        const imageIndex = Math.round(contentOffset.x / width);
        setCurrentIndex(imageIndex);
    };

    const toggleFullScreenPreview = () => {
        setIsFullScreenPreview(!isFullScreenPreview);
    };

    // Thêm mockImages để demo vuốt ảnh
    const mockImages: ImageItem[] = [
        { id: '1', uri: 'https://static.vinwonders.com/production/homestay-la-gi-thumb.jpg' },
        { id: '2', uri: 'https://vatlieuhousing.com/wp-content/uploads/2024/03/homestay-chuong-my.jpg' },
        { id: '3', uri: 'https://tourdulichmangden.vn/upload/news/homestay-mang-den-0-8434.jpg' },
    ];

    const placeDetails: AddressDetails = {
        id: id,
        name: "Phố Cổ Hội An",
        numberFollowers: 1000,
        address: "Hội An, Quảng Nam, Việt Nam",
        description: "Phố cổ Hội An là một đô thị cổ nằm ở hạ lưu sông Thu Bồn, thuộc vùng đồng bằng ven biển tỉnh Quảng Nam, Việt Nam. Với những giá trị văn hóa, lịch sử đặc sắc, phố cổ Hội An đã được UNESCO công nhận là Di sản văn hóa thế giới vào năm 1999.",
        images: [
            { uri: 'https://picsum.photos/id/1011/200/300' },
            { uri: 'https://picsum.photos/id/1012/200/300' },
            { uri: 'https://picsum.photos/id/1013/200/300' },
            { uri: 'https://picsum.photos/id/1014/200/300' },
            { uri: 'https://picsum.photos/id/1015/200/300' },
            { uri: 'https://picsum.photos/id/1012/200/300' },
            { uri: 'https://picsum.photos/id/1013/200/300' },
            { uri: 'https://picsum.photos/id/1014/200/300' },
        ],
        isFollowing: isFollowing,
        rating: 4.8,
        reviewsCount: 2345,
        homestayes: [
            {
                id: '1',
                name: 'Homestay 1',
                address: 'Địa danh 1',
                imageUri: 'https://picsum.photos/id/1011/200/300',
                rating: 4.8,
                numberOfReviews: 100,
            },
            {
                id: '2',
                name: 'Homestay 2',
                address: 'Địa danh 2',
                imageUri: 'https://picsum.photos/id/1012/200/300',
                rating: 2.8,
                numberOfReviews: 200,
            },
            {
                id: '3',
                name: 'Homestay 3',
                address: 'Địa danh 3',
                imageUri: 'https://picsum.photos/id/1013/200/300',
                rating: 3.5,
                numberOfReviews: 300,
            },
            {
                id: '4',
                name: 'Homestay 4',
                address: 'Địa danh 4',
                imageUri: 'https://picsum.photos/id/1014/200/300',
                rating: 4.8,
                numberOfReviews: 400,
            },
        ],
        travelPlaces: [
            {
                id: '1',
                name: 'Travel Place 1',
                imageUri: 'https://picsum.photos/id/1011/200/300',
                numberOfLikes: 123,
            },
            {
                id: '2',
                name: 'Travel Place 2',
                imageUri: 'https://picsum.photos/id/1012/200/300',
                numberOfLikes: 234,
            },
            {
                id: '3',
                name: 'Travel Place 3',
                imageUri: 'https://picsum.photos/id/1013/200/300',
                numberOfLikes: 231,
            },
            {
                id: '4',
                name: 'Travel Place 4',
                imageUri: 'https://picsum.photos/id/1014/200/300',
                numberOfLikes: 234,
            },
            {
                id: '5',
                name: 'Travel Place 5',
                imageUri: 'https://picsum.photos/id/1015/200/300',
                numberOfLikes: 125,
            },
        ]
    };

    return (
        <ScrollView
            style={styles.container}
            onScroll={handleScroll}
            scrollEventThrottle={400}
        >
            {loading && !shouldLoadPosts && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#888" />
                    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                </View>
            )}
            {/* Ảnh địa điểm với nút quay lại */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: placeDetails.images[0].uri }}
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

                {/* Nút theo dõi */}
                <TouchableOpacity
                    style={[styles.followButton, isFollowing && styles.followingButton]}
                    onPress={toggleFollow}
                    activeOpacity={0.7}
                >
                    <FontAwesome name={isFollowing ? "check" : "plus"} size={16} color="#fff" />
                    <Text style={styles.followButtonText}>
                        {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                    </Text>
                </TouchableOpacity>

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
                <Text style={styles.sectionTitle}>Bài viết</Text>
            </View>
            {shouldLoadPosts && (
                <View>
                    {loading ? (
                        <View style={styles.postsLoadingContainer}>
                            <ActivityIndicator size="large" color="#888" />
                            <Text style={styles.loadingText}>Đang tải bài viết...</Text>
                        </View>
                    ) : (
                        posts.map((post) => (
                            <Post
                                key={post.id}
                                username={post.author.username}
                                location={post.location}
                                images={post.imageUrl.map((url, index) => ({
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
                            />
                        ))
                    )}
                </View>
            )}
        </ScrollView>
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
        backgroundColor: '#4CAF50',
    },
    followButtonText: {
        color: '#fff',
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
    loadingText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 16,
    },
    postsLoadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
});

export default AddressDetailPage;
