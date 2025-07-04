import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    Image,
    Dimensions,
    Alert,
    Modal
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { BACKGROUND } from "@/src/const/constants";
import { RootStackParamList } from "../navigation/AppNavigator";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from "../redux/hook";
import { getMessages, addMessage, addOptimisticMessage, updateMessageStatus, setSelectedConversation } from "../redux/slices/chatSlice";
import { MessageResponseInterface } from "../../types/messageResponseInterface";
import Toast from "react-native-toast-message";
import { sendMessage } from "../redux/slices/chatSlice";

type ChatDetailRouteProp = RouteProp<RootStackParamList, 'ChatDetailPage'>;

// Kích thước ảnh trong thư viện
const { width } = Dimensions.get('window');
const IMAGE_SIZE = width / 4 - 12;

// Định nghĩa lại type cho ảnh
type GalleryImage = {
    id: string;
    uri: string;
};

const ChatDetailPage: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<ChatDetailRouteProp>();
    const { chatId, name, avatar } = route.params;
    const flatListRef = React.useRef<FlatList<MessageResponseInterface>>(null);
    const isNewMessageSent = useRef(false);
    const isLoadingMore = useRef(false); // ✅ Track load more state

    const dispatch = useAppDispatch();
    const {
        messages,
        messagesLoading,
        hasMoreMessages,
        currentPage,
        selectedConversation
    } = useAppSelector((state) => state.chat);

    const { profile: currentUser } = useAppSelector((state) => state.auth);

    useEffect(() => {
        // Set selected conversation khi vào chat detail
        if (chatId) {
            dispatch(setSelectedConversation({
                id: chatId,
                isGroup: false,
                name: name,
                createdById: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                participants: [{
                    id: chatId,
                    conversationId: chatId,
                    userId: chatId,
                    joinedAt: new Date().toISOString(),
                    user: {
                        id: chatId,
                        username: name,
                        profilePic: avatar
                    }
                }],
                lastMessage: null
            }));

            // Load messages đầu tiên
            dispatch(getMessages({
                conversationId: chatId,
                limit: 0,
                before: "test"
            }));
        }
    }, [chatId, dispatch]);

    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);

    // Xin quyền truy cập thư viện ảnh khi component mount
    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Xin lỗi, chúng tôi cần quyền truy cập thư viện ảnh!');
            }
        })();
    }, []);

    // ✅ Tự động scroll xuống cuối chỉ khi có tin nhắn mới (KHÔNG phải load more)
    useEffect(() => {
        if (messages.length > 0 && !messagesLoading) {
            // Chỉ scroll nếu KHÔNG phải load more
            if (!isLoadingMore.current) {
                setTimeout(() => {
                    // Scroll với animation nếu là tin nhắn user gửi, không animation cho tin nhắn từ người khác
                    const shouldAnimate = isNewMessageSent.current;
                    flatListRef.current?.scrollToEnd({ animated: shouldAnimate });

                    if (isNewMessageSent.current) {
                        isNewMessageSent.current = false; // Reset flag sau khi scroll
                    }

                    console.log('📱 Auto scroll to bottom:', {
                        animated: shouldAnimate,
                        messagesCount: messages.length
                    });
                }, 100);
            } else {
                // Reset load more flag sau khi load xong
                isLoadingMore.current = false;
                console.log('📱 Load more completed - maintaining scroll position');
            }
        }
    }, [messages.length, messagesLoading]);

    // Load more messages khi scroll lên đầu
    const handleLoadMore = () => {
        if (!messagesLoading && hasMoreMessages && chatId) {
            // ✅ Set flag để prevent auto scroll
            isLoadingMore.current = true;

            // ✅ Sử dụng message cũ nhất (đầu tiên) để load messages cũ hơn
            // Vì array được sắp xếp: [message_cũ, ..., message_mới]
            const oldestMessageId = messages.length > 0 ? messages[0].id : '';

            console.log('🔄 Loading more messages before:', {
                oldestMessageId,
                totalMessages: messages.length,
                firstMessage: messages[0]?.content?.substring(0, 30) + '...'
            });

            dispatch(getMessages({
                conversationId: chatId,
                limit: 20,
                before: oldestMessageId
            }));
        }
    };

    // Handle scroll để detect khi scroll lên đầu (load more messages cũ)
    const handleScroll = (event: any) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

        // Kiểm tra nếu scroll gần đến đầu danh sách (tin nhắn cũ)
        if (contentOffset.y <= 100 && !messagesLoading && hasMoreMessages) {
            handleLoadMore();
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const handleGalleryPress = async () => {
        dismissKeyboard();
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh!');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 1,
            aspect: [4, 3],
        });

        if (!result.canceled && result.assets) {
            const newImages: GalleryImage[] = result.assets.map((asset, index) => {
                return {
                    id: asset.assetId || `${asset.uri}-${index}`,
                    uri: asset.uri,
                };
            });
            setGalleryImages(prevImages => [...newImages, ...prevImages]);
            setShowGallery(true);
        }
    };

    const handleCameraPress = async () => {
        dismissKeyboard();
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Lỗi', 'Cần cấp quyền truy cập camera!');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 1,
            aspect: [4, 3],
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const newImage: GalleryImage = {
                id: result.assets[0].assetId || `camera-${Date.now()}`,
                uri: result.assets[0].uri,
            };
            setGalleryImages(prevImages => [newImage, ...prevImages]);
            setShowGallery(true);
        }
    };

    const handleMicPress = () => {
        setIsRecording(!isRecording);
    };

    // Function để gửi tin nhắn
    const handleSendMessage = async (text: string, selectedFiles?: any[]) => {
        if (!selectedConversation?.id || (!text.trim() && (!selectedFiles || selectedFiles.length === 0))) return;

        const hasText = text.trim() !== '';
        const hasImages = selectedFiles && selectedFiles.length > 0;

        // Clear input và gallery ngay lập tức để UX mượt mà
        setNewMessage('');
        setGalleryImages([]);
        setShowGallery(false);
        isNewMessageSent.current = true;

        // Case 1: Chỉ có text
        if (hasText && !hasImages) {
            await sendSingleMessage(text.trim(), undefined);
        }
        // Case 2: Chỉ có ảnh  
        else if (!hasText && hasImages) {
            await sendSingleMessage("hinh anh", selectedFiles);
        }
        // Case 3: Có cả text và ảnh - gửi 2 tin nhắn riêng biệt
        else if (hasText && hasImages) {
            // Gửi tin nhắn text trước
            await sendSingleMessage(text.trim(), undefined);
            // Sau đó gửi tin nhắn ảnh với delay nhỏ
            setTimeout(() => {
                sendSingleMessage("hinh anh", selectedFiles);
            }, 100);
        }
    };

    // Helper function để gửi 1 tin nhắn
    const sendSingleMessage = async (content: string, files?: any[]) => {
        if (!selectedConversation?.id) return;

        // Tạo tempId cho tin nhắn tạm thời
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Tạo optimistic message để hiển thị ngay
        const optimisticMessage: MessageResponseInterface = {
            id: tempId,
            tempId: tempId,
            conversationId: selectedConversation.id,
            senderId: currentUser?.id || '',
            content: content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedForAll: false,
            seenBy: [],
            mediaUrls: files ? files.map((file: GalleryImage) => file.uri) : [],
            mediaType: files && files.length > 0 ? 'image' : null,
            pinned: false,
            sender: {
                id: currentUser?.id || '',
                username: currentUser?.username || '',
                profilePic: currentUser?.profilePic || ''
            },
            sendingStatus: 'sending'
        };

        // Hiển thị tin nhắn ngay lập tức trên UI
        dispatch(addOptimisticMessage(optimisticMessage));

        try {
            // Chuyển đổi galleryImages thành format file phù hợp cho API
            let apiFiles = undefined;
            if (files && files.length > 0) {
                apiFiles = files.map((image: GalleryImage) => ({
                    uri: image.uri,
                    type: 'image/jpeg',
                    name: `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`,
                }));

            }

            // Gửi tin nhắn thực sự
            const result = await dispatch(sendMessage({
                conversationId: selectedConversation.id,
                content: content,
                files: apiFiles
            })).unwrap();



            // Cập nhật trạng thái thành công
            dispatch(updateMessageStatus({
                tempId: tempId,
                message: result,
                status: 'sent'
            }));

        } catch (error) {
            // Cập nhật trạng thái thất bại
            dispatch(updateMessageStatus({
                tempId: tempId,
                status: 'failed'
            }));

            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể gửi tin nhắn. Vui lòng thử lại.',
            });
        }
    };

    // Example function để gửi tin nhắn với hình ảnh
    const handleSendMessageWithImage = async (text: string, imageUri: string) => {
        if (!selectedConversation?.id) return;

        try {
            // Tạo file object từ image URI (cho React Native)
            const file = {
                uri: imageUri,
                type: 'image/jpeg', // hoặc type phù hợp
                name: `image_${Date.now()}.jpg`,
            };

            await dispatch(sendMessage({
                conversationId: selectedConversation.id,
                content: text,
                files: [file]
            })).unwrap();

        } catch (error) {
            // Handle error
        }
    };

    const handleRemoveImage = (imageToRemove: GalleryImage) => {
        setGalleryImages(prevImages => {
            const updatedImages = prevImages.filter(img => img.id !== imageToRemove.id);
            if (updatedImages.length === 0) {
                setShowGallery(false);
            }
            return updatedImages;
        });
    };

    const renderMessage = ({ item }: { item: MessageResponseInterface }) => {
        const isMe = item.senderId === currentUser?.id;
        const timestamp = new Date(item.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Xác định màu và opacity dựa trên trạng thái
        const getMessageStyle = () => {
            if (item.sendingStatus === 'sending') {
                return [styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage, styles.sendingMessage];
            }
            if (item.sendingStatus === 'failed') {
                return [styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage, styles.failedMessage];
            }
            return [styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage];
        };

        // Icon trạng thái cho tin nhắn của mình
        const renderStatusIcon = () => {
            if (!isMe) return null;

            if (item.sendingStatus === 'sending') {
                return <Ionicons name="time" size={12} color="#999" style={styles.statusIcon} />;
            }
            if (item.sendingStatus === 'failed') {
                return <Ionicons name="alert-circle" size={12} color="#FF6B6B" style={styles.statusIcon} />;
            }
            if (item.sendingStatus === 'sent' || !item.sendingStatus) {
                return <Ionicons name="checkmark" size={12} color="#4CAF50" style={styles.statusIcon} />;
            }
            return null;
        };

        return (
            <View style={getMessageStyle()}>
                {item.mediaType === 'image' && item.mediaUrls.length > 0 ? (
                    <View>
                        <TouchableOpacity
                            onPress={() => {
                                // Chỉ cho phép xem ảnh nếu đã gửi thành công
                                if (item.sendingStatus !== 'sending' && item.sendingStatus !== 'failed') {
                                    handleImagePress(item.mediaUrls[0]);
                                }
                            }}
                            activeOpacity={item.sendingStatus === 'sending' ? 1 : 0.8}
                            delayPressIn={100}
                        >
                            <Image
                                source={{ uri: item.mediaUrls[0] }}
                                style={[
                                    styles.chatImage,
                                    item.sendingStatus === 'sending' && styles.sendingImage
                                ]}
                                resizeMode="cover"
                                onError={(e) => {
                                    if (item.sendingStatus !== 'sending') {
                                        Alert.alert('Lỗi', 'Không thể tải ảnh, vui lòng thử lại.');
                                    }
                                }}
                            />
                            {item.sendingStatus === 'sending' && (
                                <View style={styles.sendingOverlay}>
                                    <Text style={styles.sendingText}>Đang gửi...</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <View style={styles.timestampContainer}>
                            <Text style={styles.timestamp}>{timestamp}</Text>
                            {renderStatusIcon()}
                        </View>
                    </View>
                ) : (
                    <>
                        <Text style={[styles.messageText, item.sendingStatus === 'sending' && styles.sendingText]}>
                            {item.content}
                        </Text>
                        <View style={styles.timestampContainer}>
                            <Text style={styles.timestamp}>{timestamp}</Text>
                            {renderStatusIcon()}
                        </View>
                    </>
                )}
            </View>
        );
    };

    const renderGalleryItem = ({ item, index }: { item: GalleryImage, index: number }) => {
        if (item.id === 'camera') {
            return (
                <TouchableOpacity
                    style={styles.galleryItem}
                    onPress={handleCameraPress}
                    activeOpacity={0.7}
                >
                    <View style={styles.cameraIconContainer}>
                        <Ionicons name="camera" size={30} color="#555" />
                    </View>
                </TouchableOpacity>
            );
        }

        return (
            <View style={styles.galleryItemContainer}>
                <Image source={{ uri: item.uri }} style={styles.galleryImage} />
                <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(item)}
                >
                    <Ionicons name="close-circle" size={24} color="rgba(0,0,0,0.7)" />
                </TouchableOpacity>
            </View>
        );
    };

    const handlePressOutside = () => {
        if (showGallery) {
            setShowGallery(false);
            setGalleryImages([]);
            // Không xóa galleryImages để vẫn có thể gửi tin nhắn sau khi ẩn gallery
        }
    };

    const handleImagePress = (imageUri: string) => {
        setSelectedImageUri(imageUri);
        setShowImageModal(true);
    };

    const closeImageModal = () => {
        setShowImageModal(false);
        setSelectedImageUri(null);
    };

    // Optional: Emit typing event khi user đang gõ
    const handleTextChange = (text: string) => {
        setNewMessage(text);
        // Note: Typing events sẽ được handle trong future updates
    };

    return (
        <SafeAreaView style={styles.container} edges={[]}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 45 : 20}
            >
                <View style={styles.mainContent}>
                    <TouchableWithoutFeedback onPress={handlePressOutside}>
                        <View style={styles.header}>
                            <TouchableOpacity onPress={handleBack}>
                                <Ionicons name="chevron-back" size={24} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>{name}</Text>
                            <TouchableOpacity>
                                <Ionicons name="information-circle-outline" size={24} />
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>

                    {messagesLoading && messages.length === 0 ? (
                        <TouchableWithoutFeedback onPress={dismissKeyboard}>
                            <View style={styles.loadingContainer}>
                                <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    ) : messages.length === 0 ? (
                        <TouchableWithoutFeedback onPress={dismissKeyboard}>
                            <View style={styles.emptyContainer}>
                                <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
                                <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
                                <Text style={styles.emptySubText}>Hãy gửi tin nhắn đầu tiên!</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            renderItem={renderMessage}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.messagesContainer}
                            style={styles.flatListStyle}
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            onScrollBeginDrag={dismissKeyboard}
                        />
                    )}
                </View>

                <View style={styles.bottomContainer}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Nhập tin nhắn..."
                            placeholderTextColor="#999"
                            value={newMessage}
                            onChangeText={handleTextChange}
                            multiline
                            maxLength={1000}
                        />
                        <TouchableOpacity
                            style={[
                                styles.iconButton,
                                (showGallery || (!showGallery && galleryImages.length > 0)) && styles.activeIconButton
                            ]}
                            onPress={handleGalleryPress}
                        >
                            <Ionicons name="images" size={24} color={(showGallery || (!showGallery && galleryImages.length > 0)) ? "#3897F0" : "#555"} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={handleCameraPress}
                        >
                            <Ionicons name="camera" size={24} color="#555" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.iconButton,
                                isRecording && styles.activeIconButton
                            ]}
                            onPress={handleMicPress}
                        >
                            <Ionicons
                                name={isRecording ? "mic-off" : "mic"}
                                size={24}
                                color={isRecording ? "red" : "#555"}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.iconButton,
                                (newMessage.trim() !== '' || galleryImages.length > 0) ? styles.sendButton : null
                            ]}
                            onPress={() => handleSendMessage(newMessage, galleryImages.length > 0 ? galleryImages : undefined)}
                            activeOpacity={0.5}
                        >
                            <Ionicons
                                name="send"
                                size={24}
                                color={(newMessage.trim() !== '' || galleryImages.length > 0) ? "#fff" : "#555"}
                            />
                        </TouchableOpacity>
                    </View>

                    {isRecording && (
                        <View style={styles.recordingContainer}>
                            <View style={styles.recordingIndicator}>
                                <MaterialIcons name="fiber-manual-record" size={24} color="red" />
                                <Text style={styles.recordingText}>Đang ghi âm...</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.stopRecordingButton}
                                onPress={handleMicPress}
                            >
                                <Ionicons name="stop-circle" size={40} color="red" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {showGallery && galleryImages.length > 0 && (
                        <View style={styles.galleryWrapper}>
                            <FlatList
                                data={[{ id: 'camera', uri: '' }, ...galleryImages]}
                                renderItem={renderGalleryItem}
                                keyExtractor={item => item.id}
                                numColumns={4}
                                contentContainerStyle={styles.galleryGrid}
                                style={styles.galleryContainer}
                            />
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>

            {/* Modal phóng to hình ảnh */}
            <Modal
                visible={showImageModal}
                transparent={true}
                animationType="fade"
                onRequestClose={closeImageModal}
                statusBarTranslucent={true}
            >
                <View style={styles.imageModalContainer}>
                    <TouchableWithoutFeedback onPress={closeImageModal}>
                        <View style={styles.imageModalBackground} />
                    </TouchableWithoutFeedback>

                    <View style={styles.imageModalContent}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={closeImageModal}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="close" size={30} color="white" />
                        </TouchableOpacity>

                        {selectedImageUri && (
                            <TouchableWithoutFeedback onPress={closeImageModal}>
                                <Image
                                    source={{ uri: selectedImageUri }}
                                    style={styles.fullScreenImage}
                                    resizeMode="contain"
                                    onError={(e) => {
                                        Alert.alert('Lỗi', 'Không thể tải ảnh, vui lòng thử lại.');
                                        closeImageModal();
                                    }}
                                />
                            </TouchableWithoutFeedback>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND,
    },
    keyboardAvoidView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        paddingTop: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    messagesContainer: {
        padding: 16,
        paddingBottom: 16,
        flexGrow: 1,
    },
    flatListStyle: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    messageContainer: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 20,
        marginBottom: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#DCF8C6',
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#E5E5EA',
    },
    messageText: {
        fontSize: 16,
    },
    timestamp: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    bottomContainer: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        backgroundColor: BACKGROUND,
        paddingBottom: Platform.OS === 'ios' ? 12 : 12,
        marginBottom: Platform.OS === 'android' ? 0 : 0,
    },
    iconButton: {
        padding: 8,
    },
    activeIconButton: {
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
    },
    textInput: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        maxHeight: 100,
        marginRight: 8,
    },
    recordingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    recordingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recordingText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    stopRecordingButton: {
        padding: 5,
    },
    galleryWrapper: {
        width: '100%',
        backgroundColor: '#f0f0f0',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    galleryContainer: {
        maxHeight: 240,
    },
    galleryGrid: {
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    galleryItem: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderRadius: 10,
        margin: 5,
        overflow: 'hidden',
        backgroundColor: '#eee',
        alignItems: 'center',
        justifyContent: 'center',
    },
    galleryImage: {
        width: '100%',
        height: '100%',
    },
    cameraIconContainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainContent: {
        flex: 1,
        backgroundColor: BACKGROUND,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
    },
    galleryItemContainer: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderRadius: 10,
        margin: 5,
        overflow: 'visible',
        backgroundColor: '#eee',
    },
    removeImageButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 0,
    },
    chatImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginVertical: 5,
        backgroundColor: '#f0f0f0',
    },
    sendButton: {
        backgroundColor: '#3897F0',
        borderRadius: 50,
        padding: 10,
    },
    imageModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageModalBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    imageModalContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        right: 20,
        zIndex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 25,
        padding: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    fullScreenImage: {
        width: '100%',
        height: '100%',
    },
    badgeContainer: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    // Styles for message status
    sendingMessage: {
        opacity: 0.7,
    },
    failedMessage: {
        borderWidth: 1,
        borderColor: '#FF6B6B',
        backgroundColor: '#FFE6E6',
    },
    sendingImage: {
        opacity: 0.6,
    },
    sendingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    sendingText: {
        color: '#999',
        fontStyle: 'italic',
    },
    timestampContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
    },
    statusIcon: {
        marginLeft: 4,
    },
});

export default ChatDetailPage;