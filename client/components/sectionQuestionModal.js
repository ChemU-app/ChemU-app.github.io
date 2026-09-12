import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { api } from "../lib/api";

export default function TagQuestionModal({
  visible,
  onClose,
  section,
  token,
}) {
  const [questions, setQuestions] = useState([]);
  const [tagCounts, setTagCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible || !section?.questionIds?.length) {
      setQuestions([]);
      setTagCounts({});
      return;
    }

    let cancelled = false;

    async function loadQuestions() {
      setLoading(true);

      try {
        const fetchedQuestions = await Promise.all(
          section.questionIds.map((questionId) =>
            api.get(`/questions/${questionId}`, token)
          )
        );

        if (!cancelled) {
          setQuestions(fetchedQuestions);
        }
      } catch (error) {
        console.error(error);
        Alert.alert(
          "Error",
          "Unable to load the questions for this section."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadQuestions();

    return () => {
      cancelled = true;
    };
  }, [visible, section, token]);

  /*
   * Creates an object such as:
   *
   * {
   *   JavaScript: 5,
   *   React: 3
   * }
   *
   * question.tags is expected to look like:
   *
   * [
   *   { id: 1, name: "JavaScript" },
   *   { id: 2, name: "React" }
   * ]
   */
  const tagMaximums = useMemo(() => {
    const maximums = {};

    questions.forEach((question) => {
      const questionTags = Array.isArray(question.tags)
        ? question.tags
        : [];

      // Count a tag only once per question.
      const uniqueTagNames = [
        ...new Set(
          questionTags
            .map((tag) => tag?.name)
            .filter(Boolean)
        ),
      ];

      uniqueTagNames.forEach((tagName) => {
        maximums[tagName] = (maximums[tagName] || 0) + 1;
      });
    });

    return maximums;
  }, [questions]);

  // There will be one input for every unique tag name found.
  const tags = Object.keys(tagMaximums).sort();

  function handleTagCountChange(tagName, value) {
    // The input accepts only whole-number characters.
    if (!/^\d*$/.test(value)) {
      return;
    }

    const maximum = tagMaximums[tagName];
    const numericValue = value === "" ? 0 : Number(value);

    if (numericValue < 0) {
      Alert.alert(
        "Invalid number",
        `The number of "${tagName}" questions cannot be below 0.`
      );
      return;
    }

    if (numericValue > maximum) {
      Alert.alert(
        "Invalid number",
        `"${tagName}" has a maximum of ${maximum} question${
          maximum === 1 ? "" : "s"
        }.`
      );
      return;
    }

    setTagCounts((previous) => ({
      ...previous,
      [tagName]: value,
    }));
  }

  function validateTagCounts() {
    for (const tagName of tags) {
      const rawValue = tagCounts[tagName];
      const value =
        rawValue === "" || rawValue == null ? 0 : Number(rawValue);

      const maximum = tagMaximums[tagName];

      if (!Number.isInteger(value)) {
        Alert.alert(
          "Invalid number",
          `The number for "${tagName}" must be a whole number.`
        );
        return false;
      }

      if (value < 0) {
        Alert.alert(
          "Invalid number",
          `The number of "${tagName}" questions cannot be below 0.`
        );
        return false;
      }

      if (value > maximum) {
        Alert.alert(
          "Invalid number",
          `The number of "${tagName}" questions cannot be above ${maximum}.`
        );
        return false;
      }
    }

    return true;
  }

  async function handleSubmit() {
    if (!validateTagCounts()) {
      return;
    }

    const normalizedTagCounts = {};

    tags.forEach((tagName) => {
      normalizedTagCounts[tagName] =
        tagCounts[tagName] === "" || tagCounts[tagName] == null
          ? 0
          : Number(tagCounts[tagName]);
    });

    const body = {
      questionsPerTag: normalizedTagCounts,
    };

    setSaving(true);

    try {
      await api.patch(
        `/sections/${section.id}/update`,
        body,
        token
      );

      Alert.alert("Success", "Section updated successfully.");
      onClose?.();
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error",
        "Unable to update the section."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Questions per tag</Text>

            <Pressable
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.closeButton}>×</Text>
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator size="large" />
          ) : tags.length === 0 ? (
            <Text style={styles.emptyText}>
              No tags were found for this section.
            </Text>
          ) : (
            <ScrollView>
              <Text style={styles.description}>
                Enter how many questions from each tag should appear
                in every attempt.
              </Text>

              {tags.map((tagName) => (
                <View style={styles.tagRow} key={tagName}>
                  <View style={styles.tagInfo}>
                    <Text style={styles.tagName}>{tagName}</Text>
                    <Text style={styles.maximumText}>
                      Maximum: {tagMaximums[tagName]}
                    </Text>
                  </View>

                  <TextInput
                    style={styles.input}
                    value={String(tagCounts[tagName] ?? "")}
                    onChangeText={(value) =>
                      handleTagCountChange(tagName, value)
                    }
                    keyboardType="number-pad"
                    placeholder="0"
                    editable={!saving}
                  />
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.actions}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[
                styles.button,
                styles.saveButton,
                saving && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={loading || saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    maxHeight: "85%",
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    fontSize: 30,
    color: "#666",
  },
  description: {
    marginBottom: 16,
    color: "#555",
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  tagInfo: {
    flex: 1,
  },
  tagName: {
    fontSize: 16,
    fontWeight: "600",
  },
  maximumText: {
    marginTop: 4,
    fontSize: 13,
    color: "#777",
  },
  input: {
    width: 75,
    height: 44,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    textAlign: "center",
  },
  emptyText: {
    paddingVertical: 20,
    color: "#666",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  button: {
    minWidth: 90,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 18,
  },
  cancelButton: {
    backgroundColor: "#eee",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#2563eb",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

