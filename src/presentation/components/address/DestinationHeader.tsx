import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface DestinationHeaderProps {
    imageUrl?: string;
    title: string;
}

const DestinationHeader: React.FC<DestinationHeaderProps> = ({
    imageUrl,
    title
}) => {
    const navigation = useNavigation();

    return (
        <View style={styles.imageContainer}>
            <Image
                source={imageUrl ? { uri: imageUrl } : { uri: 'https://i.pinimg.com/1200x/d7/78/7f/d7787f49f64cb6a8450ed7b7d0f30b57.jpg' }}
                style={styles.image}
                resizeMode="cover"
            />
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
            >
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: width,
        height: 250,
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
});

export default DestinationHeader;
