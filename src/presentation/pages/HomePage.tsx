import { View, Text, ScrollView, PanResponder, Animated, StyleSheet } from 'react-native'
import { Header } from '../components/header'
import FollowList from '../components/follower'
import Post from '../components/post'
import { useNavigation } from '@react-navigation/native'
import { NavigationProp } from "@/src/utils/PropsNavigate"
import { useEffect, useRef, useState } from 'react'

const HomePage = () => {

  const navigation: NavigationProp<'Home' | 'WeatherPage'> = useNavigation()
  const pan = useRef(new Animated.ValueXY()).current

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20 // Vuốt ngang
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 50) {
        // Vuốt từ trái sang phải -> chuyển sang trang Weather
        navigation.navigate('WeatherPage')
      }
    },
  })

  const posts = [
    {
      id: '1',
      username: 'joshua_J',
      isVerified: true,
      location: 'Tokyo, Japan',
      imageUrl: require('../../../assets/images/natural1.jpg'),
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
      imageUrl: 'https://ik.imagekit.io/tvlk/blog/2024/07/canh-dep-viet-nam-6.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2',
      likedBy: 'craig_love',
      likesCount: 44686,
      caption: 'The game in Japan was amazing and I want to share some photos',
      currentImageIndex: 1,
      totalImages: 3,
    },
    {
      id: '3',
      username: 'joshua_J',
      isVerified: true,
      location: 'Tokyo, Japan',
      imageUrl: require('../../../assets/images/natural1.jpg'),
      likedBy: 'craig_love',
      likesCount: 44686,
      caption: 'The game in Japan was amazing and I want to share some photos',
      currentImageIndex: 1,
      totalImages: 3,
    },
    {
      id: '4',
      username: 'joshua_J',
      isVerified: true,
      location: 'Tokyo, Japan',
      imageUrl: 'https://ik.imagekit.io/tvlk/blog/2024/07/canh-dep-viet-nam-6.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2',
      likedBy: 'craig_love',
      likesCount: 44686,
      caption: 'The game in Japan was amazing and I want to share some photos',
      currentImageIndex: 1,
      totalImages: 3,
    },
    {
      id: '5',
      username: 'joshua_J',
      isVerified: true,
      location: 'Tokyo, Japan',
      imageUrl: require('../../../assets/images/natural1.jpg'),
      likedBy: 'craig_love',
      likesCount: 44686,
      caption: 'The game in Japan was amazing and I want to share some photos',
      currentImageIndex: 1,
      totalImages: 3,
    },
    {
      id: '6',
      username: 'joshua_J',
      isVerified: true,
      location: 'Tokyo, Japan',
      imageUrl: 'https://ik.imagekit.io/tvlk/blog/2024/07/canh-dep-viet-nam-6.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2',
      likedBy: 'craig_love',
      likesCount: 44686,
      caption: 'The game in Japan was amazing and I want to share some photos',
      currentImageIndex: 1,
      totalImages: 3,
    },
  ];

  return (
    <ScrollView {...panResponder.panHandlers} style={styles.container}>
      <Header
        unreadMessages={1}
        onCameraPress={() => console.log("Camera pressed")}
        onMessagesPress={() => console.log("Messages pressed")}
        onDirectPress={() => console.log("Direct pressed")} />
      <FollowList />
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
      <Text style={{ textAlign: 'center', marginVertical: 20 }}>HomePage</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(173, 216, 230)',
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
