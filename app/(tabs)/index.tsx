import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput,
  ScrollView, Platform, ActivityIndicator, Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useTrips } from '@/lib/trip-context';
import { Zone, ZONE_LABELS, PRICING_RULES, TripStatus } from '@/lib/types';
import { DriverCard } from '@/components/DriverCard';
import { StatusBadge } from '@/components/StatusBadge';

const ZONE_LIST = Object.entries(ZONE_LABELS) as [Zone, string][];

function SearchingOverlay() {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <View style={searchStyles.container}>
      <Animated.View style={[searchStyles.pulse, { opacity: pulseAnim }]}>
        <MaterialCommunityIcons name="car-connected" size={48} color={Colors.accent} />
      </Animated.View>
      <Text style={searchStyles.title}>Finding your driver</Text>
      <Text style={searchStyles.subtitle}>Matching you with the nearest available driver...</Text>
      <ActivityIndicator size="small" color={Colors.accent} style={{ marginTop: 12 }} />
    </View>
  );
}

function ActiveTripView() {
  const { activeTrip, confirmPickup, cancelTrip, refreshTrips } = useTrips();
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const interval = setInterval(refreshTrips, 2000);
    return () => clearInterval(interval);
  }, [refreshTrips]);

  if (!activeTrip) return null;

  const handleConfirmOTP = async () => {
    setConfirming(true);
    setOtpError(false);
    const success = await confirmPickup(otpInput);
    if (!success) {
      setOtpError(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setConfirming(false);
  };

  const handleCancel = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await cancelTrip();
  };

  const showOTP = activeTrip.status === 'arrived';
  const showDriver = activeTrip.driver && activeTrip.status !== 'searching';

  const getStatusMessage = (status: TripStatus): string => {
    switch (status) {
      case 'searching': return 'Looking for a driver nearby...';
      case 'driver_assigned': return 'Your driver is on the way!';
      case 'driver_arriving': return 'Driver is almost there...';
      case 'arrived': return 'Driver has arrived! Share your OTP';
      case 'pickup_confirmed': return 'Starting your ride...';
      case 'in_progress': return 'Enjoy your ride!';
      default: return '';
    }
  };

  if (activeTrip.status === 'searching') {
    return (
      <View style={activeStyles.wrapper}>
        <SearchingOverlay />
        <Pressable
          style={({ pressed }) => [activeStyles.cancelBtn, pressed && { opacity: 0.8 }]}
          onPress={handleCancel}
        >
          <Ionicons name="close" size={20} color={Colors.error} />
          <Text style={activeStyles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={activeStyles.wrapper} contentContainerStyle={activeStyles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={activeStyles.statusSection}>
        <StatusBadge status={activeTrip.status} />
        <Text style={activeStyles.statusMessage}>{getStatusMessage(activeTrip.status)}</Text>
      </View>

      {showDriver && activeTrip.driver && (
        <DriverCard driver={activeTrip.driver} />
      )}

      <View style={activeStyles.routeCard}>
        <View style={activeStyles.routeRow}>
          <View style={[activeStyles.dot, { backgroundColor: Colors.success }]} />
          <View style={activeStyles.routeInfo}>
            <Text style={activeStyles.routeLabel}>Pickup</Text>
            <Text style={activeStyles.routeAddress}>{activeTrip.pickupAddress}</Text>
          </View>
        </View>
        <View style={activeStyles.routeDivider} />
        <View style={activeStyles.routeRow}>
          <View style={[activeStyles.dot, { backgroundColor: Colors.error }]} />
          <View style={activeStyles.routeInfo}>
            <Text style={activeStyles.routeLabel}>Drop-off</Text>
            <Text style={activeStyles.routeAddress}>{activeTrip.dropoffAddress}</Text>
          </View>
        </View>
      </View>

      {activeTrip.estimatedFare != null && (
        <View style={activeStyles.fareCard}>
          <Text style={activeStyles.fareLabel}>Estimated Fare</Text>
          <Text style={activeStyles.fareAmount}>{activeTrip.estimatedFare} THB</Text>
          {activeTrip.distanceKm != null && (
            <Text style={activeStyles.fareDistance}>{activeTrip.distanceKm} km</Text>
          )}
        </View>
      )}

      {showOTP && (
        <View style={activeStyles.otpSection}>
          <Text style={activeStyles.otpTitle}>Enter OTP to confirm pickup</Text>
          <Text style={activeStyles.otpHint}>Your code: {activeTrip.otpCode}</Text>
          <TextInput
            style={[activeStyles.otpInput, otpError && activeStyles.otpInputError]}
            value={otpInput}
            onChangeText={(t) => { setOtpInput(t); setOtpError(false); }}
            placeholder="Enter 4-digit OTP"
            placeholderTextColor={Colors.dark.textMuted}
            keyboardType="number-pad"
            maxLength={4}
          />
          {otpError && <Text style={activeStyles.otpErrorText}>Invalid OTP. Please try again.</Text>}
          <Pressable
            style={({ pressed }) => [activeStyles.confirmBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }, confirming && { opacity: 0.6 }]}
            onPress={handleConfirmOTP}
            disabled={otpInput.length < 4 || confirming}
          >
            {confirming ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={activeStyles.confirmBtnText}>Confirm Pickup</Text>
            )}
          </Pressable>
        </View>
      )}

      {activeTrip.status === 'in_progress' && (
        <View style={activeStyles.progressCard}>
          <MaterialCommunityIcons name="car-side" size={32} color={Colors.accent} />
          <Text style={activeStyles.progressText}>Your trip is in progress</Text>
          <ActivityIndicator size="small" color={Colors.accent} style={{ marginTop: 8 }} />
        </View>
      )}

      {activeTrip.status !== 'in_progress' && activeTrip.status !== 'pickup_confirmed' && (
        <Pressable
          style={({ pressed }) => [activeStyles.cancelBtn, pressed && { opacity: 0.8 }]}
          onPress={handleCancel}
        >
          <Ionicons name="close" size={20} color={Colors.error} />
          <Text style={activeStyles.cancelText}>Cancel Ride</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { activeTrip, bookTrip } = useTrips();
  const [selectedZone, setSelectedZone] = useState<Zone>('chaweng');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupNote, setPickupNote] = useState('');
  const [showZones, setShowZones] = useState(false);
  const [booking, setBooking] = useState(false);

  const selectedPricing = PRICING_RULES.find(r => r.zone === selectedZone);

  const handleBook = useCallback(async () => {
    if (!pickup.trim() || !dropoff.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setBooking(true);
    await bookTrip({
      zone: selectedZone,
      pickupAddress: pickup.trim(),
      dropoffAddress: dropoff.trim(),
      pickupNote: pickupNote.trim() || undefined,
    });
    setBooking(false);
    setPickup('');
    setDropoff('');
    setPickupNote('');
  }, [pickup, dropoff, pickupNote, selectedZone, bookTrip]);

  if (activeTrip) {
    return (
      <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 67 : insets.top }]}>
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Your Ride</Text>
        </View>
        <ActiveTripView />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 67 : insets.top }]}>
      <View style={styles.headerBar}>
        <MaterialCommunityIcons name="steering" size={28} color={Colors.dark.text} />
        <Text style={styles.headerTitle}>Samui Safe Drive</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.heroBanner}>
          <MaterialCommunityIcons name="palm-tree" size={40} color={Colors.accent} />
          <Text style={styles.heroTitle}>Where to?</Text>
          <Text style={styles.heroSubtitle}>Safe rides around Koh Samui</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.zoneSelector, pressed && { opacity: 0.85 }]}
          onPress={() => { setShowZones(!showZones); Haptics.selectionAsync(); }}
        >
          <Ionicons name="location" size={20} color={Colors.accent} />
          <Text style={styles.zoneSelectorText}>{ZONE_LABELS[selectedZone]}</Text>
          <Ionicons name={showZones ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.dark.textMuted} />
        </Pressable>

        {showZones && (
          <View style={styles.zoneList}>
            {ZONE_LIST.map(([zone, label]) => (
              <Pressable
                key={zone}
                style={({ pressed }) => [
                  styles.zoneItem,
                  zone === selectedZone && styles.zoneItemActive,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => {
                  setSelectedZone(zone);
                  setShowZones(false);
                  Haptics.selectionAsync();
                }}
              >
                <Text style={[styles.zoneItemText, zone === selectedZone && styles.zoneItemTextActive]}>
                  {label}
                </Text>
                {zone === selectedZone && <Ionicons name="checkmark" size={18} color={Colors.accent} />}
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.inputSection}>
          <View style={styles.inputRow}>
            <View style={[styles.inputDot, { backgroundColor: Colors.success }]} />
            <TextInput
              style={styles.input}
              placeholder="Pickup location"
              placeholderTextColor={Colors.dark.textMuted}
              value={pickup}
              onChangeText={setPickup}
            />
          </View>
          <View style={styles.inputDivider} />
          <View style={styles.inputRow}>
            <View style={[styles.inputDot, { backgroundColor: Colors.error }]} />
            <TextInput
              style={styles.input}
              placeholder="Drop-off location"
              placeholderTextColor={Colors.dark.textMuted}
              value={dropoff}
              onChangeText={setDropoff}
            />
          </View>
        </View>

        <TextInput
          style={styles.noteInput}
          placeholder="Pickup note (optional)"
          placeholderTextColor={Colors.dark.textMuted}
          value={pickupNote}
          onChangeText={setPickupNote}
          multiline
        />

        {selectedPricing && (
          <View style={styles.pricingCard}>
            <Text style={styles.pricingTitle}>Zone Pricing</Text>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Base fare</Text>
              <Text style={styles.pricingValue}>{selectedPricing.baseFare} THB</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Per km</Text>
              <Text style={styles.pricingValue}>{selectedPricing.perKmRate} THB</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Minimum fare</Text>
              <Text style={styles.pricingValue}>{selectedPricing.minFare} THB</Text>
            </View>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.bookBtn,
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
            (!pickup.trim() || !dropoff.trim() || booking) && styles.bookBtnDisabled,
          ]}
          onPress={handleBook}
          disabled={!pickup.trim() || !dropoff.trim() || booking}
        >
          {booking ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="car-side" size={22} color="#fff" />
              <Text style={styles.bookBtnText}>Book Ride</Text>
            </>
          )}
        </Pressable>

        <View style={{ height: Platform.OS === 'web' ? 34 : 20 }} />
      </ScrollView>
    </View>
  );
}

const searchStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  pulse: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.dark.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
});

const activeStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  statusSection: {
    gap: 8,
  },
  statusMessage: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
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
  fareCard: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  fareLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
  },
  fareAmount: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
  },
  fareDistance: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
  },
  otpSection: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 16,
    padding: 20,
    gap: 10,
    alignItems: 'center',
  },
  otpTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  otpHint: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.accent,
  },
  otpInput: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
    letterSpacing: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  otpInputError: {
    borderColor: Colors.error,
  },
  otpErrorText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.error,
  },
  confirmBtn: {
    width: '100%',
    height: 48,
    backgroundColor: Colors.success,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  confirmBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  progressCard: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error + '40',
    backgroundColor: Colors.error + '10',
  },
  cancelText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.error,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 14,
  },
  heroBanner: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dark.surface,
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
  },
  zoneSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  zoneSelectorText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  zoneList: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  zoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  zoneItemActive: {
    backgroundColor: Colors.accent + '15',
  },
  zoneItemText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
  },
  zoneItemTextActive: {
    color: Colors.accent,
    fontFamily: 'Inter_600SemiBold',
  },
  inputSection: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  inputDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.text,
  },
  inputDivider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginLeft: 38,
  },
  noteInput: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.text,
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  pricingCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  pricingTitle: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
  },
  pricingValue: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.success,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 4,
  },
  bookBtnText: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  bookBtnDisabled: {
    opacity: 0.4,
  },
});
