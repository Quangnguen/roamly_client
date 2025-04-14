import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
  Dimensions,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Types
type StoryHighlight = {
  id: string;
  name: string;
  image: string;
};

type Post = {
  id: string;
  imageUrl: string;
};


const AccountPage: React.FC = () => {
  // Mock data
  const userStats = {
    posts: 54,
    followers: 834,
    following: 162,
  };

  const navigation = useNavigation<NavigationProp>();

  const handleEditProfilePage = () => {
    navigation.navigate('EditProfilePage');
  };
  

  const storyHighlights: StoryHighlight[] = [
    { id: '1', name: 'New', image: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
    { id: '2', name: 'Friends', image: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
    { id: '3', name: 'Sport', image: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
    { id: '4', name: 'Design', image: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
  ];

  const posts: Post[] = [
    { id: '1', imageUrl: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
    { id: '2', imageUrl: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
    { id: '3', imageUrl: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
    { id: '4', imageUrl: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
    { id: '5', imageUrl: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
    { id: '6', imageUrl: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' },
  ];

  // Calculate dimensions for grid items
  const { width } = Dimensions.get('window');
  const itemSize = width / 3;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View></View>
        <View style={styles.usernameContainer}>
          <Text style={styles.username}>jacob_w</Text>
        
        </View>
        <TouchableOpacity>
          <Feather name="menu" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <Image
              source={{ uri: 'https://i.pinimg.com/474x/1f/61/95/1f61957319c9cddaec9b3250b721c82b.jpg' }}
              style={styles.profileImage}
            />
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userStats.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userStats.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userStats.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>

          {/* Bio */}
          <View style={styles.bioContainer}>
            <Text style={styles.name}>Jacob Ward</Text>
            <Text style={styles.bioText}>
              Digital goodies designer @pixsellz{'\n'}
              Everything is designed.
            </Text>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfilePage}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>

          {/* Story Highlights */}
          <FlatList
            data={storyHighlights}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            style={styles.highlightsContainer}
            renderItem={({ item }) => (
              <View style={styles.highlightItem}>
                <View style={styles.highlightImageContainer}>
                  {item.name === 'New' ? (
                    <View style={styles.newHighlightContainer}>
                      <Feather name="plus" size={24} color="black" />
                    </View>
                  ) : (
                    <Image source={{ uri: item.image }} style={styles.highlightImage} />
                  )}
                </View>
                <Text style={styles.highlightName}>{item.name}</Text>
              </View>
            )}
          />
        </View>

        {/* Tab Selector */}
        <View style={styles.tabSelector}>
          <TouchableOpacity style={[styles.tabButton, styles.activeTab]}>
            <MaterialIcons name="grid-on" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton}>
            <Feather name="user" size={24} color="gray" />
          </TouchableOpacity>
        </View>

        {/* Posts Grid */}
        <FlatList
          data={posts}
          numColumns={3}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item.imageUrl }}
              style={{
                width: itemSize,
                height: itemSize,
                marginRight: 1,
                marginBottom: 1,
              }}
            />
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DBDBDB',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 5,
  },
  profileSection: {
    padding: 15,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#262626',
  },
  bioContainer: {
    marginBottom: 15,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  bioText: {
    fontSize: 14,
    color: '#262626',
  },
  editProfileButton: {
    borderWidth: 1,
    borderColor: '#DBDBDB',
    borderRadius: 4,
    paddingVertical: 7,
    alignItems: 'center',
    marginBottom: 15,
  },
  editProfileText: {
    fontWeight: '600',
    fontSize: 14,
  },
  highlightsContainer: {
    marginBottom: 15,
  },
  highlightItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  highlightImageContainer: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 1,
    borderColor: '#DBDBDB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  highlightImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  newHighlightContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightName: {
    fontSize: 12,
  },
  tabSelector: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: '#DBDBDB',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
});

export default AccountPage;