import React from 'react';
import { BaseToast, ErrorToast } from 'react-native-toast-message';
import { View, Text } from 'react-native';

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: 'green',
        backgroundColor: '#f0fff4',
        borderRadius: 10,
        minHeight: 24,
        height: 32, // hoặc nhỏ hơn nữa
        paddingVertical: 0,
        flexDirection: 'row',
        alignItems: 'center',
      }}
      contentContainerStyle={{ paddingHorizontal: 8 }}
      text1Style={{
        fontSize: 14,
        fontWeight: 'bold',
        color: '#228B22',
      }}
      text2Style={{
        fontSize: 14,
        color: '#228B22',
      }}
      renderTrailingIcon={() => (
        <View style={{
          width: 16, height: 16, borderRadius: 8,
          backgroundColor: 'green', justifyContent: 'center', alignItems: 'center',
          marginLeft: 4, marginRight: 8
        }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 10 }}>✓</Text>
        </View>
      )}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: 'red',
        backgroundColor: '#fff0f0',
        borderRadius: 10,
        minHeight: 24,
        height: 32, // hoặc nhỏ hơn nữa
        paddingVertical: 0,
        flexDirection: 'row',
        alignItems: 'center',
      }}
      text1Style={{
        fontSize: 14,
        fontWeight: 'bold',
        color: '#b00020',
      }}
      text2Style={{
        fontSize: 14,
        color: '#b00020',
      }}
      renderTrailingIcon={() => (
        <View style={{
          width: 16, height: 16, borderRadius: 8,
          backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', marginLeft: 4
        }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 10 }}>!</Text>
        </View>
      )}
    />
  ),
  warning: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#FFA500',
        backgroundColor: '#FFF8E1',
        borderRadius: 10,
        minHeight: 24,
        height: 32, // hoặc nhỏ hơn nữa
        paddingVertical: 0,
        flexDirection: 'row',
        alignItems: 'center',
      }}
      contentContainerStyle={{ paddingHorizontal: 8 }}
      renderTrailingIcon={() => (
        <View style={{
          width: 16, height: 16, borderRadius: 8,
          backgroundColor: '#FFA500', justifyContent: 'center', alignItems: 'center', marginLeft: 4
        }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 10 }}>!</Text>
        </View>
      )}
      text1Style={{
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFA500',
      }}
      text2Style={{
        fontSize: 14,
        color: '#FFA500',
      }}
    />
  ),
};

export default toastConfig;