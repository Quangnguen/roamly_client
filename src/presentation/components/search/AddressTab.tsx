import React from 'react';
import { ScrollView, StyleSheet, Dimensions } from 'react-native';
import Card from '../card';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

const { width } = Dimensions.get('window');

const addressCards = [
    {
        image: { uri: 'https://cafebiz.cafebizcdn.vn/2018/12/22/photo-2-15454504530612141260827.jpg' },
        title: 'Beautiful Location',
        totalFollowers: 100,
        description: 'This is a beautiful location in Tokyo, Japan. Perfect for sightseeing and capturing stunning photos.',
    },
    {
        image: { uri: 'https://ik.imagekit.io/tvlk/blog/2024/07/canh-dep-viet-nam-6.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2' },
        title: 'Amazing View',
        totalFollowers: 245,
        description: 'Experience the breathtaking views of Vietnam\'s natural beauty.',
    },
    {
        image: require('../../../../assets/images/natural2.jpg'),
        title: 'Beautiful Location',
        totalFollowers: 345,
        description: 'This is a beautiful location in Tokyo, Japan. Perfect for sightseeing and capturing stunning photos.',
    },
    {
        image: { uri: 'https://ik.imagekit.io/tvlk/blog/2024/07/canh-dep-viet-nam-6.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2' },
        title: 'Amazing View',
        totalFollowers: 521,
        description: 'Experience the breathtaking views of Vietnam\'s natural beauty.',
    },
];

const AddressTab = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {addressCards.map((card, index) => (
                <Card
                    key={index}
                    type="address"
                    image={card.image}
                    title={card.title}
                    description={card.description}
                    totalFollowers={card.totalFollowers}
                    onPress={() => navigation.navigate('AddressDetailPage', {
                        id: index.toString(),
                    })}
                />
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 20,
    },
});

export default AddressTab; 