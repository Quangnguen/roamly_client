import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions, ScrollView, TextInput, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { clearMemoryMessage, createMemory, updateMemory } from '../../redux/slices/memorySlice';
import { AppDispatch, RootState } from '../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from 'expo-router';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

type CreateMemoryProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (memoryData: any) => void;
  memory?: any;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AccountPage'>;

// Thêm hàm removeAccents ở đầu file, trước component
const removeAccents = (str: string): string => {
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

const CreateMemory: React.FC<CreateMemoryProps> = ({ visible, onClose, onSave, memory }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { statusCode, message, status } = useSelector((state: RootState) => state.memory);
  const navigation = useNavigation<NavigationProp>();

  const [newImages, setNewImages] = useState<string[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  // Thay đổi từ string thành array cho địa điểm
  const [placesVisitedList, setPlacesVisitedList] = useState<string[]>([]);
  const [placesInput, setPlacesInput] = useState('');
  const [placeSuggestions, setPlaceSuggestions] = useState<string[]>([
    'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hội An', 'Nha Trang', 'Đà Lạt', 'Phú Quốc', 'Sapa', 'Hạ Long', 'Huế'
  ]);
  const [filteredPlaces, setFilteredPlaces] = useState<string[]>([]);

  const [newHomestay, setNewHomestay] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // State cho chi phí
  const [costItems, setCostItems] = useState<{ key: string, value: string }[]>([]);

  // State cho thành viên tham gia
  const [participantsTags, setParticipantsTags] = useState<string[]>([]);
  const [participantsInput, setParticipantsInput] = useState('');
  const [participantSuggestions, setParticipantSuggestions] = useState<string[]>([
    'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Ngô Văn E'
  ]);
  const [filteredParticipants, setFilteredParticipants] = useState<string[]>([]);

  // State cho homestay
  const [homestaySuggestions, setHomestaySuggestions] = useState<string[]>([
    'Homestay ABC', 'Homestay XYZ', 'Sunshine Homestay', 'Blue House', 'Green Villa'
  ]);
  const [filteredHomestays, setFilteredHomestays] = useState<string[]>([]);

  // State cho quyền riêng tư
  const [shareOption, setShareOption] = useState<'private' | 'tagged' | 'followers' | 'public'>('private');

  // State cho tags
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([
    'biển', 'núi', 'phiêu lưu', 'gia đình', 'bạn bè', 'du lịch', 'nghỉ dưỡng', 'khám phá', 'ẩm thực', 'văn hóa'
  ]);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 10,
    });
    if (!result.canceled) {
      setNewImages(result.assets.map(asset => asset.uri));
    }
  };

  // Hàm tính tổng chi phí
  const calculateTotalCost = (items: { key: string, value: string }[]) => {
    let total = 0;
    items.forEach(item => {
      if (item.key !== 'total' && !isNaN(Number(item.value))) {
        total += Number(item.value);
      }
    });
    return total;
  };

  const handleCostItemChange = (idx: number, field: 'key' | 'value', val: string) => {
    const newItems = [...costItems];
    newItems[idx][field] = val;

    if (field === 'value' && newItems[idx].key !== 'total') {
      // Đếm số phần tử có key và value hợp lệ
      const validItems = newItems.filter(item =>
        item.key && item.key !== 'total' && item.value && !isNaN(Number(item.value))
      );

      // Chỉ tính và hiển thị tổng khi có nhiều hơn 1 phần tử hợp lệ
      if (validItems.length > 1) {
        const total = calculateTotalCost(newItems);
        const totalIdx = newItems.findIndex(i => i.key === 'total');
        if (totalIdx !== -1) {
          newItems[totalIdx].value = total.toString();
        } else {
          // Nếu chưa có total, thêm mới khi đủ điều kiện
          newItems.push({ key: 'total', value: total.toString() });
        }
      } else {
        // Nếu chỉ có 1 phần tử, xóa total nếu có
        const totalIdx = newItems.findIndex(i => i.key === 'total');
        if (totalIdx !== -1) {
          newItems.splice(totalIdx, 1);
        }
      }
    }

    setCostItems(newItems);
  };

  const addCostItem = () => {
    setCostItems([...costItems, { key: '', value: '' }]);
  };

  const removeCostItem = (idx: number) => {
    const newItems = costItems.filter((_, i) => i !== idx);
    const total = calculateTotalCost(newItems);
    const totalIdx = newItems.findIndex(i => i.key === 'total');
    if (totalIdx !== -1) newItems[totalIdx].value = total.toString();
    setCostItems(newItems);
  };

  const handlePlacesInput = (text: string) => {
    setPlacesInput(text);
    if (text.length > 0) {
      const searchText = removeAccents(text.toLowerCase());
      setFilteredPlaces(
        placeSuggestions.filter(
          (place) =>
            removeAccents(place.toLowerCase()).includes(searchText) &&
            !placesVisitedList.includes(place)
        )
      );
    } else {
      setFilteredPlaces([]);
    }
    if (text.endsWith(',') || text.endsWith('\n')) {
      const place = text.replace(/,|\n/g, '').trim();
      if (place && !placesVisitedList.includes(place)) setPlacesVisitedList([...placesVisitedList, place]);
      setPlacesInput('');
      setFilteredPlaces([]);
    }
  };

  const removePlace = (idx: number) => {
    setPlacesVisitedList(placesVisitedList.filter((_, i) => i !== idx));
  };

  const selectPlaceSuggestion = (place: string) => {
    if (!placesVisitedList.includes(place)) setPlacesVisitedList([...placesVisitedList, place]);
    setPlacesInput('');
    setFilteredPlaces([]);
  };

  const handleTagsInput = (text: string) => {
    setTagsInput(text);
    if (text.length > 0) {
      const searchText = removeAccents(text.toLowerCase());
      setFilteredTags(
        tagSuggestions.filter(
          (tag) =>
            removeAccents(tag.toLowerCase()).includes(searchText) &&
            !tagsList.includes(tag)
        )
      );
    } else {
      setFilteredTags([]);
    }
    if (text.endsWith(',') || text.endsWith('\n')) {
      const tag = text.replace(/,|\n/g, '').trim();
      if (tag && !tagsList.includes(tag)) setTagsList([...tagsList, tag]);
      setTagsInput('');
      setFilteredTags([]);
    }
  };

  const removeTag = (idx: number) => {
    setTagsList(tagsList.filter((_, i) => i !== idx));
  };

  const selectTagSuggestion = (tag: string) => {
    if (!tagsList.includes(tag)) setTagsList([...tagsList, tag]);
    setTagsInput('');
    setFilteredTags([]);
  };

  const handleParticipantsInput = (text: string) => {
    setParticipantsInput(text);
    if (text.length > 0) {
      const searchText = removeAccents(text.toLowerCase());
      setFilteredParticipants(
        participantSuggestions.filter(
          (name) =>
            removeAccents(name.toLowerCase()).includes(searchText) &&
            !participantsTags.includes(name)
        )
      );
    } else {
      setFilteredParticipants([]);
    }
    if (text.endsWith(',') || text.endsWith('\n')) {
      const tag = text.replace(/,|\n/g, '').trim();
      if (tag && !participantsTags.includes(tag)) setParticipantsTags([...participantsTags, tag]);
      setParticipantsInput('');
      setFilteredParticipants([]);
    }
  };

  const removeParticipantsTag = (idx: number) => {
    setParticipantsTags(participantsTags.filter((_, i) => i !== idx));
  };

  const selectParticipantSuggestion = (name: string) => {
    if (!participantsTags.includes(name)) setParticipantsTags([...participantsTags, name]);
    setParticipantsInput('');
    setFilteredParticipants([]);
  };

  const handleHomestayChange = (text: string) => {
    setNewHomestay(text);
    if (text.length > 0) {
      const searchText = removeAccents(text.toLowerCase());
      setFilteredHomestays(
        homestaySuggestions.filter(h =>
          removeAccents(h.toLowerCase()).includes(searchText)
        )
      );
    } else {
      setFilteredHomestays([]);
    }
  };

  const selectHomestaySuggestion = (name: string) => {
    setNewHomestay(name);
    setFilteredHomestays([]);
  };

  const handleSave = async () => {
    // Xử lý chi phí - lưu dạng object
    let costObj: Record<string, number> = {};
    costItems.forEach(item => {
      if (item.key && !isNaN(Number(item.value))) {
        costObj[item.key] = Number(item.value);
      }
    });

    // Tính tổng chi phí và chỉ thêm key 'total' khi có nhiều hơn 1 phần tử
    const validCostKeys = Object.keys(costObj).filter(key => key !== 'total');
    if (validCostKeys.length > 1) {
      const totalCost = Object.values(costObj).reduce((sum, value) => sum + value, 0);
      costObj['total'] = totalCost;
    }

    // Chuyển đổi ngày sang định dạng ISO 8601
    const isoStartDate = newStartDate ? new Date(newStartDate).toISOString() : undefined;
    const isoEndDate = newEndDate ? new Date(newEndDate).toISOString() : undefined;

    // Tạo object để hiển thị local (không gửi lên API)
    const memoryData = {
      title: newTitle,
      description: newDescription,
      startDate: isoStartDate,
      endDate: isoEndDate,
      cost: costObj,
      placesVisited: placesVisitedList,
      tags: tagsList,
      homestay: newHomestay,
      participants: participantsTags,
      privacy: shareOption,
      images: newImages,
    };

    if (memory && memory.id) {
      // Gọi action update
      dispatch(updateMemory({ id: memory.id, data: memoryData }));
    } else {
      // Gọi action create
      dispatch(createMemory(memoryData));
    }
    onClose();
  };


  useEffect(() => {
    if (status === 'success' && statusCode === 201) {
      resetForm();
    }
    if (message) {
      Toast.show({
        type: status === 'success' ? 'success' : 'error',
        text1: message,
        onHide: () => {
          dispatch(clearMemoryMessage());
        },
      });
    }
  }, [status, statusCode, message]);

  const resetForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewStartDate('');
    setNewEndDate('');
    setPlacesVisitedList([]);
    setPlacesInput('');
    setNewHomestay('');
    setNewImages([]);
    setCostItems([]);
    setParticipantsTags([]);
    setParticipantsInput('');
    setShareOption('private');
    setTagsList([]);
    setTagsInput('');
    setFilteredTags([]);
    setFilteredPlaces([]);
    setFilteredHomestays([]);
    setFilteredParticipants([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (memory) {
      setNewTitle(memory.title || '');
      setNewDescription(memory.description || '');
      setNewStartDate(memory.startDate ? memory.startDate.slice(0, 10) : '');
      setNewEndDate(memory.endDate ? memory.endDate.slice(0, 10) : '');
      setPlacesVisitedList(memory.placesVisited || []);
      setNewHomestay(memory.homestay || '');
      setNewImages(memory.images || []);
      setCostItems(
        memory.cost && typeof memory.cost === 'object'
          ? Object.entries(memory.cost)
              .filter(([k]) => k !== 'total')
              .map(([key, value]) => ({ key, value: value.toString() }))
          : []
      );
      setParticipantsTags(memory.participants || []);
      setShareOption(memory.privacy || 'private');
      setTagsList(memory.tags || []);
    } else {
      resetForm();
    }
  }, [memory, visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={styles.addModalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>✨ Thêm kỷ niệm mới</Text>
        </View>

        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Các section không có suggestion: z-index thấp */}
          <View style={[styles.section, { zIndex: 1 }]}>
            <Text style={styles.sectionTitle}>📸 Hình ảnh</Text>
            <TouchableOpacity style={styles.pickImageBtn} onPress={pickImages}>
              <Text style={styles.pickImageText}>+ Chọn ảnh (tối đa 10)</Text>
            </TouchableOpacity>
            {newImages.length > 0 && (
              <View style={styles.previewContainer}>
                {newImages.map((uri, idx) => (
                  <Image key={idx} source={{ uri }} style={styles.previewImage} />
                ))}
              </View>
            )}
          </View>

          <View style={[styles.section, { zIndex: 1 }]}>
            <Text style={styles.sectionTitle}>📝 Thông tin cơ bản</Text>

            <Text style={styles.inputLabel}>Tiêu đề</Text>
            <TextInput
              placeholder="Nhập tiêu đề chuyến đi"
              value={newTitle}
              onChangeText={setNewTitle}
              style={styles.input}
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.inputLabel}>Mô tả</Text>
            <TextInput
              placeholder="Mô tả về chuyến đi của bạn"
              value={newDescription}
              onChangeText={setNewDescription}
              style={[styles.input, { minHeight: 80 }]}
              placeholderTextColor="#9ca3af"
              multiline
            />
          </View>

          <View style={[styles.section, { zIndex: 1 }]}>
            <Text style={styles.sectionTitle}>📅 Thời gian</Text>

            <Text style={styles.inputLabel}>Ngày bắt đầu</Text>
            <View style={styles.datePickerContainer}>
              <TextInput
                placeholder="YYYY-MM-DD"
                value={newStartDate}
                style={[styles.input, styles.dateInput]}
                placeholderTextColor="#9ca3af"
                editable={false}
              />
              <TouchableOpacity
                style={styles.dateIconBtn}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={24} color="#228be6" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Ngày kết thúc</Text>
            <View style={styles.datePickerContainer}>
              <TextInput
                placeholder="YYYY-MM-DD"
                value={newEndDate}
                style={[styles.input, styles.dateInput]}
                placeholderTextColor="#9ca3af"
                editable={false}
              />
              <TouchableOpacity
                style={styles.dateIconBtn}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={24} color="#228be6" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.section, { zIndex: 1 }]}>
            <Text style={styles.sectionTitle}>💰 Chi phí</Text>
            {costItems.map((item, idx) => (
              <View key={idx} style={styles.costItemContainer}>
                <TextInput
                  placeholder="Loại chi phí"
                  value={item.key}
                  onChangeText={val => handleCostItemChange(idx, 'key', val)}
                  style={[styles.input, styles.costInput]}
                  placeholderTextColor="#9ca3af"
                />
                <TextInput
                  placeholder="Số tiền"
                  value={item.value}
                  onChangeText={val => handleCostItemChange(idx, 'value', val)}
                  style={[styles.input, styles.costInput]}
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeCostItem(idx)}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addCostBtn} onPress={addCostItem}>
              <Text style={styles.pickImageText}>+ Thêm loại chi phí</Text>
            </TouchableOpacity>
          </View>

          {/* Section có suggestion: z-index cao hơn, từ cao xuống thấp */}
          <View style={[styles.section, { zIndex: 5 }]}>
            <Text style={styles.sectionTitle}>🌍 Địa điểm & Tags</Text>
            <View style={[styles.inputWrapper, { zIndex: 2 }]}>
              <Text style={styles.inputLabel}>Địa điểm đã đến</Text>
              <View style={styles.tagContainer}>
                {placesVisitedList.map((place, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{place}</Text>
                    <TouchableOpacity
                      style={styles.tagRemoveBtn}
                      onPress={() => removePlace(idx)}
                    >
                      <Ionicons name="close-circle" size={16} color="#228be6" />
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.inputContainer}>
                  <TextInput
                    value={placesInput}
                    onChangeText={handlePlacesInput}
                    placeholder="Nhập địa điểm..."
                    style={styles.tagInput}
                    placeholderTextColor="#9ca3af"
                    onSubmitEditing={() => handlePlacesInput(placesInput + '\n')}
                  />
                  {filteredPlaces.length > 0 && (
                    <View style={styles.suggestionContainer}>
                      <ScrollView
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                        style={styles.suggestionScrollContainer}
                      >
                        {filteredPlaces.map((place, idx) => (
                          <TouchableOpacity
                            key={idx}
                            onPress={() => selectPlaceSuggestion(place)}
                            style={[
                              styles.suggestionItem,
                              { borderBottomWidth: idx === filteredPlaces.length - 1 ? 0 : 1 }
                            ]}
                          >
                            <Text style={styles.suggestionText}>📍 {place}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={[styles.inputWrapper, { zIndex: 1 }]}>
              <Text style={styles.inputLabel}>Tags</Text>
              <View style={styles.tagContainer}>
                {tagsList.map((tag, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                    <TouchableOpacity
                      style={styles.tagRemoveBtn}
                      onPress={() => removeTag(idx)}
                    >
                      <Ionicons name="close-circle" size={16} color="#228be6" />
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.inputContainer}>
                  <TextInput
                    value={tagsInput}
                    onChangeText={handleTagsInput}
                    placeholder="Nhập tags..."
                    style={styles.tagInput}
                    placeholderTextColor="#9ca3af"
                    onSubmitEditing={() => handleTagsInput(tagsInput + '\n')}
                  />
                  {filteredTags.length > 0 && (
                    <View style={styles.suggestionContainer}>
                      <ScrollView
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                        style={{ maxHeight: 200 }}
                      >
                        {filteredTags.map((tag, idx) => (
                          <TouchableOpacity
                            key={idx}
                            onPress={() => selectTagSuggestion(tag)}
                            style={[
                              styles.suggestionItem,
                              { borderBottomWidth: idx === filteredTags.length - 1 ? 0 : 1 }
                            ]}
                          >
                            <Text style={styles.suggestionText}>#{tag}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.section, { zIndex: 4 }]}>
            <Text style={styles.sectionTitle}>🏠 Nơi lưu trú</Text>
            <Text style={styles.inputLabel}>Homestay</Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                placeholder="Tên homestay"
                value={newHomestay}
                onChangeText={handleHomestayChange}
                style={styles.input}
                placeholderTextColor="#9ca3af"
              />
              {filteredHomestays.length > 0 && (
                <View style={styles.suggestionContainer}>
                  {filteredHomestays.map((name, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => selectHomestaySuggestion(name)}
                      style={[
                        styles.suggestionItem,
                        { borderBottomWidth: idx === filteredHomestays.length - 1 ? 0 : 1 }
                      ]}
                    >
                      <Text style={styles.suggestionText}>{name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={[styles.section, { zIndex: 3 }]}>
            <Text style={styles.sectionTitle}>👥 Thành viên tham gia</Text>
            <View style={styles.tagContainer}>
              {participantsTags.map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity
                    style={styles.tagRemoveBtn}
                    onPress={() => removeParticipantsTag(idx)}
                  >
                    <Ionicons name="close-circle" size={16} color="#228be6" />
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.inputContainer}>
                <TextInput
                  value={participantsInput}
                  onChangeText={handleParticipantsInput}
                  placeholder="Nhập tên thành viên..."
                  style={styles.tagInput}
                  placeholderTextColor="#9ca3af"
                  onSubmitEditing={() => handleParticipantsInput(participantsInput + '\n')}
                />
                {filteredParticipants.length > 0 && (
                  <View style={styles.suggestionContainer}>
                    <ScrollView
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps="handled"
                      style={styles.suggestionScrollContainer}
                    >
                      {filteredParticipants.map((name, idx) => (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => selectParticipantSuggestion(name)}
                          style={[
                            styles.suggestionItem,
                            { borderBottomWidth: idx === filteredParticipants.length - 1 ? 0 : 1 }
                          ]}
                        >
                          <Text style={styles.suggestionText}>{name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Section không có suggestion: z-index thấp nhất */}
          <View style={[styles.section, { zIndex: 1 }]}>
            <Text style={styles.sectionTitle}>🔒 Quyền riêng tư</Text>
            <Text style={styles.inputLabel}>Chia sẻ với</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={shareOption}
                onValueChange={setShareOption}
                style={{ height: 60 }}
                dropdownIconColor="#228be6"
              >
                <Picker.Item label="🔒 Chỉ mình tôi" value="private" />
                <Picker.Item label="🏷️ Bạn bè được gắn thẻ" value="tagged" />
                <Picker.Item label="👥 Bạn bè follow" value="followers" />
                <Picker.Item label="🌍 Công khai" value="public" />
              </Picker>
            </View>
          </View>
        </ScrollView>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>💾 Lưu kỷ niệm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
            <Text style={styles.cancelBtnText}>❌ Hủy</Text>
          </TouchableOpacity>
        </View>

        {/* Date Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={newStartDate ? new Date(newStartDate) : new Date()}
            mode="date"
            display="default"
            onChange={(_, date) => {
              setShowStartDatePicker(false);
              if (date) setNewStartDate(date.toISOString().slice(0, 10));
            }}
          />
        )}
        {showEndDatePicker && (
          <DateTimePicker
            value={newEndDate ? new Date(newEndDate) : new Date()}
            mode="date"
            display="default"
            onChange={(_, date) => {
              setShowEndDatePicker(false);
              if (date) setNewEndDate(date.toISOString().slice(0, 10));
            }}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  addModalContainer: {
    flex: 1,
    backgroundColor: '#f8fafb',
  },
  modalHeader: {
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#228be6',
    letterSpacing: 0.5,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginLeft: 4,
  },
  pickImageBtn: {
    backgroundColor: '#e8f2ff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#90caf9',
    borderStyle: 'dashed',
  },
  pickImageText: {
    color: '#228be6',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  previewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  previewImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginRight: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e8f2ff',
    backgroundColor: '#fff',
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
    marginRight: 12,
    marginBottom: 0,
  },
  dateIconBtn: {
    backgroundColor: '#e8f2ff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#90caf9',
  },
  costItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
  },
  costInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 0,
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
  },
  removeBtn: {
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 8,
  },
  addCostBtn: {
    backgroundColor: '#e8f2ff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#90caf9',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 8,
    minHeight: 50,
    alignItems: 'center',
    position: 'relative',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e8f2ff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#90caf9',
  },
  tagText: {
    color: '#228be6',
    fontWeight: '600',
    fontSize: 14,
  },
  tagRemoveBtn: {
    marginLeft: 6,
  },
  inputContainer: {
    flex: 1,
    minWidth: 150,
    position: 'relative',
  },
  tagInput: {
    minWidth: '100%',
    borderWidth: 0,
    backgroundColor: 'transparent',
    padding: 8,
    height: 36,
    fontSize: 15,
    color: '#1f2937',
  },
  suggestionContainer: {
    position: 'absolute',
    top: 36,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  suggestionScrollContainer: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  suggestionText: {
    color: '#228be6',
    fontSize: 15,
    fontWeight: '500',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 16,
    overflow: 'hidden',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  saveBtn: {
    backgroundColor: '#228be6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#228be6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  cancelBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelBtnText: {
    color: '#6b7280',
    fontWeight: 'bold',
    fontSize: 15,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 16,
    zIndex: 1,
  },
});

export default CreateMemory;