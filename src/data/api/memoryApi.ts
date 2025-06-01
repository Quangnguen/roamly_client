import { authorizedRequest } from '@/src/utils/authorizedRequest';
import { API_BASE_URL } from '../../const/api'
import { CreateMemoryInterface } from '@/src/types/memoryInterface';

export const createMemoryApi = async (memoryData: CreateMemoryInterface) => {
       const formData = new FormData();

    // Thông tin cơ bản
    formData.append('title', memoryData.title);
    formData.append('description', memoryData.description || '');
    if (memoryData.startDate) {
        formData.append('startDate', memoryData.startDate);
    }
    if (memoryData.endDate) {
        formData.append('endDate', memoryData.endDate);
    }

    // Chi phí - gửi dạng JSON string
    if (memoryData.cost) {
        formData.append('cost', JSON.stringify(memoryData.cost));
    }

    // Tags - gửi từng tag với cùng key 'tags'
    if (memoryData.tags && memoryData.tags.length > 0) {
        memoryData.tags.forEach(tag => {
            formData.append('tags', tag);
        });
    }

    // Thành viên tham gia - gửi từng participant với cùng key 'participants'
    if (memoryData.participants && memoryData.participants.length > 0) {
        memoryData.participants.forEach(participant => {
            formData.append('participants', participant);
        });
    }

    // Địa điểm - gửi từng place với cùng key 'placesVisited'
    if (memoryData.placesVisited && memoryData.placesVisited.length > 0) {
        memoryData.placesVisited.forEach(place => {
            formData.append('placesVisited', place);
        });
    }

    // Thông tin khác
    if (memoryData.homestay) {
        formData.append('homestay', memoryData.homestay);
    }
    if (memoryData.privacy !== undefined) {
        formData.append('privacy', memoryData.privacy);
    }


    // Xử lý hình ảnh - chuyển URI thành File object
    if (memoryData.images && memoryData.images.length > 0) {
        for (let i = 0; i < memoryData.images.length; i++) {
            const imageUri = memoryData.images[i];

            try {
                // Lấy tên file từ URI
                const fileName = imageUri.split('/').pop() || `image_${i}.jpg`;
                const fileType = 'image/jpeg'; // Bạn có thể thay đổi nếu cần

                // Append file vào FormData với key 'images'
                formData.append('images', {
                    uri: imageUri,
                    name: fileName,
                    type: fileType,
                } as any);
            } catch (error) {
                console.error(`Error processing image ${i}:`, error);
            }
        }
    }

    try {
        // Gọi API với FormData
        const response = await authorizedRequest(`${API_BASE_URL}/memory/create`, {
            method: 'POST',
            body: formData,
        });

        // Kiểm tra nếu `response` không hợp lệ
        if (!response || response.statusCode !== 201) {
            throw new Error('Invalid response from server');
        }

        // Nếu response đã là object, không cần gọi response.json()
        if (response.ok === false) {
            throw new Error(response.message || 'Failed to create memory');
        }

        return response;
    } catch (error) {
        console.error('Create memory API error:', error);
        throw error;
    }
};

export const getMemoriesApi = async (userId?: string) => {
  try {
    const url = userId 
      ? `${API_BASE_URL}/memories?userId=${userId}`
      : `${API_BASE_URL}/memories`;
    
    const response = await authorizedRequest(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch memories');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Get memories API error:', error);
    throw error;
  }
};

export const updateMemoryApi = async (memoryId: string, memoryData: Partial<CreateMemoryInterface>) => {
  try {
    const formData = new FormData();
    
    // Chỉ append các field có giá trị
    Object.entries(memoryData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'cost') {
          formData.append(key, JSON.stringify(value));
        } else if (Array.isArray(value)) {
          value.forEach(item => {
            formData.append(key, item);
          });
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await authorizedRequest(`${API_BASE_URL}/memories/${memoryId}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update memory');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Update memory API error:', error);
    throw error;
  }
};

export const deleteMemoryApi = async (memoryId: string) => {
  try {
    const response = await authorizedRequest(`${API_BASE_URL}/memories/${memoryId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete memory');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Delete memory API error:', error);
    throw error;
  }
};
