"use client";

import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Platform,
    StatusBar,
    Animated,
    PanResponder,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "@/src/utils/PropsNavigate";

interface WeatherInfoCardProps {
    icon: JSX.Element | string;
    title: string;
    value: number;
    unit?: string;
}

interface ForecastHourItemProps {
    icon: JSX.Element | string;
    temp: number;
    time: string;
    isNow: boolean;
}

interface WeatherType {
    main: {
        temp: number;
        humidity: number;
    };
    weather: { main: string }[];
    rain?: {
        [key: string]: number;
    };
    wind?: {
        speed: number;
    };
}

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

// Weather condition icons mapping
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

// Weather info card component
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

// Forecast hour item component
const ForecastHourItem = ({
    time,
    temp,
    icon,
    isNow,
}: ForecastHourItemProps) => (
    <View style={[styles.hourItem, isNow && styles.currentHourItem]}>
        <Text style={styles.hourTime}>{time}</Text>
        {icon}
        <Text style={styles.hourTemp}>{temp}°</Text>
    </View>
);

export default function WeatherPage() {
    const [location, setLocation] = useState<Location.LocationObject | null>(
        null
    );
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [weather, setWeather] = useState<WeatherType | null>(null);
    const [forecast, setForecast] = useState<ForecastItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [address, setAddress] = useState<{
        city: string;
        country: string;
    } | null>(null);

    const navigation: NavigationProp<"InApp" | "WeatherPage"> = useNavigation();

    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
            return Math.abs(gestureState.dx) > 20;
        },
        onPanResponderRelease: (_, gestureState) => {
            if (gestureState.dx > 50) {
                navigation.navigate("InApp");
            }
        },
    });

    // Get current date in the format "Day, Month Date"
    const getCurrentDate = () => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];

        const now = new Date();
        const day = days[now.getDay()];
        const month = months[now.getMonth()];
        const date = now.getDate();

        return `${day}, ${month} ${date}`;
    };

    // Format time from timestamp (e.g., "13:00")
    const formatTime = (timestamp: number): string => {
        const date = new Date(timestamp * 1000);
        const hours = date.getHours();
        return `${hours}:00`;
    };

    // Get device location and fetch weather data
    useEffect(() => {
        (async () => {
            try {
                // Request location permissions
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    setErrorMsg("Permission to access location was denied");
                    return;
                }

                // Get current location
                const location = await Location.getCurrentPositionAsync({});
                setLocation(location);
                console.log("Location:", location);

                // Get address from coordinates
                const addressResponse = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
                console.log("Address Response:", addressResponse);

                if (addressResponse && addressResponse.length > 0) {
                    const { city, region, country } = addressResponse[0];
                    setAddress({
                        city: city || region || "Unknown",
                        country: country || "",
                    });
                }

                // Fetch current weather data
                const weatherResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&units=metric&appid=3e349bf428f7f4fc11df7a1077b01876`
                );
                const weatherData = await weatherResponse.json();
                setWeather(weatherData);

                // Fetch forecast data
                const forecastResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/forecast?lat=${location.coords.latitude}&lon=${location.coords.longitude}&units=metric&appid=3e349bf428f7f4fc11df7a1077b01876`
                );
                const forecastData = await forecastResponse.json();

                // Process forecast data to get hourly forecasts for today
                const today = new Date().setHours(0, 0, 0, 0);
                console.log("Forecast Data:", forecastData);
                console.log("Today:", today);
                const todayForecasts = forecastData.list
                    .filter((item: ForecastItem) => {
                        const itemDate = new Date(item.dt * 1000).setHours(0, 0, 0, 0);
                        return itemDate === today;
                    })
                    .slice(0, 6); // Get first 6 forecasts for today

                setForecast(todayForecasts);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching weather data:", error);
                setErrorMsg("Failed to fetch weather data");
                setLoading(false);
            }
        })();
    }, []);

    // Show loading or error message
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.loadingText}>Loading weather data...</Text>
            </SafeAreaView>
        );
    }

    if (errorMsg) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>{errorMsg}</Text>
            </SafeAreaView>
        );
    }

    // Get weather condition and icon
    const weatherCondition = weather?.weather[0]?.main || "Clear";
    const weatherIcon =
        weatherIcons[weatherCondition as keyof typeof weatherIcons] ||
        weatherIcons.Clear;

    return (
        <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton}>
                    <Feather name="search" size={24} color="black" />
                </TouchableOpacity>
                <View style={styles.headerDots}>
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={styles.dash} />
                    <View style={styles.dot} />
                </View>
                <TouchableOpacity style={styles.iconButton}>
                    <Feather name="menu" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {/* Location and Date */}
            <View style={styles.locationContainer}>
                <Text style={styles.locationText}>
                    {address?.city}, {address?.country}
                </Text>
                <Text style={styles.dateText}>{getCurrentDate()}</Text>
            </View>

            {/* Current Weather */}
            <View style={styles.currentWeather}>
                {weatherIcon}
                <View style={styles.temperatureContainer}>
                    <Text style={styles.temperature}>
                        {Math.round(weather?.main?.temp || 0)}
                        <Text style={styles.temperatureUnit}>°C</Text>
                    </Text>
                    <Text style={styles.weatherDescription}>
                        {weather?.weather[0]?.main || "Clear"}
                    </Text>
                </View>
            </View>

            {/* Weather Info Cards */}
            <View style={styles.infoCardsContainer}>
                <WeatherInfoCard
                    icon={
                        <MaterialCommunityIcons
                            name="weather-pouring"
                            size={24}
                            color="#4DA6FF"
                        />
                    }
                    title="Rainfall"
                    value={weather?.rain?.["1h"] || 0}
                    unit="cm"
                />
                <WeatherInfoCard
                    icon={<Feather name="wind" size={24} color="#FF69B4" />}
                    title="Wind"
                    value={Math.round(weather?.wind?.speed || 0)}
                    unit="km/h"
                />
                <WeatherInfoCard
                    icon={<Ionicons name="water-outline" size={24} color="#4DA6FF" />}
                    title="Humidity"
                    value={weather?.main?.humidity || 0}
                    unit="%"
                />
            </View>

            {/* Forecast Section */}
            <View style={styles.forecastContainer}>
                <View style={styles.forecastHeader}>
                    <Text style={styles.forecastTitle}>Today</Text>
                    <View style={styles.forecastTabs}>
                        <Text style={styles.activeTab}>Tomorrow</Text>
                        <Text style={styles.inactiveTab}>Next 7 Days</Text>
                        <Feather name="chevron-right" size={20} color="black" />
                    </View>
                </View>

                {/* Active Tab Indicator */}
                <View style={styles.tabIndicatorContainer}>
                    <View style={styles.tabIndicator} />
                </View>

                {/* Hourly Forecast */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.hourlyForecast}
                    contentContainerStyle={styles.hourlyForecastContent}
                >
                    <ForecastHourItem
                        time="now"
                        temp={Math.round(weather?.main?.temp || 0)}
                        icon={weatherIcon}
                        isNow={true}
                    />

                    {forecast.map((item, index) => (
                        <ForecastHourItem
                            key={index}
                            time={formatTime(item.dt)}
                            temp={Math.round(item.main.temp)}
                            //   icon={'weatherIcons[item.weather[0]?.main]' || weatherIcons.Clear}
                            icon={
                                weatherIcons[
                                item.weather[0]?.main as keyof typeof weatherIcons
                                ] || weatherIcons.Clear
                            }
                            isNow={false}
                        />
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff", // Peachy background color
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
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
    infoCardsContainer: {
        paddingHorizontal: 20,
        marginTop: 30,
        gap: 10,
    },
    infoCard: {
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: 16,
        padding: 16,
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
    forecastContainer: {
        marginTop: 30,
        flex: 1,
    },
    forecastHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    forecastTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    forecastTabs: {
        flexDirection: "row",
        alignItems: "center",
    },
    activeTab: {
        fontSize: 14,
        color: "#333",
        marginRight: 10,
    },
    inactiveTab: {
        fontSize: 14,
        color: "#666",
        marginRight: 10,
    },
    tabIndicatorContainer: {
        paddingHorizontal: 20,
        marginTop: 8,
    },
    tabIndicator: {
        width: 30,
        height: 4,
        backgroundColor: "#333",
        borderRadius: 2,
    },
    hourlyForecast: {
        marginTop: 20,
    },
    hourlyForecastContent: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    hourItem: {
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 5,
        padding: 10,
        borderRadius: 16,
        width: 70,
        height: 100,
    },
    currentHourItem: {
        backgroundColor: "rgba(255, 255, 255, 0.5)",
    },
    hourTime: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
    },
    hourTemp: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginTop: 8,
    },
    loadingText: {
        fontSize: 18,
        textAlign: "center",
        marginTop: 100,
    },
    errorText: {
        fontSize: 18,
        textAlign: "center",
        marginTop: 100,
        color: "red",
    },
});
