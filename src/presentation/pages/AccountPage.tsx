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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BACKGROUND } from '@/src/const/constants';
import PostList from '../components/postList';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, clearMessage, uploadProfilePicture } from '../redux/slices/userSlice';
import { logout } from '../redux/slices/authSlice';
import { RootState, AppDispatch } from '../redux/store';
import Toast from 'react-native-toast-message';
import MemoriesGrid from '../components/memories/memory';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { getFollowers, getFollowing, followUser, unfollowUser } from '../redux/slices/followSlice';
import { getMyPosts, getPosts } from '../redux/slices/postSlice';
import Post from '../components/post';


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
  const { followers, following, loading: followersLoading, error: followersError, message: followersMessage, status: followersStatus, statusCode: followersStatusCode } = useSelector((state: RootState) => state.follow);
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const { myPosts, loading: postLoading } = useSelector((state: RootState) => state.post);
  const [isOpen, setIsOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'followings' | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);


  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  // Add useFocusEffect to refresh data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchUserProfile());
      dispatch(getFollowers());
      dispatch(getFollowing());
      dispatch(getMyPosts());
      setActiveTab('grid');
    }, [dispatch])
  );

  // Thêm useEffect để lắng nghe thay đổi của followers và following
  useEffect(() => {
    if (modalVisible) {
      if (modalType === 'followers') {
        dispatch(getFollowers());
        dispatch(getFollowing()); // Cần cả following để check trạng thái
      } else if (modalType === 'followings') {
        dispatch(getFollowing());
      }
    }
  }, [modalVisible, modalType]);

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

  const handleOpenModal = (type: 'followers' | 'followings') => {
    setModalType(type);
    setModalVisible(true);
    if (type === 'followers') {
      dispatch(getFollowers());
    } else {
      dispatch(getFollowing());
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setModalType(null);
  };

  const changeProfilePic = async () => {
    try {
      setIsLoading(true);
      const result = await launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        // Tạo FormData object
        const formData = new FormData();

        // Thêm file vào FormData
        const fileUri = result.assets[0].uri;
        const fileName = fileUri.split('/').pop() || 'photo.jpg';
        const fileType = 'file';

        formData.append('file', {
          uri: fileUri,
          name: fileName,
          type: fileType,
        } as any);

        // Dispatch action để upload ảnh đại diện
        await dispatch(uploadProfilePicture(formData));

        // Sau khi upload thành công, fetch lại thông tin user
        await dispatch(fetchUserProfile());
        setShowAvatarModal(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'Có lỗi khi cập nhật ảnh đại diện',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUser = async (userId: string) => {
    try {
      await dispatch(followUser(userId));
      // Refresh lại toàn bộ dữ liệu
      dispatch(getFollowers());
      dispatch(getFollowing());
      dispatch(fetchUserProfile());
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollowUser = async (userId: string, username: string) => {
    try {
      await dispatch(unfollowUser(userId));
      // Refresh lại toàn bộ dữ liệu
      dispatch(getFollowers());
      dispatch(getFollowing());
      dispatch(fetchUserProfile());
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  // Kiểm tra xem mình đã follow user này chưa
  const isFollowingUser = (userId: string): boolean => {
    return following?.some(followingUser => followingUser.id === userId) ?? false;
  };

  const handleFollowAction = async (userId: string, username: string, isAlreadyFollowing: boolean) => {
    if (isAlreadyFollowing) {
      // Trực tiếp unfollow không cần xác nhận
      await handleUnfollowUser(userId, username);
    } else {
      // Nếu chưa follow thì follow
      await handleFollowUser(userId);
    }
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
                <TouchableOpacity onPress={() => setShowAvatarModal(true)}>
                  <Image
                    source={{ uri: profile?.profilePic || 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' }}
                    style={styles.profileImage}
                  />
                </TouchableOpacity>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{userStats.posts}</Text>
                    <Text style={styles.statLabel}>Posts</Text>
                  </View>
                  <TouchableOpacity style={styles.statItem} onPress={() => handleOpenModal('followers')}>
                    <Text style={styles.statNumber}>{profile?.followersCount ?? 0}</Text>
                    <Text style={styles.statLabel}>Followers</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.statItem} onPress={() => handleOpenModal('followings')}>
                    <Text style={styles.statNumber}>{profile?.followingsCount ?? 0}</Text>
                    <Text style={styles.statLabel}>Followings</Text>
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
          postLoading
            ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <ActivityIndicator size="large" color="#888" />
            </View>
            : <PostList
              posts={myPosts}
              mini={true}
              expandedPostId={expandedPostId}
              onPostPress={(post) => {
                setExpandedPostId(expandedPostId === post.id ? null : post.id);
              }}
            />
          : <MemoriesGrid memories={fakeMemories} userId={authUser?.user?.id ?? ''} />} // Hiển thị danh sách bài đăng
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

      {/* Modal hiển thị followers/following */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                    <Feather name="x" size={28} color="black" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>
                    {modalType === 'followers' ? 'Người theo dõi' : 'Đang theo dõi'}
                  </Text>
                  <View style={{ width: 28 }}>
                    <Text> </Text>
                  </View>
                </View>

                <ScrollView style={styles.modalScrollView}>
                  {modalType === 'followers' ? (
                    followers?.map((user) => {
                      const isAlreadyFollowing = isFollowingUser(user.id);
                      return (
                        <TouchableOpacity key={user.id} style={styles.userItem}>
                          <View style={styles.userInfo}>
                            <Image
                              source={{ uri: user.profilePic || 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' }}
                              style={styles.userAvatar}
                            />
                            <View style={styles.userTextInfo}>
                              <Text style={styles.userNameText}>{user.username}</Text>
                              <Text style={styles.followDate}>
                                Theo dõi từ: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                              </Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={[
                              styles.followButton,
                              isAlreadyFollowing ? styles.followingButton : styles.followButton
                            ]}
                            onPress={() => handleFollowAction(user.id, user.username, isAlreadyFollowing)}
                          >
                            <Text
                              style={[
                                styles.followButtonText,
                                isAlreadyFollowing ? styles.followingButtonText : { color: '#FFFFFF' }
                              ]}
                            >
                              {isAlreadyFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                            </Text>
                          </TouchableOpacity>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    following?.map((user) => (
                      <TouchableOpacity key={user.id} style={styles.userItem}>
                        <View style={styles.userInfo}>
                          <Image
                            source={{ uri: user.profilePic || 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' }}
                            style={styles.userAvatar}
                          />
                          <View style={styles.userTextInfo}>
                            <Text style={styles.userNameText}>{user.username}</Text>
                            <Text style={styles.followDate}>
                              Theo dõi từ: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={[styles.followButton, styles.followingButton]}
                          onPress={() => handleUnfollowUser(user.id, user.username)}
                        >
                          <Text style={[styles.followButtonText, styles.followingButtonText]}>
                            Đang theo dõi
                          </Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))
                  )}
                  {((modalType === 'followers' ? followers : following)?.length === 0) && (
                    <Text style={styles.emptyText}>Không có người dùng nào</Text>
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal hiển thị avatar phóng to */}
      <Modal
        visible={showAvatarModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View style={styles.avatarModalContainer}>
          <TouchableOpacity
            style={styles.avatarModalCloseButton}
            onPress={() => setShowAvatarModal(false)}
          >
            <Feather name="x" size={24} color="white" />
          </TouchableOpacity>
          <Image
            source={{ uri: profile?.profilePic || 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' }}
            style={styles.avatarModalImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.changeAvatarButton}
            onPress={changeProfilePic}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.changeAvatarButtonText}>Đổi ảnh đại diện</Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal hiển thị bài viết đầy đủ */}
      <Modal
        visible={showPostModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowPostModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 40,
              right: 20,
              zIndex: 10,
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderRadius: 20,
              padding: 8,
            }}
            onPress={() => setShowPostModal(false)}
          >
            <Text style={{ color: '#007AFF', fontWeight: 'bold', fontSize: 18 }}>Đóng</Text>
          </TouchableOpacity>
          {selectedPost && (
            <Post
              username={selectedPost.author.username}
              location={selectedPost.location}
              images={selectedPost.imageUrl.map((url: string, index: number) => ({
                id: index.toString(),
                uri: url,
              }))}
              commentCount={selectedPost.commentCount}
              likeCount={selectedPost.likeCount}
              sharedCount={selectedPost.sharedCount}
              caption={selectedPost.caption}
              author={selectedPost.author}
              isPublic={selectedPost.isPublic}
              isVerified={false}
            />
          )}
        </View>
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
  avatarModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarModalImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  avatarModalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  changeAvatarButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  changeAvatarButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    height: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DBDBDB',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalScrollView: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DBDBDB',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  userTextInfo: {
    flex: 1,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  followDate: {
    fontSize: 14,
    color: '#8E8E8E',
  },
  followButton: {
    backgroundColor: '#0095F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  followingButton: {
    backgroundColor: '#EFEFEF',
  },
  followButtonText: {
    color: '#262626',
    fontWeight: '600',
    fontSize: 15,
  },
  followingButtonText: {
    color: '#262626',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E8E',
    marginTop: 24,
    fontSize: 16,
  },
});

export default AccountPage;