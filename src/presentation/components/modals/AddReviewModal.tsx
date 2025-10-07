import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { PRIMARY } from '@/src/const/constants';

interface AddReviewModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (review: {
        rating: number;
        comment: string;
        visitDate: string;
        images: string[];
    }) => void;
    destinationName: string;
    loading?: boolean;
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({
    visible,
    onClose,
    onSubmit,
    destinationName,
    loading = false
}) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [visitDate, setVisitDate] = useState('');
    const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

    const pickImageFromGallery = async () => {
        try {
            // Request permission
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Permission needed', 'Permission to access camera roll is required!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                allowsMultipleSelection: true,
                selectionLimit: 5, // Max 5 images
            });

            if (!result.canceled) {
                // Limit to 5 images total
                const newImages = [...images, ...result.assets].slice(0, 5);
                setImages(newImages);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const takePhoto = async () => {
        try {
            // Request permission
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Permission needed', 'Permission to access camera is required!');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                // Limit to 5 images total
                const newImages = [...images, ...result.assets].slice(0, 5);
                setImages(newImages);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
    };

    const showImageOptions = () => {
        Alert.alert(
            'Chọn hình ảnh',
            'Bạn muốn lấy ảnh từ đâu?',
            [
                { text: 'Camera', onPress: takePhoto },
                { text: 'Thư viện', onPress: pickImageFromGallery },
                { text: 'Hủy', style: 'cancel' },
            ]
        );
    };

    const handleSubmit = () => {
        if (!comment.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập nội dung đánh giá');
            return;
        }

        onSubmit({
            rating,
            comment: comment.trim(),
            visitDate: visitDate || new Date().toISOString().split('T')[0],
            images: images.map(img => img.uri) // Convert to string array for submission
        });

        // Reset form
        setRating(5);
        setComment('');
        setVisitDate('');
        setImages([]);
        onClose();
    };

    const renderStars = () => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => setRating(star)}
                        style={styles.starButton}
                    >
                        <Ionicons
                            name={star <= rating ? "star" : "star-outline"}
                            size={24}
                            color="#FFD700"
                        />
                    </TouchableOpacity>
                ))}
                <Text style={styles.ratingText}>{rating}/5</Text>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
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
                            <Text style={styles.headerTitle}>
                                Thêm đánh giá - {destinationName}
                            </Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Form */}
                        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                            {/* Rating */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Đánh giá</Text>
                                {renderStars()}
                            </View>

                            {/* Comment */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Nội dung đánh giá</Text>
                                <TextInput
                                    style={styles.commentInput}
                                    multiline
                                    placeholder="Hãy chia sẻ trải nghiệm của bạn..."
                                    value={comment}
                                    onChangeText={setComment}
                                    maxLength={500}
                                />
                                <Text style={styles.charCount}>
                                    {comment.length}/500
                                </Text>
                            </View>

                            {/* Visit Date */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Ngày thăm quan</Text>
                                <TextInput
                                    style={styles.dateInput}
                                    placeholder="YYYY-MM-DD (tùy chọn)"
                                    value={visitDate}
                                    onChangeText={setVisitDate}
                                />
                            </View>

                            {/* Images */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>
                                    Hình ảnh ({images.length}/5)
                                </Text>

                                {/* Selected Images */}
                                {images.length > 0 && (
                                    <View style={styles.selectedImagesContainer}>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            {images.map((image, index) => (
                                                <View key={index} style={styles.imageWrapper}>
                                                    <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                                                    <TouchableOpacity
                                                        style={styles.removeImageButton}
                                                        onPress={() => removeImage(index)}
                                                    >
                                                        <Ionicons name="close-circle" size={20} color="#ff4444" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                {/* Add Image Button */}
                                {images.length < 5 && (
                                    <TouchableOpacity style={styles.imageButton} onPress={showImageOptions}>
                                        <Ionicons name="camera" size={24} color="#666" />
                                        <Text style={styles.imageButtonText}>
                                            {images.length === 0 ? 'Thêm hình ảnh' : 'Thêm ảnh khác'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </ScrollView>

                        {/* Submit Button */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
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
        width: '95%',
        maxHeight: '90%',
        minHeight: '50%',
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
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    starsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starButton: {
        padding: 4,
    },
    ratingText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        minHeight: 100,
        textAlignVertical: 'top',
        fontSize: 16,
    },
    charCount: {
        fontSize: 12,
        color: '#666',
        textAlign: 'right',
        marginTop: 4,
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 20,
        backgroundColor: '#fafafa',
    },
    imageButtonText: {
        fontSize: 16,
        color: '#666',
        marginLeft: 8,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    submitButton: {
        backgroundColor: PRIMARY,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    selectedImagesContainer: {
        marginBottom: 12,
    },
    imageWrapper: {
        position: 'relative',
        marginRight: 12,
    },
    selectedImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
});

export default AddReviewModal;
