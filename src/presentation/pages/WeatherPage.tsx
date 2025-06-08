import { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Platform,
    StatusBar,
    ActivityIndicator,
    Keyboard,
    FlatList,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "@/src/utils/PropsNavigate";
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Định nghĩa props cho WeatherInfoCard
 */
interface WeatherInfoCardProps {
    icon: JSX.Element | string;
    title: string;
    value: number;
    unit?: string;
}

interface Suggestion {
    name: string;
    latitude: number;
    longitude: number;
}

/**
 * Định nghĩa cấu trúc dữ liệu thời tiết
 */
interface WeatherType {
    main: {
        temp: number;
        humidity: number;
    };
    weather: {
        main: string;
        description: string;
    }[];
    rain?: {
        [key: string]: number;
    };
    wind?: {
        speed: number;
    };
}

/**
 * Định nghĩa cấu trúc dữ liệu dự báo
 */
interface ForecastItem {
    dt: number;
    main: {
        temp: number;
        humidity: number;
        pressure: number;
    };
    weather: {
        id: number;
        main: string;
        description: string;
        icon: string;
    }[];
    dt_txt: string;
}

// Weather condition icons mapping - Ánh xạ các icon theo trạng thái thời tiết
const weatherIcons = {
    Clear: <Ionicons name="sunny" size={40} color="#FFD700" />,
    Clouds: <Ionicons name="partly-sunny" size={40} color="#FFD700" />,
    Rain: (
        <View style={{ flexDirection: "row" }}>
            <Ionicons name="partly-sunny" size={40} color="#FFD700" />
            <MaterialCommunityIcons
                name="weather-pouring"
                size={24}
                color="#4DA6FF"
                style={{ marginTop: 15, marginLeft: -10 }}
            />
        </View>
    ),
    Drizzle: (
        <View style={{ flexDirection: "row" }}>
            <Ionicons name="partly-sunny" size={40} color="#FFD700" />
            <MaterialCommunityIcons
                name="weather-rainy"
                size={24}
                color="#4DA6FF"
                style={{ marginTop: 15, marginLeft: -10 }}
            />
        </View>
    ),
    Thunderstorm: (
        <MaterialCommunityIcons
            name="weather-lightning-rainy"
            size={40}
            color="#4DA6FF"
        />
    ),
    Snow: <MaterialCommunityIcons name="weather-snowy" size={40} color="white" />,
    Mist: <MaterialCommunityIcons name="weather-fog" size={40} color="gray" />,
};

/**
 * Component hiển thị thông tin thời tiết (Card)
 */
const WeatherInfoCard = ({
    icon,
    title,
    value,
    unit,
}: WeatherInfoCardProps) => (
    <View style={styles.infoCard}>
        <View style={styles.infoCardContent}>
            {icon}
            <View style={styles.infoCardText}>
                <Text style={styles.infoCardTitle}>{title}</Text>
                <Text style={styles.infoCardValue}>
                    {value}
                    {unit && <Text style={styles.infoCardUnit}>{unit}</Text>}
                </Text>
            </View>
        </View>
    </View>
);

// Constants cho cache và API
const CACHE_EXPIRY = 1000 * 60 * 15; // 15 phút - thời gian cache hết hạn
const WEATHER_CACHE_KEY = 'weather_cache'; // key lưu cache thời tiết
const FORECAST_CACHE_KEY = 'forecast_cache'; // key lưu cache dự báo
const API_TIMEOUT = 20000; // 20 giây - thời gian timeout cho API calls (tăng từ 10s)

/**
 * Định nghĩa cấu trúc dữ liệu cache
 */
interface CacheData<T> {
    data: T;
    timestamp: number;
}

/**
 * Hiển thị skeleton loading khi đang tải dữ liệu
 */
const LoadingSkeleton = () => (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton}>
                <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <ActivityIndicator size="large" color="#000" />
            <View style={styles.iconButton} />
        </View>
        <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Đang lấy dữ liệu thời tiết...</Text>
            <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
        </View>
    </SafeAreaView>
);

/**
 * Hàm lưu cache dữ liệu
 * @param key Khóa cache
 * @param data Dữ liệu cần lưu
 */
const setCachedData = async <T,>(key: string, data: T): Promise<void> => {
    try {
        const cacheData: CacheData<T> = {
            data,
            timestamp: Date.now(),
        };
        await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
        console.log('Cache save error:', error);
    }
};

/**
 * Lấy thông tin địa chỉ từ tọa độ GPS sử dụng Nominatim OpenStreetMap API
 * @param latitude Vĩ độ
 * @param longitude Kinh độ
 * @returns Thông tin thành phố và quốc gia
 */
const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
        // Sử dụng AbortController để kiểm soát timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // Tăng timeout lên 10 giây

        console.log(`Fetching address for coordinates: ${latitude}, ${longitude}`);

        // Thêm nhiều headers hơn và thông tin user-agent chi tiết để tránh bị chặn
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=vi&zoom=10`, // Thêm zoom=10 để lấy cấp độ thành phố
            {
                headers: {
                    'User-Agent': 'RoamlyApp/1.0 (https://roamly.app; contact@roamly.app)',
                    'Accept': 'application/json',
                    'Accept-Language': 'vi,en;q=0.9',
                    'Referer': 'https://roamly.app/'
                },
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.log(`Nominatim API error status: ${response.status}`);
            throw new Error(`Nominatim API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data.address) {
            console.log('Invalid address data from Nominatim API');
            throw new Error('Invalid address data');
        }

        // Log thông tin để debug
        console.log('Address data received:', {
            city: data.address?.city,
            town: data.address?.town,
            district: data.address?.district,
            county: data.address?.county,
            state_district: data.address?.state_district,
            state: data.address?.state
        });

        // Thêm nhiều cấp địa lý để tăng khả năng tìm thấy thành phố
        const result = {
            city: data.address?.city ||
                data.address?.town ||
                data.address?.district ||
                data.address?.county ||
                data.address?.state_district ||
                data.address?.state ||
                "Hà Nội",
            country: data.address?.country || "Việt Nam"
        };

        console.log('Resolved location:', result);
        return result;
    } catch (error) {
        console.log("Error getting address from Nominatim:", error);

        // Trả về giá trị mặc định nếu không lấy được thông tin
        console.log("Using default location");
        return {
            city: "Hà Nội",
            country: "Việt Nam"
        };
    }
};

/**
 * Kiểm tra tọa độ có nằm trong lãnh thổ Việt Nam không
 * @param latitude Vĩ độ
 * @param longitude Kinh độ
 * @returns true nếu là vị trí ở Việt Nam
 */
const isLocationInVietnam = (latitude: number, longitude: number) => {
    // Tọa độ xấp xỉ của Việt Nam
    return latitude >= 8.18 && latitude <= 23.39 && // Vĩ độ từ Nam lên Bắc
        longitude >= 102.14 && longitude <= 109.46; // Kinh độ từ Tây sang Đông
};

/**
 * Chuyển đổi mô tả thời tiết từ tiếng Anh sang tiếng Việt
 * @param description Mô tả thời tiết bằng tiếng Anh
 * @returns Mô tả thời tiết bằng tiếng Việt
 */
const translateWeatherDescription = (description: string): string => {
    const weatherTranslations: { [key: string]: string } = {
        // Clear sky
        'clear sky': 'trời quang',
        'clear': 'quang đãng',

        // Clouds
        'few clouds': 'ít mây',
        'scattered clouds': 'mây rải rác',
        'broken clouds': 'nhiều mây',
        'overcast clouds': 'mây che phủ',
        'overcast cloud': 'mây che phủ',
        'partly cloudy': 'có mây',

        // Rain
        'light rain': 'mưa nhỏ',
        'moderate rain': 'mưa vừa',
        'heavy intensity rain': 'mưa to',
        'very heavy rain': 'mưa rất to',
        'extreme rain': 'mưa cực to',
        'freezing rain': 'mưa đá nhỏ',
        'light intensity shower rain': 'mưa rào nhẹ',
        'shower rain': 'mưa rào',
        'heavy intensity shower rain': 'mưa rào to',
        'ragged shower rain': 'mưa rào không đều',
        'rain': 'mưa',

        // Drizzle
        'light intensity drizzle': 'mưa phùn nhẹ',
        'drizzle': 'mưa phùn',
        'heavy intensity drizzle': 'mưa phùn dày',
        'light intensity drizzle rain': 'mưa phùn nhỏ',
        'drizzle rain': 'mưa phùn',
        'heavy intensity drizzle rain': 'mưa phùn to',
        'shower rain and drizzle': 'mưa rào và mưa phùn',
        'heavy shower rain and drizzle': 'mưa rào to và mưa phùn',
        'shower drizzle': 'mưa phùn rào',

        // Thunderstorm
        'thunderstorm with light rain': 'dông có mưa nhỏ',
        'thunderstorm with rain': 'dông có mưa',
        'thunderstorm with heavy rain': 'dông có mưa to',
        'light thunderstorm': 'dông nhẹ',
        'thunderstorm': 'dông',
        'heavy thunderstorm': 'dông to',
        'ragged thunderstorm': 'dông không đều',
        'thunderstorm with light drizzle': 'dông có mưa phùn nhẹ',
        'thunderstorm with drizzle': 'dông có mưa phùn',
        'thunderstorm with heavy drizzle': 'dông có mưa phùn dày',

        // Snow
        'light snow': 'tuyết nhỏ',
        'snow': 'tuyết',
        'heavy snow': 'tuyết to',
        'sleet': 'mưa tuyết',
        'light shower sleet': 'mưa tuyết nhẹ',
        'shower sleet': 'mưa tuyết',
        'light rain and snow': 'mưa và tuyết nhẹ',
        'rain and snow': 'mưa và tuyết',
        'light shower snow': 'tuyết rào nhẹ',
        'shower snow': 'tuyết rào',
        'heavy shower snow': 'tuyết rào to',

        // Atmosphere
        'mist': 'sương mù',
        'smoke': 'khói',
        'haze': 'sương khói',
        'sand/dust whirls': 'lốc cát/bụi',
        'fog': 'sương mù dày',
        'sand': 'cát',
        'dust': 'bụi',
        'volcanic ash': 'tro núi lửa',
        'squalls': 'gió giật',
        'tornado': 'lốc xoáy'
    };

    // Chuyển về chữ thường để so sánh
    const lowerDescription = description.toLowerCase().trim();

    // Tìm kiếm exact match trước
    if (weatherTranslations[lowerDescription]) {
        return weatherTranslations[lowerDescription];
    }

    // Tìm kiếm partial match nếu không có exact match
    for (const [key, value] of Object.entries(weatherTranslations)) {
        if (lowerDescription.includes(key)) {
            return value;
        }
    }

    // Nếu không tìm thấy, trả về mô tả gốc
    return description;
};

/**
 * Component hiển thị dự báo theo ngày
 */
const DailyForecastItem = ({
    date,
    temp,
    icon,
    description
}: {
    date: string;
    temp: number;
    icon: JSX.Element;
    description: string;
}) => (
    <View style={styles.dailyForecastItem}>
        <Text style={styles.dayText}>{date}</Text>
        {icon}
        <Text style={styles.dailyTemp}>{temp}°C</Text>
        <Text style={styles.dailyDescription}>{description}</Text>
    </View>
);

/**
 * Lấy ngày hiện tại theo định dạng tiếng Việt
 */
const getCurrentDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return date.toLocaleDateString('vi-VN', options);
};

/**
 * Format timestamp thành ngày tháng theo định dạng tiếng Việt
 * @param timestamp Unix timestamp
 */
const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'numeric'
    };
    return date.toLocaleDateString('vi-VN', options);
};

/**
 * Component chính cho trang thời tiết
 */
export default function WeatherPage() {
    // States
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [weatherData, setWeatherData] = useState<WeatherType | null>(null);
    const [dailyForecast, setDailyForecast] = useState<ForecastItem[]>([]);
    const [showRetryToast, setShowRetryToast] = useState(false);
    const [location, setLocation] = useState<{
        latitude: number;
        longitude: number;
        city: string;
        country: string;
    } | null>(null);
    const navigation = useNavigation<NavigationProp<any>>();

    // Debounce timer reference
    const debounceTimer = useRef<number | null>(null);

    // Effect hook chạy khi component mount
    useEffect(() => {
        const initWeatherPage = async () => {
            try {
                // 1. KHỞI TẠO STATE
                setLoading(true);
                setError(null);

                // 2. KIỂM TRA CACHE
                const cached = await AsyncStorage.getItem(WEATHER_CACHE_KEY);
                const cachedForecastData = await AsyncStorage.getItem(FORECAST_CACHE_KEY);
                const cachedLocation = await AsyncStorage.getItem('cached_location');
                const lastFetchTime = await AsyncStorage.getItem('last_weather_fetch_time');
                const currentTime = Date.now();

                let hasValidCache = false;
                let parsedLocation = null;

                // Nếu có cache hợp lệ, hiển thị ngay
                if (cached && cachedForecastData && cachedLocation) {
                    try {
                        const weatherCache = JSON.parse(cached) as CacheData<WeatherType>;
                        const forecastCache = JSON.parse(cachedForecastData) as CacheData<ForecastItem[]>;
                        parsedLocation = JSON.parse(cachedLocation);

                        // Kiểm tra nếu cache còn hợp lệ hoặc có dữ liệu
                        if ((Date.now() - weatherCache.timestamp < CACHE_EXPIRY) ||
                            (weatherCache.data && forecastCache.data)) {
                            console.log('Using cached data');

                            // Hiển thị dữ liệu từ cache ngay lập tức
                            setWeatherData(weatherCache.data);
                            setDailyForecast(forecastCache.data);
                            setLocation(parsedLocation);

                            // Cho phép hiển thị UI sớm
                            setLoading(false);
                            hasValidCache = true;
                        }
                    } catch (error) {
                        console.log('Error parsing cache:', error);
                    }
                }

                // 3. QUYẾT ĐỊNH CÓ FETCH DỮ LIỆU MỚI KHÔNG
                let shouldRefetch = true;
                if (lastFetchTime) {
                    const timeSinceLastFetch = currentTime - parseInt(lastFetchTime);
                    if (hasValidCache && timeSinceLastFetch < CACHE_EXPIRY) {
                        console.log('Skipping fetch as cache is valid and last fetch was recent');
                        shouldRefetch = false;
                    }
                }

                // Nếu không cần fetch mới và đã có cache, kết thúc sớm
                if (!shouldRefetch && hasValidCache) {
                    return;
                }

                // 4. XÁC ĐỊNH VỊ TRÍ NGƯỜI DÙNG
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setError('Cần quyền truy cập vị trí để xem thời tiết');
                    setLoading(false);
                    return;
                }

                // Xác định vị trí để fetch dữ liệu thời tiết
                let fetchLat, fetchLon;
                if (parsedLocation) {
                    // Sử dụng vị trí từ cache nếu có
                    fetchLat = parsedLocation.latitude;
                    fetchLon = parsedLocation.longitude;

                    // Tiếp tục sử dụng location cache trong khi fetch mới
                    setLocation(parsedLocation);
                } else {
                    // Không có location cache, phải lấy vị trí mới
                    const locationResult = await Location.getCurrentPositionAsync({});
                    const { latitude, longitude } = locationResult.coords;

                    // Kiểm tra xem vị trí có ở Việt Nam không
                    if (!isLocationInVietnam(latitude, longitude)) {
                        console.log('Location not in Vietnam, using default location');
                        // Sử dụng tọa độ mặc định của Hà Nội
                        const defaultLocation = {
                            latitude: 21.0285,
                            longitude: 105.8542,
                            city: 'Hà Nội',
                            country: 'Việt Nam'
                        };
                        setLocation(defaultLocation);
                        fetchLat = defaultLocation.latitude;
                        fetchLon = defaultLocation.longitude;

                        // Cache vị trí
                        await AsyncStorage.setItem('cached_location', JSON.stringify(defaultLocation));
                    } else {
                        // 5. LẤY ĐỊA CHỈ TỪ TỌA ĐỘ
                        const address = await getAddressFromCoordinates(latitude, longitude);
                        const newLocation = {
                            latitude,
                            longitude,
                            ...address
                        };
                        setLocation(newLocation);
                        fetchLat = latitude;
                        fetchLon = longitude;

                        // Cache vị trí
                        await AsyncStorage.setItem('cached_location', JSON.stringify(newLocation));
                    }
                }

                // 6. FETCH DỮ LIỆU THỜI TIẾT
                await fetchWeatherData(fetchLat, fetchLon);
            } catch (error) {
                console.error('General error:', error);
                setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        initWeatherPage();
    }, []);

    // Cleanup debounce timer khi component unmount
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    const fetchSuggestions = async (query: string) => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }

        try {
            setLoadingSuggestions(true);
            setSuggestions([]); // Clear previous suggestions

            // Thêm timeout cho request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 giây timeout

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                    query
                )}&countrycodes=VN&format=json&addressdetails=1&limit=5`, // Giới hạn 5 kết quả
                {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'RoamlyApp/1.0 (https://roamly.app; contact@roamly.app)',
                        'Accept': 'application/json',
                        'Accept-Language': 'vi,en;q=0.9',
                    },
                }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error('Invalid response format');
            }

            const formattedSuggestions = data
                .filter((item: any) => item.lat && item.lon && item.display_name) // Lọc dữ liệu hợp lệ
                .map((item: any) => ({
                    name: item.display_name,
                    latitude: parseFloat(item.lat),
                    longitude: parseFloat(item.lon),
                }))
                .slice(0, 5); // Giới hạn 5 gợi ý

            setSuggestions(formattedSuggestions);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('Request was aborted due to timeout');
            }
            // Không hiển thị lỗi cho user vì gợi ý không quan trọng bằng chức năng chính
            setSuggestions([]);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    // Debounced version của fetchSuggestions
    const debouncedFetchSuggestions = (query: string) => {
        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set new timer
        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(query);
        }, 500) as any; // 500ms delay
    };

    // Hàm xử lý khi chọn một gợi ý
    const handleSelectSuggestion = async (suggestion: {
        name: string;
        latitude: number;
        longitude: number;
    }) => {
        try {
            setSearchQuery(suggestion.name);
            setSuggestions([]);
            Keyboard.dismiss();

            // Hiển thị loading cho user
            setLoading(true);

            setLocation({
                latitude: suggestion.latitude,
                longitude: suggestion.longitude,
                city: suggestion.name.split(",")[0],
                country: suggestion.name.split(",").pop()?.trim() || "Unknown",
            });

            await fetchWeatherData(suggestion.latitude, suggestion.longitude);
        } catch (error) {
            console.error("Error selecting suggestion:", error);
            setError("Không thể lấy dữ liệu thời tiết cho địa điểm này.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setError("Vui lòng nhập địa chỉ hợp lệ.");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Gọi API Nominatim để chuyển đổi địa chỉ thành tọa độ
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                    searchQuery
                )}&format=json&addressdetails=1`
            );

            if (!response.ok) {
                throw new Error("Không thể tìm thấy địa chỉ.");
            }

            const data = await response.json();

            if (!data || data.length === 0) {
                throw new Error("Không tìm thấy kết quả cho địa chỉ này.");
            }

            // Lấy tọa độ từ kết quả đầu tiên
            const { lat, lon, display_name } = data[0];
            const newLocation = {
                latitude: parseFloat(lat),
                longitude: parseFloat(lon),
                city: display_name.split(",")[0], // Lấy tên thành phố từ địa chỉ
                country: display_name.split(",").pop()?.trim() || "Unknown",
            };

            setLocation(newLocation);

            // Fetch dữ liệu thời tiết cho tọa độ mới
            await fetchWeatherData(newLocation.latitude, newLocation.longitude);
        } catch (error) {
            console.error("Error searching location:", error);
            setError("Không thể tìm thấy địa chỉ. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Retry function with exponential backoff
     */
    const retryFetch = async (url: string, options: RequestInit, retries = 2): Promise<Response> => {
        for (let i = 0; i <= retries; i++) {
            try {
                const response = await fetch(url, options);
                if (response.ok) {
                    return response;
                }
                // Nếu không phải lỗi server (5xx), không retry
                if (response.status < 500) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                // Retry cho lỗi server
                if (i < retries) {
                    const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
                    console.log(`Retrying in ${delay}ms... (attempt ${i + 1}/${retries + 1})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            } catch (error) {
                if (i === retries) throw error;
                if (error instanceof Error && error.name === 'AbortError') {
                    throw error; // Không retry khi bị abort
                }
                const delay = Math.pow(2, i) * 1000;
                console.log(`Retrying in ${delay}ms... (attempt ${i + 1}/${retries + 1})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw new Error('Max retries exceeded');
    };

    /**
     * Lấy dữ liệu thời tiết từ OpenWeatherMap API
     * @param lat Vĩ độ
     * @param lon Kinh độ
     */
    const fetchWeatherData = async (lat: number, lon: number) => {
        let controller: AbortController | null = null;
        let fetchTimeout: number | null = null;

        try {
            console.log('Fetching weather data for:', lat, lon);

            // Lưu thời điểm fetch mới nhất
            const currentTime = Date.now();
            await AsyncStorage.setItem('last_weather_fetch_time', currentTime.toString());

            // Tạo URLs cho API
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.EXPO_PUBLIC_WEATHER_API_KEY || '3e349bf428f7f4fc11df7a1077b01876'}`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.EXPO_PUBLIC_WEATHER_API_KEY || '3e349bf428f7f4fc11df7a1077b01876'}`;

            console.log('Fetching new weather data...');

            // Sử dụng AbortController để giới hạn thời gian chờ API
            controller = new AbortController();
            fetchTimeout = setTimeout(() => {
                console.log('API timeout - aborting request');
                controller?.abort();
            }, API_TIMEOUT) as any;

            try {
                // Fetch song song để tối ưu thời gian
                const [weatherResponse, forecastResponse] = await Promise.all([
                    retryFetch(weatherUrl, {
                        signal: controller.signal,
                        headers: {
                            'Accept': 'application/json',
                            'User-Agent': 'RoamlyApp/1.0',
                        }
                    }),
                    retryFetch(forecastUrl, {
                        signal: controller.signal,
                        headers: {
                            'Accept': 'application/json',
                            'User-Agent': 'RoamlyApp/1.0',
                        }
                    })
                ]);

                // Clear timeout khi request thành công
                if (fetchTimeout) {
                    clearTimeout(fetchTimeout);
                    fetchTimeout = null;
                }

                if (!weatherResponse.ok || !forecastResponse.ok) {
                    throw new Error(`API response error: Weather ${weatherResponse.status}, Forecast ${forecastResponse.status}`);
                }

                const [weather, forecast] = await Promise.all([
                    weatherResponse.json(),
                    forecastResponse.json(),
                ]);

                // Kiểm tra dữ liệu hợp lệ
                if (!weather || !weather.main || !forecast || !forecast.list) {
                    throw new Error('Invalid weather data received');
                }

                // Xử lý dự báo 7 ngày (lấy 1 dự báo mỗi ngày)
                const dailyData = forecast.list.reduce((acc: ForecastItem[], item: ForecastItem) => {
                    const date = new Date(item.dt * 1000).setHours(0, 0, 0, 0);
                    if (!acc.find(i => new Date(i.dt * 1000).setHours(0, 0, 0, 0) === date)) {
                        acc.push(item);
                    }
                    return acc;
                }, []).slice(0, 7);

                // Cache dữ liệu mới
                await Promise.all([
                    setCachedData(WEATHER_CACHE_KEY, weather),
                    setCachedData(FORECAST_CACHE_KEY, dailyData),
                ]);

                // Cập nhật state và UI
                setWeatherData(weather);
                setDailyForecast(dailyData);
                setLoading(false);

                console.log('Weather data updated successfully');
            } catch (error) {
                // Clear timeout nếu có lỗi
                if (fetchTimeout) {
                    clearTimeout(fetchTimeout);
                    fetchTimeout = null;
                }

                // Phân loại lỗi
                if (error instanceof Error) {
                    if (error.name === 'AbortError') {
                        console.log('Request was aborted due to timeout');
                        throw new Error('Kết nối mạng chậm. Vui lòng thử lại.');
                    } else if (error.message.includes('Network request failed')) {
                        console.log('Network error detected');
                        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra và thử lại.');
                    }
                }

                console.error('Error in fetch operation:', error);
                throw error;
            }
        } catch (error) {
            console.error('Error fetching weather:', error);

            // Chỉ hiển thị lỗi nếu không có dữ liệu cache
            if (!weatherData) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError('Không thể lấy dữ liệu thời tiết. Vui lòng thử lại sau.');
                }
            } else {
                // Có dữ liệu cache, hiển thị toast thông báo
                console.log('Using cached data due to fetch error');
                setShowRetryToast(true);
                // Auto hide toast sau 3 giây
                setTimeout(() => setShowRetryToast(false), 3000);
            }
        } finally {
            // Cleanup
            if (fetchTimeout) {
                clearTimeout(fetchTimeout);
            }
        }
    };

    /**
     * Xử lý sự kiện nhấn nút quay lại
     */
    const handleBackPress = () => {
        navigation.goBack();
    };

    // 7. HIỂN THỊ UI THEO TRẠNG THÁI
    // Hiển thị skeleton loading khi đang tải
    if (loading) {
        return <LoadingSkeleton />;
    }

    // Hiển thị màn hình lỗi nếu có lỗi
    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
                        <Feather name="arrow-left" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => {
                            if (location) {
                                fetchWeatherData(location.latitude, location.longitude);
                            }
                        }}
                    >
                        <Text style={styles.retryButtonText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Xác định icon thời tiết dựa trên trạng thái
    const weatherCondition = weatherData?.weather[0]?.main || "Clear";
    const weatherIcon = weatherIcons[weatherCondition as keyof typeof weatherIcons] || weatherIcons.Clear;

    // Hiển thị UI chính với dữ liệu thời tiết
    return (
        <SafeAreaView style={styles.container}>
            {/* Retry Toast Notification */}
            {showRetryToast && (
                <View style={styles.toastContainer}>
                    <View style={styles.toast}>
                        <Ionicons name="warning-outline" size={20} color="#FF9500" />
                        <Text style={styles.toastText}>
                            Đang sử dụng dữ liệu đã lưu. Kiểm tra kết nối mạng.
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                setShowRetryToast(false);
                                if (location) {
                                    fetchWeatherData(location.latitude, location.longitude);
                                }
                            }}
                            style={styles.toastRetryButton}
                        >
                            <Text style={styles.toastRetryText}>Thử lại</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowRetryToast(false)}
                            style={styles.toastCloseButton}
                        >
                            <Ionicons name="close" size={18} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={handleBackPress}>
                    <Feather name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                    <Text style={styles.headerText}>Thời tiết</Text>
                </View>
                <View style={styles.iconButton} />
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Nhập địa chỉ..."
                    value={searchQuery}
                    onChangeText={(text) => {
                        setSearchQuery(text);
                        debouncedFetchSuggestions(text); // Gọi API gợi ý khi người dùng nhập
                    }}
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchButtonText}>Tìm kiếm</Text>
                </TouchableOpacity>
            </View>

            {suggestions.length > 0 && (
                <FlatList
                    data={suggestions}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.suggestionItem}
                            onPress={() => handleSelectSuggestion(item)}
                        >
                            <Text style={styles.suggestionText}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                    style={styles.suggestionsList}
                />
            )}

            {loadingSuggestions && searchQuery.trim() && (
                <View style={styles.loadingSuggestionsContainer}>
                    <ActivityIndicator size="small" color="#666" />
                    <Text style={styles.loadingSuggestionsText}>Đang tìm kiếm...</Text>
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Location and Date */}
                <View style={styles.locationContainer}>
                    <Text style={styles.locationText}>
                        {location?.city}, {location?.country}
                    </Text>
                    <Text style={styles.dateText}>{getCurrentDate()}</Text>
                </View>

                {/* Current Weather */}
                <View style={styles.currentWeather}>
                    {weatherIcon}
                    <View style={styles.temperatureContainer}>
                        <Text style={styles.temperature}>
                            {Math.round(weatherData?.main?.temp || 0)}
                            <Text style={styles.temperatureUnit}>°C</Text>
                        </Text>
                        <Text style={styles.weatherDescription}>
                            {translateWeatherDescription(weatherData?.weather[0]?.description || weatherData?.weather[0]?.main || "Clear")}
                        </Text>
                    </View>
                </View>

                {/* Weather Info Cards */}
                <View style={styles.infoContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <WeatherInfoCard
                            icon={<MaterialCommunityIcons name="weather-pouring" size={24} color="#4DA6FF" />}
                            title="Lượng mưa"
                            value={weatherData?.rain?.["1h"] || 0}
                            unit="cm"
                        />
                        <WeatherInfoCard
                            icon={<Feather name="wind" size={24} color="#FF69B4" />}
                            title="Gió"
                            value={Math.round(weatherData?.wind?.speed || 0)}
                            unit="km/h"
                        />
                    </View>
                    <View style={{ alignItems: 'center', marginTop: 10 }}>
                        <WeatherInfoCard
                            icon={<Ionicons name="water-outline" size={24} color="#4DA6FF" />}
                            title="Độ ẩm"
                            value={weatherData?.main?.humidity || 0}
                            unit="%"
                        />
                    </View>
                </View>

                {/* Daily Forecast */}
                <View style={styles.dailyForecastContainer}>
                    <Text style={styles.dailyForecastTitle}>Dự báo 7 ngày tới</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.dailyForecastList}
                    >
                        {dailyForecast.map((item, index) => (
                            <DailyForecastItem
                                key={index}
                                date={formatDate(item.dt)}
                                temp={Math.round(item.main.temp)}
                                icon={weatherIcons[item.weather[0]?.main as keyof typeof weatherIcons] || weatherIcons.Clear}
                                description={translateWeatherDescription(item.weather[0]?.description || "")}
                            />
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff8f0", // Peachy background color
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 10,
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginRight: 10,
    },
    searchButton: {
        backgroundColor: "#000",
        padding: 10,
        borderRadius: 8,
    },
    searchButtonText: {
        color: "#fff",
        fontSize: 16,
    },
    suggestionsList: {
        maxHeight: 200,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginHorizontal: 20,
        marginTop: 5,
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    suggestionText: {
        fontSize: 16,
        color: "#333",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    iconButton: {
        padding: 8,
    },
    headerDots: {
        flexDirection: "row",
        alignItems: "center",
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "black",
        marginHorizontal: 2,
    },
    dash: {
        width: 12,
        height: 4,
        borderRadius: 2,
        backgroundColor: "black",
        marginHorizontal: 2,
    },
    locationContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    locationText: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
    },
    dateText: {
        fontSize: 16,
        color: "#666",
        marginTop: 4,
    },
    currentWeather: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 30,
    },
    temperatureContainer: {
        marginLeft: 20,
    },
    temperature: {
        fontSize: 60,
        fontWeight: "bold",
        color: "#333",
    },
    temperatureUnit: {
        fontSize: 24,
        fontWeight: "normal",
    },
    weatherDescription: {
        fontSize: 18,
        color: "#666",
    },
    infoContainer: {
        paddingHorizontal: 20,
        marginTop: 30,
        gap: 10,
    },
    infoCard: {
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        width: '45%',
    },
    infoCardContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    infoCardText: {
        marginLeft: 12,
    },
    infoCardTitle: {
        fontSize: 16,
        color: "#666",
    },
    infoCardValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    infoCardUnit: {
        fontSize: 14,
        fontWeight: "normal",
    },
    dailyForecastContainer: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    dailyForecastTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    dailyForecastList: {
        marginTop: 10,
    },
    dailyForecastItem: {
        alignItems: 'center',
        marginRight: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 10,
        borderRadius: 10,
        minWidth: 80,
    },
    dayText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    dailyTemp: {
        fontSize: 16,
        marginTop: 5,
    },
    dailyDescription: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        marginBottom: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
        marginHorizontal: 20,
    },
    retryButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#000',
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    headerTitle: {
        flex: 1,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    hourItem: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
        padding: 10,
        borderRadius: 16,
        width: 70,
        height: 100,
    },
    currentHourItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    hourTime: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    hourTemp: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 8,
    },
    loadingSuggestionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        backgroundColor: '#f5f5f5',
        marginHorizontal: 20,
        marginTop: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    loadingSuggestionsText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    toastContainer: {
        position: 'absolute',
        top: Platform.OS === 'android' ? StatusBar.currentHeight || 40 : 50,
        left: 20,
        right: 20,
        zIndex: 1000,
    },
    toast: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9500',
    },
    toastText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 10,
        flex: 1,
        fontWeight: '500',
    },
    toastRetryButton: {
        padding: 8,
        marginLeft: 10,
    },
    toastRetryText: {
        fontSize: 14,
        color: '#000',
        fontWeight: 'bold',
    },
    toastCloseButton: {
        padding: 8,
        marginLeft: 10,
    },
});

