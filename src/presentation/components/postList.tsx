import React from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

type Post = {
  id: string;
  images: string[]; // Danh sách ảnh của bài đăng
  caption: string; // Nội dung bài đăng
  likes: number; // Số lượt thích
  comments: number; // Số lượt bình luận
  shares: number; // Số lượt chia sẻ
  createdAt: string; // Ngày đăng bài
};

type PostListProps = {
  posts: Post[];
};

const PostList: React.FC<PostListProps> = ({ posts }) => {
  // Sắp xếp bài đăng theo ngày đăng (mới nhất trước)
  const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <FlatList
      data={sortedPosts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          {/* Bên trái: Hình ảnh */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.images[0] }} style={styles.image} />
            {item.images.length > 1 && (
              <View style={styles.imageCount}>
                <Text style={styles.imageCountText}>{item.images.length}+</Text>
              </View>
            )}
          </View>

          {/* Bên phải: Nội dung */}
          <View style={styles.contentContainer}>
            <Text style={styles.caption} numberOfLines={2}>
              {item.caption}
            </Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="heart-outline" size={16} color="gray" />
                <Text style={styles.statText}>{item.likes}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="chatbubble-outline" size={16} color="gray" />
                <Text style={styles.statText}>{item.comments}</Text>
              </View>
              <View style={styles.statItem}>
                <Feather name="share" size={16} color="gray" />
                <Text style={styles.statText}>{item.shares}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    marginRight: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imageCount: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  imageCountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  caption: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: '10'
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: 'gray',
    marginLeft: 4,
  },
});

export default PostList;