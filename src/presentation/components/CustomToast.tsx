// ✅ Tạo CustomToast.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomToastProps {
  title: string;
  message: string;
  onPress?: () => void;
  type?: 'success' | 'info' | 'error';
}

const CustomToast: React.FC<CustomToastProps> = ({
  title,
  message,
  onPress,
  type = 'success'
}) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'info': return '#2196F3';
      case 'error': return '#F44336';
      default: return '#4CAF50';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'info': return 'information-circle';
      case 'error': return 'alert-circle';
      default: return 'notifications';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: getBackgroundColor() }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={getIcon()} size={24} color={getBackgroundColor()} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {onPress && <Text style={styles.hint}>Nhấn để xem chi tiết</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderLeftWidth: 4,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default CustomToast;