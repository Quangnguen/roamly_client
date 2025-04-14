import 'reflect-metadata'

import { Provider } from 'react-redux'
import { store } from '../src/presentation/redux/store'
import AppNavigator from '@/src/presentation/navigation/AppNavigator'


export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  )
}
