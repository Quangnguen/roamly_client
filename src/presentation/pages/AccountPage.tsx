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
import { useNavigation, useFocusEffect, RouteProp } from '@react-navigation/native';
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
import AccountHeader from '../components/account/AccountHeader';
import ProfileInfo from '../components/account/ProfileInfo';
import TabSelector from '../components/account/TabSelector';
import TabSelectorAccountPage from '../components/TabSelectorAccountPage';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Types
type StoryHighlight = {
  id: string;
  name: string;
  image: string;
};

const AccountPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error, message, status, statusCode } = useSelector((state: RootState) => state.user);
  const { followers, following, loading: followersLoading, error: followersError, message: followersMessage, status: followersStatus, statusCode: followersStatusCode } = useSelector((state: RootState) => state.follow);
  const user = useSelector((state: RootState) => state.auth.profile);
  const [isOpen, setIsOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'followings' | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [followingCount, setFollowingCount] = useState(user?.followingCount ?? 0);
  const [profilePic, setProfilePic] = useState(user?.profilePic ?? 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg');

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }


  useEffect(() => {
    setFollowingCount(user?.followingCount ?? 0);
    setProfilePic(user?.profilePic ?? 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg');
  }, [user]);

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


  const menuItems = [
    { icon: <Feather name="archive" size={20} color="black" />, label: "Lưu trữ" },
    { icon: <Feather name="clock" size={20} color="black" />, label: "Hoạt động của bạn" },
    { icon: <Feather name="tag" size={20} color="black" />, label: "Thẻ tên" },
    { icon: <Feather name="bookmark" size={20} color="black" />, label: "Đã lưu" },
    { icon: <Feather name="users" size={20} color="black" />, label: "Bạn thân" },
    { icon: <Feather name="user-plus" size={20} color="black" />, label: "Khám phá mọi người" },
    { icon: <Feather name="lock" size={20} color="black" />, label: "Đổi mật khẩu" },
    { icon: <Feather name="settings" size={20} color="black" />, label: "Cài đặt" },
    { icon: <Feather name="help-circle" size={20} color="black" />, label: "Trợ giúp" },
    { icon: <Feather name="shield" size={20} color="black" />, label: "Chính sách bảo mật" },
    { icon: <Feather name="log-out" size={20} color="black" />, label: "Đăng xuất" },
  ]


  const handleEditProfilePage = () => {
    navigation.navigate('EditProfilePage');
  };

  const storyHighlights: StoryHighlight[] = [
    { id: '1', name: 'Mới', image: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
    { id: '2', name: 'Bạn bè', image: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
    { id: '3', name: 'Thể thao', image: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
    { id: '4', name: 'Thiết kế', image: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
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

        // Xác định MIME type từ extension
        const fileExtension = fileName.split('.').pop()?.toLowerCase();
        let mimeType = 'image/jpeg'; // default

        switch (fileExtension) {
          case 'png':
            mimeType = 'image/png';
            break;
          case 'jpg':
          case 'jpeg':
            mimeType = 'image/jpeg';
            break;
          case 'gif':
            mimeType = 'image/gif';
            break;
          case 'webp':
            mimeType = 'image/webp';
            break;
          default:
            mimeType = 'image/jpeg';
        }

        formData.append('file', {
          uri: fileUri,
          name: fileName,
          type: mimeType,
        } as any);

        console.log('FormData for upload:', {
          uri: fileUri,
          name: fileName,
          type: mimeType,
        });

        // Dispatch action để upload ảnh đại diện
        const uploadResult = await dispatch(uploadProfilePicture(formData));

        if (uploadResult.meta.requestStatus === 'fulfilled') {
          // Đóng modal ngay khi upload thành công
          setProfilePic(result.assets[0].uri);
          setShowAvatarModal(false);
          Toast.show({
            type: 'success',
            text1: 'Cập nhật ảnh đại diện thành công',
          });
        } else {
          setShowAvatarModal(false);
          // Hiển thị lỗi nếu upload thất bại
          Toast.show({
            type: 'error',
            text1: 'Không thể cập nhật ảnh đại diện',
            text2: 'Vui lòng thử lại sau',
          });
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'Có lỗi khi cập nhật ảnh đại diện',
        text2: 'Vui lòng kiểm tra kết nối mạng',
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
      setFollowingCount(followingCount + 1);
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
      setFollowingCount(followingCount - 1);
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
        keyExtractor={(_, index) => index.toString()}
        renderItem={() => null}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <AccountHeader
              username={user?.username ?? ''}
              onMenuPress={() => setIsOpen(true)}
            />

            <ProfileInfo
              profilePic={profilePic}
              name={user?.name ?? ''}
              bio={user?.bio ?? ''}
              postCount={user?.postCount ?? 0}
              followersCount={user?.followersCount ?? 0}
              followingCount={followingCount}
              onAvatarPress={() => setShowAvatarModal(true)}
              onFollowersPress={() => handleOpenModal('followers')}
              onFollowingPress={() => handleOpenModal('followings')}
              onEditProfilePress={handleEditProfilePage}
            />

            <TabSelectorAccountPage />
          </>
        }

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
              <Text style={{ paddingHorizontal: 16, paddingVertical: 8, fontWeight: 'bold' }}>{user?.username}</Text>
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
                    if (item.label === 'Đổi mật khẩu') {
                      setShowChangePassword(true);
                    }
                    if (item.label === 'Đăng xuất') {
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
                        <TouchableOpacity key={user.id} style={styles.userItem} onPress={() => {
                          navigation.navigate('InfoAccPage', { id: user.id });
                        }}>
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
                      <TouchableOpacity key={user.id} style={styles.userItem} onPress={() => {
                        navigation.navigate('InfoAccPage', { id: user.id });
                      }}>
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
            source={{ uri: profilePic }}
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
      {/* <Modal
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
              author={author}
              isPublic={selectedPost.isPublic}
              isVerified={false}
              isLike={selectedPost.isLike}
            />
          )}
        </View>
      </Modal> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    position: 'relative',
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