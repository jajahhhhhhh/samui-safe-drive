import { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { Property, Zone } from './types';
import {
  getProperties,
  getPropertyById,
  importPropertyFromFacebook,
  getPropertyHistory,
  deleteImportedProperty as deleteFromStorage,
  updatePropertyGroupPriceHistory
} from './storage';

interface PropertyContextValue {
  properties: Property[];
  isLoading: boolean;
  getPropertyById: (id: string) => Property | undefined;
  searchProperties: (query: string, zone?: Zone, priceRange?: { min: number; max: number }) => Property[];
  searchBySource: (source?: 'mock' | 'facebook' | 'all') => Property[];
  refreshProperties: () => Promise<void>;
  importNewProperty: (postText: string, photoUrls?: string[]) => Promise<boolean>;
  getPropertyVersions: (groupId: string) => Promise<Property[]>;
  deleteImportedProperty: (propertyId: string) => Promise<void>;
}

const PropertyContext = createContext<PropertyContextValue | null>(null);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const loadedProperties = await getProperties();
    setProperties(loadedProperties);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshProperties = useCallback(async () => {
    setIsLoading(true);
    const loadedProperties = await getProperties();
    setProperties(loadedProperties);
    setIsLoading(false);
  }, []);

  const getPropertyByIdLocal = useCallback((id: string): Property | undefined => {
    return properties.find(p => p.id === id);
  }, [properties]);

  const searchProperties = useCallback((
    query: string,
    zone?: Zone,
    priceRange?: { min: number; max: number }
  ): Property[] => {
    return properties.filter(property => {
      // Filter by search query (title and address)
      const queryLower = query.toLowerCase();
      const matchesQuery = !query ||
        property.title.toLowerCase().includes(queryLower) ||
        property.address.toLowerCase().includes(queryLower) ||
        property.description.toLowerCase().includes(queryLower);

      // Filter by zone
      const matchesZone = !zone || property.zone === zone;

      // Filter by price range
      const matchesPrice = !priceRange ||
        (property.price >= priceRange.min && property.price <= priceRange.max);

      return matchesQuery && matchesZone && matchesPrice;
    });
  }, [properties]);

  const searchBySource = useCallback((source?: 'mock' | 'facebook' | 'all'): Property[] => {
    if (!source || source === 'all') return properties;
    return properties.filter(p => (p.source || 'mock') === source);
  }, [properties]);

  const importNewProperty = useCallback(async (
    postText: string,
    photoUrls: string[] = []
  ): Promise<boolean> => {
    try {
      const imported = await importPropertyFromFacebook(postText, photoUrls);

      if (imported && imported.groupId) {
        // Update price history for the group
        await updatePropertyGroupPriceHistory(imported.groupId);
        // Refresh properties list
        await refreshProperties();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing property:', error);
      return false;
    }
  }, [refreshProperties]);

  const getPropertyVersions = useCallback(async (groupId: string): Promise<Property[]> => {
    try {
      return await getPropertyHistory(groupId);
    } catch (error) {
      console.error('Error getting property versions:', error);
      return [];
    }
  }, []);

  const deleteImportedProperty = useCallback(async (propertyId: string): Promise<void> => {
    try {
      await deleteFromStorage(propertyId);
      await refreshProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  }, [refreshProperties]);

  const value = useMemo(() => ({
    properties,
    isLoading,
    getPropertyById: getPropertyByIdLocal,
    searchProperties,
    searchBySource,
    refreshProperties,
    importNewProperty,
    getPropertyVersions,
    deleteImportedProperty,
  }), [
    properties,
    isLoading,
    getPropertyByIdLocal,
    searchProperties,
    searchBySource,
    refreshProperties,
    importNewProperty,
    getPropertyVersions,
    deleteImportedProperty,
  ]);

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperties() {
  const context = useContext(PropertyContext);
  if (!context) throw new Error('useProperties must be used within PropertyProvider');
  return context;
}
