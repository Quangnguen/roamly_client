import React, { use, useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Modal, StyleSheet, Dimensions, ScrollView, TextInput, Button, Platform } from 'react-native';
// Nếu dùng expo-image-picker:
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, clearMessage } from '../redux/slices/userSlice';
import { RootState, AppDispatch } from '../redux/store';
import { getUserProfile } from '@/src/data/api/userApi';

const { width } = Dimensions.get('window');
const ITEM_SIZE = width / 4 - 16; // Sửa lại từ 3 thành 4

type Memory = {
  id: string;
  images: string[];
  date: string;
  location: string;
  diary: string;
};

type MemoriesGridProps = {
  memories: Memory[];
  userId: string;
};

const MemoriesGrid: React.FC<MemoriesGridProps> = ({ memories, userId }) => {
  const { profile } = useSelector((state: RootState) => state.user);
  const [selected, setSelected] = useState<Memory | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDiary, setNewDiary] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editDate, setEditDate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDiary, setEditDiary] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const [memoriesState, setMemoriesState] = useState<Memory[]>(memories);

  const addMemoryItem = { id: 'add', images: [''], date: '', location: '', diary: '' };
  // Chỉ thêm nút "+" nếu userId === profile?.id
  const dataWithAdd = userId === profile?.id ? [addMemoryItem, ...memoriesState] : memoriesState;



    useEffect(() => {
      dispatch(fetchUserProfile())
    }, [dispatch]);

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
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.location} numberOfLines={1}>{item.location}</Text>
      </View>
    );
  };

  // Hàm xử lý scroll để cập nhật chỉ số ảnh hiện tại
  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
    setCurrentImageIdx(idx);
  };

  const handleAddMemory = () => {
    // Xử lý thêm kỷ niệm mới
    alert('Thêm kỷ niệm mới với thông tin:\n' + JSON.stringify({ newImages, newDate, newLocation, newDiary }));
    // Đóng modal sau khi thêm
    setShowAddModal(false);
  };

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 10, // số ảnh tối đa
    });
    if (!result.canceled) {
      setNewImages(result.assets.map(asset => asset.uri));
    }
  };

  const startEdit = () => {
    if (selected) {
      setEditMode(true);
      setEditImages(selected.images);
      setEditDate(selected.date);
      setEditLocation(selected.location);
      setEditDiary(selected.diary);
    }
  };

  const saveEdit = () => {
    if (selected) {
      // Xử lý lưu thay đổi
      alert('Lưu thay đổi với thông tin:\n' + JSON.stringify({ editImages, editDate, editLocation, editDiary }));
      // Đóng modal sau khi lưu
      setSelected(null);
      setEditMode(false);
    }
  };

  const pickEditImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 10, // số ảnh tối đa
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
    }
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
            <FlatList
              data={selected.images}
              horizontal
              pagingEnabled
              keyExtractor={(_, idx) => idx.toString()}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.detailImage} />
              )}
              style={{ marginBottom: 16 }}
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            />
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
            <Text style={styles.detailDate}>{selected.date}</Text>
            <Text style={styles.detailLocation}>{selected.location}</Text>
            <Text style={styles.detailDiary}>{selected.diary}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              {userId === profile?.id ? (
                <>
                  <TouchableOpacity style={[styles.saveBtn, { flex: 1 }]} onPress={startEdit}>
                    <Text style={styles.saveBtnText}>Sửa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.cancelBtn, { flex: 1 }]} onPress={() => setSelected(null)}>
                    <Text style={styles.cancelBtnText}>Đóng</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { flex: 1, backgroundColor: '#ffdddd', borderWidth: 1, borderColor: '#ff4444' }]}
                    onPress={handleDelete}
                  >
                    <Text style={[styles.cancelBtnText, { color: '#ff4444' }]}>Xóa</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={[styles.cancelBtn, { flex: 1 }]} onPress={() => setSelected(null)}>
                  <Text style={styles.cancelBtnText}>Đóng</Text>
                </TouchableOpacity>
              )}
            </View>
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
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.inputLabel}>Ghi chú</Text>
              <TextInput
                placeholder="Đoạn text gợi nhớ"
                value={editDiary}
                onChangeText={setEditDiary}
                multiline
                style={[styles.input, { minHeight: 60 }]}
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

      {/* Modal thêm kỷ niệm mới */}
      { userId === profile?.id ? (<Modal
        visible={showAddModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowAddModal(false)}
      >
        <ScrollView
          style={styles.addModalContainer}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.modalTitle}>Thêm kỷ niệm mới</Text>

          <TouchableOpacity style={styles.pickImageBtn} onPress={pickImages}>
            <Text style={styles.pickImageText}>+ Chọn ảnh (nhiều)</Text>
          </TouchableOpacity>

          {newImages.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {newImages.map((uri, idx) => (
                <Image key={idx} source={{ uri }} style={styles.previewImage} />
              ))}
            </ScrollView>
          )}

          <View style={{ marginBottom: 12 }}>
            <Text style={styles.inputLabel}>Ngày</Text>
            <TextInput
              placeholder="VD: 2024-05-01"
              value={newDate}
              onChangeText={setNewDate}
              style={styles.input}
              placeholderTextColor="#b3c6e0"
            />
          </View>
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.inputLabel}>Tên địa điểm</Text>
            <TextInput
              placeholder="Nhập tên địa điểm"
              value={newLocation}
              onChangeText={setNewLocation}
              style={styles.input}
              placeholderTextColor="#b3c6e0"
            />
          </View>
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.inputLabel}>Ghi chú</Text>
            <TextInput
              placeholder="Đoạn text gợi nhớ"
              value={newDiary}
              onChangeText={setNewDiary}
              multiline
              style={[styles.input, { minHeight: 60 }]}
              placeholderTextColor="#b3c6e0"
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
            <TouchableOpacity style={[styles.saveBtn, { flex: 1 }]} onPress={handleAddMemory}>
              <Text style={styles.saveBtnText}>Lưu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cancelBtn, { flex: 1 }]} onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>) : ''}
    </>
  );
};

const styles = StyleSheet.create({
  grid: {
    padding: 8,
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
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  addBox: {
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#b3c6e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
    marginTop: 2,
    fontWeight: '500',
  },
  location: {
    fontSize: 13,
    color: '#222',
    textAlign: 'center',
    maxWidth: ITEM_SIZE,
    fontWeight: '600',
  },
  detailContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  detailImage: {
    width: width - 32,
    height: width - 32,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#228be6',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  detailDate: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  detailLocation: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 8,
    textAlign: 'center',
    color: '#228be6',
  },
  detailDiary: {
    fontSize: 15,
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  closeBtn: {
    alignSelf: 'center',
    backgroundColor: '#228be6',
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
    marginBottom: 24,
  },
  addModalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
    color: '#228be6',
  },
  input: {
    borderWidth: 1,
    borderColor: '#b3c6e0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f8fafd',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#228be6',
    marginBottom: 4,
    marginLeft: 2,
  },
  pickImageBtn: {
    backgroundColor: '#e3f0ff',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#b3c6e0',
  },
  pickImageText: {
    color: '#228be6',
    fontWeight: 'bold',
    fontSize: 15,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#b3c6e0',
  },
  saveBtn: {
    backgroundColor: '#228be6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelBtn: {
    backgroundColor: '#eee',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MemoriesGrid;