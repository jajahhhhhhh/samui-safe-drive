import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Colors from '@/constants/colors';

const SECTIONS = [
  {
    icon: 'shield-check-outline' as const,
    title: '1. Driver Eligibility',
    items: [
      'Must be at least 21 years of age.',
      'Must hold a valid Thai driving license (Class 2 or above) or an International Driving Permit recognized in Thailand.',
      'Must pass a background check conducted by Samui Safe Drive.',
      'Must complete a health screening certificate (not older than 6 months).',
      'Must have at least 2 years of driving experience.',
    ],
  },
  {
    icon: 'car-cog' as const,
    title: '2. Vehicle Requirements',
    items: [
      'Vehicle must be registered in Koh Samui or Surat Thani province.',
      'Vehicle must pass annual safety inspection (Ror Ngor Sor).',
      'Must maintain valid vehicle insurance (at minimum, third-party liability).',
      'Vehicle must be clean, well-maintained, and air-conditioned (for car service).',
      'Motorcycles must have helmet for passenger and driver.',
    ],
  },
  {
    icon: 'account-check-outline' as const,
    title: '3. Code of Conduct',
    items: [
      'Drivers must maintain professional behavior at all times.',
      'No use of alcohol or drugs while on duty or 8 hours prior.',
      'Must wear clean, appropriate clothing while on duty.',
      'Smoking is prohibited in the vehicle during rides.',
      'Must respect passenger privacy and personal space.',
      'Use of mobile phone while driving is strictly prohibited.',
      'Must follow all traffic rules and speed limits at all times.',
    ],
  },
  {
    icon: 'shield-lock-outline' as const,
    title: '4. Safety Regulations',
    items: [
      'Drivers must ensure all passengers wear seatbelts before starting a trip.',
      'Maximum speed limit: 60 km/h on main roads, 40 km/h in residential areas.',
      'Must perform daily vehicle safety checks (brakes, lights, tires, mirrors).',
      'Report any accident or incident to Samui Safe Drive within 30 minutes.',
      'Must carry a first aid kit in the vehicle at all times.',
      'OTP verification is mandatory at every pickup to confirm passenger identity.',
    ],
  },
  {
    icon: 'cash-multiple' as const,
    title: '5. Fare & Payment Policy',
    items: [
      'Fares are calculated by the Samui Safe Drive system based on zone and distance.',
      'Drivers may not negotiate, increase, or modify fares with passengers.',
      'Samui Safe Drive retains a 15% commission on each completed trip.',
      'Payments are processed weekly via bank transfer.',
      'Drivers must accept all payment methods offered through the platform.',
      'Any fare disputes must be reported through the app within 24 hours.',
    ],
  },
  {
    icon: 'file-document-outline' as const,
    title: '6. Insurance Coverage',
    items: [
      'Samui Safe Drive provides supplementary insurance coverage for active trips.',
      'Coverage includes passenger injury up to ฿500,000 per incident.',
      'Vehicle damage during active trips covered up to ฿200,000.',
      'Coverage is only active during OTP-confirmed trips (from pickup to drop-off).',
      'Drivers must maintain their own personal vehicle insurance separately.',
      'Insurance claims must be filed within 48 hours of an incident.',
    ],
  },
  {
    icon: 'database-lock-outline' as const,
    title: '7. Data Privacy',
    items: [
      'Driver personal data is handled in compliance with Thailand PDPA (Personal Data Protection Act).',
      'Location data is collected only during active duty hours.',
      'Passenger information must not be stored, shared, or used outside the platform.',
      'Drivers may request data deletion upon account deactivation.',
    ],
  },
  {
    icon: 'gavel' as const,
    title: '8. Termination & Suspension',
    items: [
      'Samui Safe Drive reserves the right to suspend or terminate driver accounts.',
      'Grounds for immediate termination: DUI, assault, fraud, repeated safety violations.',
      'Ratings below 4.0 for 30 consecutive days may result in suspension.',
      'Three verified passenger complaints may trigger a review and potential suspension.',
      'Terminated drivers may appeal within 14 days of notification.',
    ],
  },
  {
    icon: 'scale-balance' as const,
    title: '9. Dispute Resolution',
    items: [
      'All disputes shall first be resolved through the Samui Safe Drive mediation process.',
      'If mediation fails, disputes will be settled under Thai law in Surat Thani Provincial Court.',
      'This agreement is governed by the laws of the Kingdom of Thailand.',
    ],
  },
];

export default function DriverPolicyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 67 : insets.top }]}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Legal Policy & Terms</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <MaterialCommunityIcons name="shield-check" size={28} color={Colors.accent} />
          <Text style={styles.bannerTitle}>Samui Safe Drive</Text>
          <Text style={styles.bannerSubtitle}>Driver Agreement & Legal Policy</Text>
          <Text style={styles.bannerDate}>Effective: January 1, 2026</Text>
        </View>

        <Text style={styles.intro}>
          By registering as a driver with Samui Safe Drive, you agree to comply with the following terms, conditions, safety regulations, and legal requirements. Please read carefully before accepting.
        </Text>

        {SECTIONS.map((section, i) => (
          <View key={i} style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name={section.icon} size={22} color={Colors.accent} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.items.map((item, j) => (
              <View key={j} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By checking the acceptance box on the registration form, you acknowledge that you have read, understood, and agree to be bound by all terms and conditions outlined above.
          </Text>
          <Text style={styles.footerText}>
            Samui Safe Drive reserves the right to update these terms. Drivers will be notified of material changes via email and in-app notifications.
          </Text>
          <Text style={styles.footerCopy}>© 2026 Samui Safe Drive. All rights reserved.</Text>
        </View>

        <View style={{ height: Platform.OS === 'web' ? 34 : 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
  },
  content: {
    paddingHorizontal: 20,
    gap: 20,
    paddingBottom: 100,
  },
  banner: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  bannerTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
    marginTop: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.accent,
  },
  bannerDate: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
    marginTop: 4,
  },
  intro: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    lineHeight: 21,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 14,
    color: Colors.accent,
    lineHeight: 21,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    lineHeight: 21,
  },
  footer: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginTop: 8,
  },
  footerText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
    lineHeight: 19,
  },
  footerCopy: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
