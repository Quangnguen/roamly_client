import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Homestay from '@/src/types/homestayInterface';



const SquareCard: React.FC<Homestay> = ({ imageUri, name, rating, address, id }) => {
    return (
        <View style={styles.cardContainer}>
            <Image source={{ uri: imageUri }} style={styles.cardImage} />
            <Text style={styles.cardTitle} numberOfLines={1}>{name}</Text>
            <View style={styles.locationContainer}>
                <FontAwesome name="map-marker" size={12} color="#FF6B6B" />
                <Text style={styles.locationText} numberOfLines={1}>{address}</Text>
            </View>
            <View style={styles.ratingContainer}>
                <FontAwesome name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{rating}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: 150,
        height: 180, // Tăng chiều cao để chứa thêm thông tin địa điểm
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#fff',
        elevation: 3,
        marginRight: 16,
        padding: 0,
    },
    cardImage: {
        width: '100%',
        height: '55%', // Giảm tỷ lệ chiều cao hình ảnh
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 4,
        marginHorizontal: 8,
        textAlign: 'left', // Căn trái thay vì căn giữa
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
        flex: 1, // Cho phép text co giãn nhưng không vượt quá chiều rộng của container
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
        marginTop: 4,
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 12,
        color: '#333',
    },
});

export default SquareCard;