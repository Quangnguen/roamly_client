import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRIMARY } from '@/src/const/constants';

interface DestinationActionsProps {
    isLiked: boolean;
    onToggleLike: () => void;
    rating: number;
    reviewCount: number;
    onViewReviews: () => void;
    onAddReview: () => void;
}

const DestinationActions: React.FC<DestinationActionsProps> = ({
    isLiked,
    onToggleLike,
    rating,
    reviewCount,
    onViewReviews,
    onAddReview
}) => {
    return (
        <View style={styles.container}>
            {/* Nút yêu thích */}
            <TouchableOpacity
                style={[styles.followButton, isLiked && styles.followingButton]}
                onPress={onToggleLike}
                activeOpacity={0.7}
            >
                <Ionicons name={isLiked ? "heart" : "heart-outline"} size={16} color={isLiked ? "#FF3B30" : "#fff"} />
                <Text style={[styles.followButtonText, isLiked && styles.followingButtonText]}>
                    {isLiked ? 'Đã thích' : 'Yêu thích'}
                </Text>
            </TouchableOpacity>

            {/* Rating và Reviews */}
            <View style={styles.reviewsSection}>
                {rating > 0 ? (
                    <TouchableOpacity style={styles.ratingContainer} onPress={onViewReviews}>
                        <Ionicons name="star" size={20} color="#FFD700" />
                        <Text style={styles.ratingText}>
                            {rating.toFixed(1)} ({reviewCount} đánh giá)
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color="#666" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.noReviewsContainer}>
                        <Ionicons name="chatbubble-outline" size={24} color="#666" />
                        <Text style={styles.noReviewsText}>Chưa có đánh giá</Text>
                        <TouchableOpacity
                            style={styles.addFirstReviewButton}
                            onPress={onAddReview}
                        >
                            <Ionicons name="add-circle" size={16} color="#fff" />
                            <Text style={styles.addFirstReviewText}>Thêm đánh giá đầu tiên</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
    },
    followButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: PRIMARY,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginVertical: 16,
    },
    followingButton: {
        backgroundColor: '#FFECEC',
        borderColor: '#FF3B30',
        borderWidth: 1,
    },
    followButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    followingButtonText: {
        color: '#FF3B30',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    reviewsSection: {
        marginVertical: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    ratingText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    noReviewsContainer: {
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        marginVertical: 8,
    },
    noReviewsText: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
        marginBottom: 12,
        textAlign: 'center',
    },
    addFirstReviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: PRIMARY,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    addFirstReviewText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
});

export default DestinationActions;
