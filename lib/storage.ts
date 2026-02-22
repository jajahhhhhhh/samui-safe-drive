import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, UserProfile, DriverRegistration } from './types';

const KEYS = {
  TRIPS: '@samui_trips',
  PROFILE: '@samui_profile',
  ACTIVE_TRIP: '@samui_active_trip',
  DRIVER_REG: '@samui_driver_registration',
};

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
