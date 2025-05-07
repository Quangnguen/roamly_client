import { BACKGROUND } from '@/src/const/constants';
import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Dimensions } from 'react-native';

type User = {
  id: string;
  username: string;
  avatar: string;
  hasStory?: boolean;
  viewed?: boolean;
};

const FollowList = () => {
  const users: User[] = [
    {
      id: "1",
      username: "Your Story",
      avatar: "",
      hasStory: true,
      viewed: false,
    },
    {
      id: "2",
      username: "karennine",
      avatar: "",
      hasStory: true,
      viewed: false,
    },
    {
      id: "3",
      username: "zackjohn",
      avatar: "",
      hasStory: true,
      viewed: false,
    },
    {
      id: "4",
      username: "kieron_d",
      avatar: "",
      hasStory: true,
      viewed: false,
    },
    {
      id: "5",
      username: "craig_",
      avatar: "",
      hasStory: true,
      viewed: false,
    },
    {
      id: "6",
      username: "arthur99",
      avatar: "",
      hasStory: true,
      viewed: true,
    },
    {
      id: "7",
      username: "jessica_t",
      avatar: "",
      hasStory: true,
    },
    {
      id: "8",
      username: "mike_ross",
      avatar: "",
      hasStory: true,
      viewed: false,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {users.map((user) => (
          <UserStory key={user.id} user={user} />
        ))}
      </ScrollView>
    </View>
  );
};

const UserStory = ({ user }: { user: User }) => {
    const renderBorder = () => {
        if (user.hasStory && !user.viewed) {
          return (
            <View style={styles.gradientBorderSimulated}>
              <View style={styles.whiteBorder}>
                <Image 
                  source={ user.avatar 
                    ? { uri: user.avatar } 
                    : require('../../../assets/images/avatar-test.jpg')
                 } 
                  style={styles.avatar} 
                  resizeMode="cover"
                />
              </View>
            </View>
          );
        } else if (user.hasStory && user.viewed) {
          return (
            <View style={styles.viewedBorder}>
              <View style={styles.whiteBorder}>
                <Image 
                  source={ user.avatar 
                    ? { uri: user.avatar } 
                    : require('../../../assets/images/avatar-test.jpg')}
                  style={styles.avatar} 
                  resizeMode="cover"
                />
              </View>
            </View>
          );
        } else {
          return (
            <View style={styles.noBorder}>
              <Image 
                source={{ uri: user.avatar }} 
                style={styles.avatar} 
                resizeMode="cover"
              />
            </View>
          );
        }
      };
      

  return (
    <View style={styles.userContainer}>
      <View style={styles.avatarContainer}>
        {renderBorder()}
        
      </View>
      <Text style={styles.username} numberOfLines={1} ellipsizeMode="tail">
        {user.username}
      </Text>
    </View>
  );
};

const { width } = Dimensions.get('window');
const AVATAR_SIZE = 64;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 6,
    backgroundColor: BACKGROUND,
  },
  gradientBorderSimulated: {
    width: AVATAR_SIZE + 6,
    height: AVATAR_SIZE + 6,
    borderRadius: (AVATAR_SIZE + 6) / 2,
    borderWidth: 2,
    borderColor: '#D62976', // màu Instagram-like
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  scrollContent: {
    paddingHorizontal: 6,
  },
  userContainer: {
    alignItems: 'center',
    marginRight: 10,
    width: AVATAR_SIZE + 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  gradientBorder: {
    width: AVATAR_SIZE + 6,
    height: AVATAR_SIZE + 6,
    borderRadius: (AVATAR_SIZE + 6) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewedBorder: {
    width: AVATAR_SIZE + 6,
    height: AVATAR_SIZE + 6,
    borderRadius: (AVATAR_SIZE + 6) / 2,
    backgroundColor: '#DBDBDB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noBorder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
  },
  whiteBorder: {
    width: AVATAR_SIZE + 2,
    height: AVATAR_SIZE + 2,
    borderRadius: (AVATAR_SIZE + 2) / 2,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  liveIndicator: {
    position: 'absolute',
    top: -4,
    alignSelf: 'center',
    backgroundColor: '#ED4956',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  liveText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 12,
    textAlign: 'center',
    width: AVATAR_SIZE + 8,
  },
});

export default FollowList;