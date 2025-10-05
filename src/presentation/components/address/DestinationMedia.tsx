import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import ImageViewing from 'react-native-image-viewing';

const { width } = Dimensions.get('window');

interface DestinationMediaProps {
    images: string[];
}

const DestinationMedia: React.FC<DestinationMediaProps> = ({ images }) => {
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const openImageViewer = (index: number) => {
        setCurrentImageIndex(index);
        setImageViewerVisible(true);
    };

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ảnh</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((imageUri, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => openImageViewer(index)}
                    >
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.galleryImage}
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Image Viewer */}
            <ImageViewing
                images={images.map(uri => ({ uri }))}
                imageIndex={currentImageIndex}
                visible={imageViewerVisible}
                onRequestClose={() => setImageViewerVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
        position: 'relative',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 12,
    },
    galleryImage: {
        width: 200,
        height: 150,
        borderRadius: 8,
        marginRight: 8,
    },
});

export default DestinationMedia;
