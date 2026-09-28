import React, { useState } from 'react';
import {
  View,
  Pressable,
  Text,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '../lib/api';
import { colors, radius } from '../theme';

export default function DeleteQuestionModal({ token, question }) {
  const [showDel, setDel] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const insets = useSafeAreaInsets();

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/questions/${question.id}`, token);
      setDel(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Remove question"
        onPress={() => setDel(true)}
        style={({ pressed }) => [
          styles.iconButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="trash-outline"
          size={18}
          color={colors.danger ?? '#DC2626'}
        />
      </Pressable>

      <Modal
        animationType="fade"
        transparent
        visible={showDel}
        onRequestClose={() => !deleting && setDel(false)}
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
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="trash-outline"
                size={24}
                color={colors.danger ?? '#DC2626'}
              />
            </View>

            <Text style={styles.title}>Remove question?</Text>

            <Text style={styles.questionId}>
              Question #{String(question.id)}
            </Text>

            <Text style={styles.content} numberOfLines={3}>
              {question.content}
            </Text>

            <Text style={styles.bodyText}>
              Do you wish to remove this question from your question bank?
            </Text>

            <View style={styles.actions}>
              <Pressable
                disabled={deleting}
                onPress={() => setDel(false)}
                style={({ pressed }) => [
                  styles.button,
                  styles.cancelButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                disabled={deleting}
                onPress={handleDelete}
                style={({ pressed }) => [
                  styles.button,
                  styles.deleteButton,
                  pressed && styles.pressed,
                ]}
              >
                {deleting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.deleteText}>Remove</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius?.md ?? 10,
    backgroundColor: colors.dangerLight ?? '#FEE2E2',
  },

  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
  },

  card: {
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

  iconContainer: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    borderRadius: 26,
    backgroundColor: colors.dangerLight ?? '#FEE2E2',
  },

  title: {
    color: colors.text ?? '#111827',
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
  },

  questionId: {
    marginTop: 8,
    color: colors.muted ?? '#6B7280',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  content: {
    marginTop: 18,
    padding: 14,
    borderRadius: radius?.md ?? 10,
    color: colors.text ?? '#111827',
    backgroundColor: colors.background ?? '#F8FAFC',
    fontSize: 14,
    lineHeight: 20,
  },

  bodyText: {
    marginTop: 18,
    color: colors.muted ?? '#6B7280',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },

  actions: {
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
    borderColor: colors.border ?? '#E5E7EB',
    backgroundColor: colors.surface ?? '#FFFFFF',
  },

  deleteButton: {
    backgroundColor: colors.danger ?? '#DC2626',
  },

  cancelText: {
    color: colors.text ?? '#111827',
    fontSize: 15,
    fontWeight: '700',
  },

  deleteText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.7,
  },
});

