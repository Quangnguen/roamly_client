import React from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import Post from '../post';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

interface Post {
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
        profilePic: string | null;
    };
    authorId: string;
    isLike?: boolean;
}

const PostTab = () => {
    const { posts, loading: postLoading } = useSelector((state: RootState) => state.post);

    const renderPost = ({ item: post }: { item: Post }) => (
        <Post
            key={post.id}
            postId={post.id}
            username={post.author.username}
            location={post.location}
            images={post.imageUrl.map((url: string, index: number) => ({ id: index.toString(), uri: url }))}
            commentCount={post.commentCount}
            likeCount={post.likeCount}
            sharedCount={post.sharedCount}
            caption={post.caption}
            author={post.author}
            isPublic={post.isPublic}
            isVerified={false}
            authorId={post.authorId}
            isLike={post.isLike}
        />
    );

    if (postLoading) {
        return (
            <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#888" />
            </View>
        );
    }

    return (
        <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            windowSize={5}
            initialNumToRender={5}
            onEndReachedThreshold={0.5}
        />
    );
};

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PostTab; 