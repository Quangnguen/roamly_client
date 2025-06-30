import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '../redux/hook';
import { getConversations } from '../redux/slices/chatSlice';
import ChatItem from './chatItem';
import { ChatItemType } from '../../types/chatItem';
import { BACKGROUND } from '@/src/const/constants';

interface ConversationsSectionProps {
    conversations: ChatItemType[];
    loading: boolean;
    error: string | null;
    searchText: string;
}

const ConversationsSection: React.FC<ConversationsSectionProps> = ({
    conversations,
    loading,
    error,
    searchText
}) => {
    const dispatch = useAppDispatch();
    const [showAll, setShowAll] = useState(false);

    const INITIAL_SHOW_COUNT = 4;

    // Filter conversations based on search
    const filteredConversations = React.useMemo(() => {
        if (!searchText.trim()) {
            return conversations;
        }

        return conversations.filter(chat =>
            chat.name.toLowerCase().includes(searchText.toLowerCase()) ||
            chat.lastMessage.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [conversations, searchText]);

    // Get conversations to display (limited or all)
    const displayConversations = showAll
        ? filteredConversations
        : filteredConversations.slice(0, INITIAL_SHOW_COUNT);

    const hasMore = filteredConversations.length > INITIAL_SHOW_COUNT;
    const showExpandButton = hasMore && !showAll;
    const showCollapseButton = hasMore && showAll;

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tin nhắn mới</Text>
                <Text style={styles.sectionCount}>({filteredConversations.length})</Text>
            </View>

            <View style={styles.sectionContent}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>Đang tải cuộc trò chuyện...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>Lỗi: {error}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => dispatch(getConversations())}
                        >
                            <Text style={styles.retryButtonText}>Thử lại</Text>
                        </TouchableOpacity>
                    </View>
                ) : filteredConversations.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {searchText ? "Không tìm thấy cuộc trò chuyện" : "Chưa có cuộc trò chuyện nào"}
                        </Text>
                    </View>
                ) : (
                    <>
                        {displayConversations.map((chat) => (
                            <ChatItem key={chat.id} chat={chat} />
                        ))}

                        {/* Show more/less buttons */}
                        {showExpandButton && (
                            <TouchableOpacity
                                style={styles.expandButton}
                                onPress={() => setShowAll(true)}
                            >
                                <Text style={styles.expandButtonText}>
                                    Xem thêm {filteredConversations.length - INITIAL_SHOW_COUNT} cuộc trò chuyện
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
});

export default ConversationsSection; 