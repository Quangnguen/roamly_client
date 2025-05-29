import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { BACKGROUND } from '@/src/const/constants';

interface PostMiniProps {
    image: string;
    caption: string;
    likeCount: number;
    commentCount: number;
    sharedCount: number;
    imageCount: number;
    onPress: () => void;
}

const PostMini: React.FC<PostMiniProps> = ({ image, caption, likeCount, commentCount, sharedCount, imageCount, onPress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.image} />
                {imageCount > 1 && (
                    <View style={styles.imageCountBadge}>
                        <Text style={styles.imageCountText}>{'+' + imageCount}</Text>
                    </View>
                )}
            </View>
            <View style={styles.content}>
                <Text style={styles.caption} numberOfLines={1}>{caption}</Text>
                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <FontAwesome name="heart-o" size={16} color="#666" />
                        <Text style={styles.statText}> {likeCount}</Text>
                    </View>
                    <View style={styles.stat}>
                        <FontAwesome name="comment-o" size={16} color="#666" />
                        <Text style={styles.statText}> {commentCount}</Text>
                    </View>
                    <View style={styles.stat}>
                        <FontAwesome name="share" size={16} color="#666" />
                        <Text style={styles.statText}> {sharedCount}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: BACKGROUND,
        borderRadius: 10,
        marginBottom: 10,
        padding: 8,
        marginHorizontal: 4,
    },
    imageWrapper: {
        position: 'relative',
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
    imageCountBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#222',
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    imageCountText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    content: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
        minHeight: 70,
    },
    caption: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 8,
        color: '#222',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 18,
    },
    statText: {
        fontSize: 14,
        color: '#444',
    },
});

export default PostMini;