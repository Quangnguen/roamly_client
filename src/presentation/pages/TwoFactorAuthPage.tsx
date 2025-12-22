import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
    Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { FloatingLabelInput } from 'react-native-floating-label-input';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAppDispatch } from '../redux/hook';
import { verifyTwoFactor } from '../redux/slices/authSlice';
import { resendTwoFactorOtpApi } from '../../data/api/loginApi';

type Props = NativeStackScreenProps<RootStackParamList, 'TwoFactorAuth'>;

export default function TwoFactorAuthPage({ navigation, route }: Props) {
    const { email, message } = route.params;
    const dispatch = useAppDispatch();

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [trustDevice, setTrustDevice] = useState(true);

    // Countdown timer cho nút gửi lại OTP
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    // Xác thực OTP
    const handleVerify = async () => {
        if (!otp || otp.length !== 6) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng nhập mã OTP 6 chữ số',
            });
            return;
        }

        setLoading(true);
        try {
            const result = await dispatch(verifyTwoFactor({ email, otp, trustDevice })).unwrap();

            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Đăng nhập thành công!',
            });

            // Chuyển đến màn hình chính
            navigation.reset({
                index: 0,
                routes: [{ name: 'InApp' }],
            });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Xác thực thất bại',
                text2: error || 'Mã OTP không chính xác hoặc đã hết hạn',
            });
        } finally {
            setLoading(false);
        }
    };

    // Gửi lại OTP
    const handleResendOtp = async () => {
        setResendLoading(true);
        try {
            await resendTwoFactorOtpApi(email);
            setCountdown(60);
            Toast.show({
                type: 'success',
                text1: 'Đã gửi lại',
                text2: 'Mã OTP mới đã được gửi đến email của bạn',
            });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error.message || 'Không thể gửi lại OTP',
            });
        } finally {
            setResendLoading(false);
        }
    };

    // Quay lại trang đăng nhập
    const handleGoBack = () => {
        navigation.goBack();
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                {/* Header */}
                <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>

                {/* Icon */}
                <View style={styles.iconContainer}>
                    <Ionicons name="shield-checkmark-outline" size={80} color="#2196F3" />
                </View>

                {/* Title & Description */}
                <Text style={styles.title}>Xác thực 2 bước</Text>
                <Text style={styles.subtitle}>{message}</Text>
                <Text style={styles.emailText}>{email}</Text>

                {/* OTP Input */}
                <View style={styles.inputContainer}>
                    <FloatingLabelInput
                        label="Mã OTP"
                        hint="Nhập mã 6 chữ số"
                        value={otp}
                        onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
                        keyboardType="number-pad"
                        maxLength={6}
                        containerStyles={styles.input}
                        staticLabel={true}
                        customLabelStyles={{
                            colorFocused: '#2196F3',
                            fontSizeFocused: 12,
                            colorBlurred: '#888',
                            fontSizeBlurred: 12,
                            topFocused: -6,
                            topBlurred: -6,
                            leftFocused: 15,
                            leftBlurred: 15,
                        }}
                        labelStyles={{
                            backgroundColor: '#f5f5f5',
                            paddingHorizontal: 5,
                        }}
                        inputStyles={styles.inputText}
                        hintTextColor="#ccc"
                        editable={!loading}
                    />
                </View>

                {/* Trust Device Toggle */}
                <View style={styles.trustDeviceContainer}>
                    <View style={styles.trustDeviceTextContainer}>
                        <Ionicons name="phone-portrait-outline" size={20} color="#666" />
                        <View style={styles.trustDeviceLabels}>
                            <Text style={styles.trustDeviceLabel}>Tin cậy thiết bị này</Text>
                            <Text style={styles.trustDeviceDescription}>
                                Không yêu cầu OTP cho lần đăng nhập sau
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={trustDevice}
                        onValueChange={setTrustDevice}
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                        thumbColor={trustDevice ? '#2196F3' : '#f4f3f4'}
                    />
                </View>

                {/* Verify Button */}
                <TouchableOpacity
                    style={[styles.verifyButton, loading && styles.buttonDisabled]}
                    onPress={handleVerify}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.verifyButtonText}>Xác nhận</Text>
                    )}
                </TouchableOpacity>

                {/* Resend OTP */}
                <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={countdown > 0 || resendLoading}
                    style={styles.resendButton}
                >
                    {resendLoading ? (
                        <ActivityIndicator size="small" color="#2196F3" />
                    ) : (
                        <Text style={[styles.resendText, countdown > 0 && styles.resendTextDisabled]}>
                            {countdown > 0 ? `Gửi lại mã sau ${countdown}s` : 'Gửi lại mã OTP'}
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Info */}
                <View style={styles.infoContainer}>
                    <Ionicons name="information-circle-outline" size={16} color="#888" />
                    <Text style={styles.infoText}>
                        Chúng tôi phát hiện đăng nhập từ thiết bị mới. Để bảo vệ tài khoản của bạn,
                        vui lòng nhập mã OTP đã gửi đến email.
                    </Text>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    backButton: {
        marginTop: 40,
        marginBottom: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        color: '#333',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
        paddingHorizontal: 20,
    },
    emailText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2196F3',
        textAlign: 'center',
        marginBottom: 32,
    },
    inputContainer: {
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 15,
        borderRadius: 8,
        backgroundColor: '#fff',
        height: 55,
    },
    inputText: {
        fontSize: 20,
        color: '#333',
        letterSpacing: 8,
        textAlign: 'center',
    },
    trustDeviceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#eee',
    },
    trustDeviceTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    trustDeviceLabels: {
        marginLeft: 12,
        flex: 1,
    },
    trustDeviceLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    trustDeviceDescription: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    verifyButton: {
        backgroundColor: '#2196F3',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    verifyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    resendButton: {
        alignItems: 'center',
        padding: 12,
    },
    resendText: {
        color: '#2196F3',
        fontSize: 14,
        fontWeight: '600',
    },
    resendTextDisabled: {
        color: '#999',
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#e3f2fd',
        padding: 16,
        borderRadius: 8,
        marginTop: 24,
    },
    infoText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
});
