import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.9; // Chiều rộng card chiếm 90% màn hình
const AVATAR_SIZE = 64;

interface CardUserProps {
  avatar: string; // Avatar của user (có thể là URL hoặc require)
  name: string; // Tên user
  achievements: string; // Thành tích (ví dụ: "3 địa danh")
  description: string; // Mô tả về user
}

const CardUser: React.FC<CardUserProps> = ({ avatar, name, achievements, description }) => {
  return (
    <View style={styles.card}>
      <View style={styles.avatarContainer}>
        <Image
          source={
            avatar
              ? { uri: avatar }
              : require('../../../assets/images/avatar-test.jpg') // Hình ảnh mặc định
          }
          style={styles.avatar}
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.achievements}>{achievements}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: cardWidth,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Bóng đổ cho Android
    marginVertical: 10,
    alignSelf: 'center',
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    resizeMode: 'cover',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  achievements: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#888',
  },
});

export default CardUser;