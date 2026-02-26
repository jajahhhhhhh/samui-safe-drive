import { View, Text, StyleSheet } from 'react-native';
import { TripStatus } from '@/lib/types';

const STATUS_CONFIG: Record<TripStatus, { label: string; bg: string; text: string }> = {
  searching: { label: 'Searching', bg: '#3D3200', text: '#FFC043' },
  driver_assigned: { label: 'Driver Assigned', bg: '#1A2D52', text: '#276EF1' },
  driver_arriving: { label: 'Driver Arriving', bg: '#1A2D52', text: '#7B9BF0' },
  arrived: { label: 'Driver Arrived', bg: '#0A2E1F', text: '#05944F' },
  pickup_confirmed: { label: 'Pickup Confirmed', bg: '#0A2E1F', text: '#05944F' },
  in_progress: { label: 'In Progress', bg: '#0A2E1F', text: '#06C167' },
  completed: { label: 'Completed', bg: '#0A2E1F', text: '#05944F' },
  cancelled: { label: 'Cancelled', bg: '#3D1010', text: '#E11900' },
};

export function StatusBadge({ status }: { status: TripStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
});
