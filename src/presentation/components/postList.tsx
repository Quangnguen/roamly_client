import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import Post from './post';
import PostMini from './PostMini';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

type PostType = {
  id: string;
  authorId: string;
  imageUrl: string[]; // Danh sách ảnh của bài đăng
  caption: string; // Nội dung bài đăng
  likeCount?: number; // Số lượt thích (legacy, fallback)
  commentCount?: number; // Số lượt bình luận (legacy, fallback)
  sharedCount: number; // Số lượt chia sẻ
  createdAt: string; // Ngày đăng bài
  updatedAt?: string;
  location: string | null;
  tags?: string[];
  isPublic: boolean;
  author: {
    username: string;
    profilePic: string;
  };
  _count?: {
    likes: number;
    comments: number;
  };
  score?: number;
  isLike?: boolean;
  isToday?: boolean;
  isFollowing?: boolean;
  isSelf?: boolean;
};

type PostListProps = {
  posts: PostType[];
  mini?: boolean;
  onPostPress?: (post: PostType) => void;
  expandedPostId?: string | null;
  currentUserId?: string;
  author: {
    username: string;
    profilePic: string | null;
  };
};

const PostList: React.FC<PostListProps> = ({ posts, mini = false, onPostPress, expandedPostId, currentUserId, author }) => {
  // Process posts structure

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
                images={item.imageUrl.map((url: string, index: number) => ({
                  id: index.toString(),
                  uri: url
                }))}
                commentCount={item._count?.comments ?? item.commentCount ?? 0}
                likeCount={item._count?.likes ?? item.likeCount ?? 0}
                sharedCount={item.sharedCount}
                caption={item.caption}
                author={author}
                isPublic={item.isPublic}
                isVerified={false}
                isOwner={item.authorId === currentUserId}
                authorId={item.authorId}
                isLike={item.isLike ?? false}
                isToday={item.isToday ?? false}
                isFollowing={item.isFollowing ?? false}
                isSelf={item.isSelf ?? false}
                createdAt={item.createdAt}
                updatedAt={item.updatedAt ?? item.createdAt}
                tags={item.tags ?? []}
              />
              <TouchableOpacity style={{ alignSelf: 'center', marginVertical: 8 }} onPress={() => onPostPress && onPostPress(item)}>
                <Text style={{ color: '#007AFF', fontWeight: 'bold', fontSize: 16 }}>Thu gọn</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <PostMini
              image={item.imageUrl[0]}
              caption={item.caption}
              likeCount={item._count?.likes ?? item.likeCount ?? 0}
              commentCount={item._count?.comments ?? item.commentCount ?? 0}
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
            images={item.imageUrl.map((url: string, index: number) => ({
              id: index.toString(),
              uri: url
            }))}
            commentCount={item._count?.comments ?? item.commentCount ?? 0}
            likeCount={item._count?.likes ?? item.likeCount ?? 0}
            sharedCount={item.sharedCount}
            caption={item.caption}
            author={author}
            isPublic={item.isPublic}
            isVerified={false}
            isOwner={item.authorId === currentUserId}
            authorId={item.authorId}
            isLike={item.isLike ?? false}
            isToday={item.isToday ?? false}
            isFollowing={item.isFollowing ?? false}
            isSelf={item.isSelf ?? false}
            createdAt={item.createdAt}
            updatedAt={item.updatedAt ?? item.createdAt}
            tags={item.tags ?? []}
          />
        )
      )}
    />
  );
};

const styles = StyleSheet.create({});

export default PostList;