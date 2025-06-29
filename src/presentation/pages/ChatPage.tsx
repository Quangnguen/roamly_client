import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, Feather } from "@expo/vector-icons"
import ChatItem from "../components/chatItem"
import type { ChatItemType } from "../../types/chatItem"
import { useNavigation } from "@react-navigation/native"
import { NavigationProp } from "@/src/utils/PropsNavigate"
import { BACKGROUND } from "@/src/const/constants"
import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../redux/hook"
import { getConversations } from "../redux/slices/chatSlice"
import { ConversationResponseInterface } from "@/src/types/ConversationResponseInterface"

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

  // Calculate time ago from updatedAt
  const timeAgo = calculateTimeAgo(conversation.updatedAt);

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

const ChatPage: React.FC = () => {
  const navigation: NavigationProp<'Home'> = useNavigation()
  const dispatch = useAppDispatch()

  // Redux state
  const { conversations, loading, error } = useAppSelector(state => state.chat)
  const profile = useAppSelector(state => state.auth.profile)

  const [searchText, setSearchText] = React.useState("");

  // Load conversations on component mount
  useEffect(() => {
    dispatch(getConversations());
  }, [dispatch]);

  // Convert conversations to chat items
  const chatData: ChatItemType[] = React.useMemo(() => {
    if (!conversations || conversations.length === 0) {
      return [];
    }

    // Use profile id if available, otherwise use fallback for development
    const currentUserId = profile?.id || 'fallback-user-id';

    return conversations.map(conversation =>
      convertConversationToChat(conversation, currentUserId)
    );
  }, [conversations, profile?.id]);

  // Filter chat data based on search
  const filteredChatData = React.useMemo(() => {
    if (!searchText.trim()) {
      return chatData;
    }

    return chatData.filter(chat =>
      chat.name.toLowerCase().includes(searchText.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [chatData, searchText]);

  const handleClearSearch = () => {
    setSearchText("");
  };

  const handleBackPress = () => {
    navigation.goBack()
  }

  const handlePressOutside = () => {
    Keyboard.dismiss()
  }
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
          </TouchableOpacity>

          <TouchableOpacity>
            <Feather name="plus" size={24} />
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>


      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="gray" />
          <TextInput placeholder="Search"
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
        ) : filteredChatData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchText ? "Không tìm thấy cuộc trò chuyện" : "Chưa có cuộc trò chuyện nào"}
            </Text>
          </View>
        ) : (
          filteredChatData.map((chat) => (
            <ChatItem key={chat.id} chat={chat} />
          ))
        )}
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
})

export default ChatPage
