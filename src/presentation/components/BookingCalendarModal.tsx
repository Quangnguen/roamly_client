import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RoomType {
    id: string;
    name: string;
    available: boolean;
}

interface BookingDay {
    date: string;
    status: 'full' | 'limited' | 'available';
    availableRooms?: RoomType[];
}

interface BookingCalendarModalProps {
    isVisible: boolean;
    onClose: () => void;
    bookingData: BookingDay[];
}

const MONTHS = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const BookingCalendarModal: React.FC<BookingCalendarModalProps> = ({
    isVisible,
    onClose,
    bookingData,
}) => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDay, setSelectedDay] = useState<BookingDay | null>(null);

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const canNavigateToPrevMonth = () => {
        const today = new Date();
        if (currentYear < today.getFullYear()) return false;
        if (currentYear === today.getFullYear() && currentMonth <= today.getMonth()) return false;
        return true;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        if (direction === 'prev' && !canNavigateToPrevMonth()) {
            return;
        }

        if (direction === 'next') {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        } else {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        }
    };

    const renderDayStatus = (day: BookingDay) => {
        switch (day.status) {
            case 'full':
                return <View style={[styles.statusDot, styles.fullDot]} />;
            case 'limited':
                return <View style={[styles.statusDot, styles.limitedDot]} />;
            case 'available':
                return <View style={[styles.statusDot, styles.availableDot]} />;
        }
    };

    const renderCalendarDays = () => {
        const days = [];
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(
                <View key={`empty-${i}`} style={styles.dayCell} />
            );
        }

        // Add the days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const dayString = `${i}/${currentMonth + 1}`;
            const dayData = bookingData.find(d => d.date === dayString) || {
                date: dayString,
                status: 'available'
            };
            const isSelected = selectedDay?.date === dayString;

            days.push(
                <TouchableOpacity
                    key={i}
                    style={[styles.dayCell, isSelected && styles.selectedDay]}
                    onPress={() => setSelectedDay(dayData)}
                >
                    <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                        {i}
                    </Text>
                    {renderDayStatus(dayData)}
                </TouchableOpacity>
            );
        }

        return days;
    };

    const renderAvailabilityInfo = () => {
        if (!selectedDay) return null;

        switch (selectedDay.status) {
            case 'full':
                return (
                    <View style={styles.availabilityInfo}>
                        <Text style={styles.availabilityText}>Hết phòng</Text>
                    </View>
                );
            case 'limited':
                return (
                    <View style={styles.availabilityInfo}>
                        <Text style={styles.availabilityTitle}>Còn các loại phòng:</Text>
                        {selectedDay.availableRooms?.map(room => (
                            <Text key={room.id} style={styles.roomText}>
                                • {room.name}
                            </Text>
                        ))}
                    </View>
                );
            case 'available':
                return (
                    <View style={styles.availabilityInfo}>
                        <Text style={styles.availabilityText}>Còn tất cả các phòng</Text>
                    </View>
                );
        }
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalContainer}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    style={styles.modalContent}
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Lịch đặt phòng</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.monthNavigator}>
                        <TouchableOpacity
                            onPress={() => navigateMonth('prev')}
                            disabled={!canNavigateToPrevMonth()}
                        >
                            <Ionicons
                                name="chevron-back"
                                size={24}
                                color={canNavigateToPrevMonth() ? "#000" : "#ccc"}
                            />
                        </TouchableOpacity>
                        <Text style={styles.monthYear}>
                            {MONTHS[currentMonth]} {currentYear}
                        </Text>
                        <TouchableOpacity onPress={() => navigateMonth('next')}>
                            <Ionicons name="chevron-forward" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.weekDaysContainer}>
                        {DAYS.map(day => (
                            <Text key={day} style={styles.weekDay}>{day}</Text>
                        ))}
                    </View>

                    <View style={styles.calendarGrid}>
                        {renderCalendarDays()}
                    </View>

                    <View style={styles.legendContainer}>
                        <View style={styles.legendItem}>
                            <View style={[styles.statusDot, styles.fullDot]} />
                            <Text style={styles.legendText}>Hết phòng</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.statusDot, styles.limitedDot]} />
                            <Text style={styles.legendText}>Còn một số phòng</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.statusDot, styles.availableDot]} />
                            <Text style={styles.legendText}>Còn tất cả phòng</Text>
                        </View>
                    </View>

                    {renderAvailabilityInfo()}
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '90%',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    monthNavigator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    monthYear: {
        fontSize: 18,
        fontWeight: '600',
    },
    weekDaysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    weekDay: {
        width: '14%',
        textAlign: 'center',
        fontWeight: '600',
        color: '#666',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    dayCell: {
        width: '14%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        borderRadius: 8,
    },
    selectedDay: {
        backgroundColor: '#007AFF',
    },
    dayText: {
        fontSize: 16,
        marginBottom: 4,
    },
    selectedDayText: {
        color: '#fff',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendText: {
        marginLeft: 5,
        fontSize: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    fullDot: {
        backgroundColor: 'red',
    },
    limitedDot: {
        backgroundColor: 'yellow',
    },
    availableDot: {
        backgroundColor: '#ddd',
    },
    availabilityInfo: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
    },
    availabilityTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    availabilityText: {
        fontSize: 16,
        color: '#666',
    },
    roomText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 10,
        marginTop: 5,
    },
})

export default BookingCalendarModal; 