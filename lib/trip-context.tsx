import { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import * as Crypto from 'expo-crypto';
import { Trip, TripStatus, Zone, Driver, MOCK_DRIVERS, calculateFare, generateOTP } from './types';
import { getTrips, saveTrip, getActiveTrip, setActiveTrip } from './storage';

interface TripContextValue {
  trips: Trip[];
  activeTrip: Trip | null;
  isLoading: boolean;
  bookTrip: (params: {
    zone: Zone;
    pickupAddress: string;
    dropoffAddress: string;
    pickupNote?: string;
  }) => Promise<Trip>;
  confirmPickup: (otp: string) => Promise<boolean>;
  cancelTrip: () => Promise<void>;
  rateTrip: (tripId: string, stars: number, comment?: string) => Promise<void>;
  refreshTrips: () => Promise<void>;
}

const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTripState] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [loadedTrips, active] = await Promise.all([
      getTrips(),
      getActiveTrip(),
    ]);
    setTrips(loadedTrips);
    setActiveTripState(active);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateActiveTrip = useCallback(async (trip: Trip | null) => {
    setActiveTripState(trip);
    await setActiveTrip(trip);
    if (trip) {
      await saveTrip(trip);
      setTrips(prev => {
        const idx = prev.findIndex(t => t.id === trip.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = trip;
          return updated;
        }
        return [trip, ...prev];
      });
    }
  }, []);

  const simulateTripFlow = useCallback((trip: Trip) => {
    const driver = MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)];
    const distance = 3 + Math.random() * 15;
    const fare = calculateFare(trip.zone, distance);

    setTimeout(async () => {
      const assigned: Trip = {
        ...trip,
        status: 'driver_assigned',
        driverId: driver.id,
        driver,
        distanceKm: Math.round(distance * 10) / 10,
        estimatedFare: fare,
        acceptedAt: new Date().toISOString(),
        otpCode: generateOTP(),
      };
      await updateActiveTrip(assigned);

      setTimeout(async () => {
        const current = await getActiveTrip();
        if (current && current.id === trip.id && current.status === 'driver_assigned') {
          const arriving: Trip = { ...current, status: 'driver_arriving' };
          await updateActiveTrip(arriving);

          setTimeout(async () => {
            const curr2 = await getActiveTrip();
            if (curr2 && curr2.id === trip.id && curr2.status === 'driver_arriving') {
              const arrived: Trip = { ...curr2, status: 'arrived', arrivedAt: new Date().toISOString() };
              await updateActiveTrip(arrived);
            }
          }, 8000);
        }
      }, 5000);
    }, 3000);
  }, [updateActiveTrip]);

  const bookTrip = useCallback(async (params: {
    zone: Zone;
    pickupAddress: string;
    dropoffAddress: string;
    pickupNote?: string;
  }) => {
    const trip: Trip = {
      id: Crypto.randomUUID(),
      customerId: 'c1',
      zone: params.zone,
      status: 'searching',
      pickupAddress: params.pickupAddress,
      dropoffAddress: params.dropoffAddress,
      pickupNote: params.pickupNote,
      createdAt: new Date().toISOString(),
    };
    await updateActiveTrip(trip);
    simulateTripFlow(trip);
    return trip;
  }, [updateActiveTrip, simulateTripFlow]);

  const confirmPickup = useCallback(async (otp: string) => {
    if (!activeTrip || activeTrip.otpCode !== otp) return false;
    const distance = activeTrip.distanceKm || 5;
    const fare = calculateFare(activeTrip.zone, distance);

    const confirmed: Trip = {
      ...activeTrip,
      status: 'pickup_confirmed',
    };
    await updateActiveTrip(confirmed);

    setTimeout(async () => {
      const curr = await getActiveTrip();
      if (curr && curr.id === activeTrip.id) {
        const inProgress: Trip = { ...curr, status: 'in_progress', startedAt: new Date().toISOString() };
        await updateActiveTrip(inProgress);

        const tripDuration = 10000 + Math.random() * 10000;
        setTimeout(async () => {
          const curr2 = await getActiveTrip();
          if (curr2 && curr2.id === activeTrip.id && curr2.status === 'in_progress') {
            const completed: Trip = {
              ...curr2,
              status: 'completed',
              totalFare: fare,
              completedAt: new Date().toISOString(),
            };
            await saveTrip(completed);
            await setActiveTrip(null);
            setActiveTripState(null);
            setTrips(prev => {
              const idx = prev.findIndex(t => t.id === completed.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = completed;
                return updated;
              }
              return [completed, ...prev];
            });
          }
        }, tripDuration);
      }
    }, 2000);

    return true;
  }, [activeTrip, updateActiveTrip]);

  const cancelTrip = useCallback(async () => {
    if (!activeTrip) return;
    const cancelled: Trip = {
      ...activeTrip,
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    };
    await saveTrip(cancelled);
    await setActiveTrip(null);
    setActiveTripState(null);
    setTrips(prev => {
      const idx = prev.findIndex(t => t.id === cancelled.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = cancelled;
        return updated;
      }
      return [cancelled, ...prev];
    });
  }, [activeTrip]);

  const rateTrip = useCallback(async (tripId: string, stars: number, comment?: string) => {
    const updatedTrips = trips.map(t =>
      t.id === tripId ? { ...t, rating: stars, ratingComment: comment } : t
    );
    setTrips(updatedTrips);
    const trip = updatedTrips.find(t => t.id === tripId);
    if (trip) await saveTrip(trip);
  }, [trips]);

  const refreshTrips = useCallback(async () => {
    const [loadedTrips, active] = await Promise.all([getTrips(), getActiveTrip()]);
    setTrips(loadedTrips);
    setActiveTripState(active);
  }, []);

  const value = useMemo(() => ({
    trips,
    activeTrip,
    isLoading,
    bookTrip,
    confirmPickup,
    cancelTrip,
    rateTrip,
    refreshTrips,
  }), [trips, activeTrip, isLoading, bookTrip, confirmPickup, cancelTrip, rateTrip, refreshTrips]);

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrips() {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrips must be used within TripProvider');
  return context;
}
