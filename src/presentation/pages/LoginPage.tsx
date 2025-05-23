import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native'
import { useAppDispatch, useAppSelector } from '../redux/hook'
import { login } from '../redux/slices/authSlice'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/AppNavigator'
import { FloatingLabelInput } from 'react-native-floating-label-input'
import { Ionicons } from '@expo/vector-icons'

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

export default function LoginPage({ navigation }: Props) {
  const dispatch = useAppDispatch()
  const { loading, user } = useAppSelector((state) => state.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const validateForm = () => {
    let isValid = true

    // Reset errors
    setEmailError('')
    setPasswordError('')

    if (!email) {
      setEmailError('Vui lòng nhập email')
      isValid = false
    }

    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu')
      isValid = false
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự')
      isValid = false
    }

    return isValid
  }

  const handleLogin = async () => {
    if (!validateForm()) return

    const result = await dispatch(login({ email, password }))
    if (login.fulfilled.match(result)) {
      navigation.replace('InApp')
    } else {
      Alert.alert('Lỗi', 'Tên đăng nhập hoặc mật khẩu không chính xác')
    }
  }

  const handleLoginWithGoogle = () => {
    Alert.alert('Google login giả lập', 'Chưa kết nối Google SDK')
  }

  const handleLoginWithFacebook = () => {
    Alert.alert('Facebook login giả lập', 'Chưa kết nối Facebook SDK')
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome To Roadly 👋</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

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
            showCountdown={false}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <FloatingLabelInput
            label="Password"
            hint="Nhập mật khẩu của bạn"
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
            showCountdown={false}
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.or}>OR</Text>

        <View style={styles.socialContainer}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleLoginWithGoogle}
            disabled={loading}
          >
            <Image
              source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }}
              style={styles.socialIcon}
            />
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleLoginWithFacebook}
            disabled={loading}
          >
            <Image
              source={{ uri: 'https://img.icons8.com/color/48/facebook-new.png' }}
              style={styles.socialIcon}
            />
            <Text style={styles.socialText}>Facebook</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          disabled={loading}
        >
          <Text style={styles.registerText}>Chưa có tài khoản? Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
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
  or: {
    textAlign: 'center',
    marginVertical: 16,
    color: '#888',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  registerText: {
    marginTop: 24,
    textAlign: 'center',
    color: '#2196F3',
    fontWeight: 'bold',
  },
})
