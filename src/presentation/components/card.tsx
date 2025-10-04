import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';

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
  userId?: string;
  bio?: string;
  isFollowing?: boolean;
  totalRaters?: number;
  onPress?: () => void;
  onFollowPress?: () => void;
  isLiked?: boolean;
  visitCount?: number;
  reviewCount?: number;
}

const Card = React.memo<CardProps>(({
  type,
  image,
  avatar,
  title,
  description,
  rating,
  userId,
  achievements,
  cardHeight = 350,
  totalFollowers,
  totalRaters,
  bio,
  isFollowing,
  onPress,
  onFollowPress,
  isLiked,
  visitCount,
  reviewCount,
}) => {
  const renderContent = () => {
    switch (type) {
      case 'address':
        return (
          console.log("isLiked", isLiked),
          <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.card, { height: cardHeight }]}>
            <Image source={image} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <View>
                    <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
                  </View>

                  {/* Visit Count */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                    <Ionicons name="eye" size={14} color="#666" />
                    <Text style={styles.visitText}>   {(visitCount || 0).toString()} lượt truy cập</Text>
                  </View>

                  {/* Rating */}
                  {rating && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.ratingText}>   {rating.toFixed(1)}</Text>
                      <Text style={styles.ratingText}> ({(reviewCount || 0).toString()})</Text>
                    </View>
                  )}

                  {/* Like Count */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                    <Ionicons name="heart" size={14} color="#FF3B30" />
                    <Text style={styles.likeText}>   {(totalFollowers || 0).toString()} lượt thích</Text>
                  </View>
                </View>

                {/* Favorite Button */}
                <TouchableOpacity
                  style={[
                    styles.favoriteCard,
                    isLiked && styles.favoritedCard
                  ]}
                  onPress={onFollowPress}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons
                      name={isLiked ? "heart" : "heart-outline"}
                      size={18}
                      color={isLiked ? "#FF3B30" : "#666"}
                    />
                    <Text style={isLiked ? styles.favoritedText : styles.favoriteText}>
                      {isLiked ? 'Đã yêu thích' : 'Yêu thích'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <Text style={styles.cardDescription} numberOfLines={2}>{description}</Text>
            </View>
          </TouchableOpacity>
        );

      case 'user':
        return (
          <TouchableOpacity activeOpacity={0.8} onPress={onPress} >
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
                <Text style={styles.achievements} numberOfLines={2}>{description}</Text>
                <Text style={styles.description} numberOfLines={2}>{totalFollowers} Người theo dõi</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.followCard,
                  isFollowing && styles.followingCard
                ]}
                onPress={onFollowPress}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={isFollowing ? styles.followingText : styles.followText}>
                    {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                  </Text>
                  {!isFollowing && (
                    <Ionicons
                      name="add"
                      size={16}
                      color="#fff"
                      style={{ marginLeft: 2 }}
                    />
                  )}
                  {
                    isFollowing && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color="#000"
                        style={{ marginLeft: 2 }}
                      />
                    )
                  }
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
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
});

const styles = StyleSheet.create({
  followCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#0095F6',
    borderColor: '#0095F6',
    minWidth: 90,
  },
  followingCard: {
    backgroundColor: '#EFEFEF',
    borderColor: '#DBDBDB',
  },
  followText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 4,
  },
  followingText: {
    color: '#262626',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 4,
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
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievements: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#999',
  },
  visitText: {
    fontSize: 12,
    color: '#666',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  likeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '400',
  },
  favoriteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderColor: '#DBDBDB',
    minWidth: 90,
  },
  favoritedCard: {
    backgroundColor: '#FFECEC',
    borderColor: '#FF3B30',
  },
  favoriteText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  favoritedText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
});

Card.displayName = 'Card';

export default Card;