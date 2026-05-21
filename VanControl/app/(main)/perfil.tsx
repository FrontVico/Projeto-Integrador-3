import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, ActivityIndicator, Dimensions, Alert,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
 
const { width } = Dimensions.get('window');
 
type MenuItem = {
  icon: string;
  label: string;
  sub: string;
  route?: string;
  action?: () => void;
  color: string;
  danger?: boolean;
};
 
export default function PerfilAdmin() {
  const { user, loading } = useAuth();
 
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;
 
  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    }
  }, [loading]);
 
  function confirmLogout() {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            router.replace('/');
          },
        },
      ]
    );
  }
 
  const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Gerenciamento',
      items: [
        { icon: 'map-outline',      label: 'Rotas',       sub: 'Gerenciar rotas do sistema',    route: '/(main)/rotas',      color: '#2563eb' },
        { icon: 'bus-outline',      label: 'Veículos',    sub: 'Frota cadastrada',               route: '/(main)/rotas',      color: '#0ea5e9' },
        { icon: 'people-outline',   label: 'Motoristas',  sub: 'Equipe de motoristas',           route: '/(main)/rotas',      color: '#22c55e' },
        { icon: 'navigate-outline', label: 'Viagens',     sub: 'Histórico e andamento',          route: '/(main)/viagens',    color: '#f59e0b' },
        { icon: 'card-outline',     label: 'Pagamentos',  sub: 'Cobranças e recebimentos',       route: '/(main)/pagamentos', color: '#a78bfa' },
        { icon: 'school-outline',   label: 'Passageiros', sub: 'Alunos cadastrados no sistema',  route: '/(main)/perfil',     color: '#f472b6' },
      ],
    },
    {
      title: 'Conta',
      items: [
        { icon: 'shield-checkmark-outline', label: 'Segurança',     sub: 'Senha e autenticação',   color: '#64748b', route: undefined },
        { icon: 'notifications-outline',    label: 'Notificações',  sub: 'Preferências de alerta', color: '#64748b', route: undefined },
        { icon: 'information-circle-outline', label: 'Sobre o app', sub: 'VanControl v1.0.0',      color: '#64748b', route: undefined },
      ],
    },
    {
      title: 'Sessão',
      items: [
        { icon: 'log-out-outline', label: 'Sair da conta', sub: 'Encerrar sessão atual', color: '#ef4444', danger: true, action: confirmLogout },
      ],
    },
  ];
 
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#a78bfa" size="large" />
      </View>
    );
  }
 
  return (
    <Animated.ScrollView
      style={{ flex: 1, opacity: fadeAnim, backgroundColor: '#060c22' }}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HERO ── */}
      <LinearGradient colors={['#100d28', '#070e28']} style={styles.hero}>
        <View style={styles.glowCircle} />
        <View style={styles.glowCircle2} />
 
        <Animated.View style={[styles.heroContent, { transform: [{ translateY: slideAnim }] }]}>
          {/* Avatar grande */}
          <LinearGradient
            colors={['rgba(167,139,250,0.35)', 'rgba(167,139,250,0.1)']}
            style={styles.avatarRing}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>
                {user?.name?.[0]?.toUpperCase() ?? 'A'}
              </Text>
            </View>
          </LinearGradient>
 
          {/* Info */}
          <Text style={styles.heroName}>{user?.name ?? '—'}</Text>
          <Text style={styles.heroEmail}>{user?.email ?? '—'}</Text>
 
          {/* Badge de role */}
          <View style={styles.roleBadge}>
            <Ionicons name="flash-outline" size={11} color="#c4b5fd" />
            <Text style={styles.roleText}>Administrador</Text>
          </View>
        </Animated.View>
      </LinearGradient>
 
      {/* ── MENU SECTIONS ── */}
      <Animated.View style={[styles.body, { transform: [{ translateY: slideAnim }] }]}>
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionLabel}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuRow,
                    i < section.items.length - 1 && styles.menuRowBorder,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (item.action) { item.action(); return; }
                    if (item.route) router.push(item.route as any);
                  }}
                >
                  {/* Ícone */}
                  <View style={[styles.menuIconBox, { backgroundColor: item.color + '1a' }]}>
                    <Ionicons name={item.icon as any} size={18} color={item.color} />
                  </View>
 
                  {/* Texto */}
                  <View style={styles.menuText}>
                    <Text style={[styles.menuLabel, item.danger && { color: '#ef4444' }]}>
                      {item.label}
                    </Text>
                    <Text style={styles.menuSub}>{item.sub}</Text>
                  </View>
 
                  {/* Chevron */}
                  {!item.danger && (
                    <Ionicons name="chevron-forward" size={16} color="#2a3550" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
 
      </Animated.View>
    </Animated.ScrollView>
  );
}
 
const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#050a1e' },
  scroll: { paddingBottom: 48, backgroundColor: '#060c22' },
 
  // ── Hero ──
  hero: {
    paddingTop: 72,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  glowCircle: {
    position: 'absolute',
    top: -80, right: -80,
    width: 260, height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(167,139,250,0.13)',
  },
  glowCircle2: {
    position: 'absolute',
    bottom: -60, left: -60,
    width: 200, height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(37,99,235,0.08)',
  },
  heroContent: { alignItems: 'center', gap: 8 },
 
  avatarRing: {
    width: 88, height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.3)',
  },
  avatar: {
    width: 72, height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(167,139,250,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 30, fontWeight: '800', color: '#c4b5fd' },
 
  heroName:  { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: 0.2, marginTop: 4 },
  heroEmail: { fontSize: 13, color: '#4a5a7a', fontWeight: '500' },
 
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(167,139,250,0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(167,139,250,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 6,
  },
  roleText: { fontSize: 11, color: '#c4b5fd', fontWeight: '700', letterSpacing: 0.5 },
 
  // ── Body ──
  body: { paddingHorizontal: 24, paddingTop: 28, gap: 28 },
 
  section: {},
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4a5a7a',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
 
  menuCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  menuRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  menuIconBox: {
    width: 38, height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText:  { flex: 1, gap: 3 },
  menuLabel: { fontSize: 14, color: '#e2e8f0', fontWeight: '600' },
  menuSub:   { fontSize: 12, color: '#4a5a7a', fontWeight: '400' },
 
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: '#1e2d4a',
    fontWeight: '500',
    letterSpacing: 0.3,
    marginTop: 8,
  },
});