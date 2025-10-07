import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

interface SquareCardProps {
    imageUri: string;
    name: string;
    address?: string;
    rating?: number;
    numberOfReviews?: number;
    numberOfLikes?: number;
    numberOfVisits?: number;
    id: string;
    type: 'homestay' | 'place';
    onPress?: () => void;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Thêm sao đầy
    for (let i = 0; i < fullStars; i++) {
        stars.push(
            <FontAwesome
                key={`full-${i}`}
                name="star"
                size={12}
                color="#FFD700"
                style={styles.star}
            />
        );
    }

    // Thêm nửa sao nếu có
    if (hasHalfStar && fullStars < 5) {
        stars.push(
            <FontAwesome
                key="half"
                name="star-half-o"
                size={12}
                color="#FFD700"
                style={styles.star}
            />
        );
    }

    // Thêm sao rỗng cho đủ 5 sao
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars.push(
            <FontAwesome
                key={`empty-${i}`}
                name="star-o"
                size={12}
                color="#FFD700"
                style={styles.star}
            />
        );
    }

    return <View style={styles.starsContainer}>{stars}</View>;
};

const SquareCard: React.FC<SquareCardProps> = ({
    imageUri,
    name,
    address,
    rating,
    numberOfReviews,
    numberOfLikes,
    numberOfVisits,
    type,
    onPress,
}) => {
    const cardHeight = type === 'place' ? 150 : 170; // Chiều cao card dựa vào type
    const imageHeight = 99; // Giữ nguyên chiều cao ảnh (55% của 180)

    return (
        <TouchableOpacity
            style={[
                styles.cardContainer,
                { height: cardHeight }
            ]}
            onPress={onPress}
        >
            <Image
                source={{ uri: imageUri }}
                style={[
                    styles.cardImage,
                    { height: imageHeight }
                ]}
            />
            <Text style={styles.cardTitle} numberOfLines={1}>{name}</Text>
            {address && type === 'homestay' && (
                <View style={styles.locationContainer}>
                    <FontAwesome name="map-marker" size={12} color="#FF6B6B" />
                    <Text style={styles.locationText} numberOfLines={1}>{address}</Text>
                </View>
            )}
            {rating && (
                <View style={styles.ratingContainer}>
                    <StarRating rating={rating} />
                    <Text style={styles.ratingText}>({numberOfReviews})</Text>
                </View>
            )}
            {type === 'place' && (
                <View style={styles.placeContainer}>
                    <Ionicons name="heart" size={16} color="red" />
                    <Text>{numberOfLikes}</Text>
                </View>
            )}

             {type === 'place' && (
                <View style={styles.placeContainer}>
                    <Ionicons name="people" size={16} color="red" />
                    <Text>{numberOfVisits}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: 150,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#fff',
        elevation: 3,
        marginRight: 16,
        padding: 0,
    },
    cardImage: {
        width: '100%',
        resizeMode: 'cover',
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 4,
        marginHorizontal: 8,
        textAlign: 'left',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
        marginTop: 4,
    },
    locationText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
        flex: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
        marginTop: 4,
    },
    starsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    star: {
        marginRight: 2,
    },
    ratingText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 2,
        marginBottom: 2
    },
    placeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
        marginTop: 4,
    }
});

export default SquareCard;