import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch } from '../redux/hook';
import { register } from '../redux/slices/authSlice';
import { RootStackParamList } from '../navigation/AppNavigator';
import { FloatingLabelInput } from 'react-native-floating-label-input';
import { sendOtpApi } from '../../data/api/otpApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhoneNumber = (phone: string) => {
    const re = /^(0[3|5|7|8|9])+([0-9]{8})\b/;
    return re.test(phone);
  };

  const validatePassword = (password: string) => {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char (@$!%*?&)
    // Phải khớp với regex ở backend
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(password);
  };

  const validateUsername = (username: string) => {
    return username.length >= 3 && username.length <= 20;
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !name || !username || !phoneNumber) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    if (!validateUsername(username)) {
      Alert.alert('Lỗi', 'Tên đăng nhập phải từ 3 đến 20 ký tự.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ.');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ.');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Send OTP
      await sendOtpApi(email, 'REGISTER');

      // Step 2: Navigate to OTP Verification Page
      navigation.navigate('OtpVerification', {
        email,
        password,
        name,
        username,
        phoneNumber,
        type: 'REGISTER'
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Không thể gửi mã OTP. Vui lòng thử lại.';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Đăng ký</Text>

        <View style={styles.inputContainer}>
          <FloatingLabelInput
            label="Họ và tên"
            hint="Nhập họ và tên đầy đủ"
            value={name}
            onChangeText={setName}
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
            showCountdown={false}
          />

          <FloatingLabelInput
            label="Tên đăng nhập"
            hint="Chọn tên đăng nhập"
            value={username}
            onChangeText={setUsername}
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
            showCountdown={false}
          />

          <FloatingLabelInput
            label="Email"
            hint="Nhập địa chỉ email"
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
            keyboardType="email-address"
            hintTextColor="#ccc"
            editable={!loading}
            showCountdown={false}
          />

          <FloatingLabelInput
            label="Số điện thoại"
            hint="Nhập số điện thoại"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
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
            keyboardType="phone-pad"
            hintTextColor="#ccc"
            editable={!loading}
            showCountdown={false}
          />

          <FloatingLabelInput
            label="Mật khẩu"
            hint="Nhập mật khẩu"
            value={password}
            onChangeText={setPassword}
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
            isPassword
            hintTextColor="#ccc"
            editable={!loading}
            showCountdown={false}
          />

          <FloatingLabelInput
            label="Xác nhận mật khẩu"
            hint="Nhập lại mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
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
            isPassword
            hintTextColor="#ccc"
            editable={!loading}
            showCountdown={false}
          />
        </View>

        <TouchableOpacity
          onPress={handleRegister}
          style={[styles.button, loading && styles.buttonDisabled]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đăng ký</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
        >
          <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
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
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#90caf9',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    marginTop: 15,
    textAlign: 'center',
    color: '#2196F3',
    fontSize: 16,
  },
});