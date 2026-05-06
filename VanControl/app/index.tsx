import { View, Text, StyleSheet, Image, TouchableOpacity, ImageBackground, Animated, Dimensions, StatusBar } from 'react-native';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const FEATURES = [
  { icon: '🗺️', label: 'Rotas em tempo real' },
  { icon: '🚐', label: 'Frota monitorada' },
  { icon: '💳', label: 'Pagamentos fáceis' },
];

export default function HomeScreen() {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const card3Anim = useRef(new Animated.Value(0)).current;
  const btnAnim   = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();
    Animated.timing(slideAnim, { toValue: 0, duration: 600, delay: 300, useNativeDriver: true }).start();
    Animated.stagger(120, [
      Animated.timing(card1Anim, { toValue: 1, duration: 500, delay: 600, useNativeDriver: true }),
      Animated.timing(card2Anim, { toValue: 1, duration: 500, delay: 600, useNativeDriver: true }),
      Animated.timing(card3Anim, { toValue: 1, duration: 500, delay: 600, useNativeDriver: true }),
    ]).start();
    Animated.timing(btnAnim, { toValue: 1, duration: 500, delay: 1050, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const cardAnims = [card1Anim, card2Anim, card3Anim];

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground
        source={require('../assets/images/backgroundHome.jpg')}
        style={styles.bg}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(5,10,30,0.55)', 'rgba(5,10,30,0.82)', 'rgba(5,10,30,0.97)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.glowAccent} />
        <View style={styles.container}>
          <Animated.View style={[styles.logoWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient colors={['rgba(25,83,192,0.3)', 'rgba(25,83,192,0)']} style={styles.logoGlow} />
            <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.title}>VanControl</Text>
            <Text style={styles.subtitle}>Transporte universitário inteligente</Text>
          </Animated.View>

          <View style={styles.cardsRow}>
            {FEATURES.map((f, i) => (
              <Animated.View key={f.label} style={[styles.card, {
                opacity: cardAnims[i],
                transform: [{ translateY: cardAnims[i].interpolate({ inputRange: [0,1], outputRange: [24,0] }) }],
              }]}>
                <Text style={styles.cardIcon}>{f.icon}</Text>
                <Text style={styles.cardLabel}>{f.label}</Text>
              </Animated.View>
            ))}
          </View>

          <Animated.View style={{ width: '100%', opacity: btnAnim, transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/register')}>
              <LinearGradient
                colors={['#2563eb', '#1953c0', '#1240a0']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Começar agora</Text>
                <Text style={styles.buttonArrow}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ opacity: btnAnim, flexDirection: 'row', gap: 6, marginTop: 20 }}>
            <Text style={styles.footerText}>Já tem conta?</Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.footerLink}>Entrar</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  bg:          { flex: 1, width: '100%', height: '100%' },
  glowAccent:  { position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(25,83,192,0.18)' },
  container:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 40, maxWidth: 480, alignSelf: 'center', width: '100%' },
  logoWrap:    { alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  logoGlow:    { position: 'absolute', width: 220, height: 220, borderRadius: 110 },
  logo:        { width: 160, height: 160 },
  title:       { fontSize: 36, fontWeight: '800', color: '#ffffff', textAlign: 'center', letterSpacing: 0.5, marginBottom: 8 },
  subtitle:    { fontSize: 15, color: '#94a3b8', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  cardsRow:    { flexDirection: 'row', gap: 10, marginBottom: 36, width: '100%' },
  card:        { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.13)', paddingVertical: 16, paddingHorizontal: 8, alignItems: 'center', gap: 8 },
  cardIcon:    { fontSize: 22 },
  cardLabel:   { fontSize: 11, color: '#cbd5e1', textAlign: 'center', fontWeight: '500', lineHeight: 15 },
  button:      { width: '100%', paddingVertical: 17, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#1953c0', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 16, elevation: 10 },
  buttonText:  { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  buttonArrow: { color: '#93c5fd', fontSize: 18, fontWeight: '700' },
  footerText:  { color: '#64748b', fontSize: 14 },
  footerLink:  { color: '#60a5fa', fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
});
