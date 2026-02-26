import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  Platform, TextInput, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useTrips } from '@/lib/trip-context';
import { Trip, ZONE_LABELS } from '@/lib/types';
import { TripCard } from '@/components/TripCard';
import { StatusBadge } from '@/components/StatusBadge';
import { DriverCard } from '@/components/DriverCard';

function TripDetail({ trip, onClose, onRate }: { trip: Trip; onClose: () => void; onRate: (stars: number, comment?: string) => void }) {
  const [rating, setRating] = useState(trip.rating || 0);
  const [comment, setComment] = useState(trip.ratingComment || '');
  const [hasRated, setHasRated] = useState(!!trip.rating);
  const insets = useSafeAreaInsets();

  const handleRate = () => {
    if (rating > 0) {
      onRate(rating, comment.trim() || undefined);
      setHasRated(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const date = new Date(trip.createdAt);
  const formattedDate = date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={[detailStyles.container, { paddingTop: Platform.OS === 'web' ? 67 : insets.top }]}>
      <View style={detailStyles.header}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={Colors.dark.text} />
        </Pressable>
        <Text style={detailStyles.headerTitle}>Trip Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={[1]}
        keyExtractor={() => 'detail'}
        contentContainerStyle={detailStyles.content}
        showsVerticalScrollIndicator={false}
        renderItem={() => (
          <View style={{ gap: 16 }}>
            <View style={detailStyles.dateRow}>
              <Text style={detailStyles.dateText}>{formattedDate}</Text>
              <StatusBadge status={trip.status} />
            </View>

            <View style={detailStyles.routeCard}>
              <View style={detailStyles.routeRow}>
                <View style={[detailStyles.dot, { backgroundColor: Colors.success }]} />
                <View style={detailStyles.routeInfo}>
                  <Text style={detailStyles.routeLabel}>Pickup</Text>
                  <Text style={detailStyles.routeAddress}>{trip.pickupAddress}</Text>
                </View>
              </View>
              <View style={detailStyles.routeDivider} />
              <View style={detailStyles.routeRow}>
                <View style={[detailStyles.dot, { backgroundColor: Colors.error }]} />
                <View style={detailStyles.routeInfo}>
                  <Text style={detailStyles.routeLabel}>Drop-off</Text>
                  <Text style={detailStyles.routeAddress}>{trip.dropoffAddress}</Text>
                </View>
              </View>
            </View>

            <View style={detailStyles.infoGrid}>
              <View style={detailStyles.infoItem}>
                <Ionicons name="location-outline" size={18} color={Colors.accent} />
                <Text style={detailStyles.infoLabel}>Zone</Text>
                <Text style={detailStyles.infoValue}>{ZONE_LABELS[trip.zone]}</Text>
              </View>
              {trip.distanceKm != null && (
                <View style={detailStyles.infoItem}>
                  <Ionicons name="navigate-outline" size={18} color={Colors.accent} />
                  <Text style={detailStyles.infoLabel}>Distance</Text>
                  <Text style={detailStyles.infoValue}>{trip.distanceKm} km</Text>
                </View>
              )}
              {(trip.totalFare || trip.estimatedFare) != null && (
                <View style={detailStyles.infoItem}>
                  <Ionicons name="cash-outline" size={18} color={Colors.accent} />
                  <Text style={detailStyles.infoLabel}>Fare</Text>
                  <Text style={detailStyles.infoValue}>{trip.totalFare || trip.estimatedFare} THB</Text>
                </View>
              )}
            </View>

            {trip.driver && <DriverCard driver={trip.driver} />}

            {trip.status === 'completed' && !hasRated && (
              <View style={detailStyles.ratingSection}>
                <Text style={detailStyles.ratingTitle}>Rate your trip</Text>
                <View style={detailStyles.starsRow}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Pressable
                      key={star}
                      onPress={() => { setRating(star); Haptics.selectionAsync(); }}
                      hitSlop={6}
                    >
                      <Ionicons
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={36}
                        color={star <= rating ? Colors.accent : Colors.dark.textMuted}
                      />
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  style={detailStyles.commentInput}
                  placeholder="Leave a comment (optional)"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                />
                <Pressable
                  style={({ pressed }) => [detailStyles.rateBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }, rating === 0 && { opacity: 0.4 }]}
                  onPress={handleRate}
                  disabled={rating === 0}
                >
                  <Text style={detailStyles.rateBtnText}>Submit Rating</Text>
                </Pressable>
              </View>
            )}

            {hasRated && (
              <View style={detailStyles.ratedSection}>
                <View style={detailStyles.starsRow}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Ionicons
                      key={star}
                      name={star <= (trip.rating || rating) ? 'star' : 'star-outline'}
                      size={24}
                      color={star <= (trip.rating || rating) ? Colors.accent : Colors.dark.textMuted}
                    />
                  ))}
                </View>
                {(trip.ratingComment || comment) ? (
                  <Text style={detailStyles.ratedComment}>&quot;{trip.ratingComment || comment}&quot;</Text>
                ) : null}
              </View>
            )}

            <View style={{ height: Platform.OS === 'web' ? 34 : 20 }} />
          </View>
        )}
      />
    </View>
  );
}

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const { trips, rateTrip, refreshTrips } = useTrips();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const completedTrips = trips.filter(t => t.status === 'completed' || t.status === 'cancelled');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshTrips();
    setRefreshing(false);
  }, [refreshTrips]);

  const handleRate = useCallback(async (stars: number, comment?: string) => {
    if (selectedTrip) {
      await rateTrip(selectedTrip.id, stars, comment);
      setSelectedTrip(prev => prev ? { ...prev, rating: stars, ratingComment: comment } : null);
    }
  }, [selectedTrip, rateTrip]);

  if (selectedTrip) {
    return (
      <TripDetail
        trip={selectedTrip}
        onClose={() => setSelectedTrip(null)}
        onRate={handleRate}
      />
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 67 : insets.top }]}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Trip History</Text>
      </View>

      <FlatList
        data={completedTrips}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
          />
        }
        renderItem={({ item }) => (
          <TripCard trip={item} onPress={() => setSelectedTrip(item)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={56} color={Colors.dark.textMuted} />
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptyText}>Your completed trips will appear here</Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: Platform.OS === 'web' ? 34 : 20 }} />}
      />
    </View>
  );
}

const detailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
    flex: 1,
  },
  routeCard: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routeAddress: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.text,
    marginTop: 2,
  },
  routeDivider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginLeft: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  infoItem: {
    flex: 1,
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
    textAlign: 'center',
  },
  ratingSection: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  ratingTitle: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  commentInput: {
    width: '100%',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.text,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  rateBtn: {
    width: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  rateBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  ratedSection: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  ratedComment: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    fontStyle: 'italic',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
  },
});
