import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { FloatingLabelInput } from 'react-native-floating-label-input';
import { Ionicons } from '@expo/vector-icons';
import { sendOtpApi } from '../../data/api/otpApi';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordPage({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSendOtp = async () => {
        // Reset error
        setEmailError('');

        // Validate
        if (!email) {
            setEmailError('Vui lòng nhập email');
            return;
        }

        if (!validateEmail(email)) {
            setEmailError('Email không hợp lệ');
            return;
        }

        setLoading(true);
        try {
            await sendOtpApi(email, 'FORGOT_PASSWORD');
            Alert.alert('Thành công', 'Mã OTP đã được gửi đến email của bạn');
            navigation.navigate('OtpVerification', {
                email,
                type: 'FORGOT_PASSWORD',
            });
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể gửi OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                {/* Back button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>

                <Text style={styles.title}>Quên mật khẩu?</Text>
                <Text style={styles.subtitle}>
                    Nhập email của bạn để nhận mã xác thực OTP
                </Text>

                <View style={styles.inputContainer}>
                    <FloatingLabelInput
                        label="Email"
                        hint="Nhập email của bạn"
                        value={email}
                        onChangeText={setEmail}
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
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSendOtp}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Gửi mã OTP</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                    style={styles.backToLoginContainer}
                >
                    <Text style={styles.backToLoginText}>
                        <Ionicons name="arrow-back" size={14} color="#2196F3" /> Quay lại đăng nhập
                    </Text>
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        padding: 10,
        zIndex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 15,
        borderRadius: 8,
        backgroundColor: '#fff',
        marginBottom: 15,
        height: 55,
    },
    inputText: {
        fontSize: 16,
        color: '#333',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: -12,
        marginLeft: 4,
        marginBottom: 8,
    },
    button: {
        backgroundColor: '#2196F3',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    backToLoginContainer: {
        marginTop: 24,
        alignItems: 'center',
    },
    backToLoginText: {
        color: '#2196F3',
        fontSize: 14,
        fontWeight: '500',
    },
});
