import { View, Text, StyleSheet, Modal, TextInput, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import Colors from '@/constants/colors';
import { parsePropertyFromFacebookPost } from '@/lib/facebook-parser';

interface ImportModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (postText: string, photoUrls: string[]) => Promise<void>;
}

export function ImportModal({ visible, onClose, onConfirm }: ImportModalProps) {
  const [postText, setPostText] = useState('');
  const [photoUrls, setPhotoUrls] = useState('');
  const [parseResult, setParseResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleParse = () => {
    const photoArray = photoUrls
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    const result = parsePropertyFromFacebookPost(postText, photoArray);
    setParseResult(result);
  };

  const handleConfirm = async () => {
    if (!parseResult?.success) return;
    setIsLoading(true);
    const photos = photoUrls
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    await onConfirm(postText, photos);
    setIsLoading(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setPostText('');
    setPhotoUrls('');
    setParseResult(null);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return Colors.success;
    if (confidence >= 60) return '#FFA500';
    return Colors.error;
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: 40 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Import from Facebook</Text>
          <Pressable onPress={onClose} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <Ionicons name="close" size={24} color={Colors.dark.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!parseResult ? (
            <>
              {/* Input Section */}
              <View style={styles.section}>
                <Text style={styles.label}>Facebook Post Content</Text>
                <TextInput
                  style={styles.textarea}
                  placeholder="Paste Facebook post here..."
                  placeholderTextColor={Colors.dark.textMuted}
                  multiline
                  numberOfLines={8}
                  value={postText}
                  onChangeText={setPostText}
                />
              </View>

              {/* Photo URLs Section */}
              <View style={styles.section}>
                <Text style={styles.label}>Photo URLs (Optional)</Text>
                <TextInput
                  style={styles.textinput}
                  placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
                  placeholderTextColor={Colors.dark.textMuted}
                  multiline
                  numberOfLines={3}
                  value={photoUrls}
                  onChangeText={setPhotoUrls}
                />
                <Text style={styles.helperText}>Separate multiple URLs with commas</Text>
              </View>

              {/* Parse Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.parseButton,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={handleParse}
                disabled={postText.length === 0}
              >
                <Text style={styles.parseButtonText}>Parse Post</Text>
              </Pressable>
            </>
          ) : (
            <>
              {/* Preview Section */}
              <View style={styles.previewSection}>
                <View style={styles.previewHeader}>
                  <Text style={styles.previewTitle}>Parsed Data Preview</Text>
                  {parseResult.success && (
                    <View style={styles.confidenceBadge}>
                      <Text
                        style={[
                          styles.confidenceText,
                          { color: getConfidenceColor(parseResult.confidence) },
                        ]}
                      >
                        {parseResult.confidence}% Confidence
                      </Text>
                    </View>
                  )}
                </View>

                {parseResult.property && (
                  <View style={styles.previewContent}>
                    <PreviewRow
                      label="Title"
                      value={parseResult.property.title}
                      icon="document-text"
                    />
                    <PreviewRow
                      label="Price"
                      value={`${parseResult.property.price} ${parseResult.property.currency}`}
                      icon="cash"
                    />
                    <PreviewRow label="Zone" value={parseResult.property.zone} icon="location" />
                    <PreviewRow
                      label="Type"
                      value={parseResult.property.propertyType}
                      icon="home"
                    />
                    <PreviewRow
                      label="Phone"
                      value={parseResult.property.ownerPhone || 'Not provided'}
                      icon="call"
                    />
                    <PreviewRow
                      label="Email"
                      value={parseResult.property.ownerEmail || 'Not provided'}
                      icon="mail"
                    />

                    {parseResult.property.amenities &&
                      parseResult.property.amenities.length > 0 && (
                        <View style={styles.previewRow}>
                          <Ionicons name="sparkles" size={16} color={Colors.accent} />
                          <View style={styles.previewRowContent}>
                            <Text style={styles.previewLabel}>Amenities</Text>
                            <Text style={styles.previewValue}>
                              {parseResult.property.amenities.join(', ')}
                            </Text>
                          </View>
                        </View>
                      )}
                  </View>
                )}

                {/* Warnings */}
                {parseResult.errors.length > 0 && (
                  <View style={styles.warningsSection}>
                    <Text style={styles.warningsTitle}>⚠️ Warnings:</Text>
                    {parseResult.errors.map((error: string, idx: number) => (
                      <Text key={idx} style={styles.warningItem}>
                        • {error}
                      </Text>
                    ))}
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => setParseResult(null)}
                >
                  <Text style={styles.secondaryButtonText}>Edit</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    (pressed || isLoading) && { opacity: 0.7 },
                  ]}
                  onPress={handleConfirm}
                  disabled={isLoading}
                >
                  <Text style={styles.primaryButtonText}>
                    {isLoading ? 'Importing...' : 'Confirm Import'}
                  </Text>
                </Pressable>
              </View>
            </>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function PreviewRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: any;
}) {
  return (
    <View style={styles.previewRow}>
      <Ionicons name={icon} size={16} color={Colors.accent} />
      <View style={styles.previewRowContent}>
        <Text style={styles.previewLabel}>{label}</Text>
        <Text style={styles.previewValue}>{value}</Text>
      </View>
    </View>
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
  section: {
    marginBottom: 20,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  textarea: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 12,
    color: Colors.dark.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    minHeight: 120,
  },
  textinput: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 12,
    color: Colors.dark.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    minHeight: 60,
  },
  helperText: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    fontFamily: 'Inter_400Regular',
  },
  parseButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  parseButtonText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  previewSection: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  previewTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.dark.background,
    borderRadius: 20,
  },
  confidenceText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  previewContent: {
    padding: 16,
    gap: 12,
  },
  previewRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  previewRowContent: {
    flex: 1,
  },
  previewLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.textMuted,
  },
  previewValue: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.text,
    marginTop: 2,
  },
  warningsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  warningsTitle: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.error,
    marginBottom: 6,
  },
  warningItem: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    marginBottom: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
  },
});
