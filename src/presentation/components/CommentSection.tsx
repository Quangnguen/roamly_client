import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    TextInput,
    ScrollView,
    FlatList,
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { BACKGROUND } from '@/src/const/constants';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import {
    clearComments,
    createComment,
    getComments,
    likeComment,
    unlikeComment
} from '../redux/slices/commentSlice';
import { incrementCommentCount } from '../redux/slices/postSlice';
import { socketService } from '../../services/socketService';
import Toast from 'react-native-toast-message';
import TypingIndicator from './TypingIndicator';

interface CommentSectionProps {
    postId: string;
    currentCommentCount: number;
    isVisible: boolean;
    onClose: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
    postId,
    currentCommentCount,
    isVisible,
    onClose,
}) => {
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyingToUsername, setReplyingToUsername] = useState<string>('');
    const [isTyping, setIsTyping] = useState(false);

    const commentInputRef = useRef<TextInput>(null);
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth);
    const { comments: reduxComments, loading: loadingComment } = useSelector((state: RootState) => state.comment);

    // Socket listeners for real-time comments
    useEffect(() => {
        if (!socketService || !postId) return;

        const handleNewComment = (data: { postId: string, comment: any, commentCount: number }) => {
            if (data.postId === postId) {
                dispatch({
                    type: 'comment/addRealTimeComment',
                    payload: data.comment
                });

                if (data.comment.authorId !== user.profile?.id) {
                    const isReply = data.comment.parentId ? ' (trả lời)' : '';
                    Toast.show({
                        type: 'info',
                        text1: `Bình luận mới${isReply}`,
                        text2: `${data.comment.author.username}: ${data.comment.content.substring(0, 50)}${data.comment.content.length > 50 ? '...' : ''}`,
                        visibilityTime: 2000,
                    });
                }
            }
        };

        const handleCommentDeleted = (data: { commentId: string, postId: string }) => {
            if (data.postId === postId) {
                dispatch({
                    type: 'comment/removeComment',
                    payload: data.commentId
                });
            }
        };

        socketService.on('new_comment_auth', handleNewComment);
        socketService.on('comment_deleted', handleCommentDeleted);

        return () => {
            socketService.off('new_comment_auth', handleNewComment);
            socketService.off('comment_deleted', handleCommentDeleted);
        };
    }, [postId, dispatch, user.profile?.id]);

    // Load comments when modal opens
    useEffect(() => {
        if (isVisible && postId) {
            dispatch(clearComments());
            dispatch(getComments(postId));
        }
    }, [isVisible, postId, dispatch]);

    const handleAddComment = useCallback(async () => {
        if (newComment.trim() && postId) {
            const commentText = newComment.trim();
            const parentId = replyingTo;

            try {
                // Gửi comment và đợi kết quả
                const result = await dispatch(createComment({
                    postId: postId,
                    content: commentText,
                    parentId: parentId || undefined
                })).unwrap();


                // API thành công - refetch comments để đảm bảo hiển thị đúng
                await dispatch(getComments(postId));
                dispatch(incrementCommentCount({ postId: postId }));

                // Reset form sau khi thành công
                setNewComment('');
                setIsTyping(false);
                commentInputRef.current?.blur();
                setReplyingTo(null);
                setReplyingToUsername('');

                console.log('✅ Comment process completed');
                Toast.show({
                    type: 'success',
                    text1: 'Đã thêm bình luận',
                    visibilityTime: 1500,
                });

            } catch (error: any) {
                Toast.show({
                    type: 'error',
                    text1: 'Không thể thêm bình luận',
                    text2: error || 'Vui lòng thử lại sau',
                    visibilityTime: 3000,
                });
            }
        }
    }, [newComment, postId, replyingTo, replyingToUsername, dispatch, user.profile]);

    const handleKeyPress = useCallback((e: any) => {
        if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
            e.preventDefault();
            handleAddComment();
        }
    }, [handleAddComment]);

    const handleReplyPress = useCallback((commentId: string, username: string) => {
        setReplyingTo(commentId);
        setReplyingToUsername(username);
        setNewComment(`@${username} `);
        commentInputRef.current?.focus();
    }, []);

    const handleCancelReply = useCallback(() => {
        setReplyingTo(null);
        setReplyingToUsername('');
        setNewComment('');
        commentInputRef.current?.blur();
    }, []);

    const handleInputChange = useCallback((text: string) => {
        setNewComment(text);
        setIsTyping(true);

        const timer = setTimeout(() => {
            setIsTyping(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleCommentLike = useCallback(async (commentId: string, isCurrentlyLiked: boolean) => {
        try {

            // API call - không dùng optimistic update
            if (isCurrentlyLiked) {
                await dispatch(unlikeComment(commentId)).unwrap();
            } else {
                await dispatch(likeComment(commentId)).unwrap();
            }


            // Delay nhỏ để server kịp update database  
            setTimeout(async () => {
                await dispatch(getComments(postId));
            }, 200);

        } catch (error) {
            console.error('❌ Like/Unlike error:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể thực hiện thao tác này',
                visibilityTime: 2000,
            });
        }
    }, [dispatch, postId]);

    const renderReplyItem = useCallback(({ reply }: { reply: any }) => {
        if (!reply || !reply.id || !reply.content || !reply.author) {
            return null;
        }

        return (
            <View style={styles.replyItem}>
                <View style={styles.replyLine} />
                <Image
                    source={{
                        uri: reply.author.profilePic || 'https://randomuser.me/api/portraits/men/10.jpg'
                    }}
                    style={styles.replyProfilePic}
                />
                <View style={styles.replyContent}>
                    <View style={styles.commentHeader}>
                        <Text style={styles.commentUsername}>
                            {reply.author.username}
                        </Text>
                        <Text style={styles.commentTime}>
                            {reply.createdAt ? new Date(reply.createdAt).toLocaleDateString() : ''}
                        </Text>
                    </View>
                    <Text style={styles.commentText}>
                        {reply.content}
                    </Text>
                    <View style={styles.commentActions}>
                        <TouchableOpacity
                            style={styles.commentLikeButton}
                            onPress={() => handleCommentLike(reply.id, reply.isLike || false)}
                        >
                            <FontAwesome
                                name={reply.isLike ? 'heart' : 'heart-o'}
                                size={12}
                                color={reply.isLike ? '#e74c3c' : '#8e8e8e'}
                            />
                            <Text style={[styles.commentLikeCount, reply.isLike && styles.commentLikeCountActive]}>
                                {reply.likeCount || 0}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.commentReplyButton}
                            onPress={() => handleReplyPress(reply.parentId, reply.author.username)}
                        >
                            <Text style={styles.commentReplyText}>Trả lời</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }, [handleCommentLike, handleReplyPress]);

    const renderCommentItem = useCallback(({ item, index }: { item: any; index: number }) => {
        if (!item || !item.id || !item.content || !item.author || !item.author.username) {
            return null;
        }

        if (item.parentId) {
            return null;
        }

        const replies = reduxComments?.filter(comment =>
            comment.parentId === item.id
        ) || [];

        return (
            <View style={styles.commentItemContainer}>
                <View style={styles.commentItem}>
                    <Image
                        source={{
                            uri: item.author.profilePic || 'https://randomuser.me/api/portraits/men/10.jpg'
                        }}
                        style={styles.commentProfilePic}
                    />
                    <View style={styles.commentContent}>
                        <View style={styles.commentHeader}>
                            <Text style={styles.commentUsername}>
                                {item.author.username}
                            </Text>
                            <Text style={styles.commentTime}>
                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                            </Text>
                        </View>
                        <Text style={styles.commentText}>
                            {item.content}
                        </Text>
                        <View style={styles.commentActions}>
                            <TouchableOpacity
                                style={styles.commentLikeButton}
                                onPress={() => handleCommentLike(item.id, item.isLike || false)}
                            >
                                <FontAwesome
                                    name={item.isLike ? 'heart' : 'heart-o'}
                                    size={12}
                                    color={item.isLike ? '#e74c3c' : '#8e8e8e'}
                                />
                                <Text style={[styles.commentLikeCount, item.isLike && styles.commentLikeCountActive]}>
                                    {item.likeCount || 0}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.commentReplyButton}
                                onPress={() => handleReplyPress(item.id, item.author.username)}
                            >
                                <Text style={styles.commentReplyText}>Trả lời</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {replies.length > 0 && (
                    <View style={styles.repliesContainer}>
                        {replies.map((reply, replyIndex) => (
                            <View key={reply.id || `reply-${item.id}-${replyIndex}-${reply.createdAt || Date.now()}`}>
                                {renderReplyItem({ reply })}
                            </View>
                        ))}
                    </View>
                )}

                {replyingTo === item.id && (
                    <View style={styles.replyingIndicator}>
                        <View style={styles.replyLine} />
                        <Text style={styles.replyingText}>Đang soạn trả lời...</Text>
                    </View>
                )}
            </View>
        );
    }, [reduxComments, handleCommentLike, handleReplyPress, replyingTo, renderReplyItem]);

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Bình luận ({currentCommentCount})</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Feather name="x" size={24} color="#262626" />
                    </TouchableOpacity>
                </View>

                {replyingTo && (
                    <View style={styles.replyIndicator}>
                        <Text style={styles.replyText}>
                            Đang trả lời <Text style={styles.replyUsername}>@{replyingToUsername}</Text>
                        </Text>
                        <TouchableOpacity onPress={handleCancelReply} style={styles.cancelReplyButton}>
                            <Feather name="x" size={16} color="#8e8e8e" />
                        </TouchableOpacity>
                    </View>
                )}

                <FlatList
                    data={reduxComments || []}
                    renderItem={renderCommentItem}
                    keyExtractor={(item, index) => item.id || `comment-${index}-${item.createdAt || Date.now()}`}
                    style={styles.commentsList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        loadingComment ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#3897f0" />
                                <Text style={styles.loadingText}>Đang tải bình luận...</Text>
                            </View>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
                                <Text style={styles.emptySubText}>Hãy là người đầu tiên bình luận!</Text>
                            </View>
                        )
                    }
                />

                <View style={styles.commentInputContainer}>
                    <Image
                        source={{
                            uri: user.profile?.profilePic || 'https://randomuser.me/api/portraits/men/10.jpg',
                        }}
                        style={styles.commentInputProfilePic}
                    />
                    <TextInput
                        ref={commentInputRef}
                        style={styles.commentInput}
                        placeholder={replyingTo ? `Trả lời ${replyingToUsername}...` : "Thêm bình luận..."}
                        value={newComment}
                        onChangeText={handleInputChange}
                        maxLength={500}
                        returnKeyType="send"
                        onSubmitEditing={handleAddComment}
                        enablesReturnKeyAutomatically={true}
                        multiline
                        blurOnSubmit={false}
                    />
                    <TouchableOpacity
                        style={[
                            styles.commentSendButton,
                            newComment.trim() && !loadingComment ? styles.commentSendButtonActive : {}
                        ]}
                        onPress={handleAddComment}
                        disabled={!newComment.trim() || loadingComment}
                    >
                        {loadingComment ? (
                            <ActivityIndicator size="small" color="#3897f0" />
                        ) : (
                            <Feather
                                name="send"
                                size={20}
                                color={newComment.trim() ? '#3897f0' : '#8e8e8e'}
                            />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: BACKGROUND,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#262626',
    },
    closeButton: {
        padding: 4,
    },
    replyIndicator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    replyText: {
        fontSize: 14,
        color: '#6c757d',
    },
    replyUsername: {
        fontWeight: '600',
        color: '#3897f0',
    },
    cancelReplyButton: {
        padding: 4,
    },
    commentsList: {
        flex: 1,
        paddingHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6c757d',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6c757d',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#8e8e8e',
    },
    commentItemContainer: {
        paddingVertical: 12,
    },
    commentItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    commentProfilePic: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    commentContent: {
        flex: 1,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    commentUsername: {
        fontSize: 14,
        fontWeight: '600',
        color: '#262626',
        marginRight: 8,
    },
    commentTime: {
        fontSize: 12,
        color: '#8e8e8e',
    },
    commentText: {
        fontSize: 14,
        color: '#262626',
        lineHeight: 18,
        marginBottom: 8,
    },
    optimisticText: {
        opacity: 0.7,
        fontStyle: 'italic',
    },
    commentActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentLikeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    commentLikeCount: {
        fontSize: 12,
        color: '#8e8e8e',
        marginLeft: 4,
    },
    commentLikeCountActive: {
        color: '#e74c3c',
    },
    commentReplyButton: {
        paddingVertical: 4,
    },
    commentReplyText: {
        fontSize: 12,
        color: '#8e8e8e',
        fontWeight: '600',
    },
    repliesContainer: {
        marginTop: 8,
        marginLeft: 44,
    },
    replyItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    replyLine: {
        width: 1,
        backgroundColor: '#e0e0e0',
        marginRight: 12,
        alignSelf: 'stretch',
    },
    replyProfilePic: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    replyContent: {
        flex: 1,
    },
    replyingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginLeft: 44,
    },
    replyingText: {
        fontSize: 12,
        color: '#3897f0',
        fontStyle: 'italic',
        marginLeft: 12,
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: BACKGROUND,
    },
    commentInputProfilePic: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 14,
        maxHeight: 100,
        marginRight: 8,
    },
    commentSendButton: {
        padding: 8,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    commentSendButtonActive: {
        backgroundColor: 'rgba(56, 151, 240, 0.1)',
    },
});

export default CommentSection; 