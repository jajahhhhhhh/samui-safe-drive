import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  Platform, ScrollView, Alert, Switch,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Crypto from 'expo-crypto';
import Colors from '@/constants/colors';
import { Zone, ZONE_LABELS, DriverRegistration } from '@/lib/types';
import { saveDriverRegistration, getDriverRegistration } from '@/lib/storage';

const LANGUAGES = ['Thai', 'English', 'Chinese', 'Russian', 'German', 'French', 'Japanese', 'Korean'];
const ZONES = Object.entries(ZONE_LABELS) as [Zone, string][];
const VEHICLE_TYPES = ['Toyota Vios', 'Honda City', 'Nissan Almera', 'Toyota Hilux', 'Isuzu D-Max', 'Honda Wave', 'Yamaha NMAX', 'Other'];

export default function DriverRegisterScreen() {
  const insets = useSafeAreaInsets();
  const [existingReg, setExistingReg] = useState<DriverRegistration | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['Thai']);
  const [licenseNo, setLicenseNo] = useState('');
  const [homeZone, setHomeZone] = useState<Zone>('chaweng');
  const [canDriveManual, setCanDriveManual] = useState(true);
  const [vehicleType, setVehicleType] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [showLangs, setShowLangs] = useState(false);
  const [showZones, setShowZones] = useState(false);
  const [showVehicles, setShowVehicles] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getDriverRegistration().then(reg => {
      if (reg) setExistingReg(reg);
    });
  }, []);

  const toggleLang = (lang: string) => {
    Haptics.selectionAsync();
    setSelectedLangs(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const validate = () => {
    if (!fullName.trim()) return 'Please enter your full name';
    if (!phone.trim()) return 'Please enter your phone number';
    if (!email.trim()) return 'Please enter your email address';
    if (selectedLangs.length === 0) return 'Please select at least one language';
    if (!licenseNo.trim()) return 'Please enter your driver license number';
    if (!vehicleType.trim()) return 'Please select your vehicle type';
    if (!vehiclePlate.trim()) return 'Please enter your vehicle plate number';
    if (!policyAccepted) return 'You must accept the Legal Policy & Terms to register';
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Missing Information', error);
      return;
    }

    setSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const reg: DriverRegistration = {
      id: Crypto.randomUUID(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      languages: selectedLangs,
      licenseNo: licenseNo.trim(),
      homeZone,
      canDriveManual,
      vehicleType,
      vehiclePlate: vehiclePlate.trim(),
      policyAccepted: true,
      policyAcceptedAt: new Date().toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await saveDriverRegistration(reg);

    setTimeout(() => {
      setSubmitting(false);
      router.back();
      setTimeout(() => {
        Alert.alert(
          'Registration Submitted',
          'Thank you for registering as a Samui Safe Drive driver! Your application is under review. We will contact you within 2-3 business days.',
        );
      }, 300);
    }, 1000);
  };

  if (existingReg) {
    return (
      <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 67 : insets.top }]}>
        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Driver Registration</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.statusContainer}>
          <View style={styles.statusIconWrap}>
            {existingReg.status === 'approved' ? (
              <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
            ) : existingReg.status === 'rejected' ? (
              <Ionicons name="close-circle" size={64} color={Colors.error} />
            ) : (
              <MaterialCommunityIcons name="clock-outline" size={64} color={Colors.accent} />
            )}
          </View>
          <Text style={styles.statusTitle}>
            {existingReg.status === 'approved' ? 'Approved' :
             existingReg.status === 'rejected' ? 'Rejected' : 'Under Review'}
          </Text>
          <Text style={styles.statusDesc}>
            {existingReg.status === 'approved'
              ? 'Your driver account has been approved. You can start accepting rides.'
              : existingReg.status === 'rejected'
              ? 'Unfortunately, your application was not approved. Please contact support.'
              : 'Your application is being reviewed. We will contact you within 2-3 business days.'}
          </Text>
          <View style={styles.statusDetails}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Name</Text>
              <Text style={styles.statusValue}>{existingReg.fullName}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>License</Text>
              <Text style={styles.statusValue}>{existingReg.licenseNo}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Vehicle</Text>
              <Text style={styles.statusValue}>{existingReg.vehicleType} · {existingReg.vehiclePlate}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Zone</Text>
              <Text style={styles.statusValue}>{ZONE_LABELS[existingReg.homeZone]}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Policy Accepted</Text>
              <Text style={[styles.statusValue, { color: Colors.success }]}>
                {new Date(existingReg.policyAcceptedAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Submitted</Text>
              <Text style={styles.statusValue}>
                {new Date(existingReg.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 67 : insets.top }]}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Drive with Us</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heroSection}>
          <MaterialCommunityIcons name="steering" size={40} color={Colors.accent} />
          <Text style={styles.heroTitle}>Become a Driver</Text>
          <Text style={styles.heroDesc}>Join the Samui Safe Drive team and earn by providing safe rides across Koh Samui island.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Full Name *</Text>
            <TextInput
              style={styles.fieldInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full legal name"
              placeholderTextColor={Colors.dark.textMuted}
              testID="driver-fullname"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Phone Number *</Text>
            <TextInput
              style={styles.fieldInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="+66 XX XXX XXXX"
              placeholderTextColor={Colors.dark.textMuted}
              keyboardType="phone-pad"
              testID="driver-phone"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email Address *</Text>
            <TextInput
              style={styles.fieldInput}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={Colors.dark.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="driver-email"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Languages Spoken *</Text>
            <Pressable
              style={styles.selector}
              onPress={() => { setShowLangs(!showLangs); Haptics.selectionAsync(); }}
            >
              <Text style={styles.selectorText}>
                {selectedLangs.length > 0 ? selectedLangs.join(', ') : 'Select languages'}
              </Text>
              <Ionicons name={showLangs ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.dark.textMuted} />
            </Pressable>
            {showLangs && (
              <View style={styles.optionList}>
                {LANGUAGES.map(lang => (
                  <Pressable
                    key={lang}
                    style={[styles.optionItem, selectedLangs.includes(lang) && styles.optionItemActive]}
                    onPress={() => toggleLang(lang)}
                  >
                    <Text style={[styles.optionText, selectedLangs.includes(lang) && styles.optionTextActive]}>{lang}</Text>
                    {selectedLangs.includes(lang) && <Ionicons name="checkmark" size={18} color={Colors.accent} />}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Details</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Driver License Number *</Text>
            <TextInput
              style={styles.fieldInput}
              value={licenseNo}
              onChangeText={setLicenseNo}
              placeholder="e.g., DL-84001"
              placeholderTextColor={Colors.dark.textMuted}
              autoCapitalize="characters"
              testID="driver-license"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Home Zone *</Text>
            <Pressable
              style={styles.selector}
              onPress={() => { setShowZones(!showZones); Haptics.selectionAsync(); }}
            >
              <Ionicons name="location-outline" size={18} color={Colors.accent} />
              <Text style={styles.selectorText}>{ZONE_LABELS[homeZone]}</Text>
              <Ionicons name={showZones ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.dark.textMuted} />
            </Pressable>
            {showZones && (
              <View style={styles.optionList}>
                {ZONES.map(([key, label]) => (
                  <Pressable
                    key={key}
                    style={[styles.optionItem, key === homeZone && styles.optionItemActive]}
                    onPress={() => { setHomeZone(key); setShowZones(false); Haptics.selectionAsync(); }}
                  >
                    <Text style={[styles.optionText, key === homeZone && styles.optionTextActive]}>{label}</Text>
                    {key === homeZone && <Ionicons name="checkmark" size={18} color={Colors.accent} />}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <MaterialCommunityIcons name="car-shift-pattern" size={20} color={Colors.accent} />
              <Text style={styles.switchText}>Can drive manual transmission</Text>
            </View>
            <Switch
              value={canDriveManual}
              onValueChange={v => { setCanDriveManual(v); Haptics.selectionAsync(); }}
              trackColor={{ false: Colors.dark.border, true: Colors.accent + '60' }}
              thumbColor={canDriveManual ? Colors.accent : Colors.dark.textMuted}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Vehicle Type *</Text>
            <Pressable
              style={styles.selector}
              onPress={() => { setShowVehicles(!showVehicles); Haptics.selectionAsync(); }}
            >
              <MaterialCommunityIcons name="car" size={18} color={Colors.accent} />
              <Text style={styles.selectorText}>{vehicleType || 'Select vehicle type'}</Text>
              <Ionicons name={showVehicles ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.dark.textMuted} />
            </Pressable>
            {showVehicles && (
              <View style={styles.optionList}>
                {VEHICLE_TYPES.map(vt => (
                  <Pressable
                    key={vt}
                    style={[styles.optionItem, vt === vehicleType && styles.optionItemActive]}
                    onPress={() => { setVehicleType(vt); setShowVehicles(false); Haptics.selectionAsync(); }}
                  >
                    <Text style={[styles.optionText, vt === vehicleType && styles.optionTextActive]}>{vt}</Text>
                    {vt === vehicleType && <Ionicons name="checkmark" size={18} color={Colors.accent} />}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Vehicle Plate Number *</Text>
            <TextInput
              style={styles.fieldInput}
              value={vehiclePlate}
              onChangeText={setVehiclePlate}
              placeholder="e.g., 7 กว 8401"
              placeholderTextColor={Colors.dark.textMuted}
              testID="driver-plate"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal Policy & Terms</Text>

          <Pressable
            style={styles.policyLink}
            onPress={() => router.push('/driver-policy')}
          >
            <MaterialCommunityIcons name="file-document-outline" size={22} color={Colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.policyLinkTitle}>Read Legal Policy & Terms</Text>
              <Text style={styles.policyLinkDesc}>Driver agreement, safety regulations, and insurance policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.dark.textMuted} />
          </Pressable>

          <Pressable
            style={styles.checkboxRow}
            onPress={() => { setPolicyAccepted(!policyAccepted); Haptics.selectionAsync(); }}
            testID="policy-checkbox"
          >
            <View style={[styles.checkbox, policyAccepted && styles.checkboxChecked]}>
              {policyAccepted && <Ionicons name="checkmark" size={16} color="#FFF" />}
            </View>
            <Text style={styles.checkboxText}>
              I have read and agree to the Samui Safe Drive Driver Legal Policy, Terms of Service, Safety Regulations, and Insurance Policy *
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.submitBtn, (!policyAccepted || submitting) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          testID="submit-registration"
        >
          {submitting ? (
            <Text style={styles.submitBtnText}>Submitting...</Text>
          ) : (
            <>
              <MaterialCommunityIcons name="send" size={20} color="#FFF" />
              <Text style={styles.submitBtnText}>Submit Registration</Text>
            </>
          )}
        </Pressable>

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
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
  },
  content: {
    paddingHorizontal: 20,
    gap: 24,
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
  },
  heroDesc: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
  },
  fieldInput: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  selectorText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.text,
  },
  optionList: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  optionItemActive: {
    backgroundColor: Colors.accent + '15',
  },
  optionText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
  },
  optionTextActive: {
    color: Colors.accent,
    fontFamily: 'Inter_600SemiBold',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  switchText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.text,
  },
  policyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
  },
  policyLinkTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.accent,
  },
  policyLinkDesc: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.dark.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    lineHeight: 19,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.success,
    borderRadius: 14,
    paddingVertical: 16,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#FFF',
  },
  statusContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    gap: 12,
  },
  statusIconWrap: {
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
  },
  statusDesc: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  statusDetails: {
    width: '100%',
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
  },
  statusValue: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
});
