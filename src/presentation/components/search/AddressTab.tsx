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
        title: 'Địa Điểm Đẹp',
        totalFollowers: 100,
        description: 'Đây là một địa điểm tuyệt đẹp ở Tokyo, Nhật Bản. Hoàn hảo cho việc tham quan và chụp những bức ảnh tuyệt vời.',
    },
    {
        image: { uri: 'https://ik.imagekit.io/tvlk/blog/2024/07/canh-dep-viet-nam-6.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2' },
        title: 'Tầm Nhìn Tuyệt Vời',
        totalFollowers: 245,
        description: 'Trải nghiệm những tầm nhìn ngoạn mục của vẻ đẹp thiên nhiên Việt Nam.',
    },
    {
        image: require('../../../../assets/images/natural2.jpg'),
        title: 'Địa Điểm Đẹp',
        totalFollowers: 345,
        description: 'Đây là một địa điểm tuyệt đẹp ở Tokyo, Nhật Bản. Hoàn hảo cho việc tham quan và chụp những bức ảnh tuyệt vời.',
    },
    {
        image: { uri: 'https://ik.imagekit.io/tvlk/blog/2024/07/canh-dep-viet-nam-6.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2' },
        title: 'Tầm Nhìn Tuyệt Vời',
        totalFollowers: 521,
        description: 'Trải nghiệm những tầm nhìn ngoạn mục của vẻ đẹp thiên nhiên Việt Nam.',
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