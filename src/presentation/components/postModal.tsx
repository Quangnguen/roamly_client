import React from 'react';
import { View, Modal, TouchableOpacity, Text, StyleSheet, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import Post from './post';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const { width, height } = Dimensions.get('window');

interface PostModalProps {
    visible: boolean;
    onClose: () => void;
    loading: boolean;
    post: any;
}

const PostModal: React.FC<PostModalProps> = ({ visible, onClose, loading, post }) => {
    const profile = useSelector((state: RootState) => state.auth.profile);
    console.log(profile?.username);
    const author = {
        username: profile?.username || post.author.username || post.author.name || '',
        profilePic: profile?.profilePic || post.author.profilePic || '',
    }
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
            hardwareAccelerated={true}
        >
            {/* TouchableOpacity bao bọc toàn bộ để có thể nhấn ra ngoài */}
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                {/* Container chính cho nội dung */}
                <TouchableOpacity
                    style={styles.modalContainer}
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Header với nút đóng */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Chi tiết bài viết</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#3B82F6" />
                            <Text style={styles.loadingText}>Đang tải bài viết...</Text>
                        </View>
                    ) : post ? (
                        <ScrollView
                            style={styles.scrollContainer}
                            showsVerticalScrollIndicator={false}
                            bounces={false}
                            removeClippedSubviews={true}
                        >
                            <Post
                                postId={post.id}
                                username={profile?.username || post.author.username || post.author.name || ''}
                                location={post.location}
                                images={post.imageUrl.map((url: string, index: number) => ({
                                    id: index.toString(),
                                    uri: url,
                                }))}
                                commentCount={post.commentCount}
                                likeCount={post.likeCount}
                                sharedCount={post.sharedCount}
                                caption={post.caption}
                                author={author}
                                isPublic={post.isPublic}
                                isVerified={false}
                                isLike={post.isLike}
                                authorId={post.authorId}
                            />
                        </ScrollView>
                    ) : (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>Không thể tải bài viết</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={onClose}>
                                <Text style={styles.retryButtonText}>Đóng</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        maxHeight: height * 0.85,
        width: width - 40,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    scrollContainer: {
        maxHeight: height * 0.7,
    },
    loadingContainer: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    errorContainer: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default PostModal;
