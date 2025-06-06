import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface AccountHeaderProps {
    username: string;
    onMenuPress: () => void;
}

const AccountHeader: React.FC<AccountHeaderProps> = ({ username, onMenuPress }) => {
    return (
        <View style={styles.header}>
            <View />
            <View style={styles.usernameContainer}>
                <Text style={styles.username}>{username}</Text>
            </View>
            <TouchableOpacity onPress={onMenuPress}>
                <Feather name="menu" size={24} color="black" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#000',
    },
    usernameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    username: {
        fontSize: 16,
        fontWeight: '700',
        marginRight: 5,
    },
});

export default AccountHeader; 