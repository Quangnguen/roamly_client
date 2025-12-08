import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch } from '../redux/hook';
import { register } from '../redux/slices/authSlice';
import { RootStackParamList } from '../navigation/AppNavigator';
import { sendOtpApi } from '../../data/api/otpApi';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, 'OtpVerification'>;

const OtpVerificationPage = ({ navigation, route }: Props) => {
  const { email, password, name, username, phoneNumber, type } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const dispatch = useAppDispatch();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP 6 chữ số.');
      return;
    }

    setLoading(true);
    try {
      if (type === 'REGISTER') {
        await dispatch(register({ email, password, name, username, phoneNumber, otp })).unwrap();
        Toast.show({
          type: 'success',
          text1: 'Đăng ký thành công',
          text2: 'Chào mừng bạn đến với Roamly!',
        });
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        // Handle Forgot Password verification here if needed
        // For now, we assume this page is mainly for registration flow as per request
        // But if reused, we might navigate to ResetPasswordPage
        navigation.navigate('ResetPassword', { email, otp });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Xác thực thất bại',
        text2: error || 'Mã OTP không chính xác hoặc đã hết hạn.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    try {
      await sendOtpApi(email, type);
      setCountdown(60);
      Toast.show({
        type: 'success',
        text1: 'Đã gửi lại mã OTP',
        text2: 'Vui lòng kiểm tra email của bạn.',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Gửi lại thất bại',
        text2: error.message || 'Không thể gửi lại mã OTP.',
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Xác thực OTP</Text>
        <Text style={styles.subtitle}>
          Mã xác thực đã được gửi đến email {email}
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={setOtp}
            placeholder="Nhập mã 6 số"
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          onPress={handleVerify}
          style={[styles.button, loading && styles.buttonDisabled]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Xác nhận</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResendOtp}
          disabled={countdown > 0 || resendLoading}
          style={styles.resendButton}
        >
          {resendLoading ? (
            <ActivityIndicator size="small" color="#2196F3" />
          ) : (
            <Text style={[styles.resendText, countdown > 0 && styles.resendTextDisabled]}>
              {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  otpInput: {
    width: '80%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 0,
    fontSize: 20,
    textAlign: 'center',
    textAlignVertical: 'center', // Căn giữa theo chiều dọc cho Android
    letterSpacing: 5,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#90caf9',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resendButton: {
    alignItems: 'center',
    padding: 10,
  },
  resendText: {
    color: '#2196F3',
    fontSize: 14,
  },
  resendTextDisabled: {
    color: '#999',
  },
});

export default OtpVerificationPage;
