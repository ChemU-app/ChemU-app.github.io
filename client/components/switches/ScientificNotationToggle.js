import React from 'react';
import { Switch, StyleSheet, Text, View } from 'react-native';

export function ScientificNotationToggle({
  value,
  onValueChange,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Use Scientific notation</Text>

      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityRole="switch"
        accessibilityLabel="Scientific notation"
        accessibilityState={{ checked: value }}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={value ? '#2563eb' : '#f4f3f4'}
        ios_backgroundColor="#767577"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    color: '#111827',
    fontSize: 16,
  },
});

