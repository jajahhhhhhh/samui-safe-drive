import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, UserProfile, DriverRegistration, Property } from './types';
import { parsePropertyFromFacebookPost, calculateStringSimilarity } from './facebook-parser';
import * as Crypto from 'expo-crypto';

const KEYS = {
  TRIPS: '@samui_trips',
  PROFILE: '@samui_profile',
  ACTIVE_TRIP: '@samui_active_trip',
  DRIVER_REG: '@samui_driver_registration',
  PROPERTIES: '@samui_properties',
};

const MOCK_PROPERTIES: Property[] = [
  {
    id: 'p1',
    title: 'Beachfront Villa Chaweng',
    description: 'Luxury beachfront villa with private pool and stunning views of Chaweng Beach. Perfect for families and groups.',
    propertyType: 'villa',
    zone: 'chaweng',
    price: 3500,
    currency: 'THB',
    address: '123 Chaweng Beach Road, Chaweng',
    latitude: 8.738,
    longitude: 100.0831,
    photos: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
      'https://images.unsplash.com/photo-1571896619256-e51095f504ef?w=400',
    ],
    amenities: ['WiFi', 'AC', 'Pool', 'Beach Access', 'Kitchen', 'Parking'],
    rating: 4.8,
    ratingCount: 127,
    reviews: [
      { id: 'r1', authorName: 'John Doe', rating: 5, comment: 'Amazing location and beautiful property!', date: '2024-01-15' },
      { id: 'r2', authorName: 'Jane Smith', rating: 5, comment: 'Clean, spacious, and friendly staff.', date: '2024-01-10' },
      { id: 'r3', authorName: 'Mike Johnson', rating: 4, comment: 'Great stay but AC could be better.', date: '2024-01-05' },
    ],
    ownerName: 'Somchai Resort Co.',
    ownerPhone: '+66812345678',
    ownerEmail: 'somchai@resort.co.th',
    ownerPhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Somchai',
    createdAt: '2023-12-01',
    updatedAt: '2024-01-20',
  },
  {
    id: 'p2',
    title: 'Modern Apartment Downtown Lamai',
    description: 'Contemporary apartment in the heart of Lamai with easy access to restaurants and nightlife.',
    propertyType: 'apartment',
    zone: 'lamai',
    price: 1200,
    currency: 'THB',
    address: '456 Lamai Beach Road, Lamai',
    latitude: 8.647,
    longitude: 100.0789,
    photos: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    ],
    amenities: ['WiFi', 'AC', 'Gym', 'Kitchen', 'Laundry'],
    rating: 4.5,
    ratingCount: 89,
    reviews: [
      { id: 'r4', authorName: 'Sarah Williams', rating: 4, comment: 'Good location, comfortable stay.', date: '2024-01-18' },
      { id: 'r5', authorName: 'Tom Brown', rating: 5, comment: 'Very clean and modern.', date: '2024-01-12' },
    ],
    ownerName: 'Bangkok Property Group',
    ownerPhone: '+66898765432',
    ownerEmail: 'info@bpgroup.co.th',
    ownerPhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bangkok',
    createdAt: '2023-11-15',
    updatedAt: '2024-01-18',
  },
  {
    id: 'p3',
    title: 'Cozy House Bophut Village',
    description: 'Traditional Thai-style house in the charming Fisherman Village of Bophut. Great for cultural experience.',
    propertyType: 'house',
    zone: 'bophut',
    price: 1800,
    currency: 'THB',
    address: '789 Moo 1, Bophut Subdistrict',
    latitude: 8.766,
    longitude: 100.134,
    photos: [
      'https://images.unsplash.com/photo-1570129477492-45abb77ee9e0?w=400',
      'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400',
    ],
    amenities: ['WiFi', 'AC', 'Kitchen', 'Garden', 'Parking'],
    rating: 4.6,
    ratingCount: 64,
    reviews: [
      { id: 'r6', authorName: 'Alice Lee', rating: 5, comment: 'Authentic Thai experience!', date: '2024-01-14' },
      { id: 'r7', authorName: 'David Park', rating: 4, comment: 'Quiet neighbourhood, loved it.', date: '2024-01-08' },
    ],
    ownerName: 'Bophut Heritage Homes',
    ownerPhone: '+66867123456',
    ownerEmail: 'heritage@bophut.co.th',
    ownerPhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bophut',
    createdAt: '2023-10-20',
    updatedAt: '2024-01-16',
  },
  {
    id: 'p4',
    title: '5-Star Luxury Hotel - Mae Nam',
    description: 'World-class hotel resort with spa, fine dining, and all-inclusive amenities on Mae Nam Beach.',
    propertyType: 'hotel',
    zone: 'maenam',
    price: 4200,
    currency: 'THB',
    address: '999 Mae Nam Beach, Mae Nam',
    latitude: 8.768,
    longitude: 100.031,
    photos: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
      'https://images.unsplash.com/photo-1582719471384-894fbb1675ec?w=400',
      'https://images.unsplash.com/photo-1584132604489-d254c32d2af3?w=400',
    ],
    amenities: ['WiFi', 'AC', 'Pool', 'Spa', 'Restaurant', 'Room Service', 'Concierge'],
    rating: 4.9,
    ratingCount: 234,
    reviews: [
      { id: 'r8', authorName: 'Global Traveler', rating: 5, comment: 'Exceptional service and luxury!', date: '2024-01-19' },
      { id: 'r9', authorName: 'Luxury Seeker', rating: 5, comment: 'Best resort in Samui.', date: '2024-01-13' },
    ],
    ownerName: 'Samui Luxury Resorts International',
    ownerPhone: '+66876543210',
    ownerEmail: 'reservations@samuiresorts.co.th',
    ownerPhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Samui',
    createdAt: '2023-09-01',
    updatedAt: '2024-01-19',
  },
  {
    id: 'p5',
    title: 'Compact Condo Nathon Town',
    description: 'Budget-friendly condo in quiet Nathon town. Perfect for long-term stays and remote workers.',
    propertyType: 'condo',
    zone: 'nathon',
    price: 800,
    currency: 'THB',
    address: '321 Nathon Road, Nathon',
    latitude: 8.904,
    longitude: 100.004,
    photos: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    ],
    amenities: ['WiFi', 'AC', 'Balcony', 'Parking'],
    rating: 4.3,
    ratingCount: 42,
    reviews: [
      { id: 'r10', authorName: 'Budget Traveler', rating: 4, comment: 'Good value for money.', date: '2024-01-17' },
    ],
    ownerName: 'Nathon Properties',
    ownerPhone: '+66812111222',
    ownerEmail: 'nathon@properties.co.th',
    ownerPhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nathon',
    createdAt: '2023-08-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'p6',
    title: 'Beachfront Condo Lipa Noi',
    description: 'Premium beachfront condo with direct beach access and sunset views in quieter Lipa Noi.',
    propertyType: 'condo',
    zone: 'lipa_noi',
    price: 2800,
    currency: 'THB',
    address: '654 Lipa Noi Beach, Lipa Noi',
    latitude: 8.548,
    longitude: 100.092,
    photos: [
      'https://images.unsplash.com/photo-1502838124612-9f3ee1bfc4e4?w=400',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    ],
    amenities: ['WiFi', 'AC', 'Beach Access', 'Pool', 'Gym'],
    rating: 4.7,
    ratingCount: 103,
    reviews: [
      { id: 'r11', authorName: 'Sunset Lover', rating: 5, comment: 'Beautiful sunsets every evening!', date: '2024-01-16' },
      { id: 'r12', authorName: 'Beach Bum', rating: 5, comment: 'Direct beach access is amazing.', date: '2024-01-11' },
    ],
    ownerName: 'Lipa Noi Resorts',
    ownerPhone: '+66899888777',
    ownerEmail: 'lipanoi@resorts.co.th',
    ownerPhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LipaNoi',
    createdAt: '2023-07-25',
    updatedAt: '2024-01-14',
  },
  {
    id: 'p7',
    title: 'Private Estate Taling Ngam',
    description: 'Exclusive private estate with panoramic views of the west coast. Ultra-luxury retreat.',
    propertyType: 'villa',
    zone: 'taling_ngam',
    price: 5500,
    currency: 'THB',
    address: '123 Taling Ngam Hill, Taling Ngam',
    latitude: 8.459,
    longitude: 99.999,
    photos: [
      'https://images.unsplash.com/photo-1512197291652-521e6cf4ee14?w=400',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    ],
    amenities: ['WiFi', 'AC', 'Pool', 'Spa', 'Private Chef', 'Concierge', 'Gym'],
    rating: 4.9,
    ratingCount: 45,
    reviews: [
      { id: 'r13', authorName: 'VIP Guest', rating: 5, comment: 'Absolutely breathtaking!', date: '2024-01-20' },
    ],
    ownerName: 'Taling Ngam Signature Properties',
    ownerPhone: '+66877777666',
    ownerEmail: 'vip@talingngam.co.th',
    ownerPhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TalingNgam',
    createdAt: '2023-06-15',
    updatedAt: '2024-01-20',
  },
  {
    id: 'p8',
    title: 'Tropical Boutique Hotel Choeng Mon',
    description: 'Charming boutique hotel in Choeng Mon with local character and personalized service.',
    propertyType: 'hotel',
    zone: 'choeng_mon',
    price: 2100,
    currency: 'THB',
    address: '888 Choeng Mon Village, Choeng Mon',
    latitude: 8.851,
    longitude: 100.274,
    photos: [
      'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400',
      'https://images.unsplash.com/photo-1561599810-08b01865a9d2?w=400',
    ],
    amenities: ['WiFi', 'AC', 'Pool', 'Restaurant', 'Library', 'Bicycle Rental'],
    rating: 4.6,
    ratingCount: 78,
    reviews: [
      { id: 'r14', authorName: 'Local Explorer', rating: 5, comment: 'Authentic Thai experience.', date: '2024-01-13' },
      { id: 'r15', authorName: 'Culture Buff', rating: 4, comment: 'Great staff, cozy atmosphere.', date: '2024-01-09' },
    ],
    ownerName: 'Choeng Mon Boutique Hotels',
    ownerPhone: '+66881234567',
    ownerEmail: 'boutique@choengmon.co.th',
    ownerPhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChoeongMon',
    createdAt: '2023-05-20',
    updatedAt: '2024-01-13',
  },
];


export async function getTrips(): Promise<Trip[]> {
  const data = await AsyncStorage.getItem(KEYS.TRIPS);
  return data ? JSON.parse(data) : [];
}

export async function saveTrip(trip: Trip): Promise<void> {
  const trips = await getTrips();
  const idx = trips.findIndex(t => t.id === trip.id);
  if (idx >= 0) {
    trips[idx] = trip;
  } else {
    trips.unshift(trip);
  }
  await AsyncStorage.setItem(KEYS.TRIPS, JSON.stringify(trips));
}

export async function getActiveTrip(): Promise<Trip | null> {
  const data = await AsyncStorage.getItem(KEYS.ACTIVE_TRIP);
  return data ? JSON.parse(data) : null;
}

export async function setActiveTrip(trip: Trip | null): Promise<void> {
  if (trip) {
    await AsyncStorage.setItem(KEYS.ACTIVE_TRIP, JSON.stringify(trip));
  } else {
    await AsyncStorage.removeItem(KEYS.ACTIVE_TRIP);
  }
}

export async function getProfile(): Promise<UserProfile | null> {
  const data = await AsyncStorage.getItem(KEYS.PROFILE);
  return data ? JSON.parse(data) : null;
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

export async function getDriverRegistration(): Promise<DriverRegistration | null> {
  const data = await AsyncStorage.getItem(KEYS.DRIVER_REG);
  return data ? JSON.parse(data) : null;
}

export async function saveDriverRegistration(reg: DriverRegistration): Promise<void> {
  await AsyncStorage.setItem(KEYS.DRIVER_REG, JSON.stringify(reg));
}

export async function getProperties(): Promise<Property[]> {
  const data = await AsyncStorage.getItem(KEYS.PROPERTIES);
  if (data) {
    return JSON.parse(data);
  }
  // Seed mock properties on first load
  await AsyncStorage.setItem(KEYS.PROPERTIES, JSON.stringify(MOCK_PROPERTIES));
  return MOCK_PROPERTIES;
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const properties = await getProperties();
  return properties.find(p => p.id === id) || null;
}

// Phase 2: Facebook Import Functions

export async function importPropertyFromFacebook(
  postText: string,
  photoUrls: string[] = []
): Promise<Property | null> {
  const parseResult = parsePropertyFromFacebookPost(postText, photoUrls);

  if (!parseResult.success || !parseResult.property) {
    return null;
  }

  // Check for duplicates before importing
  const duplicates = await findDuplicates(parseResult.property as Property);

  if (duplicates.length > 0) {
    // Link new property to existing group
    const groupId = duplicates[0].groupId || duplicates[0].id;
    parseResult.property.groupId = groupId;
  } else {
    // Create new group ID for this property
    parseResult.property.groupId = Crypto.randomUUID();
  }

  // Create final property object
  const newProperty: Property = {
    id: Crypto.randomUUID(),
    title: parseResult.property.title || 'Imported Property',
    description: parseResult.property.description || '',
    propertyType: parseResult.property.propertyType || 'apartment',
    zone: parseResult.property.zone || 'chaweng',
    price: parseResult.property.price || 0,
    currency: parseResult.property.currency || 'THB',
    address: parseResult.property.address || '',
    photos: parseResult.property.photos || [],
    amenities: parseResult.property.amenities || [],
    rating: parseResult.property.rating || 4.0,
    ratingCount: parseResult.property.ratingCount || 0,
    reviews: parseResult.property.reviews || [],
    ownerName: parseResult.property.ownerName || 'Facebook User',
    ownerPhone: parseResult.property.ownerPhone || '',
    ownerEmail: parseResult.property.ownerEmail || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'facebook',
    importedAt: new Date().toISOString(),
    groupId: parseResult.property.groupId,
  };

  // Save to storage
  const properties = await getProperties();
  properties.unshift(newProperty); // Add to top
  await AsyncStorage.setItem(KEYS.PROPERTIES, JSON.stringify(properties));

  return newProperty;
}

export async function findDuplicates(newProperty: Property): Promise<Property[]> {
  const properties = await getProperties();
  const duplicates: Property[] = [];

  for (const existing of properties) {
    // Same zone and type
    if (existing.zone === newProperty.zone && existing.propertyType === newProperty.propertyType) {
      // Price within 500 THB range
      if (Math.abs(existing.price - newProperty.price) <= 500) {
        duplicates.push(existing);
        continue;
      }

      // Similar title/address (fuzzy match 70%+)
      const titleSimilarity = calculateStringSimilarity(existing.title, newProperty.title);
      const addressSimilarity = calculateStringSimilarity(
        existing.address || '',
        newProperty.address || ''
      );
      if (titleSimilarity >= 70 || addressSimilarity >= 70) {
        duplicates.push(existing);
      }
    }
  }

  return duplicates;
}

export async function getPropertyHistory(groupId: string): Promise<Property[]> {
  const properties = await getProperties();
  const grouped = properties
    .filter(p => p.groupId === groupId)
    .sort((a, b) => {
      const dateA = new Date(a.importedAt || a.createdAt).getTime();
      const dateB = new Date(b.importedAt || b.createdAt).getTime();
      return dateB - dateA; // Newest first
    });

  return grouped;
}

export async function deleteImportedProperty(propertyId: string): Promise<void> {
  const properties = await getProperties();
  const filtered = properties.filter(p => p.id !== propertyId);
  await AsyncStorage.setItem(KEYS.PROPERTIES, JSON.stringify(filtered));
}

export async function updatePropertyGroupPriceHistory(groupId: string): Promise<void> {
  const properties = await getProperties();
  const grouped = properties.filter(p => p.groupId === groupId);

  if (grouped.length === 0) return;

  // Build price history for all properties in group
  const priceHistory = grouped
    .sort((a, b) => {
      const dateA = new Date(a.importedAt || a.createdAt).getTime();
      const dateB = new Date(b.importedAt || b.createdAt).getTime();
      return dateB - dateA;
    })
    .map(p => ({
      price: p.price,
      date: p.importedAt || p.createdAt,
      source: p.source || 'mock',
    }));

  // Update all properties in group with full price history
  const updated = properties.map(p => {
    if (p.groupId === groupId) {
      return {
        ...p,
        priceHistory,
      };
    }
    return p;
  });

  await AsyncStorage.setItem(KEYS.PROPERTIES, JSON.stringify(updated));
}

