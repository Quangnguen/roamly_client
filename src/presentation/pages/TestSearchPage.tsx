import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { searchUsers, clearSearchResults } from '../redux/slices/userSlice';
import UserTab from '../components/search/UserTab';
import { BACKGROUND } from '@/src/const/constants';

const TestSearchPage: React.FC = () => {
    const [searchText, setSearchText] = useState<string>('');
    const dispatch = useDispatch<AppDispatch>();

    const { searchResults, searchLoading, searchError, searchPagination } = useSelector(
        (state: RootState) => state.user
    );

    const handleSearch = () => {
        if (searchText.trim()) {
            dispatch(searchUsers({
                q: searchText.trim(),
                page: 1,
                limit: 10
            }));
        }
    };

    const handleClear = () => {
        setSearchText('');
        dispatch(clearSearchResults());
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Test Search User API</Text>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Nhập tên hoặc username để tìm kiếm..."
                    value={searchText}
                    onChangeText={setSearchText}
                    onSubmitEditing={handleSearch}
                />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
                        <Text style={styles.buttonText}>Tìm kiếm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                        <Text style={styles.buttonText}>Xóa</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Debug Info */}
            <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Info:</Text>
                <Text style={styles.debugText}>Search Text: "{searchText}"</Text>
                <Text style={styles.debugText}>Loading: {searchLoading ? 'Yes' : 'No'}</Text>
                <Text style={styles.debugText}>Error: {searchError || 'None'}</Text>
                <Text style={styles.debugText}>
                    Results: {searchResults.length} items
                </Text>
                {searchPagination && (
                    <Text style={styles.debugText}>
                        Pagination: {searchPagination.currentPage}/{searchPagination.totalPages}
                        (Total: {searchPagination.total})
                    </Text>
                )}
            </View>

            {/* Results */}
            <View style={styles.resultsContainer}>
                <UserTab searchText={searchText} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#262626',
    },
    searchContainer: {
        marginBottom: 20,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    searchButton: {
        flex: 1,
        backgroundColor: '#3897f0',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    clearButton: {
        flex: 1,
        backgroundColor: '#8e8e8e',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    debugContainer: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    debugTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#262626',
    },
    debugText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    resultsContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 8,
    },
});

export default TestSearchPage; 