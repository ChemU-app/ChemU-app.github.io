import React, {useState} from 'react';
import {View, Pressable, Text, Modal, StyleSheet} from 'react-native';
import { api } from '../lib/api';
import { colors, radius } from '../theme';
import Ionicons from "@react-native-vector-icons/ionicons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function DeleteQuestionModal({token, question}){
	const [showDel, setDel] = useState(false);
	const insets = useSafeAreaInsets();
	return <>
	<Pressable onPress={()=>setDel(true)}>
         <Ionicons name="trash-outline" size={16} ></Ionicons>
        </Pressable>
	 <Modal animationType='fade' transparent={false} visible={showDel} onRequestClose={()=>setDel(false)}>
        <View stylse={styles.overlay}>
          <View stylse={styles.card}>
            <View styles={styles.stack}>
             <Text styles={styles.title}>Remove From Question Bank?</Text>
              <Text styles={styles.idText}>{String(question.id)}</Text>
              <Text styles={styles.bodyText}>{question.content}</Text>
            </View>
            <Text styles={styles.question}>Do you wish to remove this question from your question bank?</Text>
            <View styles={styles.actions}>
              <Pressable styles={[styles.btn, styles.cancel]} onPress={()=>setDel(false)}>
                <Text styles={styles.btnText}>Cancel</Text>
              </Pressable>
              <Pressable
                styles={[styles.btn, styles.delete]}
                onPress={()=>{
                  api.delete(`/questions/${question.id}`, token);
                  setDel(false);
                }}
              >
                <Text styles={styles.btnText}>Remove</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      </>
}

const styles = StyleSheet.create({

  btnText: {
    color: "#fff",
    fontWeight: "700",
  },
 btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
 idText: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  question: {
    marginTop: 8,
    marginBottom: 16,
    color: "#444",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  cancel: {
    backgroundColor: colors.purple400,
  },
  delete: {
    backgroundColor: "#e53935",
  },


});
