import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native"
import TabSelector from "./account/TabSelector";
import MemoriesGrid from "./memories/Memory";
import PostList from "./postList";
import Card from "./card";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { toggleFavoriteDestination, untoggleFavoriteDestination } from "../redux/slices/destinationSlice";
import { useEffect, useState, useCallback } from "react";
import { getMyPosts } from "../redux/slices/postSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { useFocusEffect } from "@react-navigation/native";
import { getPopularDestinations, getFavoriteDestinations } from "../redux/slices/destinationSlice";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TabSelectorAccountPage = () => {
    const [activeTab, setActiveTab] = useState<'grid' | 'list' | 'favorites'>('grid');
    const [hasLoaded, setHasLoaded] = useState(false);
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation<NavigationProp>();
    const { myPosts, loading } = useSelector((state: RootState) => state.post);
    const profile = useSelector((state: RootState) => state.auth.profile);
    const { destinations, loading: destinationLoading, myDestinations, favoriteLoading, favoriteError } = useSelector((state: RootState) => state.destination);

    useEffect(() => {
        if (!hasLoaded) {
            refreshPosts();
            refreshFavoriteDestinations();
            setHasLoaded(true);
        }
    }, [hasLoaded, dispatch]);

    // Refresh posts and destinations when user returns to AccountPage
    useFocusEffect(
        useCallback(() => {
            if (hasLoaded) {
                refreshPosts();
                refreshFavoriteDestinations();
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


    // Refresh favorite destinations when needed
    const refreshFavoriteDestinations = () => {
        dispatch(getFavoriteDestinations());
    };

    // My destinations - local copy modified directly

    // Handle favorite destination press
    const handleDestinationPress = useCallback((destination: any) => {
        navigation.navigate('AddressDetailPage', {
            id: destination.id,
            destinationData: destination
        });
    }, [navigation]);

    // Handle toggle favorite destination with optimistic updates
    const handleToggleFavorite = useCallback((destinationId: string, currentLiked: boolean) => {
        // Optimistic update: Update local state immediately for instant UI feedback
        // Note: Redux state is updated in the slice reducers

        if (currentLiked) {
            dispatch(untoggleFavoriteDestination({ targetId: destinationId, type: 'destination' }));
        } else {
            dispatch(toggleFavoriteDestination({ targetId: destinationId, type: 'destination' }));
        }
    }, [dispatch]);

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
        if (activeTab === 'list') {
            return <MemoriesGrid userId={profile?.id ?? ''} />;
        }
        if (activeTab === 'favorites') {
            if (favoriteLoading) {
                return (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#888" />
                    </View>
                );
            }
            if (favoriteError) {
                return (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.errorText}>Lỗi: {favoriteError}</Text>
                        <TouchableOpacity onPress={refreshFavoriteDestinations}>
                            <Text style={styles.retryText}>Thử lại</Text>
                        </TouchableOpacity>
                    </View>
                );
            }
            return (
                <View style={styles.favoritesContainer}>
                    {myDestinations.length > 0 ? (
                        myDestinations.map((destination) => (
                            <Card
                                key={destination.id}
                                type="address"
                                image={destination.imageUrl && destination.imageUrl.length > 0 ? { uri: destination.imageUrl[0] } : require('../../../assets/images/natural2.jpg')}
                                title={destination.title || 'Không có tiêu đề'}
                                description={destination.description || 'Không có mô tả'}
                                totalFollowers={destination.likeCount || 0}
                                visitCount={destination.visitCount || 0}
                                rating={destination.rating || 0}
                                reviewCount={destination.reviewCount || 0}
                                isLiked={destination.isLiked || false}
                                onPress={() => handleDestinationPress(destination)}
                                onFollowPress={() => handleToggleFavorite(destination.id, destination.isLiked || false)}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Chưa có địa điểm yêu thích nào</Text>
                        </View>
                    )}
                </View>
            );
        }
        return null;
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
    favoritesContainer: {
        flex: 1,
        padding: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#FF3B30',
        textAlign: 'center',
        marginBottom: 10,
    },
    retryText: {
        fontSize: 16,
        color: '#007AFF',
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});

export default TabSelectorAccountPage;