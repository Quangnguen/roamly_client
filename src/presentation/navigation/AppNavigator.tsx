import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { resetUnreadNotifications } from '../redux/slices/authSlice';
import { BACKGROUND } from '../../const/constants';

// Import pages
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
import { Destination } from '../../types/DestinationInterface';

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
    senderId?: string;
    messageId?: string;
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
    destinationData?: Destination; // Optional pre-loaded destination data
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

// Component để hiển thị icon notification với badge
const NotificationTabIcon = ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
  const unreadCount = useSelector((state: RootState) => state.auth.profile?.unreadNotifications) || 0;

  return (
    <View style={styles.notificationIconContainer}>
      <FontAwesome name="bell" size={size} color={color} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount.toString()}
          </Text>
        </View>
      )}
    </View>
  );
};

// Auth Navigator Component
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={LoginPage} />
      <Stack.Screen name="Register" component={RegisterPage} />
    </Stack.Navigator>
  );
};

// Tab Navigator Component
const TabNavigator = () => {
  const dispatch = useDispatch<AppDispatch>();
  const unreadCount = useSelector((state: RootState) => state.auth.profile?.unreadNotifications) || 0;

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
            return <NotificationTabIcon focused={focused} color={color} size={size} />;
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
      screenListeners={{
        tabPress: (e) => {
          if (e.target?.includes('Notify') && unreadCount > 0) {
            dispatch(resetUnreadNotifications());
          }
        },
      }}
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

// In-App Navigator Component
const InAppNavigator = () => {
  return (
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
  );
};

// Main App Navigator Component
const AppNavigator: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <View style={styles.container}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="InApp" component={InAppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  notificationIconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AppNavigator;