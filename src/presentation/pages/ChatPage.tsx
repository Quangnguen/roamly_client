import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, Feather } from "@expo/vector-icons"
import ChatItem from "../components/chatItem"
import type { ChatItemType } from "../../types/chatItem"
import { useNavigation } from "@react-navigation/native"
import { NavigationProp } from "@/src/utils/PropsNavigate"
import { BACKGROUND } from "@/src/const/constants"
import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../redux/hook"
import { getConversations, handleSocketNewMessage, createConversation } from "../redux/slices/chatSlice"
import { ConversationResponseInterface } from "@/src/types/ConversationResponseInterface"
import { socketService } from "@/src/services/socketService"
import { getFollowersApi, getFollowingApi } from "@/src/data/api/followApi"
import ConversationsSection from "../components/ConversationsSection"
import FriendsSection from "../components/FriendsSection"

// Helper function để convert ConversationResponseInterface sang ChatItemType
const convertConversationToChat = (conversation: ConversationResponseInterface, currentUserId: string): ChatItemType => {
  // Find other participant (not current user)
  const otherParticipant = conversation.participants.find((p: any) => p.userId !== currentUserId);

  // Get last message from conversation.lastMessage field
  // Handle both string and object cases
  const lastMessage = conversation.lastMessage;
  const lastMessageText = typeof lastMessage === 'string'
    ? lastMessage
    : (lastMessage as any)?.content || (lastMessage as any)?.text || null;

  // Calculate time ago from lastMessage time or conversation creation time
  let timeToUse: string;
  if (lastMessage && typeof lastMessage === 'object' && (lastMessage as any)?.createdAt) {
    // Nếu có lastMessage object và có thời gian, dùng thời gian của lastMessage
    timeToUse = (lastMessage as any).createdAt;
  } else {
    // Nếu không có lastMessage hoặc lastMessage là string, dùng thời gian tạo nhóm
    timeToUse = conversation.createdAt;
  }
  const timeAgo = calculateTimeAgo(timeToUse);

  return {
    id: conversation.id,
    name: conversation.isGroup
      ? conversation.name || "Group Chat"
      : otherParticipant?.user.username || "Unknown User",
    avatar: conversation.isGroup
      ? "https://i.pinimg.com/474x/0b/38/83/0b3883c43e5b003eb00fe0f20b41b08b.jpg" // Default group avatar
      : otherParticipant?.user.profilePic || "https://i.pinimg.com/474x/0b/38/83/0b3883c43e5b003eb00fe0f20b41b08b.jpg",
    lastMessage: lastMessageText || "Chưa có tin nhắn",
    time: timeAgo,
  };
};

// Helper function để tính thời gian
const calculateTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "now";
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInHours < 24) return `${diffInHours}h`;
  return `${diffInDays}d`;
};

// Interface cho friend item
interface FriendItem {
  id: string;
  username: string;
  profilePic: string;
  isOnline?: boolean;
}

const ChatPage: React.FC = () => {
  const navigation: NavigationProp<'Home'> = useNavigation()
  const dispatch = useAppDispatch()

  // Redux state
  const { conversations, loading, error } = useAppSelector(state => state.chat)
  const profile = useAppSelector(state => state.auth.profile)

  // Section state
  const [searchText, setSearchText] = React.useState("");
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [socketConnected, setSocketConnected] = React.useState(false);

  // Friends state
  const [friends, setFriends] = React.useState<FriendItem[]>([]);
  const [friendsLoading, setFriendsLoading] = React.useState(false);
  const [friendsError, setFriendsError] = React.useState<string | null>(null);

  // Load conversations on component mount
  useEffect(() => {
    dispatch(getConversations());
  }, [dispatch]);

  // Load friends khi component mount
  useEffect(() => {
    loadFriends();
  }, []);

  // Function để load danh sách bạn bè
  const loadFriends = async () => {
    setFriendsLoading(true);
    setFriendsError(null);

    try {
      // Lấy cả followers và following
      const [followersResponse, followingResponse] = await Promise.all([
        getFollowersApi(),
        getFollowingApi()
      ]);

      // Kiểm tra response structure  
      if (!followersResponse && !followingResponse) {
        setFriends([]);
        return;
      }

      // Combine và deduplicate
      const allFriends: FriendItem[] = [];
      const seenIds = new Set();

      // Add followers - API trả về direct objects
      if (followersResponse?.data) {
        followersResponse.data.forEach((follower: any) => {
          // API trả về direct object không có nested structure
          if (follower?.id && !seenIds.has(follower.id)) {
            allFriends.push({
              id: follower.id,
              username: follower.username || 'Unknown',
              profilePic: follower.profilePic || "https://i.pinimg.com/474x/0b/38/83/0b3883c43e5b003eb00fe0f20b41b08b.jpg"
            });
            seenIds.add(follower.id);
          }
        });
      }

      // Add following - API trả về direct objects  
      if (followingResponse?.data) {
        followingResponse.data.forEach((following: any) => {
          // API trả về direct object không có nested structure
          if (following?.id && !seenIds.has(following.id)) {
            allFriends.push({
              id: following.id,
              username: following.username || 'Unknown',
              profilePic: following.profilePic || "https://i.pinimg.com/474x/0b/38/83/0b3883c43e5b003eb00fe0f20b41b08b.jpg"
            });
            seenIds.add(following.id);
          }
        });
      }

      // Sort theo alphabet
      allFriends.sort((a, b) => a.username.localeCompare(b.username));
      setFriends(allFriends);

    } catch (error: any) {
      setFriendsError(error.message || 'Không thể tải danh sách bạn bè');
    } finally {
      setFriendsLoading(false);
    }
  };

  // ✅ Socket connection status check (không cần duplicate listeners)
  useEffect(() => {
    const checkConnection = () => {
      setSocketConnected(socketService.isConnected());
    };

    checkConnection();

    // Check connection status every few seconds
    const interval = setInterval(checkConnection, 3000);

    return () => clearInterval(interval);
  }, []);

  // Update current time every minute for real-time "time ago" updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Convert conversations to chat items (remove sorting here)
  const chatData: ChatItemType[] = React.useMemo(() => {
    if (!conversations || conversations.length === 0) {
      return [];
    }

    // Use profile id if available, otherwise use fallback for development
    const currentUserId = profile?.id || 'fallback-user-id';

    // Conversations are already sorted in Redux, just convert them
    return conversations.map(conversation =>
      convertConversationToChat(conversation, currentUserId)
    );
  }, [conversations, profile?.id, currentTime]);

  const handleClearSearch = () => {
    setSearchText("");
  };

  const handleBackPress = () => {
    navigation.goBack()
  }

  const handlePressOutside = () => {
    Keyboard.dismiss()
  }

  // Debug function để test WebSocket
  const testWebSocket = () => {
    // Test emit một event
    if (socketService.isConnected()) {
      socketService.emit('test_event', {
        message: 'Test from ChatPage',
        userId: profile?.id,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Test function để simulate tin nhắn mới
  const simulateNewMessage = () => {
    if (conversations.length > 0) {
      const testConversation = conversations[0];
      const testMessage = {
        id: Date.now().toString(),
        conversationId: testConversation.id,
        senderId: 'test-sender-id',
        content: `Test message at ${new Date().toLocaleTimeString()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedForAll: false,
        seenBy: [],
        mediaUrls: [],
        mediaType: null,
        pinned: false,
        sender: {
          id: 'test-sender-id',
          username: 'Test User',
          profilePic: ''
        }
      };

      dispatch(handleSocketNewMessage({
        conversationId: testConversation.id,
        message: testMessage
      }));
    }
  }

  // Function để handle bắt đầu chat với friend
  const handleStartChat = async (friend: FriendItem) => {
    try {
      // Kiểm tra xem đã có conversation với friend này chưa
      const existingConversation = conversations.find(conv => {
        // Kiểm tra conversation 1-on-1 (không phải group)
        if (conv.isGroup) return false;

        // Kiểm tra xem có participant nào là friend này không
        return conv.participants.some(participant => participant.userId === friend.id);
      });

      if (existingConversation) {
        // Navigate đến ChatDetailPage với conversation đã có
        navigation.navigate('ChatDetailPage', {
          chatId: existingConversation.id,
          name: friend.username,
          avatar: friend.profilePic
        });
        return;
      }

      // Gọi API tạo conversation mới
      const result = await dispatch(createConversation({
        userIds: [friend.id]
      })).unwrap();

      // Navigate đến ChatDetailPage với conversation mới
      navigation.navigate('ChatDetailPage', {
        chatId: result.id,
        name: friend.username,
        avatar: friend.profilePic
      });

    } catch (error: any) {
      // Có thể show alert hoặc toast thông báo lỗi
    }
  };

  return (


    <SafeAreaView style={styles.container} edges={[]}>
      <TouchableWithoutFeedback onPress={handlePressOutside}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="chevron-back" size={24} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.userContainer}>
            <Text style={styles.username}>{profile?.username}</Text>
            <Ionicons name="chevron-down" size={18} />
            {/* Socket connection indicator */}
            <View style={[styles.connectionDot, { backgroundColor: socketConnected ? '#34C759' : '#FF3B30' }]} />
          </TouchableOpacity>

          <TouchableOpacity onPress={simulateNewMessage}>
            <Feather name="plus" size={24} />
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>


      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="gray" />
          <TextInput placeholder="Tìm kiếm cuộc trò chuyện và bạn bè"
            placeholderTextColor="gray"
            style={styles.searchInput}
            value={searchText} onChangeText={setSearchText} />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Ionicons name="close-circle" size={20} color="#888" style={styles.clearIcon} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.chatList}>
        <ConversationsSection
          conversations={chatData}
          loading={loading}
          error={error}
          searchText={searchText}
        />

        <FriendsSection
          friends={friends}
          loading={friendsLoading}
          error={friendsError}
          searchText={searchText}
          onRetry={loadFriends}
          onStartChat={handleStartChat}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingTop: 16,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontWeight: "600",
    fontSize: 18,
    marginRight: 4,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
    color: "#000",
  },
  chatList: {
    flex: 1,
  },
  clearIcon: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  // Section styles
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionCount: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  sectionContent: {
    backgroundColor: 'white',
  },
  // Friend item styles
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  friendStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
})

export default ChatPage
