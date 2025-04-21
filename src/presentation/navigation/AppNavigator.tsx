import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { CardStyleInterpolators } from '@react-navigation/stack';
import LoginPage from '../pages/LoginPage'
import HomePage from '../pages/HomePage'
import { SafeAreaView } from 'react-native'
import RegisterPage from '../pages/RegisterPage'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { FontAwesome } from '@expo/vector-icons'
import SearchPage from '../pages/SearchPage'
import CreatePostPage from '../pages/CreatePostPage'
import NotifyPage from '../pages/NotifyPage'
import AccountPage from '../pages/AccountPage'
import EditProfilePage from '../pages/EditProfilePage'
import ChatPage from '../pages/ChatPage'
import WeatherPage from '../pages/WeatherPage'


export type RootStackParamList = {
  Login: undefined
  Home: undefined
  Register: undefined
  Auth: undefined
  InApp: undefined
  EditProfilePage: undefined
  CreatePostPage: undefined
  SearchPage: undefined
  NotifyPage: undefined
  AccountPage: undefined
  ChatPage: undefined
  WeatherPage: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator()

export default function AppNavigator() {
  return (
    <SafeAreaView style={{ flex: 1 }}>

      <Stack.Navigator screenOptions={{ headerShown: false,  gestureEnabled: true, // Cho phép vuốt quay lại
        gestureDirection: 'horizontal', // Vuốt theo chiều ngang 
        }}>
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="InApp" component={InAppNavigator} />
        <Stack.Screen name="EditProfilePage" component={EditProfilePage} />
        <Stack.Screen name="ChatPage" component={ChatPage} />
        <Stack.Screen name="WeatherPage" component={WeatherPage} />
      </Stack.Navigator>
    </SafeAreaView>
  )
}

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false,
     
     }}>
      <Stack.Screen name="Login" component={LoginPage} />
      <Stack.Screen name="Register" component={RegisterPage} />
    </Stack.Navigator>
  )
}

const InAppNavigator = () => {
  return (
    <Tab.Navigator initialRouteName="Home"
        screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                if (route.name === 'Home') {
                    iconName = 'home';
                } else if (route.name === 'Search') {
                    iconName = 'search';
                }
                else if (route.name === 'Post') {

                    iconName = 'plus-square';
                }
                else if (route.name === 'Notify') {
                  iconName = 'heart';
                } else {
                  iconName = 'user'
                }
                return <FontAwesome name={iconName as any} size={size} color={color} />
            },
            tabBarActiveTintColor: 'tomato',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,
            tabBarStyle: {
              borderTopColor: 'black',   // ✅ viền trên màu xanh lá
              borderTopWidth: 1,         // ✅ độ dày viền
              elevation: 5,              // (Android) thêm bóng đổ nếu muốn
            },
        })}

    >

      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Search" component={SearchPage} />
      <Tab.Screen name="Post" component={CreatePostPage} />
      <Tab.Screen name="Notify" component={NotifyPage} />
      <Tab.Screen name="Account" component={AccountPage} />
    </Tab.Navigator>
  )
}
