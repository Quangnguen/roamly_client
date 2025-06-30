# 🔍 Search Posts API - Hướng dẫn sử dụng

## 📋 Tổng quan

API Search Posts cho phép tìm kiếm bài viết với các tính năng:
- Tìm kiếm theo nội dung caption
- Phân trang kết quả
- Điểm relevance score
- State management với Redux

## 🔧 Các file đã được tạo/cập nhật

### 1. **Interface & Types**
```typescript
// src/types/responses/PostSearchResponseInterface.ts
interface PostSearchResponseInterface {
    message: string;
    statusCode: number;
    data: {
        currentPage: number;
        total: number;
        totalPages: number;
        results: Post[];
    };
}

interface SearchPostParams {
    q: string;        // Query search
    limit?: number;   // Số lượng per page (default: 10)
    page?: number;    // Trang hiện tại (default: 1)
}
```

### 2. **API Layer**
```typescript
// src/data/api/postApi.ts
export const searchPostsApi = async (params: SearchPostParams): Promise<PostSearchResponseInterface> => {
    const { q, limit = 10, page = 1 } = params;
    const queryParams = new URLSearchParams({
        q,
        limit: limit.toString(),
        page: page.toString()
    });
    
    return await authorizedRequest(`${API_BASE_URL}/posts/search?${queryParams}`, {
        method: 'GET',
    });
};
```

### 3. **Repository Layer**
```typescript
// src/data/repositories/postRepository.ts
export interface PostRepository {
    // ... other methods
    searchPosts(params: SearchPostParams): Promise<PostSearchResponseInterface>;
}

// src/data/implements/postRepositoryImpl.ts
async searchPosts(params: SearchPostParams): Promise<PostSearchResponseInterface> {
    const response = await postApi.searchPostsApi(params);
    return response;
}
```

### 4. **UseCase Layer**
```typescript
// src/domain/usecases/postUsecase.ts
async searchPosts(params: SearchPostParams): Promise<PostSearchResponseInterface> {
    return await this.repo.searchPosts(params);
}
```

### 5. **Redux State Management**
```typescript
// src/presentation/redux/slices/postSlice.ts

// State
const initialState = {
    // ... other states
    searchResults: null as PostSearchResponseInterface | null,
    searchLoading: false,
};

// Async Thunk
export const searchPosts = createAsyncThunk<PostSearchResponseInterface, SearchPostParams>(
    'post/searchPosts',
    async (params: SearchPostParams, { rejectWithValue }) => {
        try {
            const response = await postUseCase.searchPosts(params);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Có lỗi khi tìm kiếm bài viết');
        }
    }
);

// Load More Search Posts (for pagination)
export const loadMoreSearchPosts = createAsyncThunk<PostSearchResponseInterface, SearchPostParams>(
    'post/loadMoreSearchPosts',
    async (params: SearchPostParams, { rejectWithValue }) => {
        try {
            const response = await postUseCase.searchPosts(params);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Có lỗi khi tải thêm kết quả');
        }
    }
);

// Actions
export const { clearSearchResults } = postSlice.actions;
```

## 🚀 Cách sử dụng trong Component

### 1. **Import cần thiết**
```typescript
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { searchPosts, clearSearchResults } from '../redux/slices/postSlice';
```

### 2. **Setup trong Component**
```typescript
const MySearchComponent: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const dispatch = useDispatch<AppDispatch>();
    const { searchResults, searchLoading, error } = useSelector((state: RootState) => state.post);
    
    // ... component logic
};
```

### 3. **Thực hiện tìm kiếm**
```typescript
const handleSearch = async () => {
    if (searchQuery.trim()) {
        try {
            await dispatch(searchPosts({
                q: searchQuery.trim(),
                page: 1,
                limit: 10
            })).unwrap();
        } catch (error) {
            console.error('Search error:', error);
        }
    }
};
```

### 4. **Xóa kết quả tìm kiếm**
```typescript
const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    dispatch(clearSearchResults());
};
```

### 5. **Load more kết quả (Pagination)**
```typescript
const handleLoadMore = async () => {
    if (searchResults && searchResults.data.currentPage < searchResults.data.totalPages) {
        try {
            await dispatch(loadMoreSearchPosts({
                q: searchQuery.trim(),
                page: searchResults.data.currentPage + 1,
                limit: 10
            })).unwrap();
        } catch (error) {
            console.error('Load more error:', error);
        }
    }
};
```

### 5. **Hiển thị kết quả**
```typescript
{searchResults && (
    <View>
        <Text>Tìm thấy {searchResults.data.total} kết quả</Text>
        <Text>Trang {searchResults.data.currentPage}/{searchResults.data.totalPages}</Text>
        
        <FlatList
            data={searchResults.data.results}
            renderItem={({ item }) => (
                <View>
                    <Text>{item.caption}</Text>
                    <Text>❤️ {item.likeCount} | 💬 {item.commentCount}</Text>
                    <Text>Score: {item.score}</Text>
                </View>
            )}
            keyExtractor={(item) => item.id}
        />
    </View>
)}
```

## 📊 Cấu trúc Response

### **Success Response**
```json
{
    "message": "Tìm kiếm thành công",
    "statusCode": 200,
    "data": {
        "currentPage": 1,
        "total": 15,
        "totalPages": 2,
        "results": [
            {
                "id": "e3f481cc-53c6-41c8-9a28-cd2f9c4f2f46",
                "authorId": "2b84aa24-668a-40e2-af1c-ad4fc4fa5a6f",
                "imageUrl": ["https://..."],
                "caption": "Buon that, hom nay toi thi truot",
                "location": null,
                "tags": [],
                "isPublic": true,
                "likeCount": 1,
                "commentCount": 31,
                "sharedCount": 0,
                "createdAt": "2025-06-04T09:01:06.391Z",
                "updatedAt": "2025-06-30T14:22:14.292Z",
                "author": {
                    "name": "quang1",
                    "profilePic": "https://..."
                },
                "taggedUsers": [],
                "isLike": false,
                "score": 47.5
            }
        ]
    }
}
```

### **Error Response**
```json
{
    "message": "Có lỗi khi tìm kiếm bài viết",
    "statusCode": 400,
    "error": "Query parameter is required"
}
```

## 🎯 Endpoint

**GET** `/posts/search?q={query}&limit={limit}&page={page}`

### **Parameters:**
- `q` (required): Từ khóa tìm kiếm
- `limit` (optional): Số lượng kết quả per page (default: 10)
- `page` (optional): Trang hiện tại (default: 1)

### **Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

## 💡 Tips và Best Practices

1. **Debounce search input** để tránh quá nhiều API calls
2. **Cache results** cho cùng query để tối ưu performance
3. **Handle loading states** để UX tốt hơn
4. **Implement pagination** cho danh sách dài
5. **Clear results** khi không cần thiết để tiết kiệm memory

## 📝 Integration trong SearchPage

API đã được tích hợp hoàn chỉnh vào `src/presentation/pages/SearchPage.tsx` và `src/presentation/components/search/PostTab.tsx` với các tính năng:

- ✅ **Auto search**: Tự động search khi user nhập từ khóa (debounce 500ms)
- ✅ **Clear search**: Xóa kết quả khi clear search text
- ✅ **Pagination**: Load more kết quả với scroll infinite
- ✅ **Search header**: Hiển thị tổng số kết quả và trang hiện tại
- ✅ **Loading states**: Loading indicator riêng cho search và load more
- ✅ **Empty states**: Thông báo khi không có kết quả

### Cách hoạt động:
1. User mở SearchPage và chọn tab "Bài viết"
2. Nhập từ khóa vào search input
3. Sau 500ms, tự động gọi API search
4. Hiển thị kết quả với thông tin pagination
5. Scroll xuống cuối để load more results
6. Clear search text để về danh sách posts ban đầu

## 🔧 Troubleshooting

### **Lỗi thường gặp:**

1. **"Property 'name' does not exist on type 'Author'"**
   - Sử dụng `item.author.username` thay vì `item.author.name`

2. **"Cannot read property 'data' of null"**
   - Kiểm tra `searchResults` trước khi access `.data`

3. **"Network Error"**
   - Kiểm tra token authentication
   - Verify endpoint URL

## 🎉 Hoàn thành!

API Search Posts đã được hoàn thiện và sẵn sàng sử dụng trong ứng dụng! 🚀 