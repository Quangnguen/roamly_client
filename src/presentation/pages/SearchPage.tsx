import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Platform,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BACKGROUND } from '@/src/const/constants';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { getUsers } from '../redux/slices/userSlice';
import { getFollowing } from '../redux/slices/followSlice';
import { getPosts } from '../redux/slices/postSlice';
import PostTab from '../components/search/PostTab';
import AddressTab from '../components/search/AddressTab';
import HomeStayTab from '../components/search/HomeStayTab';
import UserTab from '../components/search/UserTab';

type Tab = {
  name: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

const tabs: Tab[] = [
  { name: 'Bài viết', icon: 'image-outline' },
  { name: 'Địa điểm', icon: 'location-outline' },
  { name: 'Nhà nghỉ', icon: 'home-outline' },
  { name: 'Người dùng', icon: 'person-outline' },
];

const SearchPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('Bài viết');
  const [searchText, setSearchText] = useState<string>('');
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (activeTab === 'Người dùng') {
      dispatch(getUsers({ page: 1, limit: 5 }));
      dispatch(getFollowing());
    }
    if (activeTab === 'Bài viết') {
      dispatch(getPosts());
    }
  }, [dispatch, activeTab]);

  const handleClearSearch = () => {
    setSearchText('');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Bài viết':
        return <PostTab />;
      case 'Địa điểm':
        return <AddressTab />;
      case 'Nhà nghỉ':
        return <HomeStayTab />;
      case 'Người dùng':
        return <UserTab />;
      default:
        return null;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          {/* Thanh tìm kiếm */}
          <View style={styles.header}>
            <View style={styles.searchBarContainer}>
              <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
              <TextInput
                style={styles.searchBar}
                placeholder="Tìm kiếm"
                placeholderTextColor="#888"
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={handleClearSearch}>
                  <Ionicons name="close-circle" size={20} color="#888" style={styles.clearIcon} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.name}
                onPress={() => setActiveTab(tab.name)}
                style={[styles.tab, activeTab === tab.name ? { backgroundColor: 'rgba(192, 192, 192, 0.64)' } : { backgroundColor: '#fff' }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons
                    name={tab.icon}
                    size={20}
                    color={activeTab === tab.name ? '#262626' : '#888'}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab.name && styles.activeTabText,
                    ]}
                  >
                    {tab.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          {renderTabContent()}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  header: {
    paddingTop: 10,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 10 : 0,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    textAlign: 'left',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 5,
  },
  tab: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    borderColor: '#ccc',
  },
  tabText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#262626',
  },
  activeTabText: {
    color: '#262626',
  },
  clearIcon: {
    marginLeft: 8,
  },
});

export default SearchPage;