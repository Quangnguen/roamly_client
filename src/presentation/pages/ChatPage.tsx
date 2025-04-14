import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, Feather } from "@expo/vector-icons"
import ChatItem from "../components/chatItem"
import type { ChatItemType } from "../../types/chatItem"
import { useNavigation } from "@react-navigation/native"
import { NavigationProp } from "@/src/utils/PropsNavigate"

const chatData: ChatItemType[] = [
    {
      id: "1",
      name: "joshua_j",
      avatar: "https://i.pinimg.com/474x/0b/38/83/0b3883c43e5b003eb00fe0f20b41b08b.jpg",
      lastMessage: "Have a nice day, bro!",
      time: "now",
    },
    {
      id: "2",
      name: "karennnne",
      avatar: "https://i.pinimg.com/474x/0b/38/83/0b3883c43e5b003eb00fe0f20b41b08b.jpg",
      lastMessage: "I heard this is a good movie, s...",
      time: "now",
    },
    {
      id: "3",
      name: "martini_rond",
      avatar: "https://i.pinimg.com/474x/0b/38/83/0b3883c43e5b003eb00fe0f20b41b08b.jpg",
      lastMessage: "See you on the next meeting!",
      time: "15m",
    },
    {
      id: "4",
      name: "andrewwwc",
      avatar: "https://i.pinimg.com/474x/0b/38/83/0b3883c43e5b003eb00fe0f20b41b08b.jpg",
      lastMessage: "Sounds good! 😂😂😂",
      time: "20m",
    },
    {
      id: "5",
      name: "kiera_d",
      avatar: "https://i.pinimg.com/474x/0b/38/83/0b3883c43e5b003eb00fe0f20b41b08b.jpg",
      lastMessage: "The new design looks cool, b...",
      time: "1m",
    },
    {
      id: "6",
      name: "maxjacobson",
      avatar: "https://i.pinimg.com/474x/0b/38/83/0b3883c43e5b003eb00fe0f20b41b08b.jpg",
      lastMessage: "Thank you, bro!",
      time: "2h",
    },
    {
      id: "7",
      name: "jamie.franco",
      avatar: "https://i.pinimg.com/474x/0b/38/83/0b3883c43e5b003eb00fe0f20b41b08b.jpg",
      lastMessage: "Yeap, I'm going to travel in To...",
      time: "4h",
    },
    {
      id: "8",
      name: "m_humphrey",
      avatar: "https://i.pinimg.com/474x/0b/38/83/0b3883c43e5b003eb00fe0f20b41b08b.jpg",
      lastMessage: "Instagram UI is pretty good",
      time: "5h",
    },
    {
        id: "9",
        name: "m_humphrey",
        avatar: "https://i.pinimg.com/474x/0b/38/83/0b3883c43e5b003eb00fe0f20b41b08b.jpg",
        lastMessage: "Instagram UI is pretty good",
        time: "5h",
      },
      {
        id: "10",
        name: "m_humphrey",
        avatar: "https://i.pinimg.com/474x/0b/38/83/0b3883c43e5b003eb00fe0f20b41b08b.jpg",
        lastMessage: "Instagram UI is pretty good",
        time: "5h",
      },
      {
        id: "11",
        name: "m_humphrey",
        avatar: "https://i.pinimg.com/474x/0b/38/83/0b3883c43e5b003eb00fe0f20b41b08b.jpg",
        lastMessage: "Instagram UI is pretty good",
        time: "5h",
      },
      {
        id: "12",
        name: "m_humphrey",
        avatar: "https://i.pinimg.com/474x/0b/38/83/0b3883c43e5b003eb00fe0f20b41b08b.jpg",
        lastMessage: "Instagram UI is pretty good",
        time: "5h",
      },
      {
        id: "13",
        name: "m_humphrey",
        avatar: "https://i.pinimg.com/474x/0b/38/83/0b3883c43e5b003eb00fe0f20b41b08b.jpg",
        lastMessage: "Instagram UI is pretty good",
        time: "5h",
      },
      {
        id: "14",
        name: "m_humphrey",
        avatar: "https://i.pinimg.com/474x/0b/38/83/0b3883c43e5b003eb00fe0f20b41b08b.jpg",
        lastMessage: "Instagram UI is pretty good",
        time: "5h",
      },
  ]
  
const ChatPage: React.FC = () => {

  const navigation: NavigationProp<'Home'> = useNavigation()

    const handleBackPress = () => {
      navigation.goBack()
    }

  return (


    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.userContainer}>
          <Text style={styles.username}>jacob_w</Text>
          <Ionicons name="chevron-down" size={18} color="white" />
        </TouchableOpacity>

        <TouchableOpacity>
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="gray" />
          <TextInput placeholder="Search" placeholderTextColor="gray" style={styles.searchInput} />
        </View>
      </View>

      <ScrollView style={styles.chatList}>
        {chatData.map((chat) => (
          <ChatItem key={chat.id} chat={chat} />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#000",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    userContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    username: {
      color: "white",
      fontWeight: "600",
      fontSize: 18,
      marginRight: 4,
    },
    searchContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    searchBar: {
      backgroundColor: "#333",
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    searchInput: {
      marginLeft: 8,
      color: "white",
      flex: 1,
    },
    chatList: {
      flex: 1,
    },
  })

export default ChatPage
