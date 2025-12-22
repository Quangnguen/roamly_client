import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

export interface DeviceInfo {
    deviceId: string;
    deviceName: string;
    platform: string;
    userAgent?: string;
}

/**
 * Lấy thông tin thiết bị để sử dụng cho 2FA
 */


export const getDeviceInfo = async (): Promise<DeviceInfo> => {
    try {
        let deviceId: string;

        // Lấy device ID duy nhất cho mỗi platform
        if (Platform.OS === 'ios') {
            // iOS: Sử dụng identifierForVendor
            deviceId = await Application.getIosIdForVendorAsync() || '';
        } else if (Platform.OS === 'android') {
            // Android: Sử dụng androidId
            deviceId = Application.getAndroidId() || '';
        } else {
            // Web hoặc khác: Tạo fingerprint dựa trên các thông tin có sẵn
            const fingerprint = `${Device.deviceName}-${Device.modelName}-${Device.osVersion}`;
            deviceId = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                fingerprint
            );
        }

        // Nếu vẫn không có deviceId, tạo một ID ngẫu nhiên và lưu vào storage
        if (!deviceId) {
            deviceId = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                `${Date.now()}-${Math.random()}`
            );
        }

        // Lấy tên thiết bị
        const deviceName = Device.deviceName ||
            `${Device.manufacturer || 'Unknown'} ${Device.modelName || 'Device'}`;

        // Xác định platform
        const platform = Platform.OS === 'ios' ? 'iOS' :
            Platform.OS === 'android' ? 'Android' : 'Web';

        // Tạo user agent string
        const userAgent = `${Device.manufacturer || 'Unknown'}/${Device.modelName || 'Unknown'} ` +
            `(${Platform.OS} ${Device.osVersion || 'Unknown'})`;

        return {
            deviceId,
            deviceName,
            platform,
            userAgent,
        };
    } catch (error) {
        console.error('Error getting device info:', error);

        // Fallback: Trả về device info cơ bản
        const fallbackId = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            `fallback-${Date.now()}-${Math.random()}`
        );

        return {
            deviceId: fallbackId,
            deviceName: 'Unknown Device',
            platform: Platform.OS,
            userAgent: 'Unknown',
        };
    }
};
// import * as Application from 'expo-application';
// import * as Device from 'expo-device';
// import { Platform } from 'react-native';
// import * as Crypto from 'expo-crypto';

// export interface DeviceInfo {
//     deviceId: string;
//     deviceName: string;
//     platform: string;
//     userAgent?: string;
// }

// /**
//  * Lấy thông tin thiết bị để sử dụng cho 2FA
//  */

// export const getDeviceInfo = async (): Promise<DeviceInfo> => {
//     // ⚠️ TEST MODE: Bật true để giả lập thiết bị mới mỗi lần đăng nhập
//     const SIMULATE_NEW_DEVICE = true;

//     try {
//         let deviceId: string;

//         if (SIMULATE_NEW_DEVICE) {
//             console.log('⚠️ [TEST MODE] Simulating new device for 2FA testing');
//             deviceId = `test-device-${Date.now()}-${Math.random().toString(36).substring(7)}`;
//         } else if (Platform.OS === 'ios') {
//             // iOS: Sử dụng identifierForVendor
//             deviceId = await Application.getIosIdForVendorAsync() || '';
//         } else if (Platform.OS === 'android') {
//             // Android: Sử dụng androidId
//             deviceId = Application.getAndroidId() || '';
//         } else {
//             // Web hoặc khác: Tạo fingerprint dựa trên các thông tin có sẵn
//             const fingerprint = `${Device.deviceName}-${Device.modelName}-${Device.osVersion}`;
//             deviceId = await Crypto.digestStringAsync(
//                 Crypto.CryptoDigestAlgorithm.SHA256,
//                 fingerprint
//             );
//         }

//         // Nếu vẫn không có deviceId, tạo một ID ngẫu nhiên và lưu vào storage
//         if (!deviceId) {
//             deviceId = await Crypto.digestStringAsync(
//                 Crypto.CryptoDigestAlgorithm.SHA256,
//                 `${Date.now()}-${Math.random()}`
//             );
//         }

//         // Lấy tên thiết bị
//         const deviceName = Device.deviceName ||
//             `${Device.manufacturer || 'Unknown'} ${Device.modelName || 'Device'}`;

//         // Xác định platform
//         const platform = Platform.OS === 'ios' ? 'iOS' :
//             Platform.OS === 'android' ? 'Android' : 'Web';

//         // Tạo user agent string
//         const userAgent = `${Device.manufacturer || 'Unknown'}/${Device.modelName || 'Unknown'} ` +
//             `(${Platform.OS} ${Device.osVersion || 'Unknown'})`;

//         return {
//             deviceId,
//             deviceName,
//             platform,
//             userAgent,
//         };
//     } catch (error) {
//         console.error('Error getting device info:', error);

//         // Fallback: Trả về device info cơ bản
//         const fallbackId = await Crypto.digestStringAsync(
//             Crypto.CryptoDigestAlgorithm.SHA256,
//             `fallback-${Date.now()}-${Math.random()}`
//         );

//         return {
//             deviceId: fallbackId,
//             deviceName: 'Unknown Device',
//             platform: Platform.OS,
//             userAgent: 'Unknown',
//         };
//     }
// };
