import React, { use, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { BACKGROUND } from '@/src/const/constants';
import PostList from '../components/postList';
import MemoriesGrid from '../components/memories/memory';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, fetchUserProfile, getUserById } from '../redux/slices/userSlice';
import { RootState, AppDispatch } from '../redux/store';
import Toast from 'react-native-toast-message';
import { getFollowing, followUser, unfollowUser } from '../redux/slices/followSlice';
import { getPosts, getPostsByUserId } from '../redux/slices/postSlice';
import { getConversations, createConversation } from '../redux/slices/chatSlice';
import { dependencies } from '@/src/dependencies/dependencies';
import { Post } from '@/src/domain/entities/post';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'InfoAccPage'>;
type InfoAccPageRouteProp = RouteProp<RootStackParamList, 'InfoAccPage'>;
type InfoAccPageProps = {};

type StoryHighlight = {
  id: string;
  name: string;
  image: string;
};

const InfoAccPage: React.FC<InfoAccPageProps> = () => {
  const [activeTab, setActiveTab] = useState<'grid' | 'list'>('grid');
  const dispatch = useDispatch<AppDispatch>();
  const { user, message, status } = useSelector((state: RootState) => state.user);
  const { following } = useSelector((state: RootState) => state.follow);
  const { profile: authUser } = useSelector((state: RootState) => state.auth);
  const { conversations } = useSelector((state: RootState) => state.chat);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<InfoAccPageRouteProp>();
  const { id } = route.params;
  const { postsByUserId, loading } = useSelector((state: RootState) => state.post);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);


  useEffect(() => {
    dispatch(getUserById(id));
    dispatch(getPostsByUserId(id));
    dispatch(getConversations());
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(getFollowing());
  }, [dispatch]);


  const storyHighlights: StoryHighlight[] = [
    { id: '1', name: 'Mới', image: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
    { id: '2', name: 'Bạn bè', image: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
    { id: '3', name: 'Thể thao', image: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
  ];

  // Fake data cho memories
  const fakeMemories = [
    {
      id: '1',
      images: [
        'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg',
        'https://ik.imagekit.io/tvlk/blog/2024/07/canh-dep-viet-nam-6.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2',
      ],
      date: '2024-05-01',
      location: 'Đà Lạt',
      diary: 'Một ngày tuyệt vời ở Đà Lạt cùng bạn bè!',
    },
    {
      id: '2',
      images: [
        'https://vatlieuhousing.com/wp-content/uploads/2024/03/homestay-chuong-my.jpg',
      ],
      date: '2024-04-15',
      location: 'Hà Nội',
      diary: 'Tham quan phố cổ Hà Nội, thưởng thức phở và cà phê trứng.',
    },
    {
      id: '3',
      images: [
        'https://tourdulichmangden.vn/upload/news/homestay-mang-den-0-8434.jpg',
      ],
      date: '2024-03-20',
      location: 'Măng Đen',
      diary: 'Khám phá thiên nhiên hoang sơ ở Măng Đen.',
    },
  ];

  useEffect(() => {
    if (message) {
      Toast.show({
        type: status === 'success' ? 'success' : 'error',
        text1: message,
      });
    }
  }, [message, status]);

  // Số liệu thống kê
  const postCount = 22;
  const followersCount = user?.followersCount ?? 0;
  const followingCount = user?.followingsCount ?? 0;

  const isMyProfile = authUser?.id === user?.id;
  const isFollowing = following?.some(f => f.id === user?.id);

  const handleFollowPress = async () => {
    if (!user?.id) return;
    if (isFollowing) {
      await dispatch(unfollowUser(user.id));
    } else {
      await dispatch(followUser(user.id));
    }
    dispatch(getFollowing());
  };

  const handleMessagePress = async () => {
    if (!user?.id) return;

    try {
      // Kiểm tra xem đã có conversation với user này chưa
      const existingConversation = conversations.find(conv => {
        // Kiểm tra conversation 1-on-1 (không phải group)
        if (conv.isGroup) return false;

        // Kiểm tra xem có participant nào là user này không
        return conv.participants.some(participant => participant.userId === user.id);
      });

      if (existingConversation) {
        // Navigate đến ChatDetailPage với conversation đã có
        navigation.navigate('ChatDetailPage', {
          chatId: existingConversation.id,
          name: user.name || user.username || '',
          avatar: user.profilePic || ''
        });
        return;
      }

      // Gọi API tạo conversation mới
      const result = await dispatch(createConversation({
        userIds: [user.id]
      })).unwrap();

      // Navigate đến ChatDetailPage với conversation mới
      navigation.navigate('ChatDetailPage', {
        chatId: result.id,
        name: user.name || user.username || '',
        avatar: user.profilePic || ''
      });

    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Không thể tạo cuộc trò chuyện',
        text2: 'Vui lòng thử lại sau'
      });
    }
  };

  const author = {
    username: user?.username || '',
    profilePic: user?.profilePic || '',
  }


  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[]}
        keyExtractor={(_: any, index: number) => index.toString()}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Feather name="arrow-left" size={24} color="black" />
              </TouchableOpacity>
              <View style={styles.usernameContainer}>
                <Text style={styles.username}>{user?.username ?? 'username'}</Text>
              </View>
              <View />
            </View>

            {/* Profile Info */}
            <View style={styles.profileSection}>
              <View style={styles.profileInfo}>
                <View style={styles.profileInfoCenter}>
                  <Image
                    source={{ uri: user?.profilePic || 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' }}
                    style={styles.profileImage}
                  />
                  <Text style={styles.name}>{user?.name ?? 'Tên người dùng'}</Text>
                  <Text style={styles.bioText}>
                    {user?.bio || 'This is a sample bio. Update it in your profile settings.'}
                  </Text>
                </View>
              </View>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{postCount}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{followersCount}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{followingCount}</Text>
                  <Text style={styles.statLabel}>Followings</Text>
                </View>
              </View>

              {/* Nút follow và nhắn tin */}
              {!isMyProfile && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[
                      styles.followCard,
                      isFollowing && styles.followingCard,
                      { marginRight: 12 },
                    ]}
                    onPress={handleFollowPress}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={isFollowing ? styles.followingText : styles.followText}>
                        {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                      </Text>
                      {!isFollowing && (
                        <Feather name="plus" size={16} color="#fff" style={{ marginLeft: 2 }} />
                      )}
                      {isFollowing && (
                        <Feather name="check" size={16} color="#000" style={{ marginLeft: 2 }} />
                      )}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.messageButton}
                    onPress={handleMessagePress}
                  >
                    <Feather name="message-circle" size={18} color="#0095F6" />
                    <Text style={styles.messageText}>Nhắn tin</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Tab Selector */}
            <View style={styles.tabSelector}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'grid' && styles.activeTab]}
                onPress={() => setActiveTab('grid')}
              >
                <MaterialIcons name="grid-on" size={24} color={activeTab === 'grid' ? 'black' : 'gray'} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'list' && styles.activeTab]}
                onPress={() => setActiveTab('list')}
              >
                <Feather name="user" size={24} color={activeTab === 'list' ? 'black' : 'gray'} />
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={null}
        ListFooterComponent={
          activeTab === 'grid'
            ? <PostList
              posts={postsByUserId}
              mini={true}
              expandedPostId={expandedPostId}
              onPostPress={(post) => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
              author={author}
            />
            : <MemoriesGrid userId={user?.id ?? ''} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 5,
  },
  profileSection: {
    padding: 15,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  profileInfoCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#262626',
  },
  bioCenterContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
    // alignItems: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  bioText: {
    fontSize: 14,
    color: '#262626',
  },
  editProfileButton: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 4,
    paddingVertical: 7,
    alignItems: 'center',
    marginBottom: 15,
  },
  editProfileText: {
    fontWeight: '600',
    fontSize: 14,
  },
  highlightsContainer: {
    marginBottom: 15,
  },
  highlightItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  highlightImageContainer: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 1,
    borderColor: '#DBDBDB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  highlightImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  newHighlightContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightName: {
    fontSize: 12,
  },
  tabSelector: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: '#DBDBDB',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
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
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0095F6',
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  messageText: {
    color: '#0095F6',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
});

export default InfoAccPage;