import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useAppDispatch } from '../redux/hook'
import { registerUser } from '../redux/slices/authSlice'
import { RootStackParamList } from '../navigation/AppNavigator'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>

const RegisterScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useAppDispatch()

  const handleRegister = () => {
    if (!email || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin.')
      return
    }

    dispatch(registerUser({ email, password }))
      .unwrap()
      .then(() => {
        Alert.alert('Đăng ký thành công!')
        navigation.navigate('Login') // hoặc 'Home' tùy bạn
      })
      .catch(() => {
        Alert.alert('Đăng ký thất bại. Vui lòng thử lại.')
      })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Mật khẩu"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity onPress={handleRegister} style={styles.button}>
        <Text style={styles.buttonText}>Đăng ký</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  )
}

export default RegisterScreen

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  link: { marginTop: 15, textAlign: 'center', color: '#2196F3' },
})
