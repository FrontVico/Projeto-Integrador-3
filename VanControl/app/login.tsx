import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Animated, StatusBar, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { authService } from '../services/api';

export default function LoginScreen() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [emailFocus,    setEmailFocus]    = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const formAnim  = useRef(new Animated.Value(0)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start(() => {
      Animated.timing(formAnim, { toValue: 1, duration: 500, delay: 100, useNativeDriver: true }).start();
    });
  }, []);

  function shakeError() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 60, useNativeDriver: true }),
    ]).start();
    Animated.timing(errorAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Preencha e-mail e senha.');
      shakeError();
      return;
    }
    setLoading(true);
    setError('');
    errorAnim.setValue(0);
    try {
      await authService.login(email.trim(), password);
      router.replace('/(main)');
    } catch (err: any) {
      setError(err.message ?? 'E-mail ou senha inválidos.');
      shakeError();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#050a1e', '#080f28', '#0a1235']} style={StyleSheet.absoluteFill} />
      <View style={styles.glowTopRight} />
      <View style={styles.glowBottomLeft} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>VanControl</Text>
            </View>
            <Text style={styles.title}>Bem-vindo{'\n'}de volta 👋</Text>
            <Text style={styles.subtitle}>Entre com sua conta para continuar</Text>
          </Animated.View>

          <Animated.View style={[styles.form, {
            opacity: formAnim,
            transform: [
              { translateY: formAnim.interpolate({ inputRange: [0,1], outputRange: [20,0] }) },
              { translateX: shakeAnim },
            ],
          }]}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-mail</Text>
              <View style={[styles.inputWrap, emailFocus && styles.inputWrapFocus]}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor="#3d4a6b"
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Senha</Text>
              </View>
              <View style={[styles.inputWrap, passwordFocus && styles.inputWrapFocus]}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#3d4a6b"
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(''); }}
                  secureTextEntry={!showPass}
                  onFocus={() => setPasswordFocus(true)}
                  onBlur={() => setPasswordFocus(false)}
                />
                <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn}>
                  <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {error ? (
              <Animated.View style={[styles.errorBox, { opacity: errorAnim }]}>
                <Text style={styles.errorText}>⚠️  {error}</Text>
              </Animated.View>
            ) : null}

            <TouchableOpacity onPress={handleLogin} activeOpacity={0.85} disabled={loading} style={{ marginTop: 8 }}>
              <LinearGradient
                colors={loading ? ['#1a2a4a', '#1a2a4a'] : ['#2563eb', '#1953c0', '#1240a0']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.buttonText}>Entrar</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/register')}>
              <Text style={styles.registerText}>
                Não tem conta? <Text style={styles.registerLink}>Cadastre-se</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll:         { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 60, maxWidth: 480, alignSelf: 'center', width: '100%' },
  glowTopRight:   { position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(25,83,192,0.15)' },
  glowBottomLeft: { position: 'absolute', bottom: 40, left: -80, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(37,99,235,0.08)' },
  header:         { marginBottom: 36 },
  backBtn:        { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  backIcon:       { color: '#fff', fontSize: 18 },
  badge:          { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(37,99,235,0.15)', borderWidth: 0.5, borderColor: 'rgba(37,99,235,0.4)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 16 },
  badgeDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2563eb' },
  badgeText:      { fontSize: 12, color: '#60a5fa', fontWeight: '600', letterSpacing: 0.5 },
  title:          { fontSize: 32, fontWeight: '800', color: '#ffffff', lineHeight: 40, marginBottom: 8, letterSpacing: 0.3 },
  subtitle:       { fontSize: 15, color: '#64748b', lineHeight: 22 },
  form:           { gap: 20 },
  fieldGroup:     { gap: 8 },
  label:          { fontSize: 13, fontWeight: '600', color: '#94a3b8', letterSpacing: 0.3 },
  labelRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inputWrap:      { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingHorizontal: 14, height: 54, gap: 10 },
  inputWrapFocus: { borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.07)' },
  inputIcon:      { fontSize: 16 },
  input:          { flex: 1, color: '#f1f5f9', fontSize: 15, height: '100%' },
  eyeBtn:         { padding: 4 },
  eyeIcon:        { fontSize: 16 },
  errorBox:       { backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 0.5, borderColor: 'rgba(239,68,68,0.35)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  errorText:      { color: '#fca5a5', fontSize: 13, fontWeight: '500' },
  button:         { paddingVertical: 17, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: '#1953c0', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  buttonText:     { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  divider:        { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 },
  dividerLine:    { flex: 1, height: 0.5, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText:    { fontSize: 13, color: '#3d4a6b', fontWeight: '500' },
  registerBtn:    { alignItems: 'center', paddingVertical: 4 },
  registerText:   { fontSize: 14, color: '#64748b' },
  registerLink:   { color: '#60a5fa', fontWeight: '700' },
});
