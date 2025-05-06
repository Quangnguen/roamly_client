import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.9; // Chiều rộng card chiếm 90% màn hình
const cardHeight = 200; // Chiều cao cố định cho card

interface CardProps {
  image: any; // Hình ảnh (có thể là require hoặc uri)
  title: string; // Tiêu đề
  description: string; // Mô tả
}

const CardAddress: React.FC<CardProps> = ({ image, title, description }) => {
  return (
    <View style={styles.card}>
      <Image source={image} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    height: cardHeight,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5, // Bóng đổ cho Android
    marginVertical: 10,
    alignSelf: 'center',
  },
  cardImage: {
    width: '100%',
    height: '60%', // Hình ảnh chiếm 60% chiều cao card
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 10,
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default CardAddress;