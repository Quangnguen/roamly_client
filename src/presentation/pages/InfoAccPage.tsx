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
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { BACKGROUND } from '@/src/const/constants';
import PostList from '../components/postList';
import MemoriesGrid from '../components/memory'; // Thêm dòng này
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, fetchUserProfile, getUserById } from '../redux/slices/userSlice';
import { RootState, AppDispatch } from '../redux/store';
import Toast from 'react-native-toast-message';

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
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<InfoAccPageRouteProp>();
  const { id } = route.params;

  useEffect(() => {
    dispatch(getUserById(id));
  }, [dispatch, id]);
  console.log('user', user);

  // Fake data nếu user chưa có
  const posts = [
    {
      id: '1',
      images: [
        'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg',
      ],
      caption: 'A beautiful day!',
      likes: 10,
      comments: 2,
      shares: 1,
      createdAt: '2023-05-01',
    },
    {
      id: '2',
      images: [
        'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg',
      ],
      caption: 'Enjoying the view!',
      likes: 20,
      comments: 5,
      shares: 3,
      createdAt: '2023-05-02',
    },
  ];
  const storyHighlights: StoryHighlight[] = [
    { id: '1', name: 'New', image: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
    { id: '2', name: 'Friends', image: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
    { id: '3', name: 'Sport', image: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
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
  const followingCount = user?.followingCount ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[]} // Add an empty array as data
        // Không có data chính, chỉ dùng ListHeaderComponent
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
                <Image
                  source={{ uri: user?.profilePic || 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' }}
                  style={styles.profileImage}
                />
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
                    <Text style={styles.statLabel}>Following</Text>
                  </View>
                </View>
              </View>

              {/* Bio */}
              <View style={styles.bioContainer}>
                <Text style={styles.name}>{user?.name ?? 'Tên người dùng'}</Text>
                <Text style={styles.bioText}>
                  {user?.bio || 'This is a sample bio. Update it in your profile settings.'}
                </Text>
              </View>


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
            ? <PostList posts={posts} />
            : <MemoriesGrid memories={fakeMemories} userId={user?.id ?? ''} />
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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
  bioContainer: {
    marginBottom: 15,
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
});

export default InfoAccPage;