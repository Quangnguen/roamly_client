import { View, Text, ScrollView, StyleSheet, ImageSourcePropType } from 'react-native'
import { Header } from '../components/header'
import FollowList from '../components/follower'
import Post from '../components/post'
import { useNavigation } from '@react-navigation/native'
import { NavigationProp } from "@/src/utils/PropsNavigate"
import { useEffect, useRef, useState } from 'react'
import { BACKGROUND } from '@/src/const/constants'

// Định nghĩa kiểu dữ liệu cho ảnh
type ImageItem = {
  id: string;
  uri: string | ImageSourcePropType;
};

const HomePage = () => {

  const navigation: NavigationProp<'Home' | 'WeatherPage'> = useNavigation()

  const posts = [
    {
      id: '1',
      username: 'joshua_J',
      isVerified: true,
      location: 'Tokyo, Japan',
      images: [
        { id: '1', uri: require('../../../assets/images/natural1.jpg') },
        { id: '2', uri: 'https://ik.imagekit.io/tvlk/blog/2024/07/canh-dep-viet-nam-6.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2' },
        { id: '3', uri: 'https://static.vinwonders.com/production/homestay-la-gi-thumb.jpg' }
      ],
      commentsCount: 44686,
      likesCount: 44686,
      caption: 'The game in Japan was amazing and I want to share some photos',
    },
    {
      id: '2',
      username: 'joshua_J',
      isVerified: true,
      location: 'Tokyo, Japan',
      images: [
        { id: '1', uri: 'https://ik.imagekit.io/tvlk/blog/2024/07/canh-dep-viet-nam-6.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2' }
      ],
      commentsCount: 44686,
      likesCount: 44686,
      caption: 'The game in Japan was amazing and I want to share some photos',
    },
    {
      id: '3',
      username: 'joshua_J',
      isVerified: true,
      location: 'Tokyo, Japan',
      images: [
        { id: '1', uri: require('../../../assets/images/natural1.jpg') },
        { id: '2', uri: 'https://vatlieuhousing.com/wp-content/uploads/2024/03/homestay-chuong-my.jpg' }
      ],
      commentsCount: 44686,
      likesCount: 44686,
      caption: 'The game in Japan was amazing and I want to share some photos',
    },
    {
      id: '4',
      username: 'joshua_J',
      isVerified: true,
      location: 'Tokyo, Japan',
      images: [
        { id: '1', uri: 'https://ik.imagekit.io/tvlk/blog/2024/07/canh-dep-viet-nam-6.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2' }
      ],
      commentsCount: 44686,
      likesCount: 44686,
      caption: 'The game in Japan was amazing and I want to share some photos',
    },
    {
      id: '5',
      username: 'joshua_J',
      isVerified: true,
      location: 'Tokyo, Japan',
      images: [
        { id: '1', uri: require('../../../assets/images/natural1.jpg') }
      ],
      commentsCount: 44686,
      likesCount: 44686,
      caption: 'The game in Japan was amazing and I want to share some photos',
    },
    {
      id: '6',
      username: 'joshua_J',
      isVerified: true,
      location: 'Tokyo, Japan',
      images: [
        { id: '1', uri: 'https://ik.imagekit.io/tvlk/blog/2024/07/canh-dep-viet-nam-6.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2' },
        { id: '2', uri: 'https://tourdulichmangden.vn/upload/news/homestay-mang-den-0-8434.jpg' }
      ],
      commentsCount: 44686,
      likesCount: 44686,
      caption: 'The game in Japan was amazing and I want to share some photos',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Header
        unreadMessages={1}
        onCameraPress={() => console.log("Camera pressed")}
        onMessagesPress={() => console.log("Messages pressed")}
        onDirectPress={() => console.log("Direct pressed")}
        onWeatherPress={() => navigation.navigate('WeatherPage')} />
      {/* <FollowList /> */}
      <ScrollView>
        {posts.map((post) => (
          <Post
            key={post.id}
            username={post.username}
            isVerified={post.isVerified}
            location={post.location}
            images={post.images}
            commentsCount={post.commentsCount}
            likesCount={post.likesCount}
            caption={post.caption}
          />
        ))}
      </ScrollView>
      <Text style={{ textAlign: 'center', marginVertical: 20 }}>HomePage</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  header: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
})

export default HomePage
