import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    StatusBar,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { updatePassword, clearMessage } from '../redux/slices/userSlice';

interface ChangePasswordModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const { width } = Dimensions.get('window');

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isVisible, onClose }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error, message, status, statusCode } = useSelector((state: RootState) => state.user);

    // Theo dõi thay đổi của status và message
    useEffect(() => {
        if (status === 'success' && message) {
            // Reset form và đóng modal
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            dispatch(clearMessage()); // Clear message sau khi xử lý xong
            onClose();
        } else if (status === 'error' && message) {
            Alert.alert('Lỗi', message);
            dispatch(clearMessage()); // Clear message sau khi hiển thị lỗi
        }
    }, [status, message]);

    const handleSubmit = () => {
        // Kiểm tra validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu mới không khớp');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        // Gọi API đổi mật khẩu
        dispatch(updatePassword({ oldPassword: currentPassword, newPassword }));
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoid}
                >
                    <TouchableWithoutFeedback onPress={dismissKeyboard}>
                        <View style={styles.content}>
                            {/* Header */}
                            <View style={styles.header}>
                                <TouchableOpacity
                                    onPress={onClose}
                                    style={styles.backButton}
                                >
                                    <Ionicons name="chevron-back" size={28} color="#000" />
                                </TouchableOpacity>
                                <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
                                <TouchableOpacity
                                    onPress={handleSubmit}
                                    style={styles.saveButton}
                                >
                                    <Text style={styles.saveButtonText}>Lưu</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Form */}
                            <View style={styles.form}>
                                {/* Current Password */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Mật khẩu hiện tại</Text>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.input}
                                            secureTextEntry={!showCurrentPassword}
                                            value={currentPassword}
                                            onChangeText={setCurrentPassword}
                                            placeholder="Nhập mật khẩu hiện tại"
                                            placeholderTextColor="#999"
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                            style={styles.eyeIcon}
                                        >
                                            <Ionicons
                                                name={showCurrentPassword ? 'eye-off' : 'eye'}
                                                size={24}
                                                color="#666"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* New Password */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Mật khẩu mới</Text>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.input}
                                            secureTextEntry={!showNewPassword}
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            placeholder="Nhập mật khẩu mới"
                                            placeholderTextColor="#999"
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowNewPassword(!showNewPassword)}
                                            style={styles.eyeIcon}
                                        >
                                            <Ionicons
                                                name={showNewPassword ? 'eye-off' : 'eye'}
                                                size={24}
                                                color="#666"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Confirm New Password */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.input}
                                            secureTextEntry={!showConfirmPassword}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            placeholder="Nhập lại mật khẩu mới"
                                            placeholderTextColor="#999"
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={styles.eyeIcon}
                                        >
                                            <Ionicons
                                                name={showConfirmPassword ? 'eye-off' : 'eye'}
                                                size={24}
                                                color="#666"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <Text style={styles.passwordRequirements}>
                                    * Mật khẩu phải có ít nhất 6 ký tự
                                </Text>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardAvoid: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    saveButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    saveButtonText: {
        color: '#3897F0',
        fontSize: 16,
        fontWeight: '600',
    },
    form: {
        padding: 20,
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#000',
        fontWeight: '500',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        backgroundColor: '#f8f8f8',
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#000',
    },
    eyeIcon: {
        padding: 12,
    },
    passwordRequirements: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        fontStyle: 'italic',
    },
});

export default ChangePasswordModal; 