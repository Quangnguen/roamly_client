export interface User {
  id?: string; // ID của người dùng
  name: string; // Tên đầy đủ của người dùng
  email: string; // Email của người dùng
  username: string; // Tên người dùng (username)
  token?: string; // Token xác thực (nếu cần)
  bio?: string; // Tiểu sử của người dùng
  profilePic?: string; // URL ảnh đại diện
  accountStatus: boolean; // Trạng thái tài khoản (true: hoạt động, false: bị khóa)
  role?: number; // Vai trò của người dùng (ví dụ: 1 = admin, 2 = user)
  private?: boolean; // Tài khoản có ở chế độ riêng tư không
  followers?: Array<{ id: string; name: string }>; // Danh sách người theo dõi
  following?: Array<{ id: string; name: string }>; // Danh sách người đang theo dõi
  refreshToken?: string; // Refresh token (nếu cần)
  createdAt: string; // Thời gian tạo tài khoản
  updatedAt?: string; // Thời gian cập nhật tài khoản gần nhất
  deletedAt?: string; // Thời gian tài khoản bị xóa (nếu có)
  phoneNumber?: string; // Số điện thoại của người dùng
  followersCount?: number; // Số lượng người theo dõi
  followingsCount?: number; // Số lượng người đang theo dõi
}
