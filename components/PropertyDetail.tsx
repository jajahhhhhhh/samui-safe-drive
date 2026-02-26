import { View, Text, StyleSheet, Pressable, Image, ScrollView, FlatList } from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { Property, ZONE_LABELS } from '@/lib/types';
import { useState } from 'react';

interface PropertyDetailProps {
  property: Property;
  onClose?: () => void;
}

const AMENITY_ICONS: Record<string, string> = {
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
  'Private Chef': 'chef-hat',
};

export function PropertyDetail({ property, onClose }: PropertyDetailProps) {
  const insets = useSafeAreaInsets();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / 400);
    setCurrentPhotoIndex(Math.min(currentIndex, property.photos.length - 1));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Close Button */}
      <Pressable
        style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.6 }]}
        onPress={onClose}
      >
        <Ionicons name="close" size={24} color={Colors.dark.text} />
      </Pressable>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Photo Carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={property.photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, idx) => `photo-${idx}`}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.photo}
              />
            )}
          />
          {/* Photo Counter */}
          <View style={styles.photoCounter}>
            <Text style={styles.photoCounterText}>
              {currentPhotoIndex + 1} / {property.photos.length}
            </Text>
          </View>
        </View>

        {/* Title and Price */}
        <View style={styles.headerSection}>
          <View style={styles.titlePriceRow}>
            <View style={styles.titleColumn}>
              <Text style={styles.title}>{property.title}</Text>
              <View style={styles.typeZoneRow}>
                <Text style={styles.propertyType}>
                  {property.propertyType.split('_').join(' ').toUpperCase()}
                </Text>
                <Text style={styles.zone}>• {ZONE_LABELS[property.zone]}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.priceSection}>
            {property.price.toLocaleString()} {property.currency}/night
          </Text>
        </View>

        {/* Rating Overview */}
        <View style={styles.ratingOverview}>
          <Ionicons name="star" size={18} color={Colors.accent} />
          <Text style={styles.ratingValue}>{property.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCountText}>({property.ratingCount} reviews)</Text>
        </View>

        {/* Description */}
        {property.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this property</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>
        )}

        {/* Address */}
        <View style={styles.section}>
          <View style={styles.addressRow}>
            <Ionicons name="location" size={18} color={Colors.accent} />
            <Text style={styles.address}>{property.address}</Text>
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {property.amenities.map((amenity, idx) => (
              <View key={idx} style={styles.amenityItem}>
                <MaterialCommunityIcons
                  name={AMENITY_ICONS[amenity] || 'check-circle'}
                  size={20}
                  color={Colors.accent}
                />
                <Text style={styles.amenityLabel}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Owner Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Manager</Text>
          <View style={styles.ownerCard}>
            {property.ownerPhotoUrl && (
              <Image source={{ uri: property.ownerPhotoUrl }} style={styles.ownerPhoto} />
            )}
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>{property.ownerName}</Text>
              <View style={styles.contactRow}>
                <Ionicons name="call" size={14} color={Colors.dark.textMuted} />
                <Text style={styles.contactText}>{property.ownerPhone}</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="mail" size={14} color={Colors.dark.textMuted} />
                <Text style={styles.contactText}>{property.ownerEmail}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Reviews */}
        {property.reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guest Reviews</Text>
            {property.reviews.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{review.authorName}</Text>
                  <View style={styles.reviewRatingRow}>
                    {[...Array(5)].map((_, i) => (
                      <FontAwesome6
                        key={i}
                        name="star"
                        size={12}
                        color={i < review.rating ? Colors.accent : Colors.dark.border}
                        solid={i < review.rating}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>{review.date}</Text>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  scrollView: {
    flex: 1,
  },
  carouselContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
    backgroundColor: Colors.dark.surface,
  },
  photo: {
    width: 400,
    height: 300,
  },
  photoCounter: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  photoCounterText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  headerSection: {
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleColumn: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
  },
  typeZoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  propertyType: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.accent,
  },
  zone: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
  },
  priceSection: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.accent,
  },
  ratingOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  ratingValue: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.accent,
  },
  reviewCountText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  addressRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  address: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  amenityLabel: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.text,
    flex: 1,
  },
  ownerCard: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  ownerPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.background,
  },
  ownerInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  ownerName: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
  },
  reviewItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 6,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewAuthor: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  reviewRatingRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
  },
  reviewComment: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    lineHeight: 16,
  },
});
