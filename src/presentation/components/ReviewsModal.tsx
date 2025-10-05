import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
    Dimensions,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImageViewing from 'react-native-image-viewing';
import { BACKGROUND, PRIMARY } from '@/src/const/constants';
import { Review } from '@/src/types/responses/DestinationResponseInterface';

const { width, height } = Dimensions.get('window');

interface ReviewsModalProps {
    visible: boolean;
    onClose: () => void;
    reviews: Review[];
    loading: boolean;
    error: string | null;
    destinationName: string;
    onRetry: () => void;
    onAddReview?: () => void; // Optional callback for adding review
}

const ReviewsModal: React.FC<ReviewsModalProps> = ({
    visible,
    onClose,
    reviews,
    loading,
    error,
    destinationName,
    onRetry,
    onAddReview
}) => {
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentImages, setCurrentImages] = useState<{ uri: string }[]>([]);

    const openImageViewer = (images: string[], startIndex: number = 0) => {
        setCurrentImages(images.map(uri => ({ uri })));
        setCurrentImageIndex(startIndex);
        setImageViewerVisible(true);
    };

    const renderReview = ({ item: review }: { item: Review }) => (
        <View style={styles.reviewItem}>
            {/* User Info */}
            <View style={styles.userInfo}>
                <Image
                    source={review.user.profilePic ? { uri: review.user.profilePic } : require('../../../assets/images/avatar-test.jpg')}
                    style={styles.avatar}
                />
                <View style={styles.userDetails}>
                    <Text style={styles.username}>{review.user.name}</Text>
                    <View style={styles.ratingAndDate}>
                        <View style={styles.ratingRow}>
                            {[...Array(5)].map((_, index) => (
                                <Ionicons
                                    key={index}
                                    name={index < review.rating ? "star" : "star-outline"}
                                    size={14}
                                    color="#FFD700"
                                />
                            ))}
                            <Text style={styles.ratingNumber}>{review.rating}/5</Text>
                        </View>
                        <Text style={styles.date}>
                            {new Date(review.visitDate).toLocaleDateString('vi-VN')}
                        </Text>
                    </View>
                </View>
                {review.isVerified && (
                    <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                        <Text style={styles.verifiedText}>Đã xác thực</Text>
                    </View>
                )}
            </View>

            {/* Review Content */}
            <Text style={styles.comment}>{review.comment}</Text>

            {/* Review Images */}
            {review.imageUrl && review.imageUrl.length > 0 && (
                <View style={styles.imagesContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {review.imageUrl.map((imageUri, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => openImageViewer(review.imageUrl, index)}
                            >
                                <Image
                                    source={{ uri: imageUri }}
                                    style={styles.reviewImage}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Review Date */}
            <Text style={styles.createdAt}>
                Đánh giá vào {new Date(review.createdAt).toLocaleDateString('vi-VN')}
            </Text>
        </View>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={PRIMARY} />
                    <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.centerContent}>
                    <Ionicons name="alert-circle" size={48} color="#FF3B30" />
                    <Text style={styles.errorText}>Không thể tải đánh giá</Text>
                    <Text style={styles.errorSubtext}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                        <Text style={styles.retryButtonText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (reviews.length === 0) {
            return (
                <View style={styles.centerContent}>
                    <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
                </View>
            );
        }

        return (
            <FlatList
                data={reviews}
                renderItem={renderReview}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.reviewsList}
            />
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.backdrop}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity
                                onPress={onAddReview}
                                style={styles.addReviewButton}
                                disabled={!onAddReview}
                            >
                                <Ionicons name="add-circle" size={20} color={PRIMARY} />
                                <Text style={styles.addReviewText}>Thêm đánh giá</Text>
                            </TouchableOpacity>

                            <Text style={styles.headerTitle}>
                                Đánh giá - {destinationName}
                            </Text>

                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <View style={styles.content}>
                            {renderContent()}
                        </View>
                    </View>
                </View>

                {/* Image Viewer */}
                <ImageViewing
                    images={currentImages}
                    imageIndex={currentImageIndex}
                    visible={imageViewerVisible}
                    onRequestClose={() => setImageViewerVisible(false)}
                />
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxHeight: '80%',
        minHeight: '40%',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
    addReviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 16,
        backgroundColor: '#f0f8ff',
    },
    addReviewText: {
        fontSize: 12,
        color: PRIMARY,
        fontWeight: '600',
        marginLeft: 4,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        maxHeight: height * 0.6,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        minHeight: 200,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF3B30',
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 8,
    },
    errorSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: PRIMARY,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
        textAlign: 'center',
    },
    reviewsList: {
        padding: 16,
    },
    reviewItem: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    userDetails: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    ratingAndDate: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingNumber: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    date: {
        fontSize: 12,
        color: '#666',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E8',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    verifiedText: {
        fontSize: 12,
        color: '#4CAF50',
        marginLeft: 4,
        fontWeight: '600',
    },
    comment: {
        fontSize: 15,
        lineHeight: 22,
        color: '#333',
        marginBottom: 12,
    },
    imagesContainer: {
        marginBottom: 12,
    },
    reviewImage: {
        width: 120,
        height: 80,
        borderRadius: 8,
        marginRight: 8,
    },
    createdAt: {
        fontSize: 12,
        color: '#666',
        textAlign: 'right',
    },
});

export default ReviewsModal;
