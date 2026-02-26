import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useCallback, useMemo } from 'react';
import Colors from '@/constants/colors';
import { Property, Zone, ZONE_LABELS } from '@/lib/types';
import { useProperties } from '@/lib/property-context';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyDetail } from '@/components/PropertyDetail';
import { ImportModal } from '@/components/ImportModal';
import { PriceHistoryView } from '@/components/PriceHistoryView';

export default function PropertiesScreen() {
  const { searchProperties, refreshProperties, importNewProperty, getPropertyVersions } = useProperties();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [showZoneFilter, setShowZoneFilter] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'mock' | 'facebook'>('all');
  const [showSourceFilter, setShowSourceFilter] = useState(false);
  const [priceHistoryProperty, setPriceHistoryProperty] = useState<Property | null>(null);
  const [priceHistoryList, setPriceHistoryList] = useState<Property[]>([]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshProperties();
    setRefreshing(false);
  }, [refreshProperties]);

  const handleImportConfirm = useCallback(async (postText: string, photoUrls: string[]) => {
    await importNewProperty(postText, photoUrls);
    setShowImportModal(false);
  }, [importNewProperty]);

  const handleShowPriceHistory = useCallback(async (property: Property) => {
    if (!property.groupId) return;
    const versions = await getPropertyVersions(property.groupId);
    setPriceHistoryList(versions);
    setPriceHistoryProperty(property);
  }, [getPropertyVersions]);

  // Filter and search properties
  const filteredProperties = useMemo(() => {
    const searched = searchProperties(searchQuery, selectedZone, priceRange);
    return searched.filter(p => {
      const source = p.source || 'mock';
      if (sourceFilter === 'all') return true;
      return source === sourceFilter;
    });
  }, [searchQuery, selectedZone, priceRange, searchProperties, sourceFilter]);

  const zones: Zone[] = [
    'chaweng',
    'lamai',
    'bophut',
    'maenam',
    'nathon',
    'lipa_noi',
    'taling_ngam',
    'choeng_mon',
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Properties</Text>
        <Pressable
          style={({ pressed }) => [styles.importButton, pressed && { opacity: 0.6 }]}
          onPress={() => setShowImportModal(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color={Colors.accent} />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.dark.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search properties..."
            placeholderTextColor={Colors.dark.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.dark.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        {/* Source Filter Dropdown */}
        <Pressable
          style={({ pressed }) => [styles.filterButton, pressed && { opacity: 0.6 }]}
          onPress={() => setShowSourceFilter(!showSourceFilter)}
        >
          <MaterialCommunityIcons name="filter" size={16} color={Colors.accent} />
          <Text style={styles.filterButtonText}>
            {sourceFilter === 'all' ? 'All' : sourceFilter === 'facebook' ? 'Facebook' : 'Official'}
          </Text>
          <Ionicons
            name={showSourceFilter ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={Colors.accent}
          />
        </Pressable>

        {/* Zone Filter Dropdown */}
        <Pressable
          style={({ pressed }) => [styles.filterButton, pressed && { opacity: 0.6 }]}
          onPress={() => setShowZoneFilter(!showZoneFilter)}
        >
          <MaterialCommunityIcons name="map-marker" size={16} color={Colors.accent} />
          <Text style={styles.filterButtonText}>
            {selectedZone ? ZONE_LABELS[selectedZone] : 'All Zones'}
          </Text>
          <Ionicons
            name={showZoneFilter ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={Colors.accent}
          />
        </Pressable>

        {/* Price Range Info */}
        <View style={styles.filterButton}>
          <Ionicons name="cash" size={16} color={Colors.accent} />
          <Text style={styles.filterButtonText}>
            {priceRange.min}-{priceRange.max} THB
          </Text>
        </View>

        {/* Clear Filters */}
        {(selectedZone || searchQuery || sourceFilter !== 'all') && (
          <Pressable
            style={({ pressed }) => [styles.filterButton, pressed && { opacity: 0.6 }]}
            onPress={() => {
              setSelectedZone(null);
              setSearchQuery('');
              setPriceRange({ min: 0, max: 10000 });
              setSourceFilter('all');
            }}
          >
            <Ionicons name="close-outline" size={16} color={Colors.error} />
            <Text style={[styles.filterButtonText, { color: Colors.error }]}>Clear</Text>
          </Pressable>
        )}
      </View>

      {/* Source Filter Dropdown Menu */}
      {showSourceFilter && (
        <ScrollView style={styles.filterDropdown} scrollEnabled={true}>
          <Pressable
            style={({ pressed }) => [
              styles.filterOption,
              sourceFilter === 'all' && { backgroundColor: Colors.dark.surface },
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => {
              setSourceFilter('all');
              setShowSourceFilter(false);
            }}
          >
            <Text style={styles.filterOptionText}>All Properties</Text>
            {sourceFilter === 'all' && <Ionicons name="checkmark" size={16} color={Colors.accent} />}
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.filterOption,
              sourceFilter === 'mock' && { backgroundColor: Colors.dark.surface },
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => {
              setSourceFilter('mock');
              setShowSourceFilter(false);
            }}
          >
            <Text style={styles.filterOptionText}>Official</Text>
            {sourceFilter === 'mock' && <Ionicons name="checkmark" size={16} color={Colors.accent} />}
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.filterOption,
              sourceFilter === 'facebook' && { backgroundColor: Colors.dark.surface },
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => {
              setSourceFilter('facebook');
              setShowSourceFilter(false);
            }}
          >
            <Text style={styles.filterOptionText}>Facebook</Text>
            {sourceFilter === 'facebook' && <Ionicons name="checkmark" size={16} color={Colors.accent} />}
          </Pressable>
        </ScrollView>
      )}

      {/* Zone Filter Dropdown Menu */}
      {showZoneFilter && (
        <ScrollView style={styles.zoneDropdown} scrollEnabled={true}>
          <Pressable
            style={({ pressed }) => [
              styles.zoneOption,
              !selectedZone && { backgroundColor: Colors.dark.surface },
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => {
              setSelectedZone(null);
              setShowZoneFilter(false);
            }}
          >
            <Text style={styles.zoneOptionText}>All Zones</Text>
            {!selectedZone && <Ionicons name="checkmark" size={16} color={Colors.accent} />}
          </Pressable>
          {zones.map((zone) => (
            <Pressable
              key={zone}
              style={({ pressed }) => [
                styles.zoneOption,
                selectedZone === zone && { backgroundColor: Colors.dark.surface },
                pressed && { opacity: 0.6 },
              ]}
              onPress={() => {
                setSelectedZone(zone);
                setShowZoneFilter(false);
              }}
            >
              <Text style={styles.zoneOptionText}>{ZONE_LABELS[zone]}</Text>
              {selectedZone === zone && <Ionicons name="checkmark" size={16} color={Colors.accent} />}
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Properties List */}
      {filteredProperties.length > 0 ? (
        <FlatList
          data={filteredProperties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onPress={() => setSelectedProperty(item)}
              onLongPress={() => handleShowPriceHistory(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={48} color={Colors.dark.textMuted} />
          <Text style={styles.emptyStateTitle}>No properties found</Text>
          <Text style={styles.emptyStateText}>
            Try adjusting your search or filters
          </Text>
        </View>
      )}

      {/* Property Detail Modal */}
      <Modal
        visible={!!selectedProperty}
        animationType="slide"
        onRequestClose={() => setSelectedProperty(null)}
      >
        {selectedProperty && (
          <PropertyDetail
            property={selectedProperty}
            onClose={() => setSelectedProperty(null)}
          />
        )}
      </Modal>

      {/* Import Modal */}
      <ImportModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onConfirm={handleImportConfirm}
      />

      {/* Price History Modal */}
      <PriceHistoryView
        visible={!!priceHistoryProperty && priceHistoryList.length > 0}
        onClose={() => {
          setPriceHistoryProperty(null);
          setPriceHistoryList([]);
        }}
        properties={priceHistoryList}
      />
    </SafeAreaView>
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
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
  },
  importButton: {
    padding: 4,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.dark.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.text,
  },
  filtersSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  zoneDropdown: {
    maxHeight: 300,
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  zoneOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  zoneOptionText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.text,
  },
  filterDropdown: {
    maxHeight: 200,
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.text,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
  },
});
