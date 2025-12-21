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
import { API_BASE_URL } from '@/src/const/api';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordPage({ navigation, route }: Props) {
    const { email, otp } = route.params;
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

    const validatePassword = (password: string) => {
        // Ít nhất 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const handleResetPassword = async () => {
        // Reset errors
        setPasswordError('');
        setConfirmPasswordError('');

        let isValid = true;

        // Validate password
        if (!password) {
            setPasswordError('Vui lòng nhập mật khẩu mới');
            isValid = false;
        } else if (!validatePassword(password)) {
            setPasswordError(
                'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)'
            );
            isValid = false;
        }

        // Validate confirm password
        if (!confirmPassword) {
            setConfirmPasswordError('Vui lòng xác nhận mật khẩu');
            isValid = false;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError('Mật khẩu không khớp');
            isValid = false;
        }

        if (!isValid) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    otp,
                    newPassword: password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể đổi mật khẩu');
            }

            Alert.alert(
                'Thành công',
                'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Login'),
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể đổi mật khẩu');
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

                <Text style={styles.title}>Đặt mật khẩu mới</Text>
                <Text style={styles.subtitle}>
                    Tạo mật khẩu mới cho tài khoản {email}
                </Text>

                <View style={styles.inputContainer}>
                    <FloatingLabelInput
                        label="Mật khẩu mới"
                        hint="Nhập mật khẩu mới"
                        value={password}
                        onChangeText={setPassword}
                        isPassword
                        customShowPasswordComponent={
                            <Ionicons name="eye-outline" size={24} color="#666" />
                        }
                        customHidePasswordComponent={
                            <Ionicons name="eye-off-outline" size={24} color="#666" />
                        }
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
                    {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                    <FloatingLabelInput
                        label="Xác nhận mật khẩu"
                        hint="Nhập lại mật khẩu mới"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        isPassword
                        customShowPasswordComponent={
                            <Ionicons name="eye-outline" size={24} color="#666" />
                        }
                        customHidePasswordComponent={
                            <Ionicons name="eye-off-outline" size={24} color="#666" />
                        }
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
                    {confirmPasswordError ? (
                        <Text style={styles.errorText}>{confirmPasswordError}</Text>
                    ) : null}
                </View>

                <View style={styles.passwordRequirements}>
                    <Text style={styles.requirementTitle}>Mật khẩu phải có:</Text>
                    <Text style={styles.requirementItem}>• Ít nhất 8 ký tự</Text>
                    <Text style={styles.requirementItem}>• Ít nhất 1 chữ hoa (A-Z)</Text>
                    <Text style={styles.requirementItem}>• Ít nhất 1 chữ thường (a-z)</Text>
                    <Text style={styles.requirementItem}>• Ít nhất 1 số (0-9)</Text>
                    <Text style={styles.requirementItem}>• Ít nhất 1 ký tự đặc biệt (@$!%*?&)</Text>
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleResetPassword}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Đổi mật khẩu</Text>
                    )}
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
        marginBottom: 10,
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
    passwordRequirements: {
        backgroundColor: '#e8f4fc',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    requirementTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    requirementItem: {
        fontSize: 12,
        color: '#666',
        marginLeft: 5,
        marginTop: 2,
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
});
