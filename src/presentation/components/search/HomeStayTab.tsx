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
        title: 'Nhà Nghỉ Ấm Cúng Tokyo',
        rating: 4,
        totalRaters: 100,
        description: 'Một ngôi nhà ấm cúng và thoải mái nằm ở trung tâm thành phố Tokyo.',
    },
    {
        id: '2',
        image: { uri: 'https://vatlieuhousing.com/wp-content/uploads/2024/03/homestay-chuong-my.jpg' },
        title: 'Biệt Thự Sang Trọng Việt Nam',
        rating: 5,
        totalRaters: 122,
        description: 'Trải nghiệm sự sang trọng của một biệt thự riêng với tầm nhìn ngoạn mục.',
    },
    {
        id: '3',
        image: { uri: 'https://tourdulichmangden.vn/upload/news/homestay-mang-den-0-8434.jpg' },
        title: 'Nhà Nghỉ Ấm Cúng Tokyo',
        rating: 4,
        totalRaters: 15,
        description: 'Một ngôi nhà ấm cúng và thoải mái nằm ở trung tâm thành phố Tokyo.',
    },
    {
        id: '4',
        image: { uri: 'https://khachsandep.vn/storage/files/Homestay/thiet-ke-homestay.jpeg' },
        title: 'Biệt Thự Sang Trọng Việt Nam',
        rating: 5,
        totalRaters: 235,
        description: 'Trải nghiệm sự sang trọng của một biệt thự riêng với tầm nhìn ngoạn mục.',
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