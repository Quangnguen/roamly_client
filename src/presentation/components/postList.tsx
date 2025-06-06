import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import Post from './post';
import PostMini from './PostMini';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

type Post = {
  id: string;
  authorId: string;
  imageUrl: string[]; // Danh sách ảnh của bài đăng
  caption: string; // Nội dung bài đăng
  likeCount: number; // Số lượt thích
  commentCount: number; // Số lượt bình luận
  sharedCount: number; // Số lượt chia sẻ
  createdAt: string; // Ngày đăng bài
  location: string | null;
  isPublic: boolean;
  isLike?: boolean;
  author: {
    username: string;
    profilePic: string | null;
  };
};

type PostListProps = {
  posts: Post[];
  mini?: boolean;
  onPostPress?: (post: Post) => void;
  expandedPostId?: string | null;
  currentUserId?: string;
  author: {
    username: string;
    profilePic: string | null;
  };
};

const PostList: React.FC<PostListProps> = ({ posts, mini = false, onPostPress, expandedPostId, currentUserId, author }) => {
  // Sắp xếp bài đăng theo ngày đăng (mới nhất trước)
  const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const user = useSelector((state: RootState) => state.auth.profile);

  return (
    <FlatList
      data={sortedPosts}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        mini ? (
          expandedPostId === item.id ? (
            <View>
              <Post
                postId={item.id}
                username={item.author.username}
                location={item.location}
                images={item.imageUrl.map((url, index) => ({
                  id: index.toString(),
                  uri: url
                }))}
                commentCount={item.commentCount}
                likeCount={item.likeCount}
                sharedCount={item.sharedCount}
                caption={item.caption}
                author={author}
                isPublic={item.isPublic}
                isVerified={false}
                isOwner={item.authorId === currentUserId}
                isLike={item.isLike}
              />
              <TouchableOpacity style={{ alignSelf: 'center', marginVertical: 8 }} onPress={() => onPostPress && onPostPress(item)}>
                <Text style={{ color: '#007AFF', fontWeight: 'bold', fontSize: 16 }}>Thu gọn</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <PostMini
              image={item.imageUrl[0]}
              caption={item.caption}
              likeCount={item.likeCount}
              commentCount={item.commentCount}
              sharedCount={item.sharedCount}
              imageCount={item.imageUrl.length}
              onPress={() => onPostPress && onPostPress(item)}
            />
          )
        ) : (
          <Post
            postId={item.id}
            username={item.author.username}
            location={item.location}
            images={item.imageUrl.map((url, index) => ({
              id: index.toString(),
              uri: url
            }))}
            commentCount={item.commentCount}
            likeCount={item.likeCount}
            sharedCount={item.sharedCount}
            caption={item.caption}
            author={author}
            isPublic={item.isPublic}
            isVerified={false}
            isOwner={item.authorId === currentUserId}
            isLike={item.isLike}
          />
        )
      )}
    />
  );
};

const styles = StyleSheet.create({});

export default PostList;