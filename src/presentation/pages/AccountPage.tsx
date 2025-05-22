import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BACKGROUND } from '@/src/const/constants';
import PostList from '../components/postList';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, clearMessage } from '../redux/slices/userSlice';
import { logout } from '../redux/slices/authSlice';
import { RootState, AppDispatch } from '../redux/store';
import Toast from 'react-native-toast-message';
import MemoriesGrid from '../components/memory';
import ChangePasswordModal from '../components/ChangePasswordModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Types
type StoryHighlight = {
  id: string;
  name: string;
  image: string;
};

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
      'https://static.vinwonders.com/production/homestay-la-gi-thumb.jpg',
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
  {
    id: '4',
    images: [
      'https://khachsandep.vn/storage/files/Homestay/thiet-ke-homestay.jpeg',
    ],
    date: '2024-02-10',
    location: 'Nha Trang',
    diary: 'Tắm biển và thưởng thức hải sản tươi ngon ở Nha Trang.',
  },
  {
    id: '5',
    images: [
      'https://ik.imagekit.io/tvlk/blog/2024/07/canh-dep-viet-nam-6.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2',
    ],
    date: '2024-01-05',
    location: 'Sapa',
    diary: 'Ngắm tuyết rơi và leo núi Fansipan.',
  },
];

// Fake followers và following cho profile

const AccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'grid' | 'list'>('grid');
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error, message, status, statusCode } = useSelector((state: RootState) => state.user);
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'following' | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }
  console.log('message: ', message);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      Toast.show({
        type: status === 'success' ? 'success' : 'error',
        text1: message,
        onHide: () => {
          dispatch(clearMessage());
        },
      });
    }
  }, [message, status]);


  // Mock data
  const userStats = {
    posts: 54,
    followers: 834,
    following: 162,
  };

  const menuItems = [
    { icon: <Feather name="archive" size={20} color="black" />, label: "Archive" },
    { icon: <Feather name="clock" size={20} color="black" />, label: "Your Activity" },
    { icon: <Feather name="tag" size={20} color="black" />, label: "Nametag" },
    { icon: <Feather name="bookmark" size={20} color="black" />, label: "Saved" },
    { icon: <Feather name="users" size={20} color="black" />, label: "Close Friends" },
    { icon: <Feather name="user-plus" size={20} color="black" />, label: "Discover People" },
    { icon: <Feather name="lock" size={20} color="black" />, label: "Change Password" },
    { icon: <Feather name="settings" size={20} color="black" />, label: "Settings" },
    { icon: <Feather name="help-circle" size={20} color="black" />, label: "Help" },
    { icon: <Feather name="shield" size={20} color="black" />, label: "Privacy Policy" },
    { icon: <Feather name="log-out" size={20} color="black" />, label: "Log Out" },
  ]


  const handleEditProfilePage = () => {
    navigation.navigate('EditProfilePage');
  };

  const storyHighlights: StoryHighlight[] = [
    { id: '1', name: 'New', image: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
    { id: '2', name: 'Friends', image: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
    { id: '3', name: 'Sport', image: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
    { id: '4', name: 'Design', image: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
  ];

  const posts = [
    {
      id: '1',
      images: [
        'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg',
        'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg',
      ],
      caption: 'A beautiful day in the park!',
      likes: 120,
      comments: 45,
      shares: 10,
      createdAt: '2023-05-01',
    },
    {
      id: '2',
      images: ['https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg'],
      caption: 'Loving this new design!',
      likes: 200,
      comments: 60,
      shares: 15,
      createdAt: '2023-05-03',
    },
  ];

  const handleOpenModal = (type: 'followers' | 'following') => {
    setModalType(type);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setModalType(null);
  };

  return (



    <SafeAreaView style={styles.container}>

      <FlatList
        data={[]}
        keyExtractor={(item: any, index: any) => index.toString()}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <View></View>
              <View style={styles.usernameContainer}>
                <Text style={styles.username}>{profile?.username}</Text>
              </View>
              <TouchableOpacity onPress={toggleMenu}>
                <Feather name="menu" size={24} color="black" />
              </TouchableOpacity>
            </View>

            {/* Profile Info */}
            <View style={styles.profileSection}>
              <View style={styles.profileInfo}>
                <Image
                  source={{ uri: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' }}
                  style={styles.profileImage}
                />
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{userStats.posts}</Text>
                    <Text style={styles.statLabel}>Posts</Text>
                  </View>
                  <TouchableOpacity style={styles.statItem} onPress={() => handleOpenModal('followers')}>
                    <Text style={styles.statNumber}>{profile?.followers?.length ?? 0}</Text>
                    <Text style={styles.statLabel}>Followers</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.statItem} onPress={() => handleOpenModal('following')}>
                    <Text style={styles.statNumber}>{profile?.following?.length ?? 0}</Text>
                    <Text style={styles.statLabel}>Following</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bio */}
              <View style={styles.bioContainer}>
                <Text style={styles.name}>{profile?.name}</Text>
                <Text style={styles.bioText}>
                  {profile?.bio || 'This is a sample bio. Update it in your profile settings.'}
                </Text>
              </View>

              {/* Edit Profile Button */}
              <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfilePage}>
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>



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
        renderItem={null} // Không có dữ liệu chính để hiển thị
        ListFooterComponent={activeTab === 'grid' ?
          <PostList posts={posts} /> :
          <MemoriesGrid memories={fakeMemories} userId={authUser?.user?.id ?? ''} />} // Hiển thị danh sách bài đăng
      />
      {isOpen && (
        <>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.1)',
              zIndex: 998,
              height: Dimensions.get('window').height,
            }}
            activeOpacity={1}
            onPress={() => setIsOpen(false)}
          />
          <View
            style={{
              position: 'absolute',
              right: 0,
              top: 0, // điều chỉnh nếu cần
              width: 250,
              bottom: 0,
              backgroundColor: '#fff',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 10,
              zIndex: 999,
            }}
          >
            <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
              <Text style={{ paddingHorizontal: 16, paddingVertical: 8, fontWeight: 'bold' }}>{profile?.username}</Text>
            </View>
            <View>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  }}
                  onPress={() => {
                    setIsOpen(false);
                    if (item.label === 'Change Password') {
                      setShowChangePassword(true);
                    }
                    if (item.label === 'Log Out') {
                      console.log('Log Out');
                      dispatch(logout());
                      navigation.replace('Auth');
                    }
                    // Thêm xử lý cho từng menu item nếu cần
                  }}
                >
                  <View style={{ marginRight: 12 }}>{item.icon}</View>
                  <Text>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}

      {/* Modal đổi mật khẩu */}
      <ChangePasswordModal
        isVisible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      {/* Modal hiển thị danh sách followers/following */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseModal}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <TouchableWithoutFeedback>
              <View style={{
                backgroundColor: '#fff',
                marginTop: 100,
                marginHorizontal: 30,
                borderRadius: 10,
                padding: 20,
                maxHeight: '70%',
              }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>
                  {modalType === 'followers' ? 'Followers' : 'Following'}
                </Text>
                <ScrollView>
                  {(modalType === 'followers' ? profile?.followers : profile?.following)?.map((user: any) => (
                    <View key={user.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                          source={{ uri: user.profilePic || 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' }}
                          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
                        />
                        <View>
                          <Text style={{ fontWeight: '500' }}>{user.username}</Text>
                          {user.followedAt && (
                            <Text style={{ color: '#888', fontSize: 12 }}>
                              Đã theo dõi từ: {user.followedAt}
                            </Text>
                          )}
                        </View>
                      </View>
                      {modalType === 'following' && (
                        <TouchableOpacity
                          style={{
                            backgroundColor: '#eee',
                            borderRadius: 6,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                          }}
                          onPress={() => {
                            // TODO: Thêm logic hủy theo dõi ở đây
                            alert(`Đã hủy theo dõi ${user.username}`);
                          }}
                        >
                          <Text style={{ color: '#333', fontWeight: 'bold', fontSize: 13 }}>Đang theo dõi</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  {((modalType === 'followers' ? profile?.followers : profile?.following)?.length === 0) && (
                    <Text style={{ color: '#888', textAlign: 'center' }}>No users found.</Text>
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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

export default AccountPage;