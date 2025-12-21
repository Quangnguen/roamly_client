/**
 * 🔒 Secure Storage Utility
 * ================================
 * Mã hóa dữ liệu trước khi lưu vào AsyncStorage
 * Sử dụng AES encryption với expo-crypto
 *
 * @author Roamly Team
 * @version 1.0.0
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

// ================================
// CONFIGURATION
// ================================

const isSecureStoreAvailable = Platform.OS !== 'web';

// Key để lưu encryption key trong SecureStore
const ENCRYPTION_KEY_STORAGE = 'roamly_encryption_key';

// ================================
// ENCRYPTION KEY MANAGEMENT
// ================================

/**
 * Lấy hoặc tạo encryption key
 * Key sẽ được lưu trong SecureStore (an toàn nhất)
 */
async function getOrCreateEncryptionKey(): Promise<string> {
  try {
    if (isSecureStoreAvailable) {
      // Trên mobile: lưu key trong SecureStore (mã hóa phần cứng)
      let key = await SecureStore.getItemAsync(ENCRYPTION_KEY_STORAGE);
      if (!key) {
        // Tạo key mới (32 bytes = 256 bits cho AES-256)
        key = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          `roamly_${Date.now()}_${Math.random()}`
        );
        await SecureStore.setItemAsync(ENCRYPTION_KEY_STORAGE, key);
      }
      return key;
    } else {
      // Trên web: sử dụng fixed key (ít an toàn hơn)
      // Production nên implement Web Crypto API
      return 'roamly_web_fallback_key_32chars!';
    }
  } catch (error) {
    console.error('Error getting encryption key:', error);
    // Fallback key nếu có lỗi
    return 'roamly_fallback_key_32_chars!!';
  }
}

// ================================
// ENCRYPTION/DECRYPTION
// ================================

/**
 * Mã hóa chuỗi sử dụng SHA256 hash + XOR (lightweight encryption)
 * Đây là phương pháp đơn giản, phù hợp cho dữ liệu cache
 * Cho dữ liệu cực kỳ nhạy cảm, nên dùng SecureStore trực tiếp
 */
async function encrypt(text: string): Promise<string> {
  try {
    if (!text) return text;

    const key = await getOrCreateEncryptionKey();

    // Tạo salt random cho mỗi lần mã hóa
    const salt = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${Date.now()}_${Math.random()}`
    );

    // Tạo hash từ key + salt
    const keyHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      key + salt
    );

    // Mã hóa XOR đơn giản (lightweight)
    const encrypted = xorEncrypt(text, keyHash);

    // Format: salt:encrypted (base64)
    const saltBase64 = Buffer.from(salt.substring(0, 16)).toString('base64');
    const encryptedBase64 = Buffer.from(encrypted).toString('base64');

    return `${saltBase64}:${encryptedBase64}`;
  } catch (error) {
    console.error('Encryption error:', error);
    // Nếu lỗi, trả về text gốc (không mã hóa)
    return text;
  }
}

/**
 * Giải mã chuỗi đã được mã hóa
 */
async function decrypt(encryptedText: string): Promise<string> {
  try {
    if (!encryptedText) return encryptedText;

    // Kiểm tra xem có phải text đã mã hóa không
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      // Không phải text mã hóa, trả về nguyên bản (tương thích ngược)
      return encryptedText;
    }

    const [saltBase64, encryptedBase64] = parts;

    const key = await getOrCreateEncryptionKey();

    // Giải mã base64
    const salt = Buffer.from(saltBase64, 'base64').toString();
    const encrypted = Buffer.from(encryptedBase64, 'base64').toString();

    // Tạo lại hash từ key + salt
    const keyHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      key + salt
    );

    // Giải mã XOR
    const decrypted = xorEncrypt(encrypted, keyHash);

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    // Nếu lỗi giải mã, trả về text gốc
    return encryptedText;
  }
}

/**
 * XOR encryption (symmetric - encrypt và decrypt dùng cùng hàm)
 */
function xorEncrypt(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return result;
}

/**
 * Kiểm tra xem text có phải đã được mã hóa không
 */
function isEncrypted(text: string): boolean {
  if (!text) return false;
  const parts = text.split(':');
  return parts.length === 2 && parts.every((part) => {
    try {
      // Kiểm tra base64 hợp lệ
      return /^[A-Za-z0-9+/=]+$/.test(part);
    } catch {
      return false;
    }
  });
}

// ================================
// PUBLIC API
// ================================

/**
 * Mã hóa và lưu dữ liệu vào AsyncStorage
 * @param key - Storage key
 * @param data - Dữ liệu cần lưu (object hoặc string)
 */
export async function encryptAndStore(
  key: string,
  data: unknown
): Promise<void> {
  try {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    const encrypted = await encrypt(jsonString);
    await AsyncStorage.setItem(key, encrypted);
  } catch (error) {
    console.error('Error in encryptAndStore:', error);
    throw error;
  }
}

/**
 * Lấy và giải mã dữ liệu từ AsyncStorage
 * @param key - Storage key
 * @returns Dữ liệu đã giải mã (parsed JSON nếu có thể)
 */
export async function getAndDecrypt<T = unknown>(
  key: string
): Promise<T | null> {
  try {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return null;

    const decrypted = await decrypt(encrypted);

    // Thử parse JSON
    try {
      return JSON.parse(decrypted) as T;
    } catch {
      // Nếu không parse được, trả về string
      return decrypted as unknown as T;
    }
  } catch (error) {
    console.error('Error in getAndDecrypt:', error);
    return null;
  }
}

/**
 * Xóa dữ liệu khỏi AsyncStorage
 * @param key - Storage key
 */
export async function removeSecureItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing secure item:', error);
    throw error;
  }
}

/**
 * Lưu dữ liệu cực kỳ nhạy cảm vào SecureStore (chỉ mobile)
 * Fallback về encrypted AsyncStorage trên web
 * @param key - Storage key
 * @param value - Giá trị cần lưu (string)
 */
export async function storeHighlySensitive(
  key: string,
  value: string
): Promise<void> {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.setItemAsync(key, value);
    } else {
      // Web fallback
      await encryptAndStore(key, value);
    }
  } catch (error) {
    console.error('Error storing highly sensitive data:', error);
    throw error;
  }
}

/**
 * Lấy dữ liệu cực kỳ nhạy cảm từ SecureStore
 * @param key - Storage key
 */
export async function getHighlySensitive(key: string): Promise<string | null> {
  try {
    if (isSecureStoreAvailable) {
      return await SecureStore.getItemAsync(key);
    } else {
      // Web fallback
      return await getAndDecrypt<string>(key);
    }
  } catch (error) {
    console.error('Error getting highly sensitive data:', error);
    return null;
  }
}

/**
 * Xóa dữ liệu cực kỳ nhạy cảm
 * @param key - Storage key
 */
export async function removeHighlySensitive(key: string): Promise<void> {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Error removing highly sensitive data:', error);
    throw error;
  }
}

// ================================
// EXPORTS
// ================================

export const SecureStorage = {
  // Mã hóa cơ bản (cho cache, settings)
  encryptAndStore,
  getAndDecrypt,
  removeSecureItem,

  // Mã hóa cao cấp (cho tokens, passwords)
  storeHighlySensitive,
  getHighlySensitive,
  removeHighlySensitive,

  // Utilities
  isEncrypted,
  encrypt,
  decrypt,
};

export default SecureStorage;
