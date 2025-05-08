import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, GestureHandlerRootView } from 'react-native-gesture-handler';
import Post from '../components/post';
import { BACKGROUND } from '@/src/const/constants';
import Card from '../components/card';

type Tab = {
  name: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

const { width } = Dimensions.get('window');
const imageSize: number = width / 3 - 2;

interface Post {
  id: string;
  image: ImageSourcePropType;
}

const tabs: Tab[] = [
  { name: 'Post', icon: 'image-outline' },
  { name: 'Address', icon: 'location-outline' },
  { name: 'Home Stay', icon: 'home-outline' },
  { name: 'User', icon: 'person-outline' },
];

const posts = [
  {
    id: '1',
    username: 'joshua_J',
    isVerified: true,
    location: 'Tokyo, Japan',
    imageUrl: 'https://vietluxtour.com/Upload/images/2023/KhamPhaNuocNgoai/%C4%90%E1%BB%8Ba%20%C4%90i%E1%BB%83m%20Du%20L%E1%BB%8Bch%20H%C3%A0n%20Qu%E1%BB%91c/dia-diem-du-lich-han-quoc-main-min.jpg',
    likedBy: 'craig_love',
    likesCount: 44686,
    caption: 'The game in Japan was amazing and I want to share some photos',
    currentImageIndex: 1,
    totalImages: 3,
  },
  {
    id: '2',
    username: 'joshua_J',
    isVerified: true,
    location: 'Tokyo, Japan',
    imageUrl: 'https://images.vietnamtourism.gov.vn/vn/images/2020/Thang_9/_DSC3768.JPG',
    likedBy: 'craig_love',
    likesCount: 44686,
    caption: 'The game in Japan was amazing and I want to share some photos',
    currentImageIndex: 1,
    totalImages: 3,
  },
];

const addressCards = [
  {
    image: { uri: 'https://cafebiz.cafebizcdn.vn/2018/12/22/photo-2-15454504530612141260827.jpg' },
    title: 'Beautiful Location',
    description: 'This is a beautiful location in Tokyo, Japan. Perfect for sightseeing and capturing stunning photos.',
  },
  {
    image: { uri: 'https://ik.imagekit.io/tvlk/blog/2024/07/canh-dep-viet-nam-6.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2' },
    title: 'Amazing View',
    description: 'Experience the breathtaking views of Vietnam\'s natural beauty.',
  },
  {
    image: require('../../../assets/images/natural2.jpg'),
    title: 'Beautiful Location',
    description: 'This is a beautiful location in Tokyo, Japan. Perfect for sightseeing and capturing stunning photos.',
  },
  {
    image: { uri: 'https://ik.imagekit.io/tvlk/blog/2024/07/canh-dep-viet-nam-6.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2' },
    title: 'Amazing View',
    description: 'Experience the breathtaking views of Vietnam\'s natural beauty.',
  },
];

const homeStays = [
  {
    image: { uri: 'https://static.vinwonders.com/production/homestay-la-gi-thumb.jpg' },
    title: 'Cozy Home in Tokyo',
    rating: 4,
    description: 'A cozy and comfortable home located in the heart of Tokyo.',
  },
  {
    image: { uri: 'https://vatlieuhousing.com/wp-content/uploads/2024/03/homestay-chuong-my.jpg' },
    title: 'Luxury Villa in Vietnam',
    rating: 5,
    description: 'Experience the luxury of a private villa with breathtaking views.',
  },
  {
    image: { uri: 'https://tourdulichmangden.vn/upload/news/homestay-mang-den-0-8434.jpg' },
    title: 'Cozy Home in Tokyo',
    rating: 4,
    description: 'A cozy and comfortable home located in the heart of Tokyo.',
  },
  {
    image: { uri: 'https://khachsandep.vn/storage/files/Homestay/thiet-ke-homestay.jpeg' },
    title: 'Luxury Villa in Vietnam',
    rating: 5,
    description: 'Experience the luxury of a private villa with breathtaking views.',
  },
];

const users = [
  {
    avatar: 'https://ih1.redbubble.net/image.976620401.4882/flat,750x,075,f-pad,750x1000,f8f8f8.jpg',
    name: 'Joshua J.',
    achievements: '3 địa danh',
    description: 'A travel enthusiast who loves exploring new places.',
  },
  {
    avatar: 'https://static.wikia.nocookie.net/attack-on-titan/images/9/98/Mikasa_Ackermann_%28Anime%29_%28845%29.webp/revision/latest/scale-to-width/360?cb=20220410210635&path-prefix=vi',
    name: 'Karen Nine',
    achievements: '5 địa danh',
    description: 'Photographer and adventurer.',
  },
  {
    avatar: 'https://files.idyllic.app/files/static/2911074',
    name: 'Zack John',
    achievements: '10 địa danh',
    description: 'Loves hiking and nature photography.',
  },
  {
    avatar: 'https://ih1.redbubble.net/image.976620401.4882/flat,750x,075,f-pad,750x1000,f8f8f8.jpg',
    name: 'Joshua J.',
    achievements: '3 địa danh',
    description: 'A travel enthusiast who loves exploring new places.',
  },
  {
    avatar: 'https://static.wikia.nocookie.net/attack-on-titan/images/9/98/Mikasa_Ackermann_%28Anime%29_%28845%29.webp/revision/latest/scale-to-width/360?cb=20220410210635&path-prefix=vi',
    name: 'Karen Nine',
    achievements: '5 địa danh',
    description: 'Photographer and adventurer.',
  },
  {
    avatar: 'https://files.idyllic.app/files/static/2911074',
    name: 'Zack John',
    achievements: '10 địa danh',
    description: 'Loves hiking and nature photography.',
  },
  {
    avatar: 'https://ih1.redbubble.net/image.976620401.4882/flat,750x,075,f-pad,750x1000,f8f8f8.jpg',
    name: 'Joshua J.',
    achievements: '3 địa danh',
    description: 'A travel enthusiast who loves exploring new places.',
  },
  {
    avatar: 'https://static.wikia.nocookie.net/attack-on-titan/images/9/98/Mikasa_Ackermann_%28Anime%29_%28845%29.webp/revision/latest/scale-to-width/360?cb=20220410210635&path-prefix=vi',
    name: 'Karen Nine',
    achievements: '5 địa danh',
    description: 'Photographer and adventurer.',
  },
  {
    avatar: 'https://files.idyllic.app/files/static/2911074',
    name: 'Zack John',
    achievements: '10 địa danh',
    description: 'Loves hiking and nature photography.',
  },
];

const SearchPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('Post');
  const [searchText, setSearchText] = useState<string>('');

  const handleClearSearch = () => {
    setSearchText('');
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
                placeholder="Search"
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

          {/* Nội dung theo tab */}
          {activeTab === 'Post' && (
            <ScrollView>
              {posts.map((post) => (
                <Post
                  key={post.id}
                  username={post.username}
                  isVerified={post.isVerified}
                  location={post.location}
                  imageUrl={post.imageUrl}
                  likedBy={post.likedBy}
                  likesCount={post.likesCount}
                  caption={post.caption}
                  currentImageIndex={post.currentImageIndex}
                  totalImages={post.totalImages}
                />
              ))}
            </ScrollView>
          )}

          {activeTab === 'Address' && (
            <ScrollView contentContainerStyle={styles.addressContainer}>
              {addressCards.map((card, index) => (
                <Card
                  key={index}
                  type="address"
                  image={card.image}
                  title={card.title}
                  description={card.description}
                />
              ))}
            </ScrollView>
          )}

          {activeTab === 'Home Stay' && (
            <ScrollView contentContainerStyle={styles.addressContainer}>
              {homeStays.map((homeStay, index) => (
                <Card
                  key={index}
                  type="homestay"
                  image={homeStay.image}
                  title={homeStay.title}
                  description={homeStay.description}
                  rating={homeStay.rating}
                  cardHeight={250}
                />
              ))}
            </ScrollView>
          )}

          {activeTab === 'User' && (
            <ScrollView contentContainerStyle={styles.addressContainer}>
              {users.map((user, index) => (
                <Card
                  key={index}
                  type="user"
                  avatar={user.avatar}
                  title={user.name}
                  description={user.description}
                  achievements={user.achievements}
                />
              ))}
            </ScrollView>
          )}
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
    padding: 10,
    // backgroundColor: '#fff',
    // borderBottomWidth: 1,
    // borderBottomColor: '#000',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 10,
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
    // backgroundColor: '#fff',
    // borderBottomWidth: 1,
    // borderBottomColor: '#000',
    paddingVertical: 10,
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
  flatList: {
    flex: 1,
  },
  gridItem: {
    width: imageSize,
    height: imageSize,
    margin: 1,
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  addressContainer: {
    alignItems: 'center',
    padding: 20,
  },
  addressImage: {
    width: width - 40,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  addressDescription: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  clearIcon: {
    marginLeft: 8,
  },
});

export default SearchPage;