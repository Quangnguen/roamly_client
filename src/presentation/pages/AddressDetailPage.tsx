import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { BACKGROUND, PRIMARY } from '@/src/const/constants';
import ImageViewing from 'react-native-image-viewing';
import AddressDetails from '@/src/types/addressDetailInterface';
import SquareCard from '../components/squareCardForHomeStay';
import Post from '../components/post';

const { width } = Dimensions.get('window');


const AddressDetailPage = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { id } = route.params as { id: string };
    const [isFollowing, setIsFollowing] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleFollow = () => {
        setIsFollowing(prev => !prev);
    };

    const posts = [
        {
            id: '1',
            username: 'joshua_J',
            isVerified: true,
            location: 'Tokyo, Japan',
            images: [
                { id: '1', uri: require('../../../assets/images/natural1.jpg') },
                { id: '2', uri: 'https://ik.imagekit.io/tvlk/blog/2024/07/canh-dep-viet-nam-6.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2' },
                { id: '3', uri: 'https://static.vinwonders.com/production/homestay-la-gi-thumb.jpg' }
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
                { id: '2', uri: 'https://vatlieuhousing.com/wp-content/uploads/2024/03/homestay-chuong-my.jpg' }
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
                { id: '1', uri: 'https://ik.imagekit.io/tvlk/blog/2024/07/canh-dep-viet-nam-6.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2' },
                { id: '2', uri: 'https://tourdulichmangden.vn/upload/news/homestay-mang-den-0-8434.jpg' }
            ],
            likedBy: 'craig_love',
            likesCount: 44686,
            caption: 'The game in Japan was amazing and I want to share some photos',
        },
    ];

    const placeDetails: AddressDetails = {
        id: id, // ID của địa điểm, có thể lấy từ route params
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
        isFollowing: isFollowing, // Trạng thái theo dõi
        rating: 4.8, // Ví dụ về đánh giá
        reviewsCount: 2345,// Số lượng đánh giá
        homestayes: [
            {
                id: '1',
                name: 'Homestay 1',
                address: 'Hội An, Quảng Nam, Việt Nam',
                imageUri: 'https://picsum.photos/id/1011/200/300',
                rating: 4.8,
            },
            {
                id: '2',
                name: 'Homestay 2',
                address: 'Hội An, Quảng Nam, Việt Nam',
                imageUri: 'https://picsum.photos/id/1012/200/300',
                rating: 4.8,
            },
            {
                id: '3',
                name: 'Homestay 3',
                address: 'Hội An, Quảng Nam, Việt Nam',
                imageUri: 'https://picsum.photos/id/1013/200/300',
                rating: 4.8,
            },
            {
                id: '4',
                name: 'Homestay 4',
                address: 'Hội An, Quảng Nam, Việt Nam',
                imageUri: 'https://picsum.photos/id/1014/200/300',
                rating: 4.8,
            },
        ]
    };

    return (
        <ScrollView style={styles.container}>
            {/* Ảnh địa điểm với nút quay lại */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: 'https://picsum.photos/800/400' }}
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

                {/* Tiện ích */}
                <Text style={styles.sectionTitle}>Ảnh</Text>
                <ScrollView horizontal={true} style={styles.horizontalScrollView}>
                    {placeDetails.images.map((image, index) => (
                        <TouchableOpacity key={index} onPress={() => { setCurrentIndex(index); setIsVisible(true); }}>
                            <Image source={image} style={styles.smallImage} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <View style={styles.amenitiesContainer}>
                    <ImageViewing
                        images={placeDetails.images}
                        imageIndex={currentIndex}
                        visible={isVisible}
                        onRequestClose={() => setIsVisible(false)}
                    />
                </View>
                <View>
                    <Text style={styles.sectionTitle}>Homestay</Text>
                    <ScrollView horizontal={true} style={styles.horizontalScrollView}>
                        {placeDetails.homestayes.map((homestay, index) => (
                            <SquareCard key={index} address={homestay.address} imageUri={homestay.imageUri} name={homestay.name} rating={homestay.rating} id={homestay.id} />
                        ))}
                    </ScrollView>
                </View>


            </View>
            <View>
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
            </View>
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
});

export default AddressDetailPage;
