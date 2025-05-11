import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native"
import React from "react"

type NotificationType = "like" | "mention" | "follow"

interface Notification {
  id: string
  type: NotificationType
  user: {
    id: string
    name: string
    avatar: string
  }
  timeAgo: string
  content?: {
    text?: string
    image?: string
  }
  isRead: boolean
}

interface NotificationSectionProps {
  title: string
  notifications: Notification[]
}

const NotificationItem = ({ notification }: { notification: Notification }) => {
  const renderNotificationContent = () => {
    switch (notification.type) {
      case "like":
        return (
          <Text style={styles.notificationText}>
            <Text style={styles.username}>{notification.user.name}</Text> liked your photo.{" "}
            <Text style={styles.timeAgo}>{notification.timeAgo}</Text>
          </Text>
        )
      case "mention":
        return (
          <Text style={styles.notificationText}>
            <Text style={styles.username}>{notification.user.name}</Text> mentioned you in a comment:{" "}
            <Text style={styles.comment}>{notification.content?.text}</Text>{" "}
            <Text style={styles.timeAgo}>{notification.timeAgo}</Text>
          </Text>
        )
      case "follow":
        return (
          <Text style={styles.notificationText}>
            <Text style={styles.username}>{notification.user.name}</Text> started following you.{" "}
            <Text style={styles.timeAgo}>{notification.timeAgo}</Text>
          </Text>
        )
      default:
        return null
    }
  }

  const renderActionButton = () => {
    if (notification.type === "follow") {
      return (
        <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followButtonText}>Follow</Text>
        </TouchableOpacity>
      )
    } else if (notification.content?.image) {
      return <Image source={{ uri: notification.content.image }} style={styles.contentImage} />
    }
    return null
  }

  return (
    <View style={styles.notificationItem}>
      <Image source={{ uri: notification.user.avatar }} style={styles.avatar} />
      <View style={styles.notificationContent}>
        {renderNotificationContent()}
        {notification.type === "mention" && (
          <TouchableOpacity style={styles.replyButton}>
            <Text style={styles.replyText}>Reply</Text>
          </TouchableOpacity>
        )}
      </View>
      {renderActionButton()}
    </View>
  )
}

const NotificationSection = ({ title, notifications }: NotificationSectionProps) => {
  if (notifications.length === 0) return null

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </View>
  )
}

const You = () => {
  // Sample data
  const notifications: Notification[] = [
    {
      id: "1",
      type: "like",
      user: {
        id: "101",
        name: "karenmme",
        avatar: "https://i.pinimg.com/736x/21/92/70/2192706054d96fb1bdfae0d1c2b6bf49.jpg?height=40&width=40",
      },
      timeAgo: "1h",
      content: {
        image: "https://i.pinimg.com/736x/21/92/70/2192706054d96fb1bdfae0d1c2b6bf49.jpg?height=50&width=50",
      },
      isRead: false,
    },
    {
      id: "2",
      type: "like",
      user: {
        id: "102",
        name: "kiero_d_zackjohn",
        avatar: "https://i.pinimg.com/736x/21/92/70/2192706054d96fb1bdfae0d1c2b6bf49.jpg?height=40&width=40",
      },
      timeAgo: "3h",
      content: {
        image: "https://i.pinimg.com/736x/21/92/70/2192706054d96fb1bdfae0d1c2b6bf49.jpg?height=50&width=50",
      },
      isRead: false,
    },
    {
      id: "3",
      type: "mention",
      user: {
        id: "103",
        name: "craig_love",
        avatar: "https://i.pinimg.com/736x/21/92/70/2192706054d96fb1bdfae0d1c2b6bf49.jpg?height=40&width=40",
      },
      timeAgo: "5d",
      content: {
        text: "@jacob_w exactly...",
        image: "https://i.pinimg.com/736x/21/92/70/2192706054d96fb1bdfae0d1c2b6bf49.jpg?height=50&width=50",
      },
      isRead: true,
    },
    {
      id: "4",
      type: "follow",
      user: {
        id: "104",
        name: "martini_rond",
        avatar: "https://i.pinimg.com/736x/21/92/70/2192706054d96fb1bdfae0d1c2b6bf49.jpg?height=40&width=40",
      },
      timeAgo: "1d",
      isRead: true,
    },
    {
      id: "5",
      type: "follow",
      user: {
        id: "105",
        name: "maxjacobson",
        avatar: "https://i.pinimg.com/736x/21/92/70/2192706054d96fb1bdfae0d1c2b6bf49.jpg?height=40&width=40",
      },
      timeAgo: "3d",
      isRead: true,
    },
    {
      id: "6",
      type: "follow",
      user: {
        id: "106",
        name: "mis_potter",
        avatar: "https://i.pinimg.com/736x/21/92/70/2192706054d96fb1bdfae0d1c2b6bf49.jpg?height=40&width=40",
      },
      timeAgo: "1w",
      isRead: true,
    },
  ]

  const newNotifications = notifications.filter((n) => !n.isRead)
  const todayNotifications = notifications.filter((n) => n.timeAgo.includes("h"))
  const thisWeekNotifications = notifications.filter((n) => n.timeAgo.includes("d"))
  const thisMonthNotifications = notifications.filter((n) => n.timeAgo.includes("w"))

  return (
    <ScrollView style={styles.notificationsContainer}>
      <NotificationSection title="New" notifications={newNotifications} />
      <NotificationSection title="Today" notifications={todayNotifications} />
      <NotificationSection title="This Week" notifications={thisWeekNotifications} />
      <NotificationSection title="This Month" notifications={thisMonthNotifications} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  notificationsContainer: {
    flex: 1,
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
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    marginRight: 10,
  },
  notificationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  username: {
    fontWeight: "600",
  },
  timeAgo: {
    color: "#8E8E8E",
  },
  comment: {
    color: "#8E8E8E",
  },
  contentImage: {
    width: 44,
    height: 44,
    borderRadius: 4,
  },
  followButton: {
    backgroundColor: "#3897F0",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 4,
  },
  followButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  replyButton: {
    marginTop: 5,
  },
  replyText: {
    color: "#8E8E8E",
    fontSize: 14,
  },
})

export default You