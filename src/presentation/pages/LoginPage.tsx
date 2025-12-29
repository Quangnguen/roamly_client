import React, { useState, useEffect } from 'react'
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
  Modal,
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
  const { loading, profile } = useAppSelector((state) => state.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Account Locked State
  const [isAccountLocked, setIsAccountLocked] = useState(false)
  const [lockoutSeconds, setLockoutSeconds] = useState(0)
  const [lockoutLevel, setLockoutLevel] = useState<'soft' | 'hard'>('soft')

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutSeconds > 0) {
      const timer = setTimeout(() => {
        setLockoutSeconds((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (lockoutSeconds === 0 && isAccountLocked) {
      setIsAccountLocked(false)
    }
  }, [lockoutSeconds, isAccountLocked])

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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
      const payload = result.payload

      // Kiểm tra xem có yêu cầu 2FA không
      if (payload.requiresTwoFactor) {
        // Chuyển đến trang xác thực 2FA
        navigation.navigate('TwoFactorAuth', {
          email: payload.email,
          message: payload.message,
        })
      } else {
        // Đăng nhập thành công, chuyển đến màn hình chính
        navigation.replace('InApp')
      }
    } else {
      // Kiểm tra nếu tài khoản bị khóa
      const error = result.payload as any
      if (error?.isAccountLocked) {
        setLockoutSeconds(error.retryAfter || 300)
        setIsAccountLocked(true)
        setLockoutLevel(error.lockoutLevel === 'hard' ? 'hard' : 'soft')
      } else {
        Alert.alert('Lỗi', error?.message || 'Email hoặc mật khẩu không chính xác')
      }
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
        {/* Account Locked Modal */}
        <Modal
          visible={isAccountLocked}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsAccountLocked(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Ionicons name="lock-closed" size={60} color="#FF6B6B" />
              <Text style={styles.modalTitle}>Tài khoản tạm khóa</Text>
              <Text style={styles.modalMessage}>
                Bạn đã đăng nhập sai quá nhiều lần.{'\n'}
                Vui lòng thử lại sau:
              </Text>
              <Text style={styles.countdownText}>{formatTime(lockoutSeconds)}</Text>
              <Text style={styles.modalHint}>
                {lockoutLevel === 'soft'
                  ? 'Đây là khóa tạm thời để bảo vệ tài khoản của bạn.'
                  : 'Tài khoản đã bị khóa cứng. Liên hệ hỗ trợ nếu cần.'}
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setIsAccountLocked(false)}
              >
                <Text style={styles.modalButtonText}>Đã hiểu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Text style={styles.title}>Welcome To ViVu 👋</Text>
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

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={loading}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -5,
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  // Account Locked Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginVertical: 15,
  },
  modalHint: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  modalButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
