import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
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

const HomePage = () => {
  const navigation: NavigationProp<'Home' | 'WeatherPage'> = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading } = useSelector((state: RootState) => state.post);

  useEffect(() => {
    dispatch(getPosts());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(getPosts());
  };

  return (
    <View style={styles.container}>
      <Header
        unreadMessages={1}
        onCameraPress={() => console.log("Camera pressed")}
        onMessagesPress={() => console.log("Messages pressed")}
        onDirectPress={() => console.log("Direct pressed")}
        onWeatherPress={() => navigation.navigate('WeatherPage')}
      />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
          />
        }
      >
        {posts.map((post) => (
          <Post
            key={post.id}
            username={post.author.username}
            location={post.location}
            images={post.imageUrl.map((url, index) => ({
              id: index.toString(),
              uri: url
            }))}
            commentCount={post.commentCount}
            likeCount={post.likeCount}
            sharedCount={post.sharedCount}
            caption={post.caption}
            author={post.author}
            isPublic={post.isPublic}
            isVerified={false}
          />
        ))}
      </ScrollView>
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
