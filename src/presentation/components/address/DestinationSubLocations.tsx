import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import SquareCard from '../squareCardForHomeStay';
import { Destination } from '@/src/types/DestinationInterface';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Homestay {
    id: string;
    name: string;
    address: string;
    imageUri: string;
    rating: number;
    numberOfReviews: number;
}

interface TravelPlace {
    id: string;
    name: string;
    imageUri: string;
    numberOfLikes: number;
}

interface SubLocation {
    id: string;
    title: string;
    location: string;
    imageUrl?: string;
    rating?: number;
    reviewCount?: number;
}

interface DestinationSubLocationsProps {
    homestays: Homestay[];
    travelPlaces: Destination[];
}

const DestinationSubLocations: React.FC<DestinationSubLocationsProps> = ({
    homestays,
    travelPlaces
}) => {
    const navigation = useNavigation<NavigationProp>();

    console.log('Rendering DestinationSubLocations with props:', { homestays, travelPlaces });

    return (
        <View>
            {/* Travel Places */}
            {travelPlaces.length > 0 && (
                <View>
                    <Text style={styles.sectionTitle}>Địa điểm du lịch</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollView}>
                        {travelPlaces.map((place) => (
                            <SquareCard
                                key={place.id}
                                imageUri={place.imageUrl[0]} // Assuming imageUrl is an array
                                name={place.title}
                                id={place.id}
                                numberOfVisits={place.visitCount}
                                rating={place.rating}
                                type='place'
                                onPress={() => navigation.navigate('TravelPlaceDetailPage', {
                                    id: place.id,
                                })}
                            />
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Homestays */}
            {/* {homestays.length > 0 && (
                <View>
                    <Text style={styles.sectionTitle}>Homestay</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollView}>
                        {homestays.map((homestay) => (
                            <SquareCard
                                key={homestay.id}
                                address={homestay.location}
                                imageUri={homestay.imageUrl}
                                name={homestay.title}
                                rating={homestay.rating}
                                id={homestay.id}
                                numberOfReviews={homestay.reviewCount}
                                type='homestay'
                                onPress={() => navigation.navigate('HomeStayDetailPage', {
                                    id: homestay.id,
                                })}
                            />
                        ))}
                    </ScrollView>
                </View>
            )} */}
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
    horizontalScrollView: {
        marginTop: 8,
    },
});

export default DestinationSubLocations;
