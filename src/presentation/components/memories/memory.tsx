import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Modal, StyleSheet, Dimensions, ScrollView, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import CreateMemory from './CreateMemory';
import { deleteMemory, fetchMemories, fetchMyMemories } from '../../redux/slices/memorySlice';
import { dependencies } from '@/src/dependencies/dependencies';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const ITEM_SIZE = width / 4 - 16;

type Memory = {
  id: string;
  title?: string;
  description?: string | null;
  startDate?: string;
  endDate?: string;
  cost?: string | Record<string, any> | null;
  placesVisited?: string[];
  tags?: string[];
  homestay?: string | null;
  participants?: string[];
  privacy?: string;
  userId?: string;
  images: string[]; // mapped from imageUrl
  createdAt?: string;
  updatedAt?: string;
};

type MemoriesGridProps = {
  userId: string;
};

const MemoriesGrid: React.FC<MemoriesGridProps> = ({ userId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.auth);

  // State cho memories khi gọi API trực tiếp
  const [externalMemories, setExternalMemories] = useState<any[]>([]);
  const [loadingExternal, setLoadingExternal] = useState(false);

  // Lấy memories từ redux nếu là user hiện tại
  const myMemories = useSelector((state: RootState) => state.memory.myMemories);

  // Lấy dữ liệu phù hợp
  const apiMemories = userId === profile?.id ? myMemories : externalMemories;

  // Map dữ liệu từ API về đúng định dạng Memory[]
  const mappedMemories: Memory[] = Array.isArray(apiMemories)
    ? apiMemories.map((item) => ({
        ...item,
        images: item.imageUrl || [],
      }))
    : [];

  const [selected, setSelected] = useState<Memory | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editDate, setEditDate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [memoriesState, setMemoriesState] = useState<Memory[]>(mappedMemories);
  const [editMemory, setEditMemory] = useState(null);

  const addMemoryItem = { id: 'add', images: [''], title: '', startDate: '', placesVisited: [] };
  const dataWithAdd = userId === profile?.id ? [addMemoryItem, ...memoriesState] : memoriesState;

  // Fetch redux hoặc API trực tiếp
  useEffect(() => {
    if (userId === profile?.id) {
      dispatch(fetchMyMemories());
    } else {
      setLoadingExternal(true);
      dependencies.MemoryUseCase.getMemories(userId)
        .then((res: any) => {
          setExternalMemories(res?.data || []);
        })
        .finally(() => setLoadingExternal(false));
    }
  }, [dispatch, userId, profile?.id]);

  // Cập nhật memoriesState khi dữ liệu thay đổi
  useEffect(() => {
    setMemoriesState(mappedMemories);
  }, [apiMemories]);

  const renderItem = ({ item }: { item: Memory }) => {
    if (item.id === 'add') {
      return (
        <View style={styles.gridItem}>
          <TouchableOpacity
            style={[styles.image, styles.addBox]}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={{ fontSize: 36, color: '#888' }}>+</Text>
          </TouchableOpacity>
          <Text style={styles.date}></Text>
          <Text style={styles.location}></Text>
        </View>
      );
    }
    return (
      <View style={styles.gridItem}>
        <TouchableOpacity onPress={() => { setSelected(item); setCurrentImageIdx(0); }}>
          <Image source={{ uri: item.images[0] }} style={styles.image} />
        </TouchableOpacity>
        <Text style={styles.date}>{item.startDate ? item.startDate.slice(0, 10) : ''}</Text>
        <Text style={styles.location} numberOfLines={1}>{item.title}</Text>
      </View>
    );
  };

  const getPrivacyIcon = (privacy: string) => {
  switch(privacy) {
    case 'private': return '🔒';
    case 'tagged': return '🏷️';
    case 'followers': return '👥';
    case 'public': return '🌐';
    default: return '🌐';
  }
};


  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
    setCurrentImageIdx(idx);
  };

  const startEdit = () => {
    if (selected) {
      setEditMemory(selected);
      setShowAddModal(true);
    }
  };

  const saveEdit = () => {
    if (selected) {
      // Xử lý lưu thay đổi (có thể dispatch action update ở đây)
      alert('Lưu thay đổi với thông tin:\n' + JSON.stringify({ editImages, editDate, editLocation }));
      setSelected(null);
      setEditMode(false);
    }
  };

  const pickEditImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 10,
    });
    if (!result.canceled) {
      setEditImages(result.assets.map(asset => asset.uri));
    }
  };

  const handleDelete = () => {
    if (selected) {
      setMemoriesState(prev => prev.filter(m => m.id !== selected.id));
      setSelected(null);
      setEditMode(false);
      dispatch(deleteMemory(selected.id)); // Giả sử có action deleteMemory
    }
  };

  // Khi thêm memory mới thành công từ CreateMemory
  const handleMemorySave = (memoryData: any) => {
    setMemoriesState(prev => [memoryData, ...prev]);
    setShowAddModal(false);
  };

  // Khi đóng modal sửa
  const handleCloseEdit = () => {
    setEditMemory(null);
    setShowAddModal(false);
    setSelected(null); // Thêm dòng này để bỏ chọn memory khi đóng modal edit
  };

  return (
    <>
      <FlatList
        data={dataWithAdd}
        renderItem={renderItem}
        keyExtractor={(item: Memory) => item.id}
        numColumns={4}
        contentContainerStyle={styles.grid}
      />

      <Modal
        visible={!!selected}
        animationType="slide"
        transparent={false}
        onRequestClose={() => { setSelected(null); setEditMode(false); }}
      >
        {selected && !editMode && (
          <ScrollView style={styles.detailContainer}>
            {/* Header cải tiến với gradient */}
            <View style={styles.detailHeader}>
              <TouchableOpacity style={styles.backButton} onPress={() => setSelected(null)}>
                <Ionicons name="arrow-back" size={24} color="#228be6" />
              </TouchableOpacity>
              <Text style={styles.detailHeaderTitle}>Chi tiết kỷ niệm</Text>
              <View style={{width: 40}}></View>
            </View>

            {/* Ảnh carousel cải tiến */}
            <View style={styles.imageContainer}>
              <FlatList
                data={selected.images}
                horizontal
                pagingEnabled
                keyExtractor={(_, idx) => idx.toString()}
                renderItem={({ item }) => (
                  <View style={styles.imageWrapper}>
                    <Image source={{ uri: item }} style={styles.detailImage} />
                  </View>
                )}
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              />
              
              {/* Dots indicator cải tiến */}
              <View style={styles.dotsContainer}>
                {selected.images.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      idx === currentImageIdx ? styles.activeDot : null,
                    ]}
                  />
                ))}
              </View>
            </View>
            
            {/* Tiêu đề nổi bật hơn */}
            <View style={styles.titleContainer}>
              <Text style={styles.detailTitle}>
                {selected.title ? selected.title : 'Không được chia sẻ'}
              </Text>
              {selected.startDate && (
                <View style={styles.dateChip}>
                  <Text style={styles.dateChipText}>
                    {selected.startDate.slice(0, 10)}
                    {selected.endDate ? ` - ${selected.endDate.slice(0, 10)}` : ''}
                  </Text>
                </View>
              )}
            </View>

            {/* Card thông tin chi tiết */}
            <View style={styles.detailCardContainer}>
              <View style={styles.detailCard}>
                <View style={styles.detailRowHeader}>
                  <Text style={styles.detailRowHeaderIcon}>🧳</Text>
                  <Text style={styles.detailRowHeaderText}>THÔNG TIN CHUYẾN ĐI</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Giới thiệu</Text>
                  <Text style={styles.detailDescription}>
                    {selected.description ? selected.description : 'Không được chia sẻ'}
                  </Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Chi tiết</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <Text style={styles.detailLabel}>Địa điểm:</Text>
                    <Text style={styles.detailValue}>
                      {selected.placesVisited && selected.placesVisited.length > 0
                        ? selected.placesVisited.join(', ')
                        : 'Không được chia sẻ'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>🏠</Text>
                    <Text style={styles.detailLabel}>Homestay:</Text>
                    <Text style={styles.detailValue}>
                      {selected.homestay ? selected.homestay : 'Không được chia sẻ'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>💰</Text>
                    <Text style={styles.detailLabel}>Chi phí:</Text>
                    {
                      !selected.cost ||
                      (typeof selected.cost === 'object' && Object.keys(selected.cost).length === 0) ? (
                        <Text style={styles.detailValue}>Không được chia sẻ</Text>
                      ) : typeof selected.cost === 'string' ? (
                        <Text style={styles.detailValue}>{selected.cost}</Text>
                      ) : null
                    }
                  </View>
                  {typeof selected.cost === 'object' && selected.cost && Object.keys(selected.cost).length > 0 && (
                    <View style={styles.costCardContainer}>
                      {Object.entries(selected.cost).map(([key, value], idx) => {
                        // Định dạng tiền tệ VND
                        let formattedValue = '';
                        if (!isNaN(Number(value))) {
                          formattedValue = Number(value).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
                        } else {
                          formattedValue = value;
                        }
                        if (key === 'total' || key === 'Tổng chi phí') {
                          return (
                            <View key={idx} style={styles.totalCostContainer}>
                              <Text style={styles.totalCostLabel}>Tổng chi phí</Text>
                              <Text style={styles.totalCostAmount}>{formattedValue}</Text>
                            </View>
                          );
                        }
                        return (
                          <View key={idx} style={styles.costRow}>
                            <Text style={styles.costCategory}>{key}</Text>
                            <Text style={styles.costAmount}>{formattedValue}</Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}><Text style={styles.detailIcon}>{getPrivacyIcon(selected.privacy ?? 'public')}</Text></Text>
                    <Text style={styles.detailLabel}>Quyền riêng tư:</Text>
                    <Text style={[
                      styles.detailValue, 
                      {color: selected.privacy === 'private' ? '#ff6b6b' : '#51cf66'}
                    ]}>
                      {selected.privacy === 'private' 
                      ? 'Chỉ mình tôi' 
                      : selected.privacy === 'tagged' 
                        ? 'Bạn bè được gắn thẻ' 
                        : selected.privacy === 'followers' 
                          ? 'Bạn bè follow' 
                          : 'Công khai'}
                    </Text>
                  </View>
                </View>
                
                {/* Tags */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Thẻ</Text>
                  <View style={styles.tagsContainer}>
                    {selected.tags && selected.tags.length > 0 ? (
                      selected.tags.map((tag, index) => (
                        <View key={index} style={styles.tagChip}>
                          <Text style={styles.tagText}>#{tag}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={{ color: '#6b7280' }}>Không được chia sẻ</Text>
                    )}
                  </View>
                </View>
                
                {/* Participants */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Người tham gia</Text>
                  <View style={styles.participantsContainer}>
                    {selected.participants && selected.participants.length > 0 ? (
                      selected.participants.map((person, index) => (
                        <View key={index} style={styles.participantChip}>
                          <View style={styles.participantAvatar}>
                            <Text style={styles.participantInitial}>{person.charAt(0).toUpperCase()}</Text>
                          </View>
                          <Text style={styles.participantText}>{person}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={{ color: '#6b7280' }}>Không được chia sẻ</Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
            
            {/* Nút tác vụ đẹp hơn */}
            {userId === profile?.id && (
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={styles.editButton} onPress={startEdit}>
                  <Text style={styles.buttonIcon}>✏️</Text>
                  <Text style={styles.editButtonText}>Chỉnh sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                  <Text style={styles.buttonIcon}>🗑️</Text>
                  <Text style={styles.editButtonText}>Xóa kỷ niệm</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}

        {selected && editMode && (
          <ScrollView style={styles.addModalContainer} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <Text style={styles.modalTitle}>Sửa kỷ niệm</Text>
            <TouchableOpacity style={styles.pickImageBtn} onPress={pickEditImages}>
              <Text style={styles.pickImageText}>Chọn lại ảnh</Text>
            </TouchableOpacity>
            {editImages.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {editImages.map((uri, idx) => (
                  <Image key={idx} source={{ uri }} style={styles.previewImage} />
                ))}
              </ScrollView>
            )}
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.inputLabel}>Ngày</Text>
              <TextInput
                placeholder="VD: 2024-05-01"
                value={editDate}
                onChangeText={setEditDate}
                style={styles.input}
                placeholderTextColor="#b3c6e0"
              />
            </View>
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.inputLabel}>Tên địa điểm</Text>
              <TextInput
                placeholder="Nhập tên địa điểm"
                value={editLocation}
                onChangeText={setEditLocation}
                style={styles.input}
                placeholderTextColor="#b3c6e0"
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              {userId === profile?.id ? (
                <>
                  <TouchableOpacity style={[styles.saveBtn, { flex: 1 }]} onPress={saveEdit}>
                    <Text style={styles.saveBtnText}>Lưu</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.cancelBtn, { flex: 1 }]} onPress={() => setEditMode(false)}>
                    <Text style={styles.cancelBtnText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { flex: 1, backgroundColor: '#ffdddd', borderWidth: 1, borderColor: '#ff4444' }]}
                    onPress={handleDelete}
                  >
                    <Text style={[styles.cancelBtnText, { color: '#ff4444' }]}>Xóa</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={[styles.cancelBtn, { flex: 1 }]} onPress={() => setEditMode(false)}>
                  <Text style={styles.cancelBtnText}>Đóng</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        )}
      </Modal>

      {/* Sử dụng CreateMemory component */}
      {userId === profile?.id && (
        <CreateMemory
          visible={showAddModal}
          onClose={handleCloseEdit}
          onSave={handleMemorySave}
          memory={editMemory}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  grid: {
    padding: 12,
    backgroundColor: '#f8fafb',
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
    margin: 6,
    maxWidth: ITEM_SIZE + 12,
  },
  image: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: ITEM_SIZE / 2,
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
    borderWidth: 2,
    borderColor: '#e8f2ff',
    shadowColor: '#228be6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  addBox: {
    backgroundColor: '#e8f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#90caf9',
    borderStyle: 'dashed',
  },
  date: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
    marginTop: 2,
    fontWeight: '500',
  },
  location: {
    fontSize: 14,
    color: '#1f2937',
    textAlign: 'center',
    maxWidth: ITEM_SIZE,
    fontWeight: '600',
  },
  detailContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafb',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#e8f2ff',
    marginRight: 12,
  },
  backIcon: {
    fontSize: 18,
    color: '#228be6',
  },
  detailHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  imageWrapper: {
    width: width - 40,
    height: width - 40,
    borderRadius: 24,
    marginRight: 8,
    marginBottom: 12,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d1d5db',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#228be6',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  titleContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#228be6',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  dateChip: {
    backgroundColor: '#e8f2ff',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  dateChipText: {
    color: '#228be6',
    fontWeight: '500',
    fontSize: 14,
  },
  detailCardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  detailRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
    marginBottom: 12,
  },
  detailRowHeaderIcon: {
    fontSize: 22,
    marginRight: 8,
    color: '#228be6',
  },
  detailRowHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  detailSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  detailIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#6b7280',
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginRight: 8,
  },
  detailValue: {
    fontSize: 15,
    color: '#1f2937',
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: '#e8f2ff',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#90caf9',
  },
  tagText: {
    color: '#228be6',
    fontWeight: '500',
    fontSize: 14,
  },
  participantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  participantChip: {
    backgroundColor: '#e8f2ff',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#90caf9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#90caf9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  participantInitial: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  participantText: {
    color: '#228be6',
    fontWeight: '500',
    fontSize: 14,
  },
  detailFooter: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  detailFooterText: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  editButton: {
    backgroundColor: '#228be6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 4,
    fontSize: 16,
  },
  // Styles cho modal sửa
  addModalContainer: {
    flex: 1,
    backgroundColor: '#f8fafb',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#228be6',
    marginBottom: 20,
  },
  pickImageBtn: {
    backgroundColor: '#e8f2ff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#90caf9',
  },
  pickImageText: {
    color: '#228be6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  saveBtn: {
    backgroundColor: '#228be6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelBtnText: {
    color: '#6b7280',
    fontWeight: 'bold',
    fontSize: 16,
  },
  costContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 30,
  },
  costCategory: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  costAmount: {
    fontSize: 15,
    color: '#1f2937',
    textAlign: 'right',
    minWidth: 100,
  },
  totalCostRow: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 12,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#228be6',
    textAlign: 'right',
    minWidth: 100,
  },
  costCardContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding:16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 30,
  },
  costIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e8f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  costIcon: {
    fontSize: 16,
    color: '#228be6',
  },
  costDetails: {
    flex: 1,
  },
  costDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  totalCostContainer: {
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    height: 30,
  },
  totalCostLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  totalCostAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#228be6',
    textAlign: 'right',
    minWidth: 100,
  },
});

export default MemoriesGrid;