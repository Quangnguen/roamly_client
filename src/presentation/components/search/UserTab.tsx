import React from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import Card from '../card';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { followUser, unfollowUser, getFollowing } from '../../redux/slices/followSlice';
import { User } from '../../../domain/models/User';
import { SearchUserResult } from '../../../types/UserResponseInterface';

interface UserTabProps {
    searchText?: string;
}

// Type guard để kiểm tra xem object có phải SearchUserResult không
const isSearchUserResult = (user: User | SearchUserResult): user is SearchUserResult => {
    return 'isFollowing' in user && 'followerCount' in user;
};

const UserTab: React.FC<UserTabProps> = ({ searchText = '' }) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const dispatch = useDispatch<AppDispatch>();

    const { users, loading } = useSelector((state: RootState) => state.user);
    const {
        searchResults,
        searchLoading,
        searchError,
        searchPagination
    } = useSelector((state: RootState) => state.user);
    const { following } = useSelector((state: RootState) => state.follow);

    // Determine which data to show and which loading state to use
    const isSearching = searchText.trim().length > 0;
    const displayData = isSearching ? searchResults : users;
    const isLoading = isSearching ? searchLoading : loading;

    if (isLoading) {
        return (
            <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#888" />
                <Text style={styles.loadingText}>
                    {isSearching ? 'Đang tìm kiếm...' : 'Đang tải...'}
                </Text>
            </View>
        );
    }

    if (searchError && isSearching) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.errorText}>Lỗi: {searchError}</Text>
            </View>
        );
    }

    if (isSearching && searchResults.length === 0 && !searchLoading) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                    Không tìm thấy người dùng nào với từ khóa "{searchText}"
                </Text>
            </View>
        );
    }

    if (!isSearching && (!users || users.length === 0)) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có người dùng nào</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Search results info */}
            {isSearching && searchPagination && (
                <View style={styles.searchInfoContainer}>
                    <Text style={styles.searchInfoText}>
                        Tìm thấy {searchPagination.total} kết quả cho "{searchText}"
                    </Text>
                </View>
            )}

            {(Array.isArray(displayData) ? displayData : []).map((user) => {
                // For search results, check isFollowing from the user data
                // For regular users list, check from following state
                const isFollowingUser = isSearchUserResult(user)
                    ? user.isFollowing
                    : following?.some(followingUser => followingUser.id === user.id);

                const handleFollowPress = async () => {
                    try {
                        if (!user.id) return;

                        if (isFollowingUser) {
                            await dispatch(unfollowUser(user.id));
                        } else {
                            await dispatch(followUser(user.id));
                        }
                        // Refresh lại danh sách following sau khi thay đổi
                        dispatch(getFollowing());
                    } catch (error) {
                        console.error('Error following/unfollowing user:', error);
                    }
                };

                // Get properties based on user type
                const userBio = isSearchUserResult(user) ? 'Người dùng' : (user.bio || 'Chưa có tiểu sử');
                const userDescription = isSearchUserResult(user) ? 'Người dùng' : (user.bio || 'Chưa có mô tả');
                const followerCount = isSearchUserResult(user) ? user.followerCount : (user.followersCount || 0);

                return (
                    <Card
                        key={user.id}
                        type="user"
                        avatar={user.profilePic || undefined}
                        title={user.name || user.username || 'Không có tên'}
                        userId={user.id}
                        bio={userBio}
                        description={userDescription}
                        totalFollowers={followerCount}
                        isFollowing={isFollowingUser}
                        onFollowPress={handleFollowPress}
                        onPress={() => navigation.navigate('InfoAccPage', {
                            id: user.id ?? '',
                        })}
                    />
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#d63031',
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
    },
    searchInfoContainer: {
        backgroundColor: '#f0f0f0',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        width: '100%',
    },
    searchInfoText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
});

export default UserTab; 