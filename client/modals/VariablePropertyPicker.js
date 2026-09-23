// VariablePropertyPicker.tsx

import React from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import {
  getVariableProperties,
} from "../lib/variables";

export function VariablePropertyPicker({
  variables,
  onSelect
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insert variable property</Text>

      <FlatList
        data={variables}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const properties = getVariableProperties(item);

          return (
            <View style={styles.variableGroup}>
              <Text style={styles.variableName}>
                {item.name} ({item.type})
              </Text>

              {properties.map((property) => {
                const token = property.format.replace(
                  "{{variable}}",
                  ""
                );
                return (
                  <Pressable
                    key={property.key}
                    style={styles.propertyButton}
                    onPress={() =>
                      onSelect({
                        variable: item,
			index,
                        property,
                        token
                      })
                    }
                  >
                    <Text>{property.label}</Text>
                    <Text style={styles.token}>{token}</Text>
                  </Pressable>
                );
              })}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12
  },
  variableGroup: {
    marginBottom: 16
  },
  variableName: {
    fontWeight: "600",
    marginBottom: 6
  },
  propertyButton: {
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 6,
    marginBottom: 5
  },
  token: {
    color: "#666",
    fontSize: 12,
    marginTop: 3
  }
});

