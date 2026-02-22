import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { Trip, ZONE_LABELS } from '@/lib/types';
import { StatusBadge } from './StatusBadge';

interface TripCardProps {
  trip: Trip;
  onPress?: () => void;
}

export function TripCard({ trip, onPress }: TripCardProps) {
  const date = new Date(trip.createdAt);
  const formattedDate = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.dateRow}>
          <Text style={styles.date}>{formattedDate}</Text>
          <Text style={styles.time}>{formattedTime}</Text>
        </View>
        <StatusBadge status={trip.status} />
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.dotLine}>
          <View style={styles.dotGreen} />
          <View style={styles.line} />
          <View style={styles.dotRed} />
        </View>
        <View style={styles.addresses}>
          <Text style={styles.address} numberOfLines={1}>{trip.pickupAddress}</Text>
          <Text style={styles.address} numberOfLines={1}>{trip.dropoffAddress}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="location-outline" size={14} color={Colors.dark.textMuted} />
          <Text style={styles.footerText}>{ZONE_LABELS[trip.zone]}</Text>
        </View>
        {trip.distanceKm != null && (
          <View style={styles.footerItem}>
            <Ionicons name="navigate-outline" size={14} color={Colors.dark.textMuted} />
            <Text style={styles.footerText}>{trip.distanceKm} km</Text>
          </View>
        )}
        {(trip.totalFare || trip.estimatedFare) != null && (
          <Text style={styles.fare}>{trip.totalFare || trip.estimatedFare} THB</Text>
        )}
        {trip.rating != null && (
          <View style={styles.footerItem}>
            <Ionicons name="star" size={14} color={Colors.accent} />
            <Text style={[styles.footerText, { color: Colors.accent }]}>{trip.rating}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  time: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
  },
  routeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dotLine: {
    alignItems: 'center',
    width: 12,
    paddingVertical: 3,
  },
  dotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: 2,
  },
  dotRed: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
  },
  addresses: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 0,
    gap: 10,
  },
  address: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
  },
  fare: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
    marginLeft: 'auto',
  },
});
