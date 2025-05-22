import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { BACKGROUND, PRIMARY } from '@/src/const/constants';
import ImageViewing from 'react-native-image-viewing';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Post from '../components/post';

const { width } = Dimensions.get('window');

interface TravelPlaceDetails {
    id: string;
    name: string;
    description: string;
    address: string;
    rating: number;
    reviewsCount: number;
    images: Array<{ uri: string }>;
    openTime: string;
    closeTime: string;
    ticketPrice: string;
    features: Array<{
        id: string;
        icon: string;
        name: string;
    }>;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TravelPlaceDetailPage = () => {
    const route = useRoute();
    const navigation = useNavigation<NavigationProp>();
    const { id } = route.params as { id: string };
    const [isVisible, setIsVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    // Mock data cho địa điểm du lịch
    const placeDetails: TravelPlaceDetails = {
        id,
        name: "Chùa Cầu Hội An",
        description: "Chùa Cầu (Cầu Nhật Bản) là một trong những biểu tượng nổi tiếng nhất của phố cổ Hội An. Được xây dựng vào cuối thế kỷ 16 bởi cộng đồng người Nhật, cây cầu này không chỉ là một công trình kiến trúc độc đáo mà còn là cầu nối văn hóa giữa hai cộng đồng thương nhân Nhật Bản và Trung Hoa thời bấy giờ. Cây cầu có mái che và một ngôi chùa nhỏ thờ thần Bắc Đế Trấn Võ - vị thần bảo hộ cho khách thương và dân chúng.",
        address: "Nguyễn Thị Minh Khai, Phường Minh An, Hội An, Quảng Nam",
        rating: 4.8,
        reviewsCount: 1234,
        images: [
            { uri: 'https://cdnphoto.dantri.com.vn/OlQas4uqcc3xWeWc6mAEKgov26A=/thumb_w/960/2020/04/24/venice-italya-1587703892898.jpeg' }, // Ảnh cảnh biển từ Pixabay
            { uri: 'https://visalinks.com.vn/wp-content/uploads/2023/07/Cac-dia-danh-tren-ho-chieu-moi-Viet-Nam-3-1.jpg' }, // Ảnh núi rừng từ Unsplash
            { uri: 'https://icdn.dantri.com.vn/thumb_w/960/c05a76d21c/2017/01/30/img20170130120951023-1402d.jpg' }, // Ảnh cánh đồng hoa hướng dương từ Wikimedia Commons
            { uri: 'https://cdn.24h.com.vn/upload/3-2021/images/2021-07-06/1-1625565279-612-width650height436.jpg' }, // Ảnh bình minh trên biển từ Unsplash
        ],
        openTime: "08:00",
        closeTime: "21:00",
        ticketPrice: "20.000 VNĐ",
        features: [
            { id: '1', icon: 'clock-o', name: 'Mở cửa cả tuần' },
            { id: '2', icon: 'camera', name: 'Địa điểm chụp ảnh' },
            { id: '3', icon: 'history', name: 'Di tích lịch sử' },
            { id: '4', icon: 'map-signs', name: 'Có hướng dẫn viên' },
            { id: '5', icon: 'wheelchair', name: 'Thân thiện người khuyết tật' },
            { id: '6', icon: 'umbrella', name: 'Có mái che' },
        ],
    };

    // Mock data cho bài viết
    const posts = [
        {
            id: '1',
            username: 'traveler_123',
            isVerified: true,
            location: 'Chùa Cầu, Hội An',
            images: [
                { id: '1', uri: placeDetails.images[0].uri }
            ],
            likesCount: 1234,
            commentsCount: 89,
            caption: 'Một buổi chiều tuyệt đẹp tại Chùa Cầu 🌅',
        },
        {
            id: '2',
            username: 'wanderlust',
            isVerified: true,
            location: 'Chùa Cầu, Hội An',
            images: [
                { id: '1', uri: placeDetails.images[1].uri }
            ],
            likesCount: 856,
            commentsCount: 45,
            caption: 'Kiến trúc độc đáo của cây cầu cổ nhất Hội An 🏛️',
        },
    ];

    const toggleFavorite = () => {
        setIsFavorite(prev => !prev);
    };

    return (
        <ScrollView style={styles.container}>
            {/* Ảnh cover và nút back */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: placeDetails.images[0].uri }}
                    style={styles.coverImage}
                    resizeMode="cover"
                />
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={toggleFavorite}
                >
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={24}
                        color={isFavorite ? "#FF385C" : "#fff"}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.contentContainer}>
                {/* Thông tin cơ bản */}
                <Text style={styles.title}>{placeDetails.name}</Text>
                <View style={styles.ratingContainer}>
                    <View style={styles.stars}>
                        <Ionicons name='heart' size={21} color={PRIMARY} />
                        <Text style={{ fontSize: 16 }}> 100 lượt yêu thích</Text>
                    </View>
                </View>

                <View style={styles.addressContainer}>
                    <Ionicons name='location' size={21} color={PRIMARY} />
                    <Text style={styles.addressText}>{placeDetails.address}</Text>
                </View>

                {/* Thời gian và giá vé */}
                <View style={styles.infoBox}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <FontAwesome name="clock-o" size={20} color={PRIMARY} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Giờ mở cửa</Text>
                                <Text style={styles.infoValue}>{placeDetails.openTime} - {placeDetails.closeTime}</Text>
                            </View>
                        </View>
                        <View style={styles.infoItem}>
                            <FontAwesome name="ticket" size={20} color={PRIMARY} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Giá vé</Text>
                                <Text style={styles.infoValue}>{placeDetails.ticketPrice}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Mô tả */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Giới thiệu</Text>
                    <Text
                        style={styles.description}
                        numberOfLines={isExpanded ? undefined : 3}
                    >
                        {placeDetails.description}
                    </Text>
                    <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                        <Text style={styles.readMoreText}>
                            {isExpanded ? 'Thu gọn' : 'Xem thêm...'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tiện ích */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tiện ích</Text>
                    <View style={styles.featuresGrid}>
                        {placeDetails.features.map((feature) => (
                            <View key={feature.id} style={styles.featureItem}>
                                <FontAwesome name={feature.icon as any} size={20} color={PRIMARY} />
                                <Text style={styles.featureText}>{feature.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>

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

                {/* Bài viết */}
                <Text style={styles.sectionTitle}>Bài viết</Text>


            </View>
            <View style={styles.section}>
                {posts.map((post) => (
                    <Post
                        key={post.id}
                        username={post.username}
                        isVerified={post.isVerified}
                        location={post.location}
                        images={post.images}
                        likesCount={post.likesCount}
                        commentsCount={post.commentsCount}
                        caption={post.caption}
                    />
                ))}
            </View>
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
});

export default TravelPlaceDetailPage; 