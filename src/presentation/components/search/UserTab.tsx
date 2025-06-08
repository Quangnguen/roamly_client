import React from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import Card from '../card';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { followUser, unfollowUser, getFollowing } from '../../redux/slices/followSlice';

const UserTab = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const dispatch = useDispatch<AppDispatch>();

    const { users, loading } = useSelector((state: RootState) => state.user);
    const { following } = useSelector((state: RootState) => state.follow);

    if (loading) {
        return (
            <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#888" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {(Array.isArray(users) ? users : []).map((user) => {
                const isFollowing = following?.some(followingUser => followingUser.id === user.id);

                const handleFollowPress = async () => {
                    try {
                        if (!user.id) return;

                        if (isFollowing) {
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

                return (
                    <Card
                        key={user.id}
                        type="user"
                        avatar={user.profilePic || undefined}
                        title={user.name || user.username || 'Không có tên'}
                        userId={user.id}
                        bio={user.bio || 'Chưa có tiểu sử'}
                        description={user.bio || 'Chưa có mô tả'}
                        totalFollowers={user.followersCount || 0}
                        isFollowing={isFollowing}
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
    },
});

export default UserTab; 