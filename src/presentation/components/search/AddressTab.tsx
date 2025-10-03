import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Dimensions, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import Card from '../card';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAppDispatch, useAppSelector } from '../../redux/hook';
import { getPopularDestinations } from '../../redux/slices/destinationSlice';
import { Destination } from '../../../types/DestinationInterface';

const { width } = Dimensions.get('window');

const AddressTab = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const dispatch = useAppDispatch();

    // Redux state
    const { destinations, loading, error } = useAppSelector(state => state.destination);

    // Load popular destinations khi component mount
    useEffect(() => {
        dispatch(getPopularDestinations());
    }, [dispatch]);

    // Handle favorite toggle
    const handleFavoriteToggle = (destinationId: string, currentLiked: boolean) => {
        // TODO: Implement favorite toggle API call
        console.log(`Toggle favorite for destination ${destinationId}: ${currentLiked ? 'unlike' : 'like'}`);
    };

    // Loading state
    if (loading) {
        return (
            <ScrollView contentContainerStyle={styles.container}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Đang tải danh sách địa điểm...</Text>
            </ScrollView>
        );
    }

    // Error state
    if (error) {
        return (
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.errorText}>Lỗi: {error}</Text>
                <TouchableOpacity onPress={() => dispatch(getPopularDestinations())}>
                    <Text style={styles.retryText}>Thử lại</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {destinations.length > 0 ? (
                destinations.map((destination: Destination) => (
                    <Card
                        key={destination.id}
                        type="address"
                        image={destination.imageUrl.length > 0 ? { uri: destination.imageUrl[0] } : require('../../../../assets/images/natural2.jpg')}
                        title={destination.title}
                        description={destination.description}
                        totalFollowers={destination.likeCount}
                        visitCount={destination.visitCount}
                        rating={destination.rating}
                        reviewCount={destination.reviewCount}
                        isLiked={destination.isLiked} // TODO: Implement favorite status from API
                        onPress={() => navigation.navigate('AddressDetailPage', {
                            id: destination.id,
                        })}
                        onFollowPress={() => handleFavoriteToggle(destination.id, false)}
                    />
                ))
            ) : (
                <Text style={styles.emptyText}>Không có địa điểm nào</Text>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#FF3B30',
        textAlign: 'center',
        marginBottom: 10,
    },
    retryText: {
        fontSize: 16,
        color: '#007AFF',
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 50,
    },
});

export default AddressTab; 