import { View, Text, ActivityIndicator, StyleSheet } from "react-native"
import TabSelector from "./account/TabSelector";
import MemoriesGrid from "./memories/memory";
import PostList from "./postList";
import { useEffect, useState } from "react";
import { getPosts } from "../redux/slices/postSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";

const TabSelectorAccountPage = () => {
    const [activeTab, setActiveTab] = useState<'grid' | 'list'>('grid');
    const [hasLoaded, setHasLoaded] = useState(false);
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { posts, loading } = useSelector((state: RootState) => state.post);
    const profile = useSelector((state: RootState) => state.auth.profile);

    useEffect(() => {
        if (!hasLoaded) {
            dispatch(getPosts());
            setHasLoaded(true);
        }
    }, [hasLoaded, dispatch]);

    const handlePostPress = (post: any) => {
        setExpandedPostId(expandedPostId === post.id ? null : post.id);
    };

    const filteredPosts = posts.filter(post => post.authorId === profile?.id);

    const author = {
        username: profile?.username ?? '',
        profilePic: profile?.profilePic ?? '',
    }

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