import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect , router } from 'expo-router';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  Platform, ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { UserProfile, DriverRegistration } from '@/lib/types';
import { getProfile, saveProfile, getDriverRegistration } from '@/lib/storage';

const LANGUAGES = ['English', 'Thai', 'Chinese', 'Russian', 'German', 'French', 'Japanese', 'Korean'];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile>({
    id: 'c1',
    fullName: '',
    phone: '',
    email: '',
    preferredLanguage: 'English',
    defaultPickupNote: '',
  });
  const [driverReg, setDriverReg] = useState<DriverRegistration | null>(null);
  const [editing, setEditing] = useState(false);
  const [showLangs, setShowLangs] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getProfile().then(p => {
      if (p) setProfile(p);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      getDriverRegistration().then(r => setDriverReg(r));
    }, [])
  );

  const handleSave = useCallback(async () => {
    await saveProfile(profile);
    setEditing(false);
    setSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setSaved(false), 2000);
  }, [profile]);

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 67 : insets.top }]}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable
          onPress={() => {
            if (editing) {
              handleSave();
            } else {
              setEditing(true);
              Haptics.selectionAsync();
            }
          }}
          hitSlop={12}
        >
          <Ionicons
            name={editing ? 'checkmark' : 'create-outline'}
            size={24}
            color={editing ? Colors.success : Colors.accent}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={44} color={Colors.accent} />
          </View>
          {saved && (
            <View style={styles.savedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.savedText}>Saved</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={[styles.fieldInput, !editing && styles.fieldInputDisabled]}
              value={profile.fullName}
              onChangeText={t => setProfile(p => ({ ...p, fullName: t }))}
              placeholder="Enter your full name"
              placeholderTextColor={Colors.dark.textMuted}
              editable={editing}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Phone</Text>
            <TextInput
              style={[styles.fieldInput, !editing && styles.fieldInputDisabled]}
              value={profile.phone}
              onChangeText={t => setProfile(p => ({ ...p, phone: t }))}
              placeholder="+66 XX XXX XXXX"
              placeholderTextColor={Colors.dark.textMuted}
              editable={editing}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={[styles.fieldInput, !editing && styles.fieldInputDisabled]}
              value={profile.email}
              onChangeText={t => setProfile(p => ({ ...p, email: t }))}
              placeholder="your@email.com"
              placeholderTextColor={Colors.dark.textMuted}
              editable={editing}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Preferred Language</Text>
            {editing ? (
              <>
                <Pressable
                  style={styles.langSelector}
                  onPress={() => { setShowLangs(!showLangs); Haptics.selectionAsync(); }}
                >
                  <Ionicons name="globe-outline" size={18} color={Colors.accent} />
                  <Text style={styles.langSelectorText}>{profile.preferredLanguage}</Text>
                  <Ionicons name={showLangs ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.dark.textMuted} />
                </Pressable>
                {showLangs && (
                  <View style={styles.langList}>
                    {LANGUAGES.map(lang => (
                      <Pressable
                        key={lang}
                        style={[styles.langItem, lang === profile.preferredLanguage && styles.langItemActive]}
                        onPress={() => {
                          setProfile(p => ({ ...p, preferredLanguage: lang }));
                          setShowLangs(false);
                          Haptics.selectionAsync();
                        }}
                      >
                        <Text style={[styles.langItemText, lang === profile.preferredLanguage && styles.langItemTextActive]}>{lang}</Text>
                        {lang === profile.preferredLanguage && <Ionicons name="checkmark" size={18} color={Colors.accent} />}
                      </Pressable>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.langDisplay}>
                <Ionicons name="globe-outline" size={18} color={Colors.accent} />
                <Text style={styles.langDisplayText}>{profile.preferredLanguage}</Text>
              </View>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Default Pickup Note</Text>
            <TextInput
              style={[styles.fieldInput, styles.fieldInputMultiline, !editing && styles.fieldInputDisabled]}
              value={profile.defaultPickupNote}
              onChangeText={t => setProfile(p => ({ ...p, defaultPickupNote: t }))}
              placeholder="e.g., Near the 7-Eleven entrance"
              placeholderTextColor={Colors.dark.textMuted}
              editable={editing}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver</Text>
          <Pressable
            style={styles.driverCard}
            onPress={() => { router.push('/driver-register'); Haptics.selectionAsync(); }}
            testID="driver-register-btn"
          >
            <View style={styles.driverCardIcon}>
              <MaterialCommunityIcons name="steering" size={24} color={Colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.driverCardTitle}>
                {driverReg ? 'Driver Registration' : 'Drive with Us'}
              </Text>
              <Text style={styles.driverCardDesc}>
                {driverReg
                  ? driverReg.status === 'approved'
                    ? 'Your account is approved'
                    : driverReg.status === 'rejected'
                    ? 'Application not approved'
                    : 'Application under review'
                  : 'Register as a driver on Koh Samui'}
              </Text>
            </View>
            {driverReg && (
              <View style={[
                styles.driverStatusBadge,
                driverReg.status === 'approved' && { backgroundColor: Colors.success + '20' },
                driverReg.status === 'rejected' && { backgroundColor: Colors.error + '20' },
              ]}>
                <Text style={[
                  styles.driverStatusText,
                  driverReg.status === 'approved' && { color: Colors.success },
                  driverReg.status === 'rejected' && { color: Colors.error },
                ]}>
                  {driverReg.status === 'approved' ? 'Approved' :
                   driverReg.status === 'rejected' ? 'Rejected' : 'Pending'}
                </Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={18} color={Colors.dark.textMuted} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutRow}>
            <MaterialCommunityIcons name="shield-check" size={20} color={Colors.success} />
            <Text style={styles.aboutText}>All rides are safety-verified</Text>
          </View>
          <View style={styles.aboutRow}>
            <MaterialCommunityIcons name="phone-in-talk" size={20} color={Colors.accent} />
            <Text style={styles.aboutText}>24/7 Support: +66 77 123 456</Text>
          </View>
          <View style={styles.aboutRow}>
            <MaterialCommunityIcons name="map-marker-radius" size={20} color={Colors.accent} />
            <Text style={styles.aboutText}>Operating across all Koh Samui zones</Text>
          </View>
        </View>

        <Text style={styles.version}>Samui Safe Drive v1.0.0</Text>
        <View style={{ height: Platform.OS === 'web' ? 34 : 20 }} />
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
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
  },
  content: {
    paddingHorizontal: 20,
    gap: 20,
    paddingBottom: 100,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.dark.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.accent,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savedText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.success,
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
  fieldInputDisabled: {
    opacity: 0.7,
  },
  fieldInputMultiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  langSelector: {
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
  langSelectorText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.text,
  },
  langList: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  langItemActive: {
    backgroundColor: Colors.accent + '15',
  },
  langItemText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
  },
  langItemTextActive: {
    color: Colors.accent,
    fontFamily: 'Inter_600SemiBold',
  },
  langDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    opacity: 0.7,
  },
  langDisplayText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.text,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  driverCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverCardTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  driverCardDesc: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  driverStatusBadge: {
    backgroundColor: Colors.accent + '20',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  driverStatusText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.accent,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  aboutText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
  },
  version: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
