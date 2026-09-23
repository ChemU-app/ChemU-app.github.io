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
   <Text>Use A Variable</Text>
   <Segment>
    <Text>Currently Written:</Text>
    <Segment>
     <Text>{textBox}</Text>
    </Segment>
   </Segment>
     <VariablePropertyPicker
                variables={vars}
                onSelect={({variable, index, property, token})=>{
                        setTextBox(textBox + `[${index}${token}]`);
                }}
         />

   <Pressable onPress={()=>{setVisible(false)}}>
    <Text>CANCEL</Text>
   </Pressable>
  </Modal>
 </>);
}

const styles = StyleSheet.create({
 row:{
  flexDirection: 'row',
 },
 segment:{
    borderWidth: 1.5,
    borderColor: colors.neutral200,
    borderRadius: radius.md,
    paddingVertical: 11,
    paddingHorizontal: 12,
    fontFamily: 'Outfit_500Medium',
    fontSize: 14,
    color: colors.neutral900,
    backgroundColor: '#FFF',
 },
 addSlotText:{
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 10,
  letterSpacing: 0.5,
  color: colors.purple600,
 },
  addSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.purple50,
    borderWidth: 1.5,
    borderColor: colors.purple200,
    borderRadius: radius.full,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginLeft: 'auto',
  },

});
