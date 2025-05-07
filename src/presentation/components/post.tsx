import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { BACKGROUND } from '@/src/const/constants';

const { width } = Dimensions.get('window');

interface PostProps {
  username: string;
  isVerified: boolean;
  location: string;
  imageUrl: string;
  likedBy: string;
  likesCount: number;
  caption: string;
  currentImageIndex: number;
  totalImages: number;
}

const Post: React.FC<PostProps> = ({
  username = 'joshua_J',
  isVerified = true,
  location = 'Tokyo, Japan',
  imageUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-LhKXgWZZXVwVm29H8Ay2tt6J90DBga.png',
  likedBy = 'craig_love',
  likesCount = 44686,
  caption = 'The game in Japan was amazing and I want to share some photos',
  currentImageIndex = 1,
  totalImages = 3,
}) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri: 'https://randomuser.me/api/portraits/men/43.jpg',
            }}
            style={styles.profilePic}
          />
          <View style={styles.userTextContainer}>
            <View style={styles.usernameContainer}>
              <Text style={styles.username}>{username}</Text>
              {isVerified && (
                <View style={styles.verifiedBadge}>
                  <FontAwesome name="check" size={8} color="#fff" />
                </View>
              )}
            </View>
            <Text style={styles.location}>{location}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Feather name="more-horizontal" size={24} color="#262626" />
        </TouchableOpacity>
      </View>

      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={
            typeof imageUrl === 'string'
              ? { uri: imageUrl }
              : imageUrl // Nếu là require, sử dụng trực tiếp
          }
          style={styles.postImage}
        />
        <View style={styles.imageCounter}>
          <Text style={styles.imageCounterText}>
            {currentImageIndex}/{totalImages}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="heart" size={24} color="#262626" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="message-circle" size={24} color="#262626" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="send" size={24} color="#262626" />
          </TouchableOpacity>
        </View>
        <View style={styles.carouselIndicator}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <TouchableOpacity>
          <Feather name="bookmark" size={24} color="#262626" />
        </TouchableOpacity>
      </View>

      {/* Likes */}
      <View style={styles.likesContainer}>
        <Text style={styles.likes}>
          Liked by <Text style={styles.bold}>{likedBy}</Text> and{' '}
          <Text style={styles.bold}>{likesCount.toLocaleString()} others</Text>
        </Text>
      </View>

      {/* Caption */}
      <View style={styles.captionContainer}>
        <Text style={styles.caption}>
          <Text style={styles.bold}>{username}</Text> {caption}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: BACKGROUND,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DADADA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: 50,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  userTextContainer: {
    justifyContent: 'center',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
    marginRight: 4,
  },
  verifiedBadge: {
    backgroundColor: '#3897f0',
    borderRadius: 10,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  location: {
    fontSize: 12,
    color: '#262626',
  },
  imageContainer: {
    position: 'relative',
  },
  postImage: {
    width: width,
    height: width,
  },
  imageCounter: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  imageCounterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  leftActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginRight: 16,
  },
  carouselIndicator: {
    flexDirection: 'row',
    position: 'absolute',
    left: '50%',
    marginLeft: -30,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C4C4C4',
    marginHorizontal: 2,
  },
  activeDot: {
    backgroundColor: '#3897F0',
  },
  likesContainer: {
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  likes: {
    fontSize: 14,
  },
  bold: {
    fontWeight: '600',
  },
  captionContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  caption: {
    fontSize: 14,
    lineHeight: 18,
  },
});

export default Post;