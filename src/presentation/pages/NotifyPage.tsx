
import { useState } from "react"
import { View, TouchableOpacity, Text, StyleSheet } from "react-native"
import Following from "../components/notify/Following"
import You from "../components/notify/ForYou"
import { BACKGROUND } from "@/src/const/constants"
import { useEffect } from "react"
import { useDispatch } from "react-redux"

useEffect(() => {

}, [])

const NotifyPage = () => {
  const [activeTab, setActiveTab] = useState<"you" | "following">("you")

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "you" && styles.activeTab]}
          onPress={() => setActiveTab("you")}
        >
          <Text style={[styles.tabText, activeTab === "you" && styles.activeTabText]}>You</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "following" && styles.activeTab]}
          onPress={() => setActiveTab("following")}
        >
          <Text style={[styles.tabText, activeTab === "following" && styles.activeTabText]}>Following</Text>
        </TouchableOpacity>

      </View>

      {/* Follow Requests */}
      {/* <TouchableOpacity style={styles.followRequestsContainer}>
        <Text style={styles.followRequestsText}>Follow Requests</Text>
      </TouchableOpacity> */}

      {/* Content based on active tab */}
      {activeTab === "following" ? <Following /> : <You />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#DBDBDB",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 15,
  },
  activeTab: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tabText: {
    fontSize: 16,
    color: "#8E8E8E",
  },
  activeTabText: {
    fontWeight: "600",
    color: "#000",
  },
  followRequestsContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  followRequestsText: {
    fontSize: 15,
    fontWeight: "500",
  },
})

export default NotifyPage