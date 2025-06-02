import 'reflect-metadata'

import { Provider } from 'react-redux'
import { store } from '../src/presentation/redux/store'
import AppNavigator from '@/src/presentation/navigation/AppNavigator'
import Toast from 'react-native-toast-message'
import toastConfig from '../src/config/toast.config';


export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppNavigator />
      <Toast config={toastConfig} position="top" />
    </Provider>
  )
}
