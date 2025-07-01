import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { searchUsers, clearSearchResults } from '../../redux/slices/userSlice';
import { BACKGROUND } from '@/src/const/constants';

const UserSearchExample: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const {
        searchResults,
        searchLoading,
        searchError,
        searchPagination
    } = useSelector((state: RootState) => state.user);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            dispatch(searchUsers({
                q: searchQuery.trim(),
                page: 1,
                limit: 10
            }));
            setCurrentPage(1);
        }
    };

    const handleLoadMore = () => {
        if (searchPagination && currentPage < searchPagination.totalPages) {
            dispatch(searchUsers({
                q: searchQuery.trim(),
                page: currentPage + 1,
                limit: 10
            }));
            setCurrentPage(currentPage + 1);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setCurrentPage(1);
        dispatch(clearSearchResults());
    };

    const renderUserItem = ({ item }: { item: any }) => (
        <View style={styles.userItem}>
            <Image
                source={{
                    uri: item.profilePic || 'https://randomuser.me/api/portraits/men/1.jpg'
                }}
                style={styles.avatar}
            />
            <View style={styles.userInfo}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.followerCount}>
                    {item.followerCount} người theo dõi
                </Text>
            </View>
            <View style={styles.followStatus}>
                <Text style={[
                    styles.followText,
                    { color: item.isFollowing ? '#3897f0' : '#8e8e8e' }
                ]}>
                    {item.isFollowing ? 'Đang theo dõi' : 'Chưa theo dõi'}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tìm kiếm người dùng</Text>

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Nhập tên hoặc username..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
                    <Text style={styles.searchButtonText}>Tìm</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>Xóa</Text>
                </TouchableOpacity>
            </View>

            {/* Loading */}
            {searchLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3897f0" />
                    <Text>Đang tìm kiếm...</Text>
                </View>
            )}

            {/* Error */}
            {searchError && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Lỗi: {searchError}</Text>
                </View>
            )}

            {/* Results */}
            {searchPagination && (
                <View style={styles.paginationInfo}>
                    <Text style={styles.paginationText}>
                        Trang {searchPagination.currentPage}/{searchPagination.totalPages} -
                        Tổng {searchPagination.total} kết quả
                    </Text>
                </View>
            )}

            <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={renderUserItem}
                style={styles.resultsList}
                ListEmptyComponent={
                    !searchLoading && searchQuery.length > 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Không tìm thấy người dùng nào</Text>
                        </View>
                    ) : null
                }
                ListFooterComponent={
                    searchPagination && currentPage < searchPagination.totalPages ? (
                        <TouchableOpacity onPress={handleLoadMore} style={styles.loadMoreButton}>
                            <Text style={styles.loadMoreText}>Tải thêm</Text>
                        </TouchableOpacity>
                    ) : null
                }
            />
        </View>
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
        marginBottom: 20,
        textAlign: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#fff',
    },
    searchButton: {
        backgroundColor: '#3897f0',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        justifyContent: 'center',
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    clearButton: {
        backgroundColor: '#8e8e8e',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        justifyContent: 'center',
    },
    clearButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    loadingContainer: {
        alignItems: 'center',
        padding: 20,
    },
    errorContainer: {
        backgroundColor: '#ffe6e6',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        color: '#d63031',
        textAlign: 'center',
    },
    paginationInfo: {
        backgroundColor: '#f0f0f0',
        padding: 8,
        borderRadius: 8,
        marginBottom: 16,
    },
    paginationText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 12,
    },
    resultsList: {
        flex: 1,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        marginBottom: 8,
        borderRadius: 8,
        elevation: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#262626',
    },
    name: {
        fontSize: 14,
        color: '#8e8e8e',
        marginTop: 2,
    },
    followerCount: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    followStatus: {
        paddingVertical: 4,
    },
    followText: {
        fontSize: 12,
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        color: '#8e8e8e',
        fontSize: 16,
    },
    loadMoreButton: {
        backgroundColor: '#3897f0',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    loadMoreText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default UserSearchExample; 