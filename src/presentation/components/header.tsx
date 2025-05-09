import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Camera, MessageCircle, Send, Cloud } from "lucide-react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../navigation/AppNavigator"
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

interface headerProps {
  unreadMessages?: number
  onCameraPress?: () => void
  onMessagesPress?: () => void
  onDirectPress?: () => void
  onWeatherPress?: () => void
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const Header: React.FC<headerProps> = ({
  unreadMessages = 1,
  onCameraPress,
  onMessagesPress,
  onDirectPress,
  onWeatherPress,
}) => {

  const navigation = useNavigation<NavigationProp>()

  // const handleCameraPress = () => {
  //   if (onCameraPress) {
  //     onCameraPress()
  //   }
  // }

  const handleMessagesPress = () => {
    navigation.navigate("ChatPage")
  }

  const handleCameraPress = async () => {
    // Yêu cầu quyền
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
  
    if (permissionResult.status !== 'granted') {
      Alert.alert("Quyền bị từ chối", "Ứng dụng cần quyền truy cập camera để tiếp tục.");
      return;
    }
  
    // Mở camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
  
    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      console.log("Ảnh đã chụp:", imageUri);
      // Bạn có thể lưu imageUri vào state hoặc xử lý tiếp
    }
  };


  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleCameraPress} style={styles.iconContainer}>
        <Camera size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.logoText}>Roamly</Text>

      <View style={styles.rightIcons}>
        <TouchableOpacity onPress={onWeatherPress} style={styles.iconContainer}>
          <Cloud size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMessagesPress} style={styles.iconContainer}>
          <MessageCircle size={24} color="#000" />
          {unreadMessages > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadMessages}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={onDirectPress} style={styles.iconContainer}>
          <Send size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#DBDBDB",
    // backgroundColor: "red",
  },
  logoText: {
    fontFamily: "cursive",
    fontSize: 28,
    fontWeight: "500",
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginHorizontal: 8,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FE3650",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
})
