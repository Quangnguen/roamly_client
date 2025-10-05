import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

interface DestinationInfoProps {
    title: string;
    visitCount: number;
    likeCount: number;
    address: string;
}

const DestinationInfo: React.FC<DestinationInfoProps> = ({
    title,
    visitCount,
    likeCount,
    address
}) => {
    return (
        <View style={styles.infoContainer}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.infoRow}>
                <Ionicons name="person" size={20} color="#007AFF" />
                <Text style={styles.infoText}>{visitCount} người theo dõi</Text>
            </View>
            <View style={styles.infoRow}>
                <Ionicons name="heart" size={20} color="#007AFF" />
                <Text style={styles.infoText}>{likeCount} lượt yêu thích</Text>
            </View>
            <View style={styles.infoRow}>
                <FontAwesome name="map-marker" size={20} color="#007AFF" style={{ paddingLeft: 2 }} />
                <Text style={styles.infoText}>{address}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    infoContainer: {
        padding: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 16,
        marginLeft: 12,
        color: '#333',
    },
});

export default DestinationInfo;
