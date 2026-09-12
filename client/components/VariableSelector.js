import React, {useState} from 'react';
import {Text, Modal, Pressable, FlatList, View, StyleSheet,
	ScrollView,
} from 'react-native';
import { colors, typeScale, screenPadding, radius } from '../theme';
import Ionicons from "@react-native-vector-icons/ionicons";

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

function VarItem({text, setText, index, type}){
 switch(type){
 case "NA":{
  return <></>;
 }
 case "Number":{
 return (
  <Segment>
   <Text>[{index}] {type}</Text>
   <SideScroll>
    <Pressable onPress={()=>{
     setText(text + `[${index}.number]`);
     }}style={styles.addSlotBtn}
    >
     <Text>Use Number</Text>
    </Pressable>
   </SideScroll>
  </Segment>
 )
 }
 case "Element":{
 return (
  <Segment>
   <Text>[{index}] {type}</Text>
    <SideScroll>
    <Pressable onPress={()=>{
     setText(text + `[${index}.name]`);
    }}style={styles.addSlotBtn}>
     <Text>Name</Text>
    </Pressable>
    <Pressable onPress={()=>{
     setText(text + `[${index}.symbol]`);
    }}style={styles.addSlotBtn}>
     <Text>Symbol</Text>
    </Pressable>

    <Pressable onPress={()=>{
     setText(text + `[${index}.atomicNumber]`);
    }}style={styles.addSlotBtn}>
     <Text>Atomic Number</Text>
    </Pressable>
    <Pressable onPress={()=>{
     setText(text + `[${index}.neutrons]`);
    }}style={styles.addSlotBtn}>
     <Text>Neutrons</Text>
    </Pressable>
    <Pressable onPress={()=>{
     setText(text + `[${index}.protons]`);
    }}style={styles.addSlotBtn}>
     <Text>Protons</Text>
    </Pressable>
    <Pressable onPress={()=>{
     setText(text + `[${index}.electrons]`);
    }}style={styles.addSlotBtn}>
     <Text>Electrons</Text>
    </Pressable>
    <Pressable onPress={()=>{
     setText(text + `[${index}.molarMass]`);
    }}style={styles.addSlotBtn}>
     <Text>Molar Mass</Text>
    </Pressable>

    <Pressable onPress={()=>{
     setText(text + `[${index}.charge]`);
    }} style={styles.addSlotBtn} >
     <Text>Charge</Text>
    </Pressable>
    <Pressable onPress={()=>{
     setText(text + `[${index}.chargeElectrons]`);
    }} style={styles.addSlotBtn}>
     <Text>Charge Electrons</Text>
    </Pressable>
    </SideScroll>
  </Segment>
 )}
 default:{
  return <Segment>
   <Text>[{index}] {type}</Text>
  </Segment>
 }
 }
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
   <FlatList
    data={vars}

    renderItem={({item})=>{
     return(
      <VarItem text={textBox} setText={setTextBox} index={item.index} type={item.type}/>
     );
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
