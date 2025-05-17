import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { ChatItemType } from "../../types/chatItem"
import { useNavigation } from "@react-navigation/native"
import { NavigationProp } from "@/src/utils/PropsNavigate"

interface ChatItemProps {
  chat: ChatItemType
}

const ChatItem = ({ chat }: ChatItemProps) => {
  const navigation: NavigationProp<'ChatDetailPage'> = useNavigation();

  const handlePress = () => {
    navigation.navigate('ChatDetailPage', {
      chatId: chat.id,
      name: chat.name,
      avatar: chat.avatar
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image source={{ uri: chat.avatar }} style={styles.avatar} />

      <View style={styles.contentContainer}>
        <Text style={styles.name}>{chat.name}</Text>
        <Text style={styles.message}>{chat.lastMessage}</Text>
      </View>

      <View style={styles.rightContainer}>
        <Text style={styles.time}>{chat.time}</Text>
        <Ionicons name="camera-outline" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  name: {
    fontWeight: "500",
  },
  message: {
    color: "#666",
    fontSize: 14,
  },
  rightContainer: {
    alignItems: "flex-end",
  },
  time: {
    color: "#666",
    fontSize: 12,
    marginBottom: 4,
  },
})

export default ChatItem
