import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { Property, ZONE_LABELS } from '@/lib/types';

interface PropertyCardProps {
  property: Property;
  onPress?: () => void;
  onLongPress?: () => void;
}

const PROPERTY_TYPE_COLORS: Record<string, string> = {
  'vacation_rental': '#FF6B6B',
  'apartment': '#4ECDC4',
  'house': '#45B7D1',
  'condo': '#96CEB4',
  'hotel': '#FFEAA7',
  'villa': '#DDA0DD',
};

function getPropertyTypeLabel(type: string): string {
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function PropertyCard({ property, onPress, onLongPress }: PropertyCardProps) {
  const topAmenities = property.amenities.slice(0, 3);
  const hasMultipleVersions = property.groupId ? true : false;
  const isFromFacebook = property.source === 'facebook';

  const amenityIcons: Record<string, string> = {
    'WiFi': 'wifi',
    'AC': 'fan',
    'Pool': 'swim',
    'Beach Access': 'water',
    'Kitchen': 'stove',
    'Parking': 'parking',
    'Gym': 'dumbbell',
    'Spa': 'spa',
    'Restaurant': 'silverware-fork-knife',
    'Room Service': 'bell-service',
    'Concierge': 'help-box',
    'Garden': 'leaf',
    'Laundry': 'tshirt-crew',
    'Balcony': 'balcony',
    'Library': 'library-shelves',
    'Bicycle Rental': 'bike',
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {/* Image */}
      <Image
        source={{ uri: property.photos[0] || 'https://via.placeholder.com/400x200' }}
        style={styles.image}
      />

      {/* Type Badge */}
      <View
        style={[
          styles.typeBadge,
          { backgroundColor: PROPERTY_TYPE_COLORS[property.propertyType] || '#999' },
        ]}
      >
        <Text style={styles.typeBadgeText}>{getPropertyTypeLabel(property.propertyType)}</Text>
      </View>

      {/* Source Badge */}
      {isFromFacebook && (
        <View style={styles.sourceBadge}>
          <Text style={styles.sourceBadgeText}>Facebook</Text>
        </View>
      )}

      {/* Price History Badge */}
      {hasMultipleVersions && (
        <View style={styles.historyBadge}>
          <Ionicons name="time-outline" size={12} color={Colors.accent} />
          <Text style={styles.historyBadgeText}>History</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Title and Price */}
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {property.title}
          </Text>
          <Text style={styles.price}>
            {property.price.toLocaleString()} {property.currency}
          </Text>
        </View>

        {/* Zone and Address */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={Colors.dark.textMuted} />
          <Text style={styles.zone}>{ZONE_LABELS[property.zone]}</Text>
        </View>
        <Text style={styles.address} numberOfLines={1}>
          {property.address}
        </Text>

        {/* Footer: Rating and Amenities */}
        <View style={styles.footer}>
          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={Colors.accent} />
            <Text style={styles.rating}>
              {property.rating.toFixed(1)}
            </Text>
            <Text style={styles.reviewCount}>
              ({property.ratingCount})
            </Text>
          </View>

          {/* Amenities */}
          <View style={styles.amenities}>
            {topAmenities.map((amenity, idx) => (
              <View key={idx} style={styles.amenityIcon}>
                <MaterialCommunityIcons
                  name={amenityIcons[amenity] || 'check-circle'}
                  size={12}
                  color={Colors.dark.textMuted}
                />
              </View>
            ))}
            {property.amenities.length > 3 && (
              <Text style={styles.moreAmenities}>+{property.amenities.length - 3}</Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.dark.background,
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  typeBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
  },
  content: {
    padding: 12,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  price: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: Colors.accent,
    whiteSpace: 'nowrap',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  zone: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
  },
  address: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.accent,
  },
  reviewCount: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
  },
  amenities: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amenityIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreAmenities: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.textMuted,
  },
  sourceBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#1877F2',
    borderRadius: 4,
  },
  sourceBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  historyBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.dark.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  historyBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.accent,
  },
});
