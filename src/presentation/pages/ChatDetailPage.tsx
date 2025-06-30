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
import { getMessages, addMessage, setSelectedConversation } from "../redux/slices/chatSlice";
import { MessageResponseInterface } from "../../types/messageResponseInterface";
import Toast from "react-native-toast-message";
import { sendMessage } from "../redux/slices/chatSlice";
import { socketService } from '@/src/services/socketService';

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
    const hasInitialScrolled = useRef(false);

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
            console.log('🔧 ChatDetailPage - Setting conversation:', { chatId, name, avatar });

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
            console.log('🔧 ChatDetailPage - Dispatching getMessages for:', chatId);
            dispatch(getMessages({
                conversationId: chatId,
                limit: 0,
                before: "test"
            }));
        }
    }, [chatId, dispatch]);

    // Debug state changes
    useEffect(() => {
        console.log('🔧 ChatDetailPage - Messages state updated:', {
            messagesCount: messages.length,
            messagesLoading,
            hasMoreMessages,
            currentPage,
            messages: messages.slice(0, 3) // Log first 3 messages
        });
    }, [messages, messagesLoading, hasMoreMessages, currentPage]);

    // Debug current user
    useEffect(() => {
        console.log('🔧 ChatDetailPage - Current user:', currentUser);
    }, [currentUser]);

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

    // Debug: Log messages changes
    useEffect(() => {
        console.log('🔍 Messages updated:', {
            length: messages.length,
            firstMessage: messages[0]?.content, // Tin nhắn cũ nhất
            lastMessage: messages[messages.length - 1]?.content // Tin nhắn mới nhất
        });
    }, [messages]);

    // Reset hasInitialScrolled khi chuyển conversation
    useEffect(() => {
        if (selectedConversation?.id) {
            hasInitialScrolled.current = false;
        }
    }, [selectedConversation?.id]);

    // Scroll khi có tin nhắn mới được gửi
    useEffect(() => {
        if (messages.length > 0 && isNewMessageSent.current) {
            console.log('📱 New message sent, scrolling to bottom');
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
                isNewMessageSent.current = false; // Reset flag sau khi scroll
            }, 100);
        }
    }, [messages[messages.length - 1]?.id]); // Theo dõi ID của tin nhắn cuối cùng

    // Load more messages khi scroll lên đầu
    const handleLoadMore = () => {
        if (!messagesLoading && hasMoreMessages && chatId) {
            dispatch(getMessages({
                conversationId: chatId,
                limit: 20,
                before: messages.length > 0 ? messages[0].id : '' // Lấy messages cũ hơn tin nhắn đầu tiên
            }));
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
            console.log("Đã chọn được", result.assets.length, "ảnh từ thư viện");
            const newImages: GalleryImage[] = result.assets.map((asset, index) => {
                console.log("URL ảnh được chọn:", asset.uri);
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
            console.log("Đã chụp được ảnh từ camera");
            console.log("URL ảnh từ camera:", result.assets[0].uri);
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

        try {
            // Set flag để biết đang gửi tin nhắn mới
            isNewMessageSent.current = true;

            // Dispatch sendMessage action
            const result = await dispatch(sendMessage({
                conversationId: selectedConversation.id,
                content: text.trim(),
                files: selectedFiles // Optional files array
            })).unwrap();

            console.log('✅ Message sent successfully:', result);

            // Clear input và gallery sau khi gửi thành công
            setNewMessage('');
            setGalleryImages([]);
            setShowGallery(false);

        } catch (error) {
            console.error('❌ Failed to send message:', error);
            isNewMessageSent.current = false; // Reset flag nếu có lỗi
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

            console.log('✅ Message with image sent successfully');

        } catch (error) {
            console.error('❌ Failed to send message with image:', error);
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

        return (
            <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
                {item.mediaType === 'image' && item.mediaUrls.length > 0 ? (
                    <View>
                        <TouchableOpacity
                            onPress={() => {
                                console.log("Đã nhấn vào ảnh:", item.mediaUrls[0]);
                                handleImagePress(item.mediaUrls[0]);
                            }}
                            activeOpacity={0.8}
                            delayPressIn={100} // Delay để phân biệt với scroll gesture
                        >
                            <Image
                                source={{ uri: item.mediaUrls[0] }}
                                style={styles.chatImage}
                                resizeMode="cover"
                                onError={(e) => {
                                    console.warn(`Lỗi tải ảnh: ${item.mediaUrls[0]}`, e.nativeEvent.error);
                                    Alert.alert('Lỗi', 'Không thể tải ảnh, vui lòng thử lại.');
                                }}
                            />
                        </TouchableOpacity>
                        <Text style={styles.timestamp}>{timestamp}</Text>
                    </View>
                ) : (
                    <>
                        <Text style={styles.messageText}>{item.content}</Text>
                        <Text style={styles.timestamp}>{timestamp}</Text>
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
            console.log("Đóng gallery từ handlePressOutside");
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

    // WebSocket listener cho tin nhắn real-time
    useEffect(() => {
        if (!chatId || !selectedConversation?.id) return;

        console.log('🔌 ChatDetailPage: Setting up WebSocket listeners for conversation:', chatId);

        // Handler cho tin nhắn mới
        const handleNewMessage = (data: any) => {
            console.log('📨 ChatDetailPage: Received new message:', data);

            // Chỉ xử lý nếu tin nhắn thuộc về conversation hiện tại
            if (data.conversationId === chatId || data.conversationId === selectedConversation.id) {
                console.log('📨 ChatDetailPage: Message belongs to current conversation, adding to messages');

                // Thêm message vào danh sách messages hiện tại
                if (data.message) {
                    dispatch(addMessage(data.message));

                    // Auto scroll xuống tin nhắn mới (nếu không phải tin nhắn của mình)
                    if (data.message.senderId !== currentUser?.id) {
                        setTimeout(() => {
                            flatListRef.current?.scrollToEnd({ animated: true });
                        }, 100);
                    }
                }
            } else {
                console.log('📨 ChatDetailPage: Message belongs to different conversation, ignoring');
            }
        };

        // Handler cho typing indicator
        const handleUserTyping = (data: any) => {
            console.log('⌨️ ChatDetailPage: User typing:', data);

            if (data.conversationId === chatId && data.userId !== currentUser?.id) {
                // TODO: Hiển thị typing indicator
                console.log(`${data.username || 'Ai đó'} đang gõ...`);
            }
        };

        // Handler cho user online/offline
        const handleUserOnline = (data: any) => {
            console.log('🟢 ChatDetailPage: User came online:', data);
            // TODO: Cập nhật online status
        };

        const handleUserOffline = (data: any) => {
            console.log('🔴 ChatDetailPage: User went offline:', data);
            // TODO: Cập nhật offline status
        };

        // Đăng ký listeners
        if (socketService.isConnected()) {
            console.log('✅ ChatDetailPage: Socket connected, registering listeners');

            // Các event names có thể có
            socketService.on('newMessage', handleNewMessage);
            socketService.on('messageReceived', handleNewMessage);
            socketService.on('new_message', handleNewMessage);
            socketService.on('message', handleNewMessage);

            // Typing events
            socketService.on('userTyping', handleUserTyping);
            socketService.on('user_typing', handleUserTyping);

            // Online/offline events
            socketService.on('userOnline', handleUserOnline);
            socketService.on('userOffline', handleUserOffline);
            socketService.on('user_online', handleUserOnline);
            socketService.on('user_offline', handleUserOffline);

            // Join conversation room (optional - nếu server support)
            socketService.emit('joinConversation', {
                conversationId: chatId,
                userId: currentUser?.id
            });

        } else {
            console.log('⚠️ ChatDetailPage: Socket not connected, trying to connect...');
            socketService.connect().then(() => {
                console.log('✅ ChatDetailPage: Socket connected after retry');
                // Register listeners after connection
                socketService.on('newMessage', handleNewMessage);
                socketService.on('messageReceived', handleNewMessage);
                socketService.on('new_message', handleNewMessage);
                socketService.on('message', handleNewMessage);
                socketService.on('userTyping', handleUserTyping);
                socketService.on('user_typing', handleUserTyping);
                socketService.on('userOnline', handleUserOnline);
                socketService.on('userOffline', handleUserOffline);
                socketService.on('user_online', handleUserOnline);
                socketService.on('user_offline', handleUserOffline);

                // Join conversation room
                socketService.emit('joinConversation', {
                    conversationId: chatId,
                    userId: currentUser?.id
                });
            }).catch(error => {
                console.error('❌ ChatDetailPage: Failed to connect socket:', error);
            });
        }

        // Cleanup function
        return () => {
            console.log('🧹 ChatDetailPage: Cleaning up WebSocket listeners');

            // Leave conversation room
            if (socketService.isConnected()) {
                socketService.emit('leaveConversation', {
                    conversationId: chatId,
                    userId: currentUser?.id
                });
            }

            // Remove listeners
            socketService.off('newMessage', handleNewMessage);
            socketService.off('messageReceived', handleNewMessage);
            socketService.off('new_message', handleNewMessage);
            socketService.off('message', handleNewMessage);
            socketService.off('userTyping', handleUserTyping);
            socketService.off('user_typing', handleUserTyping);
            socketService.off('userOnline', handleUserOnline);
            socketService.off('userOffline', handleUserOffline);
            socketService.off('user_online', handleUserOnline);
            socketService.off('user_offline', handleUserOffline);
        };
    }, [chatId, selectedConversation?.id, currentUser?.id, dispatch]); // Dependencies

    // Optional: Emit typing event khi user đang gõ
    const handleTextChange = (text: string) => {
        setNewMessage(text);

        // Emit typing event
        if (socketService.isConnected() && selectedConversation?.id) {
            socketService.emit('userTyping', {
                conversationId: selectedConversation.id,
                userId: currentUser?.id,
                username: currentUser?.username,
                isTyping: text.length > 0
            });
        }
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
                            <TouchableOpacity onPress={() => {
                                // Add test message
                                const testMessage: MessageResponseInterface = {
                                    id: Date.now().toString(),
                                    conversationId: chatId,
                                    senderId: 'test-sender',
                                    content: 'Đây là tin nhắn test để kiểm tra giao diện',
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString(),
                                    deletedForAll: false,
                                    seenBy: [],
                                    mediaUrls: [],
                                    mediaType: null,
                                    pinned: false,
                                    sender: {
                                        id: 'test-sender',
                                        username: 'Test User',
                                        profilePic: ''
                                    }
                                };
                                dispatch(addMessage(testMessage));
                            }}>
                                <Ionicons name="add-circle" size={24} />
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
                            style={styles.flatListStyle} // Thêm style riêng cho FlatList
                            inverted={false}
                            onContentSizeChange={() => {
                                // Chỉ scroll khi gửi tin nhắn mới
                                if (isNewMessageSent.current) {
                                    flatListRef.current?.scrollToEnd({ animated: true });
                                }
                            }}
                            onLayout={() => {
                                // Chỉ scroll lần đầu tiên khi layout hoàn tất
                                if (!hasInitialScrolled.current && messages.length > 0) {
                                    console.log('📱 FlatList initial layout completed, scrolling to end');
                                    hasInitialScrolled.current = true;
                                    setTimeout(() => {
                                        flatListRef.current?.scrollToEnd({ animated: false });
                                    }, 100);
                                }
                            }}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.1}
                            refreshing={messagesLoading}
                            onRefresh={handleLoadMore}
                            showsVerticalScrollIndicator={false} // Ẩn thanh cuộn dọc
                            showsHorizontalScrollIndicator={false} // Ẩn thanh cuộn ngang
                            extraData={messages.length} // Force re-render khi messages thay đổi
                            removeClippedSubviews={false} // Đảm bảo tất cả items được render
                            keyboardShouldPersistTaps="handled" // Cho phép tap trong FlatList khi keyboard mở
                            onScrollBeginDrag={dismissKeyboard} // Dismiss keyboard khi bắt đầu scroll
                            scrollEventThrottle={16} // Smooth scroll performance
                            bounces={true} // Cho phép bounce effect
                            alwaysBounceVertical={true} // Luôn có bounce effect dọc
                            directionalLockEnabled={true} // Chỉ scroll theo một hướng tại một thời điểm
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
                                        console.warn(`Lỗi tải ảnh fullscreen: ${selectedImageUri}`, e.nativeEvent.error);
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
});

export default ChatDetailPage;