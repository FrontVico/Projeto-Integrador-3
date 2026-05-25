import {
  View, Text, StyleSheet,
  TouchableOpacity, Animated, ActivityIndicator, Dimensions,
  useWindowDimensions,
} from 'react-native';
import { useEffect, useRef, useState, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { rotasService, veiculosService, motoristasService, viagensService } from '../services/api';
import type { AuthUser } from '../hooks/useAuth';
import { QUICK_ACCESS_ITEMS } from '../constants/navigation';

const { width } = Dimensions.get('window');

interface Props { user: AuthUser }

const getResponsiveStyles = (screenWidth: number) => {
  const isSmall = screenWidth < 380;
  const isMedium = screenWidth < 768;
  
  return {
    heroPaddingTop: isSmall ? 50 : isMedium ? 56 : 64,
    heroPaddingHorizontal: isSmall ? 16 : 24,
    heroNameFontSize: isSmall ? 22 : isMedium ? 24 : 26,
    sectionLabelFontSize: isSmall ? 11 : 12,
    bodyPaddingHorizontal: isSmall ? 16 : 24,
    tileGap: isSmall ? 8 : 10,
    actionPadding: isSmall ? 12 : 18,
    tripPadding: isSmall ? 12 : 14,
    tripGap: isSmall ? 10 : 14,
    avatarSize: isSmall ? 40 : 46,
    avatarMarginLeft: isSmall ? 12 : 16,
  };
};

export default function DashboardAdmin({ user }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const responsiveStyles = useMemo(() => getResponsiveStyles(screenWidth), [screenWidth]);
  const [counts,  setCounts]  = useState({ rotas: 0, veiculos: 0, motoristas: 0, viagens: 0 });
  const [viagens, setViagens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;
  const cardAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function load() {
      try {
        const [r, ve, m, v] = await Promise.allSettled([
          rotasService.listar(),
          veiculosService.listar(),
          motoristasService.listar(),
          viagensService.listar(),
        ]);
        setCounts({
          rotas:      r.status  === 'fulfilled' ? (r.value  as any[]).length : 0,
          veiculos:   ve.status === 'fulfilled' ? (ve.value as any[]).length : 0,
          motoristas: m.status  === 'fulfilled' ? (m.value  as any[]).length : 0,
          viagens:    v.status  === 'fulfilled' ? (v.value  as any[]).length : 0,
        });
        if (v.status === 'fulfilled') setViagens((v.value as any[]).slice(0, 4));
      } finally {
        setLoading(false);
        Animated.stagger(100, [
          Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
          Animated.timing(cardAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#a78bfa" size="large" />
      </View>
    );
  }

  const STATS = [
    { label: 'Rotas',      value: counts.rotas,      icon: 'map-outline',      color: '#2563eb' },
    { label: 'Veículos',   value: counts.veiculos,   icon: 'bus-outline',      color: '#0ea5e9' },
    { label: 'Motoristas', value: counts.motoristas, icon: 'people-outline',   color: '#22c55e' },
    { label: 'Viagens',    value: counts.viagens,    icon: 'navigate-outline', color: '#f59e0b' },
  ];

  const ACTIONS = QUICK_ACCESS_ITEMS;

  return (
    <Animated.ScrollView
      style={{ flex: 1, opacity: fadeAnim, backgroundColor: '#060c22' }}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HERO HEADER ── */}
      <LinearGradient colors={['#100d28', '#070e28']} style={[styles.hero, {
        paddingTop: responsiveStyles.heroPaddingTop,
        paddingHorizontal: responsiveStyles.heroPaddingHorizontal,
      }]}>
        <View style={styles.glowCircle} />

        <Animated.View style={[styles.heroTop, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.heroText}>
            <View style={styles.roleTag}>
              <Ionicons name="flash-outline" size={12} color="#c4b5fd" />
              <Text style={styles.roleText}>Administrador</Text>
            </View>
            <Text style={[styles.heroName, { fontSize: responsiveStyles.heroNameFontSize }]}>Painel de controle</Text>
            <Text style={styles.heroSub}>Olá, {user.name.split(' ')[0]}! Visão geral do sistema.</Text>
          </View>
          <View style={[styles.avatar, {
            width: responsiveStyles.avatarSize,
            height: responsiveStyles.avatarSize,
            borderRadius: responsiveStyles.avatarSize / 2,
            marginLeft: responsiveStyles.avatarMarginLeft,
          }]}>
            <Text style={styles.avatarLetter}>{user.name[0].toUpperCase()}</Text>
          </View>
        </Animated.View>

        {/* Stats em linha horizontal */}
        <Animated.View style={[styles.statsStrip, { opacity: cardAnim }]}>
          {STATS.map((s, i) => (
            <View key={s.label} style={styles.statBlock}>
              {i > 0 && <View style={styles.statSep} />}
              <View style={styles.statInner}>
                <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statDesc}>{s.label}</Text>
              </View>
            </View>
          ))}
        </Animated.View>
      </LinearGradient>

      {/* ── CORPO ── */}
      <Animated.View style={[styles.body, { 
        transform: [{ translateY: slideAnim }],
        paddingHorizontal: responsiveStyles.bodyPaddingHorizontal,
      }]}>

        {/* ── Gestão rápida — grid 3x2 ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { fontSize: responsiveStyles.sectionLabelFontSize }]}>Gestão rápida</Text>
          <View style={[styles.actionsGrid, { gap: responsiveStyles.tileGap }]}>
            {ACTIONS.map((a) => (
              <TouchableOpacity
                key={a.label}
                style={[styles.actionTile, { padding: responsiveStyles.actionPadding }]}
                onPress={() => router.push(a.route as any)}
                activeOpacity={0.72}
              >
                <View style={[styles.actionIconBox, { backgroundColor: a.color + '1a' }]}>
                  <Ionicons name={a.icon as any} size={20} color={a.color} />
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Últimas viagens ── */}
        {viagens.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionLabel, { fontSize: responsiveStyles.sectionLabelFontSize }]}>Últimas viagens</Text>
              <TouchableOpacity onPress={() => router.push('/(main)/viagens' as any)}>
                <Text style={styles.seeAll}>Ver todas →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tripList}>
              {viagens.map((v: any, i: number) => {
                const cor =
                  v.status === 'CONCLUIDA'    ? '#22c55e' :
                  v.status === 'EM_ANDAMENTO' ? '#0ea5e9' :
                  v.status === 'CANCELADA'    ? '#ef4444' : '#f59e0b';
                return (
                  <View key={i} style={[styles.tripRow, { 
                    gap: responsiveStyles.tripGap,
                    paddingVertical: responsiveStyles.tripPadding,
                  }, i < viagens.length - 1 && styles.tripRowBorder]}>
                    {/* Indicador lateral colorido */}
                    <View style={[styles.tripBar, { backgroundColor: cor }]} />
                    <View style={styles.tripInfo}>
                      <Text style={styles.tripCode}>#{v.codigo ?? `VG00${i + 1}`}</Text>
                      <Text style={styles.tripDate}>{v.dataViagem ?? '—'}</Text>
                    </View>
                    <View style={[styles.tripBadge, { backgroundColor: cor + '22' }]}>
                      <Text style={[styles.tripStatus, { color: cor }]}>
                        {v.status ?? 'AGENDADA'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

      </Animated.View>
    </Animated.ScrollView>
  );
}

const TILE_W = (width - 48 - 20) / 3;

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#050a1e' },
  scroll: { paddingBottom: 48, backgroundColor: '#060c22' },

  // ── Hero ──
  hero: {
    paddingBottom: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  glowCircle: {
    position: 'absolute',
    top: -80, right: -80,
    width: 260, height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(167,139,250,0.12)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  heroText: { flex: 1, gap: 6 },

  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(167,139,250,0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(167,139,250,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  
  roleText:  { fontSize: 11, color: '#c4b5fd', fontWeight: '600', letterSpacing: 0.3 },
  heroName:  { fontWeight: '800', color: '#fff', letterSpacing: 0.2, lineHeight: 32 },
  heroSub:   { fontSize: 13, color: '#4a5a7a', fontWeight: '500' },

  avatar: {
    borderRadius: 23,
    backgroundColor: 'rgba(167,139,250,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(167,139,250,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  avatarLetter: { fontSize: 18, fontWeight: '700', color: '#c4b5fd' },

  // Stats strip
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 16,
    overflow: 'hidden',
  },
  statBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statSep: {
    width: 0.5,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  statInner: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statNum:  { fontSize: 22, fontWeight: '800' },
  statDesc: { fontSize: 10, color: '#4a5a7a', fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },

  // ── Body ──
  body: { paddingTop: 28, gap: 32 },

  section:    {},
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionLabel: { fontWeight: '700', color: '#4a5a7a', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14 },
  seeAll:     { fontSize: 13, color: '#a78bfa', fontWeight: '600' },

  // Actions grid 3 colunas
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionTile: {
    width: TILE_W,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 10,
  },
  actionIconBox: {
    width: 42, height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 12, color: '#c8d3e8', fontWeight: '600', textAlign: 'center' },

  // Trip list
  tripList: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  tripRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  tripBar:    { width: 3, height: 36, borderRadius: 2 },
  tripInfo:   { flex: 1, gap: 4 },
  tripCode:   { fontSize: 14, fontWeight: '700', color: '#f1f5f9' },
  tripDate:   { fontSize: 12, color: '#4a5a7a' },
  tripBadge:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tripStatus: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
});
