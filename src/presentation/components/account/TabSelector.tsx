import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';

interface TabSelectorProps {
    activeTab: 'grid' | 'list';
    onTabChange: (tab: 'grid' | 'list') => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({ activeTab, onTabChange }) => {
    return (
        <View style={styles.tabSelector}>
            <TouchableOpacity
                style={[styles.tabButton, activeTab === 'grid' && styles.activeTab]}
                onPress={() => onTabChange('grid')}
            >
                <MaterialIcons name="grid-on" size={24} color={activeTab === 'grid' ? 'black' : 'gray'} />
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tabButton, activeTab === 'list' && styles.activeTab]}
                onPress={() => onTabChange('list')}
            >
                <Feather name="user" size={24} color={activeTab === 'list' ? 'black' : 'gray'} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    tabSelector: {
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderTopColor: '#DBDBDB',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
    },
    activeTab: {
        borderBottomWidth: 1,
        borderBottomColor: 'black',
    },
});

export default TabSelector; 