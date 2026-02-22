import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { Driver } from '@/lib/types';

export function DriverCard({ driver }: { driver: Driver }) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={28} color={Colors.accent} />
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{driver.fullName}</Text>
        <View style={styles.row}>
          <Ionicons name="star" size={14} color={Colors.accent} />
          <Text style={styles.rating}>{driver.ratingAvg.toFixed(1)}</Text>
          <Text style={styles.ratingCount}>({driver.ratingCount} trips)</Text>
        </View>
        <View style={styles.row}>
          <MaterialCommunityIcons name="car" size={14} color={Colors.dark.textSecondary} />
          <Text style={styles.vehicle}>{driver.vehicleType}</Text>
          <Text style={styles.plate}>{driver.vehiclePlate}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="globe-outline" size={14} color={Colors.dark.textSecondary} />
          <Text style={styles.languages}>{driver.languages.join(', ')}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  avatarContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  rating: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.accent,
  },
  ratingCount: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
  },
  vehicle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
  },
  plate: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.textSecondary,
    marginLeft: 4,
  },
  languages: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
  },
});
