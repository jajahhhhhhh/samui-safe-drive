import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { Property } from '@/lib/types';

interface PriceHistoryViewProps {
  visible: boolean;
  onClose: () => void;
  properties: Property[];
}

export function PriceHistoryView({ visible, onClose, properties }: PriceHistoryViewProps) {
  if (!properties || properties.length === 0) {
    return null;
  }

  // Sort properties by importedAt date (newest first)
  const sortedProperties = [...properties].sort((a, b) => {
    const dateA = new Date(a.importedAt || a.createdAt).getTime();
    const dateB = new Date(b.importedAt || b.createdAt).getTime();
    return dateB - dateA;
  });

  // Calculate price statistics
  const prices = sortedProperties
    .map(p => p.price)
    .filter((price): price is number => price !== undefined && price !== null);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getPriceTrend = (index: number) => {
    if (index === 0 || index >= sortedProperties.length - 1) return null;

    const currentPrice = sortedProperties[index].price || 0;
    const previousPrice = sortedProperties[index - 1].price || 0;

    if (currentPrice > previousPrice) {
      return { icon: 'trending-up', color: Colors.error, label: '+' };
    } else if (currentPrice < previousPrice) {
      return { icon: 'trending-down', color: Colors.success, label: '-' };
    }
    return { icon: 'remove', color: Colors.dark.textMuted, label: '=' };
  };

  const getSourceBadgeColor = (source?: string) => {
    switch (source) {
      case 'facebook':
        return '#1877F2';
      case 'mock':
        return Colors.dark.textMuted;
      default:
        return Colors.accent;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: 40 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Price History</Text>
          <Pressable onPress={onClose} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <Ionicons name="close" size={24} color={Colors.dark.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Property Info */}
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyTitle}>{sortedProperties[0].title}</Text>
            <Text style={styles.propertyZone}>{sortedProperties[0].zone}</Text>
          </View>

          {/* Summary Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Current Price</Text>
              <Text style={styles.statValue}>
                {sortedProperties[0].price} {sortedProperties[0].currency}
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Average</Text>
              <Text style={styles.statValue}>{avgPrice} THB</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Range</Text>
              <Text style={styles.statValue}>{priceRange} THB</Text>
            </View>
          </View>

          {/* Price Trend Summary */}
          <View style={styles.trendSummary}>
            <View style={styles.trendRow}>
              <View style={styles.trendLabel}>
                <Text style={styles.trendText}>Lowest</Text>
              </View>
              <Text style={[styles.trendPrice, { color: Colors.success }]}>{minPrice} THB</Text>
            </View>
            <View style={styles.trendRow}>
              <View style={styles.trendLabel}>
                <Text style={styles.trendText}>Highest</Text>
              </View>
              <Text style={[styles.trendPrice, { color: Colors.error }]}>{maxPrice} THB</Text>
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.timelineSection}>
            <Text style={styles.timelineTitle}>Timeline ({sortedProperties.length} versions)</Text>

            {sortedProperties.map((property, index) => {
              const trend = getPriceTrend(index);
              const prevPrice =
                index > 0 ? sortedProperties[index - 1].price : property.price;
              const priceDiff = property.price ? (property.price - (prevPrice || 0)) : 0;
              const dateStr = formatDate(
                property.importedAt || property.updatedAt || property.createdAt
              );

              return (
                <View key={property.id} style={styles.timelineItem}>
                  {/* Connector Line */}
                  {index < sortedProperties.length - 1 && (
                    <View style={styles.connectorLine} />
                  )}

                  {/* Timeline Dot */}
                  <View style={styles.dotContainer}>
                    <View style={styles.dot} />
                  </View>

                  {/* Content */}
                  <View style={styles.timelineContent}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.dateText}>{dateStr}</Text>
                      <View
                        style={[
                          styles.sourceBadge,
                          { backgroundColor: getSourceBadgeColor(property.source) },
                        ]}
                      >
                        <Text style={styles.sourceBadgeText}>
                          {property.source === 'facebook' ? 'Facebook' : 'Official'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.priceRow}>
                      <Text style={styles.priceText}>
                        ฿{property.price} {property.currency}
                      </Text>
                      {trend && index > 0 && (
                        <View style={styles.trendIndicator}>
                          <Ionicons
                            name={trend.icon}
                            size={14}
                            color={trend.color}
                            style={{ marginRight: 4 }}
                          />
                          <Text style={[styles.priceDiffText, { color: trend.color }]}>
                            {trend.label} {Math.abs(priceDiff)} THB
                          </Text>
                        </View>
                      )}
                    </View>

                    {property.ownerPhone && property.ownerPhone !== 'Contact available' && (
                      <Text style={styles.contactText}>📞 {property.ownerPhone}</Text>
                    )}
                    {property.ownerEmail && property.ownerEmail !== 'Not provided' && (
                      <Text style={styles.contactText}>📧 {property.ownerEmail}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Close Button */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.7 }]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  propertyInfo: {
    marginBottom: 20,
  },
  propertyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  propertyZone: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: Colors.dark.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: Colors.accent,
  },
  trendSummary: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 12,
    marginBottom: 20,
    gap: 10,
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendLabel: {
    flex: 1,
  },
  trendText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.textMuted,
  },
  trendPrice: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  timelineSection: {
    marginBottom: 20,
  },
  timelineTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  connectorLine: {
    position: 'absolute',
    left: 20,
    top: 40,
    width: 2,
    height: 60,
    backgroundColor: Colors.dark.border,
  },
  dotContainer: {
    width: 40,
    alignItems: 'center',
    paddingTop: 4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.dark.background,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sourceBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: Colors.accent,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceDiffText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  contactText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
    marginBottom: 4,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  closeButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
});
