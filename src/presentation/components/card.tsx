import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.9;
const AVATAR_SIZE = 64;

interface CardProps {
  type: 'address' | 'user' | 'homestay';
  image?: any;
  avatar?: string;
  title: string;
  description: string;
  rating?: number;
  achievements?: string;
  cardHeight?: number;
}

const Card: React.FC<CardProps> = ({
  type,
  image,
  avatar,
  title,
  description,
  rating,
  achievements,
  cardHeight = 200,
}) => {
  const renderContent = () => {
    switch (type) {
      case 'address':
        return (
          <View style={[styles.card, { height: cardHeight }]}>
            <Image source={image} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardDescription}>{description}</Text>
            </View>
          </View>
        );

      case 'user':
        return (
          <View style={styles.userCard}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  avatar
                    ? { uri: avatar }
                    : require('../../../assets/images/avatar-test.jpg')
                }
                style={styles.avatar}
              />
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{title}</Text>
              <Text style={styles.achievements}>{achievements}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
          </View>
        );

      case 'homestay':
        return (
          <View style={[styles.card, { height: cardHeight }]}>
            <Image source={image} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{title}</Text>
              {rating && (
                <View style={styles.ratingContainer}>
                  {[...Array(5)].map((_, index) => (
                    <Ionicons
                      key={index}
                      name={index < rating ? 'star' : 'star-outline'}
                      size={16}
                      color="#FFD700"
                    />
                  ))}
                </View>
              )}
              <Text style={styles.cardDescription}>{description}</Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return renderContent();
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(215, 243, 215, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    marginVertical: 10,
    alignSelf: 'center',
  },
  cardImage: {
    width: '100%',
    height: '60%',
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
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: cardWidth,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(215, 243, 215, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginVertical: 10,
    alignSelf: 'center',
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    resizeMode: 'cover',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  achievements: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#888',
  },
});

export default Card; 