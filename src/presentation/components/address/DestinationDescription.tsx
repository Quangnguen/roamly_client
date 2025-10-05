import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DestinationDescriptionProps {
    description: string;
    openingHours?: string;
    entryFee?: {
        adult: number;
        child: number;
    };
    bestTimeToVisit?: string;
    facilities?: string[];
}

const DestinationDescription: React.FC<DestinationDescriptionProps> = ({
    description,
    openingHours,
    entryFee,
    bestTimeToVisit,
    facilities
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <View>
            {/* Mô tả */}
            <Text style={styles.sectionTitle}>Giới thiệu</Text>
            <Text style={styles.description}
                numberOfLines={isExpanded ? undefined : 4}
                onPress={() => setIsExpanded(!isExpanded)}
            >
                {description}
            </Text>

            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                <Text style={styles.readMoreText}>
                    {isExpanded ? 'Thu gọn' : 'Xem thêm...'}
                </Text>
            </TouchableOpacity>

            {/* Thông tin thêm */}
            {(openingHours || entryFee || bestTimeToVisit || (facilities && facilities.length > 0)) && (
                <View style={styles.additionalInfoContainer}>
                    {openingHours && (
                        <View style={styles.infoRow}>
                            <Ionicons name="time" size={20} color="#007AFF" />
                            <Text style={styles.infoText}>{openingHours}</Text>
                        </View>
                    )}
                    {entryFee && (
                        <View style={styles.infoRow}>
                            <Ionicons name="cash" size={20} color="#007AFF" />
                            <Text style={styles.infoText}>
                                {entryFee.adult.toLocaleString()} VND (người lớn), {entryFee.child.toLocaleString()} VND (trẻ em)
                            </Text>
                        </View>
                    )}
                    {bestTimeToVisit && (
                        <View style={styles.infoRow}>
                            <Ionicons name="calendar" size={20} color="#007AFF" />
                            <Text style={styles.infoText}>Thời điểm tốt nhất: {bestTimeToVisit}</Text>
                        </View>
                    )}
                    {facilities && facilities.length > 0 && (
                        <View style={styles.facilitiesContainer}>
                            <Text style={styles.facilitiesTitle}>Tiện ích:</Text>
                            <View style={styles.facilitiesList}>
                                {facilities.map((facility, index) => (
                                    <View key={index} style={styles.facilityItem}>
                                        <Text style={styles.facilityText}>{facility}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#444',
    },
    readMoreText: {
        color: '#007AFF',
        marginTop: 4,
    },
    additionalInfoContainer: {
        marginTop: 16,
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 16,
        marginLeft: 12,
        color: '#333',
        flex: 1,
    },
    facilitiesContainer: {
        marginTop: 12,
    },
    facilitiesTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    facilitiesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    facilityItem: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    facilityText: {
        fontSize: 14,
        color: '#666',
    },
});

export default DestinationDescription;
