import React, { useState } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Post from '../post';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { searchPosts, loadMoreSearchPosts } from '../../redux/slices/postSlice';
import { useNavigation } from '@react-navigation/native';

interface PostData {
    id: string;
    imageUrl: string[];
    caption: string;
    location: string | null;
    likeCount: number;
    commentCount: number;
    sharedCount: number;
    isPublic: boolean;
    author: {
        username: string;
        name?: string;
        profilePic: string | null;
    };
    authorId: string;
    isLike?: boolean;
    createdAt: string;
}

interface PostTabProps {
    searchText?: string;
}

const PostTab: React.FC<PostTabProps> = ({ searchText = '' }) => {
    const [loadingMore, setLoadingMore] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation(); // Import useNavigation nếu chưa có

    const {
        posts,
        loading: postLoading,
        searchResults,
        searchLoading
    } = useSelector((state: RootState) => state.post);

    // Đảm bảo tab bar luôn hiển thị
    React.useEffect(() => {
        navigation.getParent()?.setOptions({
            tabBarStyle: { display: 'flex' }
        });
    }, [navigation]);

    const renderPost = ({ item: post }: { item: PostData }) => (
        <Post
            key={post.id}
            postId={post.id}
            username={post.author.name || post.author.username || ''} // Đổi thứ tự ưu tiên
            location={post.location}
            images={post.imageUrl.map((url: string, index: number) => ({ id: index.toString(), uri: url }))}
            commentCount={post.commentCount}
            likeCount={post.likeCount}
            sharedCount={post.sharedCount}
            caption={post.caption}
            author={{
                username: post.author.name || post.author.username || '', // Cũng cập nhật ở đây
                profilePic: post.author.profilePic
            }}
            isPublic={post.isPublic}
            isVerified={false}
            authorId={post.authorId}
            isLike={post.isLike}
            createdAt={post.createdAt}
        />
    );

    // Handle load more for search results
    const handleLoadMore = async () => {
        if (searchResults &&
            searchResults.data.currentPage < searchResults.data.totalPages &&
            !loadingMore &&
            searchText.trim()) {

            setLoadingMore(true);
            try {
                const nextPage = searchResults.data.currentPage + 1;
                await dispatch(loadMoreSearchPosts({
                    q: searchText.trim(),
                    page: nextPage,
                    limit: 20
                })).unwrap();

            } catch (error) {
                console.error('Error loading more results:', error);
            } finally {
                setLoadingMore(false);
            }
        }
    };

    // Determine which data to display and loading state
    const isSearching = searchText.trim().length > 0;
    const isLoading = isSearching ? searchLoading : postLoading;
    const dataToDisplay = isSearching ? (searchResults?.data?.results || []) : posts;

    // Show loading indicator
    if (isLoading) {
        return (
            <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#888" />
            </View>
        );
    }

    // Show search results summary
    const renderSearchHeader = () => {
        if (isSearching && searchResults) {
            return (
                <View style={styles.searchHeader}>
                    <Text style={styles.searchResultText}>
                        🔍 Tìm thấy {searchResults.data.total} kết quả cho "{searchText}"
                    </Text>
                    <Text style={styles.searchPageText}>
                        Trang {searchResults.data.currentPage}/{searchResults.data.totalPages}
                    </Text>
                </View>
            );
        }
        return null;
    };

    // Show empty state
    if (dataToDisplay.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                {renderSearchHeader()}
                <Text style={styles.emptyText}>
                    {isSearching ? `Không tìm thấy bài viết nào cho "${searchText}"` : 'Chưa có bài viết nào'}
                </Text>
            </View>
        );
    }

    // Render footer for load more
    const renderFooter = () => {
        if (!isSearching) return null;

        if (loadingMore) {
            return (
                <View style={styles.footerLoading}>
                    <ActivityIndicator size="small" color="#888" />
                    <Text style={styles.footerText}>Đang tải thêm...</Text>
                </View>
            );
        }

        if (searchResults && searchResults.data.currentPage < searchResults.data.totalPages) {
            return (
                <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
                    <Text style={styles.loadMoreText}>Tải thêm kết quả</Text>
                </TouchableOpacity>
            );
        }

        if (searchResults && searchResults.data.results.length > 0) {
            return (
                <View style={styles.endContainer}>
                    <Text style={styles.endText}>— Hết kết quả —</Text>
                </View>
            );
        }

        return null;
    };

    return (
        <View style={{ flex: 1 }}>
            {renderSearchHeader()}
            <FlatList
                data={dataToDisplay}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={5}
                windowSize={5}
                initialNumToRender={5}
                onEndReachedThreshold={0.5}
                onEndReached={isSearching ? handleLoadMore : undefined}
                ListFooterComponent={renderFooter}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    searchHeader: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    searchResultText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    searchPageText: {
        fontSize: 14,
        color: '#666',
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
    },
    footerLoading: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    footerText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#888',
    },
    loadMoreButton: {
        backgroundColor: '#007AFF',
        margin: 16,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    loadMoreText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    endContainer: {
        padding: 20,
        alignItems: 'center',
    },
    endText: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
    },
});

export default PostTab;