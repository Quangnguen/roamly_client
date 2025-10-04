import React, { useEffect, useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Dimensions, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import Card from '../card';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAppDispatch, useAppSelector } from '../../redux/hook';
import { getPopularDestinations, searchDestinations, toggleFavoriteDestination, untoggleFavoriteDestination, clearSearchResults } from '../../redux/slices/destinationSlice';
import { Destination } from '../../../types/DestinationInterface';

const { width } = Dimensions.get('window');

interface AddressTabProps {
    searchText?: string;
}

const AddressTab = React.memo(({ searchText = '' }: AddressTabProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const dispatch = useAppDispatch();

    // Redux state - tách riêng để tối ưu re-render
    const destinations = useAppSelector(state =>
        state.destination.searchResults.length > 0
            ? state.destination.searchResults
            : state.destination.destinations
    );
    const loading = useAppSelector(state =>
        state.destination.searchLoading || state.destination.loading
    );
    const error = useAppSelector(state =>
        state.destination.searchError || state.destination.error
    );

    // Thêm state cho debounced search
    const [debouncedSearchText, setDebouncedSearchText] = useState(searchText);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 500); // Debounce 500ms

        return () => clearTimeout(timeoutId);
    }, [searchText]);

    useEffect(() => {
        if (debouncedSearchText && debouncedSearchText.trim()) {
            dispatch(searchDestinations({ params: { keyword: debouncedSearchText.trim(), page: 1, limit: 20 } }));
        } else {
            // Clear search results và load popular destinations khi không có search
            dispatch(clearSearchResults());
            dispatch(getPopularDestinations());
        }
    }, [debouncedSearchText, dispatch]);

    // Handle favorite toggle - sử dụng useCallback để tránh tạo function mới
    const handleFavoriteToggle = useCallback((destinationId: string, currentLiked: boolean) => {
        if (currentLiked) {
            dispatch(untoggleFavoriteDestination({ targetId: destinationId, type: 'destination' }));
        } else {
            dispatch(toggleFavoriteDestination({ targetId: destinationId, type: 'destination' }));
        }
    }, [dispatch]);

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
            {destinations && destinations.length > 0 ? (
                destinations.map((destination: Destination, index: number) => {
                    return (
                        <Card
                            key={destination.id || `destination-${index}`}
                            type="address"
                            image={destination.imageUrl && destination.imageUrl.length > 0 ? { uri: destination.imageUrl[0] } : require('../../../../assets/images/natural2.jpg')}
                            title={destination.title || 'Không có tiêu đề'}
                            description={destination.description || 'Không có mô tả'}
                            totalFollowers={destination.likeCount || 0}
                            visitCount={destination.visitCount || 0}
                            rating={destination.rating || 0}
                            reviewCount={destination.reviewCount || 0}
                            isLiked={destination.isLiked || false}
                            onPress={() => navigation.navigate('AddressDetailPage', {
                                id: destination.id,
                                destinationData: destination,
                            })}
                            onFollowPress={() => handleFavoriteToggle(destination.id, destination.isLiked || false)}
                        />
                    );
                })
            ) : (
                <Text style={styles.emptyText}>Không có địa điểm nào</Text>
            )}
        </ScrollView>
    );
});

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

AddressTab.displayName = 'AddressTab';

export default AddressTab; 