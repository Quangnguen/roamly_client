import React, { useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { getPosts } from '../redux/slices/postSlice';
import Post from '../components/post';
import { BACKGROUND } from '@/src/const/constants';
import { Header } from '../components/header';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from "@/src/utils/PropsNavigate";

type PostType = {
  id: string;
  authorId: string;
  imageUrl: string[];
  caption: string;
  likeCount: number;
  commentCount: number;
  sharedCount: number;
  location: string | null;
  isPublic: boolean;
  isLoading?: boolean;
  isLike?: boolean;
  author: {
    username: string;
    profilePic: string | null;
  };
};

const HomePage = () => {
  const navigation: NavigationProp<'Home' | 'WeatherPage'> = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading } = useSelector((state: RootState) => state.post);
  const user = useSelector((state: RootState) => state.auth.profile);

  // Kiểm tra xem có post nào đang trong trạng thái optimistic loading không
  const hasOptimisticLoading = posts.some(post => post.isLoading);

  useEffect(() => {
    dispatch(getPosts());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(getPosts());
  };

  const renderItem = ({ item: post }: { item: PostType }) => (
    <Post
      key={post.id}
      postId={post.id}
      username={post.author.username}
      location={post.location}
      images={post.imageUrl.map((url: string, index: number) => ({
        id: index.toString(),
        uri: url
      }))}
      commentCount={post.commentCount}
      likeCount={post.likeCount}
      sharedCount={post.sharedCount}
      caption={post.caption}
      author={post.author}
      isPublic={post.isPublic}
      isOwner={post.authorId === user?.id}
      isVerified={false}
      isLoading={post.isLoading || false}
      authorId={post.authorId}
      isLike={post.isLike}
    />
  );

  return (
    <View style={styles.container}>
      <Header
        unreadMessages={1}
        onCameraPress={() => console.log("Camera pressed")}
        onMessagesPress={() => console.log("Messages pressed")}
        onDirectPress={() => console.log("Direct pressed")}
        onWeatherPress={() => navigation.navigate('WeatherPage')}
      />
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={loading && !hasOptimisticLoading}
            onRefresh={handleRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={5}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  header: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default HomePage;
