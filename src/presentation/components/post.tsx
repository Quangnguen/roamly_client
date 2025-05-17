import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ImageSourcePropType,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { BACKGROUND } from '@/src/const/constants';

const { width } = Dimensions.get('window');

// Định nghĩa kiểu dữ liệu cho ảnh
type ImageItem = {
  id: string;
  uri: string | ImageSourcePropType;
};

interface PostProps {
  username: string;
  isVerified: boolean;
  location: string;
  images: ImageItem[];
  likedBy: string;
  likesCount: number;
  caption: string;
}

const Post: React.FC<PostProps> = ({
  username = 'joshua_J',
  isVerified = true,
  location = 'Tokyo, Japan',
  images = [
    { 
      id: '1', 
      uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-LhKXgWZZXVwVm29H8Ay2tt6J90DBga.png' 
    }
  ],
  likedBy = 'craig_love',
  likesCount = 44686,
  caption = 'The game in Japan was amazing and I want to share some photos',
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const renderImageItem = useCallback(({ item }: { item: ImageItem }) => (
    <View style={{ width }}>
      <Image
        source={typeof item.uri === 'string' ? { uri: item.uri } : item.uri}
        style={styles.postImage}
        resizeMode="cover"
      />
    </View>
  ), []);

  const handleScrollBegin = useCallback(() => {
    setIsScrolling(true);
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isScrolling) {
      const slideSize = width;
      const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
      if (index >= 0 && index < images.length) {
        setActiveImageIndex(index);
      }
    }
  }, [isScrolling, images.length]);

  const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsScrolling(false);
    const slideSize = width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    if (index >= 0 && index < images.length) {
      setActiveImageIndex(index);
    }
  }, [images.length]);

  const goToImage = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      flatListRef.current?.scrollToOffset({
        offset: index * width,
        animated: true
      });
      setActiveImageIndex(index);
    }
  }, [images.length]);

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

      {/* Image Carousel */}
      <View style={styles.imageContainer}>
        <FlatList
          ref={flatListRef}
          data={images}
          renderItem={renderImageItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={width}
          snapToAlignment="center"
          decelerationRate={0.9}
          onScrollBeginDrag={handleScrollBegin}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          keyExtractor={(item) => item.id}
          disableIntervalMomentum={true}
          snapToOffsets={images.map((_, index) => index * width)}
          scrollEventThrottle={16}
        />
        
        {images.length > 1 && (
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {activeImageIndex + 1}/{images.length}
            </Text>
          </View>
        )}
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
        
        {images.length > 1 && (
          <View style={styles.carouselIndicatorContainer}>
            <View style={styles.carouselIndicator}>
              {images.map((_, index) => (
                <TouchableOpacity 
                  key={index}
                  onPress={() => goToImage(index)}
                >
                  <View 
                    style={[
                      styles.dot, 
                      index === activeImageIndex && styles.activeDot
                    ]} 
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
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
    borderBottomColor: '#000',
    borderTopColor: "#000",
    borderTopWidth: 0.5,
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
  carouselIndicatorContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  carouselIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
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