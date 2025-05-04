// src/utils/cache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry?: number; // timestamp d'expiration
}

export class Cache {
  private static instance: Cache;
  private prefix: string = '@modelo_cache_';
  
  private constructor() {}
  
  public static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }
  
  public async set<T>(key: string, value: T, expiryInMinutes: number = 5): Promise<void> {
    try {
      const item: CacheItem<T> = {
        data: value,
        timestamp: Date.now(),
        expiry: Date.now() + (expiryInMinutes * 60 * 1000),
      };
      
      await AsyncStorage.setItem(
        this.getKey(key),
        JSON.stringify(item)
      );
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  public async get<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(this.getKey(key));
      
      if (!item) {
        return null;
      }
      
      const cacheItem: CacheItem<T> = JSON.parse(item);
      
      // Vérifier si l'item a expiré
      if (cacheItem.expiry && cacheItem.expiry < Date.now()) {
        await this.remove(key);
        return null;
      }
      
      return cacheItem.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  public async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }
  
  public async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.prefix));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
  
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}

export const cache = Cache.getInstance();