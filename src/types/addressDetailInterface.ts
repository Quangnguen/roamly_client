interface AddressDetails {
    id: string; // ID của địa điểm
    name: string; // Tên của địa điểm
    numberFollowers: number; // Số lượng đánh giá
    address: string; // Địa chỉ của địa điểm
    description: string; // Mô tả chi tiết về địa điểm
    images: { uri: string }[]; // Mảng các URL ảnh của địa điểm
    isFollowing: boolean; // Trạng thái theo dõi
    rating: number; // Đánh giá của địa điểm
    reviewsCount: number;
}