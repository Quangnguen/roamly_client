import { View, Text, ActivityIndicator, StyleSheet } from "react-native"
import TabSelector from "./account/TabSelector";
import MemoriesGrid from "./memories/memory";
import PostList from "./postList";
import { useEffect, useState, useCallback } from "react";
import { getMyPosts } from "../redux/slices/postSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { useFocusEffect } from "@react-navigation/native";

const TabSelectorAccountPage = () => {
    const [activeTab, setActiveTab] = useState<'grid' | 'list'>('grid');
    const [hasLoaded, setHasLoaded] = useState(false);
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { myPosts, loading } = useSelector((state: RootState) => state.post);
    const profile = useSelector((state: RootState) => state.auth.profile);

    useEffect(() => {
        if (!hasLoaded) {
            refreshPosts();
            setHasLoaded(true);
        }
    }, [hasLoaded, dispatch]);

    // Refresh posts when user returns to AccountPage
    useFocusEffect(
        useCallback(() => {
            if (hasLoaded) {
                refreshPosts();
            }
        }, [hasLoaded])
    );

    const handlePostPress = (post: any) => {
        setExpandedPostId(expandedPostId === post.id ? null : post.id);
    };

    // Sử dụng myPosts thay vì filter posts
    const filteredPosts = myPosts;

    const author = {
        username: profile?.username ?? '',
        profilePic: profile?.profilePic ?? '',
    }

    // Refresh posts when tab changes or when needed
    const refreshPosts = () => {
        dispatch(getMyPosts());
    };

    const renderContent = () => {
        if (activeTab === 'grid') {
            if (loading) {
                return (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#888" />
                    </View>
                );
            }
            return (
                <PostList
                    posts={filteredPosts}
                    mini={true}
                    expandedPostId={expandedPostId}
                    currentUserId={profile?.id}
                    onPostPress={handlePostPress}
                    author={author}
                />
            );
        }
        return <MemoriesGrid userId={profile?.id ?? ''} />;
    };

    return (
        <View style={styles.container}>
            <TabSelector
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />
            {renderContent()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
    },
});

export default TabSelectorAccountPage;