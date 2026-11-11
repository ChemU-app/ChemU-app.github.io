import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView, Switch, Image,
} from 'react-native';

import { tokenlessApi } from '../../lib/api';
import { alertLib } from '../../lib/alertLib';
import { ShadowButton, ScreenSurface } from '../../components/base';
import { colors, typeScale, screenPadding, radius } from '../../theme';
import Ionicons from "@react-native-vector-icons/ionicons";

export default function RecoverScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [rpassword, setRPassword] = useState('');
  const [password, setPassword] = useState('');
  const [recovery, setRecovery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const {temail, trole} = route.params;
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
   useEffect(() => {
	setEmail(temail)
	setRole(trole)
   },[])
  console.log("-----------------");
  console.log(email);
  console.log(role);
  const handleReset = async () => {
	if(!rpassword || !password || !recovery){
		alertLib('Missing fields', 'Please enter the recovery code and new password');
		return;
	}
	if(password.length < 8){
		alertLib('Password length', 'Please make sure the password is at least 8 characters long');
		return;
	}
	if(password != rpassword){
		alertLib('Password missmatch', 'Please make sure both password entries match');
		return;
	}
	try {
                const data = await tokenlessApi.post("/auth/reset", {email, role, recoveryCode: recovery, newPassword: password});
                console.log(data);
		} catch (err) {
                        alertLib("Failed recover", "make sure your email and role are correct")
			console.log(err);
                        return
                }
	navigation.navigate('Login');
  }

  
  return (
    <ScreenSurface>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / wordmark */}
        <View style={styles.logoArea}>
          <View style={styles.logoMark}>
            <Image source={require('../../assets/icon.png')} style={styles.logoImage} />
          </View>
          <Text style={styles.appName}>ChemU</Text>
          <Text style={styles.tagline}>Master chemistry, one section at a time.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
	  <Text style={[styles.fieldLabel, { marginBottom: 16 }]}>Recovery Passcode</Text>
          <TextInput
              style={styles.input}
              value={recovery}
              onChangeText={setRecovery}
              placeholder="Insert Recovery Passcode Here"
              placeholderTextColor={colors.neutral400}
              autoCapitalize="none"
              autoComplete="none"
            />
          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.neutral400}
	    secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
          />

          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Retype Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={rpassword}
              onChangeText={setRPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.neutral400}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
            />
            <Pressable onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.neutral400}
              />
            </Pressable>
          </View>

          <ShadowButton
            label={'Reset Password'}
            variant="primary"
            onPress={handleReset}
            style={{ marginTop: 24 }}
          />
        </View>
      </ScrollView>
    </ScreenSurface>
  );

}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: screenPadding.horizontal,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoMark: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  appName: {
    ...typeScale.display,
    color: colors.neutral900,
    marginBottom: 4,
  },
  tagline: {
    ...typeScale.body,
    color: colors.neutral600,
    textAlign: 'center',
  },
  roleRow: {
    flexDirection: 'row',
    backgroundColor: colors.neutral100,
    borderRadius: radius.lg,
    padding: 4,
    marginBottom: 28,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  roleBtnActive: {
    backgroundColor: '#FFF',
    shadowColor: colors.purple800,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  roleLabel: {
    ...typeScale.h3,
    color: colors.neutral400,
  },
  roleLabelActive: {
    color: colors.purple600,
  },
  form: {
    gap: 0,
  },
  fieldLabel: {
    ...typeScale.label,
    color: colors.neutral600,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.neutral200,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: colors.neutral900,
    backgroundColor: '#FFF',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyeBtn: {
    padding: 10,
  },
  stayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  stayLabel: {
    ...typeScale.body,
    color: colors.neutral600,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    ...typeScale.body,
    color: colors.neutral600,
  },
  footerLink: {
    ...typeScale.body,
    color: colors.purple600,
    fontFamily: 'Nunito_700Bold',
  },
});
