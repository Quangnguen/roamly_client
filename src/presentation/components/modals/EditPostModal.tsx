import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    FlatList,
    Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { updatePost } from '../../redux/slices/postSlice';
import Toast from 'react-native-toast-message';
import { Post } from '../../../domain/models/Post';

interface ResponseInterface<T> {
    data: T;
    message: string;
    status: string;
    statusCode: number;
}

const { width } = Dimensions.get('window');
const imageSize = (width - 60) / 3;

interface EditPostModalProps {
    visible: boolean;
    onClose: () => void;
    post: {
        caption: string;
        location: string | null;
        isPublic: boolean;
        images: { uri: string }[];
    };
    postId?: string;
}

const EditPostModal: React.FC<EditPostModalProps> = ({
    visible,
    onClose,
    post,
    postId
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const [caption, setCaption] = useState(post.caption);
    const [location, setLocation] = useState(post.location || '');
    const [isPublic, setIsPublic] = useState(post.isPublic);
    const [originalImages, setOriginalImages] = useState(post.images);
    const [newImages, setNewImages] = useState<{ uri: string }[]>([]);
    const [removedImages, setRemovedImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleClose = () => {
        setCaption(post.caption);
        setLocation(post.location || '');
        setIsPublic(post.isPublic);
        setOriginalImages(post.images);
        setNewImages([]);
        setRemovedImages([]);
        onClose();
    };

    const handleSave = async () => {
        if (!postId) {
            Toast.show({
                type: 'error',
                text1: 'Không thể cập nhật bài viết',
                text2: 'ID bài viết không hợp lệ',
            });
            return;
        }

        try {
            setIsLoading(true);

            // Tạo FormData
            const formData = new FormData();

            // Thêm caption nếu có thay đổi
            if (caption !== post.caption) {
                formData.append('caption', caption);
            }

            // Thêm location nếu có thay đổi
            if (location !== post.location) {
                formData.append('location', location);
            }

            // Thêm các ảnh mới
            if (newImages.length > 0) {
                newImages.forEach((image, index) => {
                    formData.append('images', {
                        uri: image.uri,
                        type: 'image/jpeg',
                        name: `image-${index}.jpg`,
                    } as any);
                });
            }

            // Thêm danh sách URL ảnh hiện tại (không bị xóa)
            // originalImages.forEach(image => {
            //     if (!removedImages.includes(image.uri)) {
            //         formData.append('imageUrl', image.uri);
            //     }
            // });

            // Thêm danh sách ảnh cần xóa
            removedImages.forEach(imageUrl => {
                formData.append('removedImages', imageUrl);
            });

            // Gọi API cập nhật bài viết
            const result = await dispatch(updatePost({ postId, formData }));

            if (result.meta.requestStatus === 'fulfilled') {
                // Cập nhật thông tin bài viết trong state
                const updatedPost = (result.payload as ResponseInterface<Post>).data;

                // Cập nhật state của modal
                setCaption(updatedPost.caption);
                setLocation(updatedPost.location || '');
                setIsPublic(updatedPost.isPublic);
                setOriginalImages(updatedPost.imageUrl.map((uri: string) => ({ uri })));
                setNewImages([]);
                setRemovedImages([]);

                Toast.show({
                    type: 'success',
                    text1: 'Đã cập nhật bài viết thành công',
                });
                onClose();
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Không thể cập nhật bài viết',
                    text2: 'Vui lòng thử lại sau',
                });
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Có lỗi xảy ra khi cập nhật bài viết',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 1,
            });

            if (!result.canceled) {
                const selectedImages = result.assets.map(asset => ({ uri: asset.uri }));
                setNewImages([...newImages, ...selectedImages]);
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Không thể chọn ảnh',
                text2: 'Vui lòng thử lại sau',
            });
        }
    };

    const handleDeleteOriginalImage = (index: number) => {
        const newOriginalImages = [...originalImages];
        const removedImage = newOriginalImages.splice(index, 1)[0];
        setOriginalImages(newOriginalImages);
        setRemovedImages([...removedImages, removedImage.uri]);
    };

    const handleDeleteNewImage = (index: number) => {
        const updatedNewImages = [...newImages];
        updatedNewImages.splice(index, 1);
        setNewImages(updatedNewImages);
    };

    const renderImageItem = (
        { item, index }: { item: { uri: string }, index: number },
        isOriginal: boolean
    ) => (
        <View style={styles.imageItem}>
            <Image source={{ uri: item.uri }} style={styles.gridImage} />
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => isOriginal ? handleDeleteOriginalImage(index) : handleDeleteNewImage(index)}
            >
                <MaterialIcons name="delete" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <TouchableOpacity
                style={styles.modalContainer}
                activeOpacity={1}
                onPress={handleClose}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.modalContent}
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Chỉnh sửa bài viết</Text>
                        <TouchableOpacity
                            onPress={handleSave}
                            style={[styles.saveButton, isLoading && styles.disabledButton]}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Text style={styles.saveButtonText}>Đang lưu...</Text>
                            ) : (
                                <Text style={styles.saveButtonText}>Lưu</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form}>
                        {/* Original Images Section */}
                        <View style={styles.imageSection}>
                            <View style={styles.imageSectionHeader}>
                                <Text style={styles.label}>Ảnh hiện tại</Text>
                                {originalImages.length === 0 && (
                                    <Text style={styles.emptyText}>Chưa có ảnh nào</Text>
                                )}
                            </View>

                            {originalImages.length > 0 && (
                                <FlatList
                                    data={originalImages}
                                    renderItem={(props) => renderImageItem(props, true)}
                                    keyExtractor={(_, index) => `original_${index}`}
                                    numColumns={3}
                                    scrollEnabled={false}
                                    contentContainerStyle={styles.imageGrid}
                                />
                            )}
                        </View>

                        {/* New Images Section */}
                        <View style={styles.imageSection}>
                            <View style={styles.imageSectionHeader}>
                                <Text style={styles.label}>Ảnh mới thêm</Text>
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={handleAddImage}
                                >
                                    <Ionicons name="add-circle-outline" size={24} color="#0095f6" />
                                    <Text style={styles.addButtonText}>Thêm ảnh</Text>
                                </TouchableOpacity>
                            </View>

                            {newImages.length > 0 ? (
                                <FlatList
                                    data={newImages}
                                    renderItem={(props) => renderImageItem(props, false)}
                                    keyExtractor={(_, index) => `new_${index}`}
                                    numColumns={3}
                                    scrollEnabled={false}
                                    contentContainerStyle={styles.imageGrid}
                                />
                            ) : (
                                <TouchableOpacity
                                    style={styles.emptyImageContainer}
                                    onPress={handleAddImage}
                                >
                                    <Ionicons name="images-outline" size={40} color="#666" />
                                    <Text style={styles.emptyImageText}>Thêm ảnh mới</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Caption Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Nội dung</Text>
                            <TextInput
                                style={styles.captionInput}
                                value={caption}
                                onChangeText={setCaption}
                                multiline
                                placeholder="Nhập nội dung bài viết..."
                                placeholderTextColor="#666"
                            />
                        </View>

                        {/* Location Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Địa điểm</Text>
                            <TextInput
                                style={styles.input}
                                value={location}
                                onChangeText={setLocation}
                                placeholder="Nhập địa điểm..."
                                placeholderTextColor="#666"
                            />
                        </View>

                        {/* Privacy Setting */}
                        <View style={styles.privacyContainer}>
                            <Text style={styles.label}>Quyền riêng tư</Text>
                            <TouchableOpacity
                                style={styles.privacyButton}
                                onPress={() => setIsPublic(!isPublic)}
                            >
                                <Ionicons
                                    name={isPublic ? 'earth' : 'lock-closed'}
                                    size={20}
                                    color="#000"
                                />
                                <Text style={styles.privacyText}>
                                    {isPublic ? 'Công khai' : 'Riêng tư'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '90%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: '#0095f6',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    form: {
        padding: 15,
    },
    imageSection: {
        marginBottom: 20,
        backgroundColor: '#f8f8f8',
        padding: 10,
        borderRadius: 10,
    },
    imageSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#0095f6',
        marginLeft: 5,
        fontWeight: '600',
    },
    imageGrid: {
        gap: 5,
    },
    imageItem: {
        width: imageSize,
        height: imageSize,
        marginRight: 5,
        marginBottom: 5,
        position: 'relative',
    },
    gridImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    deleteButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 15,
        padding: 5,
    },
    emptyImageContainer: {
        width: '100%',
        height: 150,
        backgroundColor: '#fff',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
    },
    emptyImageText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
    },
    emptyText: {
        color: '#666',
        fontStyle: 'italic',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#262626',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
    },
    captionInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        height: 100,
        textAlignVertical: 'top',
    },
    privacyContainer: {
        marginBottom: 20,
    },
    privacyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 5,
    },
    privacyText: {
        marginLeft: 10,
        fontSize: 16,
    },
});

export default EditPostModal; 