// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { RouteProp } from '@react-navigation/native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { FontAwesome } from '@expo/vector-icons';
// import LoginPage from '../pages/LoginPage';
// import HomePage from '../pages/HomePage';
// import RegisterPage from '../pages/RegisterPage';
// import SearchPage from '../pages/SearchPage';
// import CreatePostPage from '../pages/CreatePostPage';
// import NotifyPage from '../pages/NotifyPage';
// import AccountPage from '../pages/AccountPage';
// import EditProfilePage from '../pages/EditProfilePage';
// import ChatPage from '../pages/ChatPage';
// import ChatDetailPage from '../pages/ChatDetailPage';
// import WeatherPage from '../pages/WeatherPage';
// import HomeStayDetailPage from '../pages/HomeStayDetailPage';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { BACKGROUND } from '@/src/const/constants';
// import InfoAccPage from '../pages/InfoAccPage';
// import AddressDetailPage from '../pages/AddressDetailPage';
// import TravelPlaceDetailPage from '../pages/TravelPlaceDetailPage';

// export type RootStackParamList = {
//   Login: undefined;
//   Home: undefined;
//   Register: undefined;
//   Auth: undefined;
//   InApp: { screen?: keyof TabParamList } | undefined;
//   EditProfilePage: undefined;
//   CreatePostPage: undefined;
//   SearchPage: undefined;
//   NotifyPage: undefined;
//   AccountPage: undefined;
//   ChatPage: undefined;
//   ChatDetailPage: {
//     chatId: string;
//     name: string;
//     avatar: string;
//   };
//   WeatherPage: undefined;
//   InfoAccPage: {
//     id: string;
//   };
//   HomeStayDetailPage: {
//     id: string;
//   };
//   AddressDetailPage: {
//     id: string;
//   };
//   TravelPlaceDetailPage: {
//     id: string;
//   };
// };

// type TabParamList = {
//   Home: undefined;
//   Search: undefined;
//   Post: undefined;
//   Notify: undefined;
//   Account: undefined;
// };

// const Stack = createNativeStackNavigator<RootStackParamList>();
// const Tab = createBottomTabNavigator<TabParamList>();

// export default function AppNavigator() {
//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <Stack.Navigator
//         screenOptions={{
//           headerShown: false,
//           gestureEnabled: true,
//           gestureDirection: 'horizontal',
//         }}
//       >
//         <Stack.Screen name="Auth" component={AuthNavigator} />
//         <Stack.Screen name="InApp" component={InAppNavigator} />
//         <Stack.Screen name="EditProfilePage" component={EditProfilePage} />
//         <Stack.Screen name="ChatPage" component={ChatPage} />
//         <Stack.Screen name="ChatDetailPage" component={ChatDetailPage} />
//         <Stack.Screen name="WeatherPage" component={WeatherPage} />
//         <Stack.Screen name="HomeStayDetailPage" component={HomeStayDetailPage} />
//         <Stack.Screen name="InfoAccPage" component={InfoAccPage} />
//         <Stack.Screen name="AddressDetailPage" component={AddressDetailPage} />
//         <Stack.Screen name="TravelPlaceDetailPage" component={TravelPlaceDetailPage} />
//       </Stack.Navigator>
//     </SafeAreaView>
//   );
// }

// const AuthNavigator = () => {
//   return (
//     <Stack.Navigator
//       screenOptions={{
//         headerShown: false,
//       }}
//     >
//       <Stack.Screen name="Login" component={LoginPage} />
//       <Stack.Screen name="Register" component={RegisterPage} />
//     </Stack.Navigator>
//   );
// };

// const InAppNavigator = () => {
//   return (
//     <Tab.Navigator
//       initialRouteName="Home"
//       screenOptions={({ route }: { route: RouteProp<TabParamList, keyof TabParamList> }) => ({
//         tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
//           let iconName: keyof typeof FontAwesome.glyphMap;
//           if (route.name === 'Home') {
//             iconName = 'home';
//           } else if (route.name === 'Search') {
//             iconName = 'search';
//           } else if (route.name === 'Post') {
//             iconName = 'plus-square';
//           } else if (route.name === 'Notify') {
//             iconName = 'heart';
//           } else {
//             iconName = 'user';
//           }
//           return <FontAwesome name={iconName} size={size} color={color} />;
//         },
//         tabBarActiveTintColor: 'tomato',
//         tabBarInactiveTintColor: 'gray',
//         headerShown: false,
//         tabBarHideOnKeyboard: true,
//         tabBarStyle: {
//           borderTopColor: "#000",
//           borderTopWidth: 1,
//           elevation: 0,
//           backgroundColor: BACKGROUND,
//           height: 60,
//           paddingBottom: 5,
//           paddingTop: 5,
//         },
//       })}
//     >
//       <Tab.Screen
//         name="Home"
//         component={HomePage}
//         options={{ title: 'Trang chủ' }}
//       />
//       <Tab.Screen
//         name="Search"
//         component={SearchPage}
//         options={{ title: 'Tìm kiếm' }}
//       />
//       <Tab.Screen
//         name="Post"
//         component={CreatePostPage}
//         options={{
//           tabBarStyle: { display: 'none' },
//           headerShown: false,
//           title: 'Đăng bài'
//         }}
//       />
//       <Tab.Screen
//         name="Notify"
//         component={NotifyPage}
//         options={{ title: 'Thông báo' }}
//       />
//       <Tab.Screen
//         name="Account"
//         component={AccountPage}
//         options={{ title: 'Tài khoản' }}
//       />
//     </Tab.Navigator>
//   );
// };

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native'; // ✅ Bỏ NavigationContainer import
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
// ✅ Bỏ navigationRef import vì không cần ở đây nữa
import { SafeAreaView } from 'react-native-safe-area-context';
import { BACKGROUND } from '../../const/constants';

// ✅ Import your pages
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import RegisterPage from '../pages/RegisterPage';
import SearchPage from '../pages/SearchPage';
import CreatePostPage from '../pages/CreatePostPage';
import NotifyPage from '../pages/NotifyPage';
import AccountPage from '../pages/AccountPage';
import EditProfilePage from '../pages/EditProfilePage';
import ChatPage from '../pages/ChatPage';
import ChatDetailPage from '../pages/ChatDetailPage';
import WeatherPage from '../pages/WeatherPage';
import HomeStayDetailPage from '../pages/HomeStayDetailPage';
import InfoAccPage from '../pages/InfoAccPage';
import AddressDetailPage from '../pages/AddressDetailPage';
import TravelPlaceDetailPage from '../pages/TravelPlaceDetailPage';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Register: undefined;
  Auth: undefined;
  InApp: { screen?: keyof TabParamList } | undefined;
  EditProfilePage: undefined;
  CreatePostPage: undefined;
  SearchPage: undefined;
  NotifyPage: undefined;
  AccountPage: undefined;
  ChatPage: undefined;
  ChatDetailPage: {
    chatId: string;
    name: string;
    avatar: string;
  };
  WeatherPage: undefined;
  InfoAccPage: {
    id: string;
  };
  HomeStayDetailPage: {
    id: string;
  };
  AddressDetailPage: {
    id: string;
  };
  TravelPlaceDetailPage: {
    id: string;
  };
};

type TabParamList = {
  Home: undefined;
  Search: undefined;
  Post: undefined;
  Notify: undefined;
  Account: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// ✅ Auth Navigator Component
const AuthNavigator = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BACKGROUND }}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="Login"
      >
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Register" component={RegisterPage} />
      </Stack.Navigator>
    </SafeAreaView>
  );
};

// ✅ In-App Navigator Component
const InAppNavigator = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BACKGROUND }}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        <Stack.Screen name="InApp" component={TabNavigator} />
        <Stack.Screen name="EditProfilePage" component={EditProfilePage} />
        <Stack.Screen name="ChatPage" component={ChatPage} />
        <Stack.Screen name="ChatDetailPage" component={ChatDetailPage} />
        <Stack.Screen name="WeatherPage" component={WeatherPage} />
        <Stack.Screen name="HomeStayDetailPage" component={HomeStayDetailPage} />
        <Stack.Screen name="InfoAccPage" component={InfoAccPage} />
        <Stack.Screen name="AddressDetailPage" component={AddressDetailPage} />
        <Stack.Screen name="TravelPlaceDetailPage" component={TravelPlaceDetailPage} />
      </Stack.Navigator>
    </SafeAreaView>
  );
};

// ✅ Tab Navigator Component
const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }: { route: RouteProp<TabParamList, keyof TabParamList> }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: keyof typeof FontAwesome.glyphMap;
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Search') {
            iconName = 'search';
          } else if (route.name === 'Post') {
            iconName = 'plus-square';
          } else if (route.name === 'Notify') {
            iconName = 'heart';
          } else {
            iconName = 'user';
          }
          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          borderTopColor: "#000",
          borderTopWidth: 1,
          elevation: 0,
          backgroundColor: BACKGROUND,
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{ title: 'Trang chủ' }}
      />
      <Tab.Screen
        name="Search"
        component={SearchPage}
        options={{ title: 'Tìm kiếm' }}
      />
      <Tab.Screen
        name="Post"
        component={CreatePostPage}
        options={{
          tabBarStyle: { display: 'none' },
          headerShown: false,
          title: 'Đăng bài'
        }}
      />
      <Tab.Screen
        name="Notify"
        component={NotifyPage}
        options={{ title: 'Thông báo' }}
      />
      <Tab.Screen
        name="Account"
        component={AccountPage}
        options={{ title: 'Tài khoản' }}
      />
    </Tab.Navigator>
  );
};

// ✅ Main App Navigator Component - Bỏ NavigationContainer
const AppNavigator: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  console.log('🔐 Navigation - Is authenticated:', isAuthenticated);

  // ✅ Chỉ return navigator, không có NavigationContainer
  return isAuthenticated ? (
    <InAppNavigator />
  ) : (
    <AuthNavigator />
  );
};

// ✅ Export default
export default AppNavigator;