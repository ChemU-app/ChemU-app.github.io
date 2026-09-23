import React, {useState} from 'react';
import {Text, Modal, Pressable, FlatList, View, StyleSheet,
	ScrollView,
} from 'react-native';
import { colors, typeScale, screenPadding, radius } from '../theme';
import Ionicons from "@react-native-vector-icons/ionicons";
import {VariablePropertyPicker} from '../modals/VariablePropertyPicker';

function Segment({children}){
 return <View style={styles.segment}>
  {children}
 </View>
}

function SideScroll({children}){
 return <ScrollView
  style={styles.row}
  horizontal={true}
 >
  {children}
 </ScrollView>
}

export function VariableSelector({vars, textBox, setTextBox}){
 const [isVisible, setVisible] = useState(false);

 return (<>
  <Pressable onPress={()=>{setVisible(true);}} style={styles.addSlotBtn}>
   <Ionicons name="add" size={13} color={colors.purple600}/>
   <Text style={styles.addSlotText}>USE VARIABLE</Text>
  </Pressable>
  <Modal
   visible={isVisible}
   trasparent={false}
   animationType="slide"
   onRequestClose={()=>{
    setVisible(false);
   }}
  >
   <View style={styles.container}>
      <Text style={styles.title}>Use a Variable</Text>

      <View style={styles.previewCard}>
        <Text style={styles.label}>Currently Written:</Text>

        <View style={styles.textBox}>
          <Text style={styles.previewText}>
            {textBox || "No text written yet"}
          </Text>
        </View>
      </View>

      <View style={styles.pickerContainer}>
        <VariablePropertyPicker
          variables={vars}
          onSelect={({ variable, index, property, token }) => {
            setTextBox(textBox + `[${index}${token}]`);
          }}
        />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.backButtonPressed,
        ]}
        onPress={() => setVisible(false)}
      >
        <Text style={styles.backButtonText}>GO BACK</Text>
      </Pressable>
    </View>
  </Modal>
 </>);
}

const styles = StyleSheet.create({
	container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F8FAFC",
  },

  title: {
    marginBottom: 20,
    color: "#111827",
    fontSize: 26,
    fontWeight: "700",
  },

  previewCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  label: {
    marginBottom: 10,
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },

  textBox: {
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
  },

  previewText: {
    color: "#1E293B",
    fontSize: 16,
    lineHeight: 22,
  },

  pickerContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },

  backButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    marginTop: 24,
    borderRadius: 10,
    backgroundColor: "#2563EB",
  },

  backButtonPressed: {
    backgroundColor: "#1D4ED8",
    transform: [{ scale: 0.98 }],
  },

  backButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
