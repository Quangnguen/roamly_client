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
        const response = await authorizedRequest(`${API_BASE_URL}/memory/create`, {
            method: 'POST',
            body: formData,
        });

        // Check for status === 'success' and statusCode in 2xx range
        if (!response || response.status !== 'success' || (response.statusCode && response.statusCode >= 400)) {
            throw new Error(response?.message || 'Failed to create memory');
        }

        return response; // or return response if you want the whole object
    } catch (error: any) {
        console.error('Create memory API error:', error);
        throw error;
    }
};

export const getMemoriesApi = async (userId?: string) => {
  try {
    const url = userId 
      ? `${API_BASE_URL}/memory/user/${userId}`
      : `${API_BASE_URL}/memory/my-memories`;
    
    const response = await authorizedRequest(url, {
      method: 'GET',
    });

      if (!response || response.status !== 'success' || (response.statusCode && response.statusCode >= 400)) {
            throw new Error(response?.message || 'Failed to create memory');
        }

    return response;
  } catch (error) {
    console.error('Get memories API error:', error);
    throw error;
  }
};

export const updateMemoryApi = async (memoryId: string, memoryData: Partial<CreateMemoryInterface>) => {
  try {
    const formData = new FormData();

    // Thông tin cơ bản
    if (memoryData.title !== undefined) {
      formData.append('title', memoryData.title);
    }
    if (memoryData.description !== undefined) {
      formData.append('description', memoryData.description || '');
    }
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
        formData.append('tags', tag || '');
      });
    }

    // Thành viên tham gia
    if (memoryData.participants && memoryData.participants.length > 0) {
      memoryData.participants.forEach(participant => {
        formData.append('participants', participant || '');
      });
    }

    // Địa điểm
    if (memoryData.placesVisited && memoryData.placesVisited.length > 0) {
      memoryData.placesVisited.forEach(place => {
        formData.append('placesVisited', place || '');
      });
    }

    // Thông tin khác
    if (memoryData.homestay) {
      formData.append('homestay', memoryData.homestay ?? '');
    }
    if (memoryData.privacy !== undefined) {
      formData.append('privacy', memoryData.privacy);
    }

    // Xử lý hình ảnh
    if (memoryData.images && memoryData.images.length > 0) {
      for (let i = 0; i < memoryData.images.length; i++) {
        const imageUri = memoryData.images[i];
        try {
          const fileName = imageUri.split('/').pop() || `image_${i}.jpg`;
          const fileType = 'image/jpeg';
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


    const response = await authorizedRequest(`${API_BASE_URL}/memory/update/${memoryId}`, {
      method: 'PUT',
      body: formData,
    });

    // Nếu API trả về kiểu response giống createMemoryApi
    if (!response || response.status !== 'success' || (response.statusCode && response.statusCode >= 400)) {
      throw new Error(response?.message || 'Failed to update memory');
    }
    console.log('Update memory response:', response);
    return response;
  } catch (error) {
    console.error('Update memory API error:', error);
    throw error;
  }
};

export const deleteMemoryApi = async (memoryId: string) => {
  try {
    const response = await authorizedRequest(`${API_BASE_URL}/memory/delete/${memoryId}`, {
      method: 'DELETE',
    });

    if (!response || response.status !== 'success' || (response.statusCode && response.statusCode >= 400)) {
            throw new Error(response?.message || 'Failed to delete memory');
        }

    return response; // Hoặc trả về response nếu bạn muốn toàn bộ đối tượng
  } catch (error) {
    console.error('Delete memory API error:', error);
    throw error;
  }
};
