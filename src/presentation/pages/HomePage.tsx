import { View, Text, ScrollView, PanResponder, Animated } from 'react-native'
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
      if (gestureState.dx > 100) {
        // Vuốt từ trái sang phải -> chuyển sang trang Weather
        navigation.navigate('WeatherPage')
      }
    },
  })

  return (
    <ScrollView {...panResponder.panHandlers}>
      <Header
        unreadMessages={1}
        onCameraPress={() => console.log("Camera pressed")}
        onMessagesPress={() => console.log("Messages pressed")}
        onDirectPress={() => console.log("Direct pressed")} />
      <FollowList />
      <Post
        username="joshua_J"
        isVerified={true}
        location="Tokyo, Japan"
        imageUrl=""
        likedBy="craig_love"
        likesCount={44686}
        caption="The game in Japan was amazing and I want to share some photos"
        currentImageIndex={1}
        totalImages={3} />
      <Post
        username="joshua_J"
        isVerified={true}
        location="Tokyo, Japan"
        imageUrl=""
        likedBy="craig_love"
        likesCount={44686}
        caption="The game in Japan was amazing and I want to share some photos"
        currentImageIndex={1}
        totalImages={3} />
      <Text style={{ textAlign: 'center', marginVertical: 20 }}>HomePage</Text>
    </ScrollView>
  )
}

export default HomePage
