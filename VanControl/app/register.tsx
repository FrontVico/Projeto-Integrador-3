import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { authService } from '../services/api';

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  cpf: string;
  telefone: string;
  instituicaoEnsino: string;
  turno: string;
  endereco: string;
  cep: string;
};

const EMPTY_FORM: RegisterForm = {
  name: '',
  email: '',
  password: '',
  cpf: '',
  telefone: '',
  instituicaoEnsino: '',
  turno: '',
  endereco: '',
  cep: '',
};

const TURNO_OPTIONS = ['Manhã', 'Tarde', 'Noite'] as const;

export default function RegisterScreen() {
  const [form, setForm] = useState<RegisterForm>(EMPTY_FORM);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start(() => {
      Animated.timing(formAnim, { toValue: 1, duration: 500, delay: 100, useNativeDriver: true }).start();
    });
  }, []);

  function onlyDigits(value: string) {
    return value.replace(/\D/g, '');
  }

  function formatCpf(value: string) {
    const digits = onlyDigits(value).slice(0, 11);
    const part1 = digits.slice(0, 3);
    const part2 = digits.slice(3, 6);
    const part3 = digits.slice(6, 9);
    const part4 = digits.slice(9, 11);
    let formatted = part1;
    if (part2) formatted += `.${part2}`;
    if (part3) formatted += `.${part3}`;
    if (part4) formatted += `-${part4}`;
    return formatted;
  }

  function formatTelefone(value: string) {
    const digits = onlyDigits(value).slice(0, 11);
    const ddd = digits.slice(0, 2);
    const part1 = digits.length > 10 ? digits.slice(2, 7) : digits.slice(2, 6);
    const part2 = digits.length > 10 ? digits.slice(7, 11) : digits.slice(6, 10);
    let formatted = ddd ? `(${ddd}` : '';
    if (ddd.length === 2) formatted += ') ';
    if (part1) formatted += part1;
    if (part2) formatted += `-${part2}`;
    return formatted;
  }

  function updateField<K extends keyof RegisterForm>(key: K, value: RegisterForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError('');
  }

  function shakeError() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
    Animated.timing(errorAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }

  function validateForm(data: RegisterForm): string | null {
    const required: Array<keyof RegisterForm> = [
      'name',
      'email',
      'password',
      'cpf',
      'telefone',
      'instituicaoEnsino',
      'turno',
      'endereco',
      'cep',
    ];

    for (const key of required) {
      if (!data[key].trim()) return 'Preencha todos os campos.';
    }

    if (!/\S+@\S+\.[A-Za-z]{2,}/.test(data.email)) return 'E-mail invalido.';
    if (onlyDigits(data.cpf).length !== 11) return 'CPF invalido.';

    const telefoneDigits = onlyDigits(data.telefone);
    if (telefoneDigits.length < 10 || telefoneDigits.length > 11) return 'Telefone invalido.';

    return null;
  }

  async function handleRegister() {
    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      shakeError();
      return;
    }

    setLoading(true);
    setError('');
    errorAnim.setValue(0);

    try {
      await authService.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        cpf: onlyDigits(form.cpf),
        telefone: formatTelefone(form.telefone),
        instituicaoEnsino: form.instituicaoEnsino.trim(),
        turno: form.turno.trim(),
        endereco: form.endereco.trim(),
        cep: form.cep.trim(),
      });
      router.replace('/(main)');
    } catch (err: any) {
      setError(err.message ?? 'Nao foi possivel cadastrar.');
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
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backIcon}>{'<-'}</Text>
            </TouchableOpacity>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>VanControl</Text>
            </View>
            <Text style={styles.title}>Crie sua conta</Text>
            <Text style={styles.subtitle}>Preencha os dados para continuar</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.form,
              {
                opacity: formAnim,
                transform: [
                  { translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                  { translateX: shakeAnim },
                ],
              },
            ]}
          >
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nome completo</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>@</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Seu nome"
                  placeholderTextColor="#3d4a6b"
                  value={form.name}
                  onChangeText={(t) => updateField('name', t)}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-mail</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>@</Text>
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor="#3d4a6b"
                  value={form.email}
                  onChangeText={(t) => updateField('email', t)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>#</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#3d4a6b"
                  value={form.password}
                  onChangeText={(t) => updateField('password', t)}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass((v) => !v)} style={styles.eyeBtn}>
                  <Text style={styles.eyeIcon}>{showPass ? 'X' : 'O'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>CPF</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>#</Text>
                <TextInput
                  style={styles.input}
                  placeholder="00000000000"
                  placeholderTextColor="#3d4a6b"
                  value={formatCpf(form.cpf)}
                  onChangeText={(t) => updateField('cpf', onlyDigits(t))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Telefone</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>#</Text>
                <TextInput
                  style={styles.input}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor="#3d4a6b"
                  value={formatTelefone(form.telefone)}
                  onChangeText={(t) => updateField('telefone', onlyDigits(t))}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Instituicao de ensino</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>@</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Sua instituicao"
                  placeholderTextColor="#3d4a6b"
                  value={form.instituicaoEnsino}
                  onChangeText={(t) => updateField('instituicaoEnsino', t)}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Turno</Text>
              <View style={styles.turnoRow}>
                {TURNO_OPTIONS.map((option) => {
                  const selected = option === form.turno;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.turnoOption, selected && styles.turnoOptionActive]}
                      onPress={() => updateField('turno', option)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.turnoText, selected && styles.turnoTextActive]}>{option}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Endereco</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>@</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Rua, numero, bairro"
                  placeholderTextColor="#3d4a6b"
                  value={form.endereco}
                  onChangeText={(t) => updateField('endereco', t)}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>CEP</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>#</Text>
                <TextInput
                  style={styles.input}
                  placeholder="00000-000"
                  placeholderTextColor="#3d4a6b"
                  value={form.cep}
                  onChangeText={(t) => updateField('cep', t)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {error ? (
              <Animated.View style={[styles.errorBox, { opacity: errorAnim }]}>
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            ) : null}

            <TouchableOpacity onPress={handleRegister} activeOpacity={0.85} disabled={loading} style={{ marginTop: 8 }}>
              <LinearGradient
                colors={loading ? ['#1a2a4a', '#1a2a4a'] : ['#2563eb', '#1953c0', '#1240a0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login')}>
              <Text style={styles.loginText}>
                Ja tem conta? <Text style={styles.loginLink}>Entrar</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 60, maxWidth: 520, alignSelf: 'center', width: '100%' },
  glowTopRight: { position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(25,83,192,0.15)' },
  glowBottomLeft: { position: 'absolute', bottom: 40, left: -80, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(37,99,235,0.08)' },
  header: { marginBottom: 28 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  backIcon: { color: '#fff', fontSize: 16 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(37,99,235,0.15)', borderWidth: 0.5, borderColor: 'rgba(37,99,235,0.4)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 16 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2563eb' },
  badgeText: { fontSize: 12, color: '#60a5fa', fontWeight: '600', letterSpacing: 0.5 },
  title: { fontSize: 30, fontWeight: '800', color: '#ffffff', lineHeight: 38, marginBottom: 6, letterSpacing: 0.3 },
  subtitle: { fontSize: 15, color: '#64748b', lineHeight: 22 },
  form: { gap: 18 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#94a3b8', letterSpacing: 0.3 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingHorizontal: 14, height: 54, gap: 10 },
  inputIcon: { fontSize: 16, color: '#94a3b8' },
  input: { flex: 1, color: '#f1f5f9', fontSize: 15, height: '100%' },
  turnoRow: { flexDirection: 'row', gap: 10 },
  turnoOption: { flex: 1, height: 48, borderRadius: 12, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center' },
  turnoOptionActive: { borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.12)' },
  turnoText: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  turnoTextActive: { color: '#93c5fd' },
  eyeBtn: { padding: 4 },
  eyeIcon: { fontSize: 12, color: '#94a3b8' },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 0.5, borderColor: 'rgba(239,68,68,0.35)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  errorText: { color: '#fca5a5', fontSize: 13, fontWeight: '500' },
  button: { paddingVertical: 17, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: '#1953c0', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 2 },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { fontSize: 13, color: '#3d4a6b', fontWeight: '500' },
  loginBtn: { alignItems: 'center', paddingVertical: 4 },
  loginText: { fontSize: 14, color: '#64748b' },
  loginLink: { color: '#60a5fa', fontWeight: '700' },
});
