import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Touchable, TouchableOpacity } from 'react-native';
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
  totalFollowers?: number;
  totalRaters?: number;
  onPress?: () => void;
}

const Card: React.FC<CardProps> = ({
  type,
  image,
  avatar,
  title,
  description,
  rating,
  achievements,
  cardHeight = 220,
  totalFollowers,
  totalRaters,
  onPress,
}) => {
  const renderContent = () => {
    switch (type) {
      case 'address':
        return (
          <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.card, { height: cardHeight }]}>
            <Image source={image} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <View>
                    <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                    <Ionicons name="people" size={16} color="#000" />
                    <Text>   {totalFollowers}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.followCard} onPress={() => {}}>
                  <Text>Theo dõi</Text>
                  <Ionicons name="add" size={16} color="#000" />
                </TouchableOpacity>
              </View>
              <Text style={styles.cardDescription} numberOfLines={2}>{description}</Text>
            </View>
          </TouchableOpacity>
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
              <Text style={styles.name} numberOfLines={2}>{title}</Text>
              <Text style={styles.achievements} numberOfLines={2}>{achievements}</Text>
              <Text style={styles.description} numberOfLines={2}>{description}</Text>
            </View>
          </View>
        );

      case 'homestay':
        return (
          <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.card, { height: cardHeight }]}>
            <Image source={image} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
              {rating && (
                <View style={styles.ratingContainer}>
                  {[...Array(5)].map((_, index) => (
                    <Ionicons
                      key={index}
                      name={index < rating ? 'star' : 'star-outline'}
                      size={18}
                      color="#FFD700"
                    />
                  ))}
                  <Text style={{ marginLeft: 5 }}>({totalRaters})</Text>
                </View>
              )}
              <Text style={styles.cardDescription} numberOfLines={2}>{description}</Text>
            </View>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  return renderContent();
};

const styles = StyleSheet.create({
  followCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#000',
    borderWidth: 1,
    padding: 5,
    borderRadius: 8,
  },
  card: {
    width: cardWidth,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgb(200, 245, 200)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    marginVertical: 10,
    alignSelf: 'center',
    paddingBottom: 8,
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
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: cardWidth,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgb(215, 243, 215)',
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