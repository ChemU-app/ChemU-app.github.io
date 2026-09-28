import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '../lib/api';
import { colors, radius } from '../theme';

export default function AddTagModal({
  isAddTagModalVisible,
  toggleAddTagModal,
  token
}) {
  const [tagName, setTagName] = useState("");
  const insets = useSafeAreaInsets();
  const [submitting, setSubmitting] = useState(false);

  const closeModal = () => {
    if (!submitting) {
      toggleAddTagModal(false);
    }
  };

  const handleSubmit = async () => {
    const trimmedTag = tagName.trim();

    if (!trimmedTag || submitting) {
      return;
    }

    try {
      setSubmitting(true);

      await api.post(
        '/tags/',
        {
          name: trimmedTag,
        },
        token,
      );

      setTagName('');
      toggleAddTagModal(false);
    } catch (error) {
      console.error('Failed to create tag:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isAddTagModalVisible}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.overlay,
            {
              paddingTop: insets.top + 20,
              paddingBottom: insets.bottom + 20,
            },
          ]}
        >
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>#</Text>
              </View>

              <Pressable
                disabled={submitting}
                onPress={closeModal}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            <Text style={styles.title}>Add a tag</Text>

            <Text style={styles.subtitle}>
              Create a tag to help organize your questions.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Mathematics"
              placeholderTextColor={colors.placeholder ?? '#9CA3AF'}
              value={tagName}
              onChangeText={setTagName}
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              editable={!submitting}
            />

            <View style={styles.buttonRow}>
              <Pressable
                disabled={submitting}
                onPress={closeModal}
                style={({ pressed }) => [
                  styles.button,
                  styles.cancelButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                disabled={!tagName.trim() || submitting}
                onPress={handleSubmit}
                style={({ pressed }) => [
                  styles.button,
                  styles.submitButton,
                  (!tagName.trim() || submitting) && styles.disabledButton,
                  pressed && styles.pressed,
                ]}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Add tag</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
  },

  modalContainer: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    borderRadius: radius?.xl ?? 22,
    backgroundColor: colors.surface ?? '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },

  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  iconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: colors.primaryLight ?? '#EDE9FE',
  },

  icon: {
    color: colors.primary ?? '#6D28D9',
    fontSize: 22,
    fontWeight: '800',
  },

  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.background ?? '#F8FAFC',
  },

  closeText: {
    marginTop: -2,
    color: colors.muted ?? '#64748B',
    fontSize: 26,
    fontWeight: '400',
  },

  title: {
    marginTop: 18,
    color: colors.text ?? '#111827',
    fontSize: 22,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: 7,
    color: colors.muted ?? '#64748B',
    fontSize: 14,
    lineHeight: 20,
  },

  input: {
    minHeight: 52,
    marginTop: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border ?? '#E2E8F0',
    borderRadius: radius?.md ?? 10,
    color: colors.text ?? '#111827',
    backgroundColor: colors.background ?? '#F8FAFC',
    fontSize: 15,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },

  button: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius?.md ?? 10,
  },

  cancelButton: {
    borderWidth: 1,
    borderColor: colors.border ?? '#E2E8F0',
    backgroundColor: colors.surface ?? '#FFFFFF',
  },

  submitButton: {
    backgroundColor: colors.primary ?? '#6D28D9',
  },

  disabledButton: {
    opacity: 0.45,
  },

  cancelButtonText: {
    color: colors.text ?? '#111827',
    fontSize: 15,
    fontWeight: '700',
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.72,
  },
});

