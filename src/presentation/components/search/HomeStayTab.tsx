import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Card from '../card';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

const homeStays = [
    {
        id: '1',
        image: { uri: 'https://static.vinwonders.com/production/homestay-la-gi-thumb.jpg' },
        title: 'Cozy Home in Tokyo',
        rating: 4,
        totalRaters: 100,
        description: 'A cozy and comfortable home located in the heart of Tokyo.',
    },
    {
        id: '2',
        image: { uri: 'https://vatlieuhousing.com/wp-content/uploads/2024/03/homestay-chuong-my.jpg' },
        title: 'Luxury Villa in Vietnam',
        rating: 5,
        totalRaters: 122,
        description: 'Experience the luxury of a private villa with breathtaking views.',
    },
    {
        id: '3',
        image: { uri: 'https://tourdulichmangden.vn/upload/news/homestay-mang-den-0-8434.jpg' },
        title: 'Cozy Home in Tokyo',
        rating: 4,
        totalRaters: 15,
        description: 'A cozy and comfortable home located in the heart of Tokyo.',
    },
    {
        id: '4',
        image: { uri: 'https://khachsandep.vn/storage/files/Homestay/thiet-ke-homestay.jpeg' },
        title: 'Luxury Villa in Vietnam',
        rating: 5,
        totalRaters: 235,
        description: 'Experience the luxury of a private villa with breathtaking views.',
    },
];

const HomeStayTab = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {homeStays.map((homeStay) => (
                <Card
                    key={homeStay.id}
                    type="homestay"
                    image={homeStay.image}
                    title={homeStay.title}
                    description={homeStay.description}
                    rating={homeStay.rating}
                    cardHeight={250}
                    totalRaters={homeStay.totalRaters}
                    onPress={() => navigation.navigate('HomeStayDetailPage', {
                        id: homeStay.id,
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

export default HomeStayTab; 