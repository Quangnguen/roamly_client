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
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { updatePassword, clearMessage } from '../redux/slices/userSlice';
import { sendChangePasswordOtp } from '../../data/api/userApi';
import Toast from 'react-native-toast-message';

interface ChangePasswordModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const { width } = Dimensions.get('window');

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isVisible, onClose }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const dispatch = useDispatch<AppDispatch>();
    const { loading, error, message, status, statusCode } = useSelector((state: RootState) => state.user);

    // Countdown timer for resend OTP
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // Theo dõi thay đổi của status và message
    useEffect(() => {
        if (status === 'success' && message) {
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: message,
            });
            // Reset form và đóng modal
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setOtp('');
            setOtpSent(false);
            dispatch(clearMessage());
            onClose();
        } else if (status === 'error' && message) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: message,
            });
            dispatch(clearMessage());
        }
    }, [status, message]);

    const handleSendOtp = async () => {
        // Validate passwords first
        if (!currentPassword || !newPassword || !confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng điền đầy đủ thông tin mật khẩu',
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Mật khẩu mới không khớp',
            });
            return;
        }

        if (newPassword.length < 6) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Mật khẩu mới phải có ít nhất 6 ký tự',
            });
            return;
        }

        try {
            setSendingOtp(true);
            await sendChangePasswordOtp();
            setOtpSent(true);
            setCountdown(60); // 60 seconds countdown
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Mã OTP đã được gửi đến email của bạn',
            });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error.message || 'Không thể gửi OTP',
            });
        } finally {
            setSendingOtp(false);
        }
    };

    const handleSubmit = () => {
        // Kiểm tra OTP
        if (!otp || otp.length !== 6) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng nhập mã OTP 6 chữ số',
            });
            return;
        }

        // Gọi API đổi mật khẩu với OTP
        dispatch(updatePassword({ oldPassword: currentPassword, newPassword, otp }));
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
                                {!otpSent ? (
                                    <TouchableOpacity
                                        onPress={handleSendOtp}
                                        style={styles.saveButton}
                                        disabled={sendingOtp}
                                    >
                                        {sendingOtp ? (
                                            <ActivityIndicator size="small" color="#3897F0" />
                                        ) : (
                                            <Text style={styles.saveButtonText}>Gửi OTP</Text>
                                        )}
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        onPress={handleSubmit}
                                        style={styles.saveButton}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color="#3897F0" />
                                        ) : (
                                            <Text style={styles.saveButtonText}>Lưu</Text>
                                        )}
                                    </TouchableOpacity>
                                )}
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
                                            editable={!otpSent}
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
                                            editable={!otpSent}
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
                                            editable={!otpSent}
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

                                {/* OTP Input - Only show after OTP is sent */}
                                {otpSent && (
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Mã OTP</Text>
                                        <View style={styles.passwordContainer}>
                                            <TextInput
                                                style={styles.input}
                                                value={otp}
                                                onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
                                                placeholder="Nhập mã OTP 6 chữ số"
                                                placeholderTextColor="#999"
                                                keyboardType="number-pad"
                                                maxLength={6}
                                            />
                                        </View>
                                        <TouchableOpacity
                                            onPress={handleSendOtp}
                                            disabled={countdown > 0 || sendingOtp}
                                            style={[styles.resendButton, (countdown > 0 || sendingOtp) && styles.resendButtonDisabled]}
                                        >
                                            <Text style={[styles.resendButtonText, (countdown > 0 || sendingOtp) && styles.resendButtonTextDisabled]}>
                                                {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại OTP'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                <Text style={styles.passwordRequirements}>
                                    * Mật khẩu phải có ít nhất 6 ký tự
                                    {!otpSent && '\n* Nhấn "Gửi OTP" để nhận mã xác thực qua email'}
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
    resendButton: {
        marginTop: 8,
        paddingVertical: 8,
    },
    resendButtonDisabled: {
        opacity: 0.5,
    },
    resendButtonText: {
        color: '#3897F0',
        fontSize: 14,
        fontWeight: '600',
    },
    resendButtonTextDisabled: {
        color: '#999',
    },
});

export default ChangePasswordModal; 