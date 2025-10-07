import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { getPostsFeed } from '../redux/slices/postSlice';
import { getPopularDestinations, toggleFavoriteDestination, untoggleFavoriteDestination } from '../redux/slices/destinationSlice'; // <-- added
import Post from '../components/post';
import Card from '../components/card'; // <-- added
import { BACKGROUND } from '@/src/const/constants';
import { Header } from '../components/header';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
  author: {
    username: string;
    profilePic: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
  score: number;
  isLike: boolean;
  isToday: boolean;
  isFollowing: boolean;
  isSelf: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
};

const HomePage = () => {
  const navigation: NavigationProp<'Home' | 'WeatherPage'> = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { feedPosts, feedLoading } = useSelector((state: RootState) => state.post);
  // Destinations for the top slider
  const popularDestinations = useSelector((state: RootState) =>
    state.destination.searchResults.length > 0 ? state.destination.searchResults : state.destination.destinations
  );
  const destLoading = useSelector((state: RootState) => state.destination.loading || state.destination.searchLoading);
  const user = useSelector((state: RootState) => state.auth.profile);

  // State cho pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const POSTS_PER_PAGE = 5;

  // Kiểm tra xem có post nào đang trong trạng thái optimistic loading không
  const hasOptimisticLoading = feedPosts.some(post => post.isLoading);

  // Load posts lần đầu khi component mount
  useEffect(() => {
    setCurrentPage(1);
    setHasNextPage(true);
    setIsLoadingMore(false);
    dispatch(getPostsFeed({ page: 1, limit: POSTS_PER_PAGE }));
    // load popular destinations for top slider
    dispatch(getPopularDestinations());
  }, [dispatch]);

  const handleDestFavoriteToggle = (destinationId: string, currentLiked: boolean) => {
    if (currentLiked) {
      dispatch(untoggleFavoriteDestination({ targetId: destinationId, type: 'destination' }));
    } else {
      dispatch(toggleFavoriteDestination({ targetId: destinationId, type: 'destination' }));
    }
  };

  // Chỉ refresh khi focus nếu không có optimistic posts
  useFocusEffect(
    React.useCallback(() => {
      // Không refresh nếu có optimistic post để tránh ghi đè
      if (hasOptimisticLoading) {
        return;
      }

      // Chỉ refresh nếu feedPosts rỗng hoặc đã lâu không cập nhật
      if (feedPosts.length === 0) {
        setCurrentPage(1);
        setHasNextPage(true);
        setIsLoadingMore(false);
        dispatch(getPostsFeed({ page: 1, limit: POSTS_PER_PAGE }));
      }
    }, [dispatch, hasOptimisticLoading, feedPosts.length])
  );

  const handleRefresh = () => {
    setCurrentPage(1);
    setHasNextPage(true);
    dispatch(getPostsFeed({ page: 1, limit: POSTS_PER_PAGE }));
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasNextPage) {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      dispatch(getPostsFeed({ page: nextPage, limit: POSTS_PER_PAGE }))
        .then((action: any) => {
          // Kiểm tra nếu response có ít hơn POSTS_PER_PAGE posts thì không còn page tiếp theo
          if (action.payload && action.payload.data && action.payload.data.length < POSTS_PER_PAGE) {
            setHasNextPage(false);
          }
          setCurrentPage(nextPage);
          setIsLoadingMore(false);
        })
        .catch(() => {
          setIsLoadingMore(false);
        });
    }
  };

  // Header component for FlatList: popular destinations slider
  const renderHeader = () => (
    <View style={styles.destHeaderWrapper}>
      <Text style={styles.destHeaderTitle}>Gợi ý địa điểm</Text>
      {destLoading ? (
        <ActivityIndicator style={{ marginVertical: 12 }} />
      ) : popularDestinations && popularDestinations.length > 0 ? (
        <FlatList
          horizontal
          data={popularDestinations}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
          renderItem={({ item }) => (
            <View style={{ marginRight: 12 }}>
              <Card
                type="address"
                image={item.imageUrl && item.imageUrl.length > 0 ? { uri: item.imageUrl[0] } : require('../../../assets/images/natural2.jpg')}
                title={item.title || 'Địa điểm'}
                description={item.location || item.city || ''}
                totalFollowers={item.likeCount || 0}
                visitCount={item.visitCount || 0}
                rating={item.rating || 0}
                reviewCount={item.reviewCount || 0}
                isLiked={item.isLiked || false}
                onPress={() => navigation.navigate('AddressDetailPage' as any, { id: item.id, destinationData: item })}
                onFollowPress={() => handleDestFavoriteToggle(item.id, item.isLiked || false)}
              />
            </View>
          )}
        />
      ) : (
        <Text style={styles.destEmptyText}>Không có địa điểm gợi ý</Text>
      )}
    </View>
  );

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
      commentCount={post._count.comments}
      likeCount={post._count.likes}
      sharedCount={post.sharedCount}
      caption={post.caption}
      author={post.author}
      isPublic={post.isPublic}
      isOwner={post.authorId === user?.id}
      isVerified={false}
      isLoading={post.isLoading || false}
      authorId={post.authorId}
      isLike={post.isLike}
      isToday={post.isToday}
      isFollowing={post.isFollowing}
      isSelf={post.isSelf}
      createdAt={post.createdAt}
      updatedAt={post.updatedAt}
      tags={post.tags}
    />
  );

  // Component cho loading indicator ở dưới
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color="#0000ff" />
        <Text style={styles.loadingText}>Đang tải thêm...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        unreadMessages={1}
        onCameraPress={() => { }}
        onMessagesPress={() => { }}
        onDirectPress={() => { }}
        onWeatherPress={() => navigation.navigate('WeatherPage')}
      />
      <FlatList
        data={feedPosts}
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={feedLoading && !hasOptimisticLoading && currentPage === 1}
            onRefresh={handleRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={5}
        onEndReachedThreshold={0.5}
        onEndReached={handleLoadMore}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  destHeaderWrapper: {
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: 'transparent',
  },
  destHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingLeft: 16,
    marginBottom: 8,
  },
  destEmptyText: {
    paddingLeft: 16,
    color: '#666',
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
  footerLoading: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
});

export default HomePage;
