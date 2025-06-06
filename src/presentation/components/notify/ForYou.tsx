import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Modal, ActivityIndicator } from "react-native"
import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/src/presentation/redux/store"
import { fetchNotifications, markAsRead, markNotificationAsRead } from "@/src/presentation/redux/slices/notificationSlice"
import { getPostById } from "@/src/presentation/redux/slices/postSlice"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import PostModal from "../postModal"

interface NotificationSectionProps {
  title: string
  notifications: NotificationType[]
  onNotificationPress: (notification: NotificationType) => void
}

interface NotificationType {
  id: string
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'MENTION' | 'MESSAGE'
  message: string
  isRead: boolean
  senderId: string
  createdAt: string
  sender: {
    id: string
    username: string
    profilePic: string | null
  }
  post?: {
    id: string
    imageUrl: string[]
  }
}

const NotificationItem = ({ notification, onPress }: { notification: NotificationType, onPress: (notification: NotificationType) => void }) => {
  const getTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi })
  }

  const renderNotificationContent = () => {
    const timeAgo = getTimeAgo(notification.createdAt)

    switch (notification.type) {
      case "LIKE":
        return (
          <Text style={styles.notificationText}>
            <Text style={styles.username}>{notification.sender.username}</Text><Text> đã thích bài viết của bạn</Text>
            <Text style={styles.timeAgo}> {timeAgo}</Text>
          </Text>
        )
      case "COMMENT":
        return (
          <Text style={styles.notificationText}>
            <Text style={styles.username}>{notification.sender.username}</Text><Text> đã bình luận về bài viết của bạn</Text>
            <Text style={styles.timeAgo}> {timeAgo}</Text>
          </Text>
        )
      case "FOLLOW":
        return (
          <Text style={styles.notificationText}>
            <Text style={styles.username}>{notification.sender.username}</Text><Text> đã bắt đầu theo dõi bạn</Text>
            <Text style={styles.timeAgo}> {timeAgo}</Text>
          </Text>
        )
      case "MENTION":
        return (
          <Text style={styles.notificationText}>
            <Text style={styles.username}>{notification.sender.username}</Text><Text> đã nhắc đến bạn</Text>
            <Text style={styles.timeAgo}> {timeAgo}</Text>
          </Text>
        )
      case "MESSAGE":
        return (
          <Text style={styles.notificationText}>
            <Text style={styles.username}>{notification.sender.username}</Text><Text> đã gửi tin nhắn cho bạn</Text>
            <Text style={styles.timeAgo}> {timeAgo}</Text>
          </Text>
        )
      default:
        return null
    }
  }

  const renderActionButton = () => {
    if (notification.type === "FOLLOW") {
      return (
        <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followButtonText}>Theo dõi</Text>
        </TouchableOpacity>
      )
    } else if (notification.post?.imageUrl[0]) {
      return <Image source={{ uri: notification.post.imageUrl[0] }} style={styles.contentImage} />
    }
    return null
  }

  return (
    <TouchableOpacity
      style={[styles.notificationItem, !notification.isRead && styles.unreadItem]}
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: notification.sender.profilePic || undefined }} style={styles.avatar} />
      <View style={styles.notificationContent}>
        {renderNotificationContent()}
      </View>
      {renderActionButton()}
    </TouchableOpacity>
  )
}

const NotificationSection = ({ title, notifications, onNotificationPress }: NotificationSectionProps) => {
  if (notifications.length === 0) return null

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onPress={onNotificationPress} />
      ))}
    </View>
  )
}

const You = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { notifications, loading, error } = useSelector((state: RootState) => state.notification)
  const { currentPost, loading: postLoading } = useSelector((state: RootState) => state.post)
  const [refreshing, setRefreshing] = useState(false)
  const [showPostModal, setShowPostModal] = useState(false)

  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    dispatch(fetchNotifications()).finally(() => {
      setRefreshing(false)
    })
  }, [dispatch])

  const handleNotificationPress = async (notification: NotificationType) => {

    if ((notification.type === 'LIKE' || notification.type === 'COMMENT') && notification.post?.id) {
      // Hiển thị modal ngay lập tức
      setShowPostModal(true)

      try {
        await dispatch(getPostById(notification.post.id)).unwrap()
      } catch (error) {
        console.error('Error fetching post:', error)
        setShowPostModal(false)
      }
    }
    console.log(notification.id);
    dispatch(markNotificationAsRead(notification.id))
    dispatch(markAsRead(notification.id))
  }

  const handleCloseModal = () => {
    console.log('Closing modal')
    setShowPostModal(false)
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <Text>Đang tải...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const newNotifications = notifications.filter((n) => !n.isRead)
  const todayNotifications = notifications.filter((n) => new Date(n.createdAt) > oneDayAgo)
  const thisWeekNotifications = notifications.filter((n) => {
    const date = new Date(n.createdAt)
    return date <= oneDayAgo && date > oneWeekAgo
  })
  const thisMonthNotifications = notifications.filter((n) => {
    const date = new Date(n.createdAt)
    return date <= oneWeekAgo && date > oneMonthAgo
  })

  return (
    <>
      <ScrollView
        style={styles.notificationsContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
      >
        <NotificationSection title="Mới" notifications={newNotifications} onNotificationPress={handleNotificationPress} />
        <NotificationSection title="Hôm nay" notifications={todayNotifications} onNotificationPress={handleNotificationPress} />
        <NotificationSection title="Tuần này" notifications={thisWeekNotifications} onNotificationPress={handleNotificationPress} />
        <NotificationSection title="Tháng này" notifications={thisMonthNotifications} onNotificationPress={handleNotificationPress} />
      </ScrollView>

      <PostModal
        visible={showPostModal}
        onClose={handleCloseModal}
        loading={postLoading}
        post={currentPost}
      />
    </>
  )
}

const styles = StyleSheet.create({
  notificationsContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    paddingTop: 10,
  },
  sectionTitle: {
    paddingHorizontal: 15,
    paddingBottom: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  unreadItem: {
    backgroundColor: '#F0F9FF',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#E5E5E5',
  },
  notificationContent: {
    flex: 1,
    marginRight: 10,
  },
  notificationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1F2937',
  },
  username: {
    fontWeight: "600",
    color: '#111827',
  },
  timeAgo: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 4,
  },
  contentImage: {
    width: 44,
    height: 44,
    borderRadius: 4,
  },
  followButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 4,
  },
  followButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
  },
})

export default You