import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BACKGROUND } from '@/src/const/constants';

interface FriendItem {
    id: string;
    username: string;
    profilePic: string;
    isOnline?: boolean;
}

interface FriendsSectionProps {
    friends: FriendItem[];
    loading: boolean;
    error: string | null;
    searchText: string;
    onRetry: () => void;
    onStartChat: (friend: FriendItem) => void;
}

const FriendsSection: React.FC<FriendsSectionProps> = ({
    friends,
    loading,
    error,
    searchText,
    onRetry,
    onStartChat
}) => {
    const navigation = useNavigation();
    const [showAll, setShowAll] = useState(false);

    const INITIAL_SHOW_COUNT = 4;



    // Filter friends based on search
    const filteredFriends = React.useMemo(() => {
        if (!searchText.trim()) {
            return friends;
        }

        const filtered = friends.filter(friend =>
            friend.username.toLowerCase().includes(searchText.toLowerCase())
        );
        return filtered;
    }, [friends, searchText]);

    // Get friends to display (limited or all)
    const displayFriends = showAll
        ? filteredFriends
        : filteredFriends.slice(0, INITIAL_SHOW_COUNT);

    const hasMore = filteredFriends.length > INITIAL_SHOW_COUNT;
    const showExpandButton = hasMore && !showAll;
    const showCollapseButton = hasMore && showAll;



    // Function để bắt đầu chat với friend
    const startChatWithFriend = (friend: FriendItem) => {
        // Gọi callback từ parent component để handle tạo conversation
        onStartChat(friend);
    };

    // Render friend item
    const renderFriendItem = (friend: FriendItem) => (
        <View key={friend.id} style={styles.friendItem}>
            <Image
                source={{ uri: friend.profilePic }}
                style={styles.friendAvatar}
            />
            <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.username}</Text>
                <Text style={styles.friendStatus}>
                    {friend.isOnline ? 'Đang hoạt động' : 'Offline'}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.messageButton}
                onPress={() => startChatWithFriend(friend)}
            >
                <Ionicons name="chatbubble-outline" size={18} color="white" />
                <Text style={styles.messageButtonText}>Nhắn tin</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Bạn bè</Text>
                <Text style={styles.sectionCount}>({filteredFriends.length})</Text>
            </View>

            <View style={styles.sectionContent}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>Đang tải danh sách bạn bè...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>Lỗi: {error}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={onRetry}
                        >
                            <Text style={styles.retryButtonText}>Thử lại</Text>
                        </TouchableOpacity>
                    </View>
                ) : filteredFriends.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {searchText ? "Không tìm thấy bạn bè" : "Chưa có bạn bè nào"}
                        </Text>
                    </View>
                ) : (
                    <>
                        {displayFriends.map((friend) => renderFriendItem(friend))}

                        {/* Show more/less buttons */}
                        {showExpandButton && (
                            <TouchableOpacity
                                style={styles.expandButton}
                                onPress={() => setShowAll(true)}
                            >
                                <Text style={styles.expandButtonText}>
                                    Xem thêm {filteredFriends.length - INITIAL_SHOW_COUNT} bạn bè
                                </Text>
                                <Ionicons name="chevron-down" size={16} color="#007AFF" />
                            </TouchableOpacity>
                        )}

                        {showCollapseButton && (
                            <TouchableOpacity
                                style={styles.expandButton}
                                onPress={() => setShowAll(false)}
                            >
                                <Text style={styles.expandButtonText}>Thu gọn</Text>
                                <Ionicons name="chevron-up" size={16} color="#007AFF" />
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: BACKGROUND,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    sectionCount: {
        fontSize: 14,
        color: '#666',
    },
    sectionContent: {
        backgroundColor: BACKGROUND,
    },
    loadingContainer: {
        paddingVertical: 30,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
    errorContainer: {
        paddingVertical: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    errorText: {
        fontSize: 14,
        color: '#FF3B30',
        textAlign: 'center',
        marginBottom: 15,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 14,
    },
    emptyContainer: {
        paddingVertical: 30,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f0f7ff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    expandButtonText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500',
        marginRight: 6,
    },
    // Friend item styles
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: BACKGROUND,
    },
    friendAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    friendInfo: {
        flex: 1,
    },
    friendName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    friendStatus: {
        fontSize: 13,
        color: '#666',
    },
    messageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginLeft: 8,
    },
    messageButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
    },
});

export default FriendsSection; 