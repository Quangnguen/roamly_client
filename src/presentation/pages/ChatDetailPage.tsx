import React, { useState, useEffect } from "react";
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
    Alert
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { BACKGROUND } from "@/src/const/constants";
import { RootStackParamList } from "../navigation/AppNavigator";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';

type ChatDetailRouteProp = RouteProp<RootStackParamList, 'ChatDetailPage'>;

// Kích thước ảnh trong thư viện
const { width } = Dimensions.get('window');
const IMAGE_SIZE = width / 4 - 12;

// Mẫu tin nhắn
type Message = {
    id: string;
    text: string;
    isMe: boolean;
    timestamp: string;
    messageType?: 'text' | 'image';
    imageUrl?: string;
};

// Định nghĩa lại type cho ảnh
type GalleryImage = {
    id: string;
    uri: string;
};

const ChatDetailPage: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<ChatDetailRouteProp>();
    const { name, avatar } = route.params;
    const flatListRef = React.useRef<FlatList<Message>>(null);

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Xin chào, bạn khỏe không?', isMe: false, timestamp: '10:30 AM', messageType: 'text' },
        { id: '2', text: 'Chào bạn! Tôi khỏe, còn bạn thì sao?', isMe: true, timestamp: '10:32 AM', messageType: 'text' },
        { id: '3', text: 'Tôi cũng ổn. Bạn đang làm gì vậy?', isMe: false, timestamp: '10:33 AM', messageType: 'text' },
        { id: '4', text: 'Tôi đang viết code React Native. Còn bạn?', isMe: true, timestamp: '10:35 AM', messageType: 'text' }
    ]);

    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [showGallery, setShowGallery] = useState(false);

    // Xin quyền truy cập thư viện ảnh khi component mount
    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Xin lỗi, chúng tôi cần quyền truy cập thư viện ảnh!');
            }
        })();
    }, []);

    // Tự động cuộn xuống khi có tin nhắn mới
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 200);
        }
    }, [messages.length]);

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
            const newImages: GalleryImage[] = result.assets.map(asset => {
                console.log("URL ảnh được chọn:", asset.uri);
                return {
                    id: asset.assetId || Date.now().toString() + Math.random(),
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
                id: result.assets[0].assetId || Date.now().toString(),
                uri: result.assets[0].uri,
            };
            setGalleryImages(prevImages => [newImage, ...prevImages]);
            setShowGallery(true);
        }
    };

    const handleMicPress = () => {
        setIsRecording(!isRecording);
    };

    const handleSendMessage = () => {
        if (newMessage.trim() === '' && galleryImages.length === 0) {
            return;
        }

        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let newMessagesToSend: Message[] = [];

        if (newMessage.trim() !== '') {
            const textMsg: Message = {
                id: Date.now().toString() + '_text_' + Math.random(),
                text: newMessage.trim(),
                isMe: true,
                timestamp: currentTime,
                messageType: 'text',
            };
            newMessagesToSend.push(textMsg);
            setNewMessage('');
        }

        if (galleryImages.length > 0) {
            galleryImages.forEach((img, index) => {
                if (img.uri) {
                    const imgMsg: Message = {
                        id: `img_${index}_` + Date.now().toString(),
                        text: '',
                        isMe: true,
                        timestamp: currentTime,
                        messageType: 'image',
                        imageUrl: img.uri,
                    };
                    newMessagesToSend.push(imgMsg);
                }
            });

            setGalleryImages([]);
            setShowGallery(false);
        }

        if (newMessagesToSend.length > 0) {
            setMessages(prevMessages => {
                const updatedMessages = [...prevMessages, ...newMessagesToSend];
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
                return updatedMessages;
            });
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

    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[styles.messageContainer, item.isMe ? styles.myMessage : styles.theirMessage]}>
            {item.messageType === 'image' ? (
                <View>
                    {item.imageUrl ? (
                        <TouchableOpacity
                            onPress={() => {
                                console.log("Đã nhấn vào ảnh:", item.imageUrl);
                                Alert.alert("Hình ảnh", `URI: ${item.imageUrl}`);
                            }}
                        >
                            <Image
                                source={{ uri: item.imageUrl }}
                                style={styles.chatImage}
                                resizeMode="cover"
                                onError={(e) => {
                                    console.warn(`Lỗi tải ảnh: ${item.imageUrl}`, e.nativeEvent.error);
                                    Alert.alert('Lỗi', 'Không thể tải ảnh, vui lòng thử lại.');
                                }}
                            />
                        </TouchableOpacity>
                    ) : (
                        <View style={[styles.chatImage, { justifyContent: 'center', alignItems: 'center' }]}>
                            <Text>Không có ảnh</Text>
                        </View>
                    )}
                    <Text style={styles.timestamp}>{item.timestamp}</Text>
                </View>
            ) : (
                <>
                    <Text style={styles.messageText}>{item.text}</Text>
                    <Text style={styles.timestamp}>{item.timestamp}</Text>
                </>
            )}
        </View>
    );

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

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
            >
                <TouchableWithoutFeedback onPress={handlePressOutside}>
                    <View style={styles.mainContent}>
                        <View style={styles.header}>
                            <TouchableOpacity onPress={handleBack}>
                                <Ionicons name="chevron-back" size={24} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>{name}</Text>
                            <TouchableOpacity>
                                <Ionicons name="ellipsis-vertical" size={24} />
                            </TouchableOpacity>
                        </View>

                        <TouchableWithoutFeedback onPress={dismissKeyboard}>
                            <FlatList
                                ref={flatListRef}
                                data={messages}
                                renderItem={renderMessage}
                                keyExtractor={item => item.id}
                                contentContainerStyle={styles.messagesContainer}
                                inverted={false}
                                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                            />
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>

                <View style={styles.bottomContainer}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhắn tin..."
                            value={newMessage}
                            onChangeText={setNewMessage}
                            multiline
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
                            onPress={handleSendMessage}
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
        paddingVertical: 12,
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
        paddingBottom: Platform.OS === 'ios' ? 25 : 12,
        marginBottom: Platform.OS === 'android' ? 5 : 0,
    },
    iconButton: {
        padding: 8,
    },
    activeIconButton: {
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
    },
    input: {
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
