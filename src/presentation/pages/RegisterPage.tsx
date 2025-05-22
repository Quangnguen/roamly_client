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

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleRegister = async () => {
    if (!email || !password || !name || !username || !phoneNumber) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    setLoading(true);
    try {
      console.log("-----------------------")
      console.log("type of phoneNumber", typeof phoneNumber)
      console.log('register', email, password, name, username, phoneNumber);
      console.log("-----------------------")
      await dispatch(register({ email, password, name, username, phoneNumber })).unwrap();
      Alert.alert('Đăng ký thành công!', '', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
    } catch (error: any) {
      const errorMessage =
        error === 'Email hoặc tên đăng nhập đã tồn tại'
          ? 'Email hoặc tên đăng nhập đã tồn tại. Vui lòng chọn thông tin khác.'
          : 'Đăng ký thất bại';
      Alert.alert('Lỗi đăng ký', errorMessage, [{ text: 'OK' }]);
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
            value={name}
            onChangeText={setName}
            containerStyles={styles.input}
            customLabelStyles={{
              colorFocused: '#2196F3',
              fontSizeFocused: 12,
            }}
            labelStyles={{
              backgroundColor: '#f5f5f5',
              paddingHorizontal: 5,
            }}
            inputStyles={styles.inputText}
            editable={!loading}
          />

          <FloatingLabelInput
            label="Tên đăng nhập"
            value={username}
            onChangeText={setUsername}
            containerStyles={styles.input}
            customLabelStyles={{
              colorFocused: '#2196F3',
              fontSizeFocused: 12,
            }}
            labelStyles={{
              backgroundColor: '#f5f5f5',
              paddingHorizontal: 5,
            }}
            inputStyles={styles.inputText}
            editable={!loading}
          />

          <FloatingLabelInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            containerStyles={styles.input}
            customLabelStyles={{
              colorFocused: '#2196F3',
              fontSizeFocused: 12,
            }}
            labelStyles={{
              backgroundColor: '#f5f5f5',
              paddingHorizontal: 5,
            }}
            inputStyles={styles.inputText}
            keyboardType="email-address"
            editable={!loading}
          />

          <FloatingLabelInput
            label="Số điện thoại"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            containerStyles={styles.input}
            customLabelStyles={{
              colorFocused: '#2196F3',
              fontSizeFocused: 12,
            }}
            labelStyles={{
              backgroundColor: '#f5f5f5',
              paddingHorizontal: 5,
            }}
            inputStyles={styles.inputText}
            keyboardType="phone-pad"
            editable={!loading}
          />

          <FloatingLabelInput
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            containerStyles={styles.input}
            customLabelStyles={{
              colorFocused: '#2196F3',
              fontSizeFocused: 12,
            }}
            labelStyles={{
              backgroundColor: '#f5f5f5',
              paddingHorizontal: 5,
            }}
            inputStyles={styles.inputText}
            isPassword
            editable={!loading}
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