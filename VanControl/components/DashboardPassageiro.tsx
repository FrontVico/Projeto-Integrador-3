import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, ActivityIndicator, Dimensions,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { passageirosService, pagamentosService, viagensService } from '../services/api';
import type { AuthUser } from '../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Props { user: AuthUser }

export default function DashboardPassageiro({ user }: Props) {
  const [passageiro, setPassageiro] = useState<any>(null);
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  const [viagens,    setViagens]    = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;
  const cardAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function load() {
      try {
        const [p, pg, v] = await Promise.allSettled([
          passageirosService.buscarPorCpf(user.sub),
          pagamentosService.meusPagamentos(),
          viagensService.listar(),
        ]);
        if (p.status  === 'fulfilled') setPassageiro(p.value);
        if (pg.status === 'fulfilled') setPagamentos((pg.value as any[]).slice(0, 3));
        if (v.status  === 'fulfilled') setViagens((v.value as any[]).slice(0, 2));
      } finally {
        setLoading(false);
        Animated.stagger(120, [
          Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
          Animated.timing(cardAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#2563eb" size="large" />
      </View>
    );
  }

  const pendentes = pagamentos.filter((p: any) => p.status === 'PENDENTE').length;

const ACTIONS = [
  { icon: 'map-outline', label: 'Rotas', route: '/(main)/rotas' },
  { icon: 'bus-outline', label: 'Viagens', route: '/(main)/viagens' },
  { icon: 'card-outline', label: 'Pagamentos', route: '/(main)/pagamentos' },
  { icon: 'person-outline', label: 'Perfil', route: '/(main)/perfil' },
];

  return (
    <Animated.ScrollView
      style={{ flex: 1, opacity: fadeAnim, backgroundColor: '#060c22' }}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HERO HEADER ── */}
      <LinearGradient colors={['#0d1a40', '#070e28']} style={styles.hero}>
        {/* Glow decorativo */}
        <View style={styles.glowCircle} />

        {/* Topo: saudação + avatar inicial */}
        <Animated.View style={[styles.heroTop, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.heroText}>
            <Text style={styles.heroLabel}>Bem-vindo de volta</Text>
            <Text style={styles.heroName}>{user.name.split(' ')[0]} 👋</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{user.name[0].toUpperCase()}</Text>
          </View>
        </Animated.View>

        {/* Card de status em linha horizontal elegante */}
        <Animated.View style={[styles.statsStrip, { opacity: cardAnim }]}>
          <View style={styles.statBlock}>
            <Text style={styles.statNum}>{pendentes}</Text>
            <Text style={styles.statDesc}>Pendentes</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statBlock}>
            <Text style={styles.statNum}>{viagens.length}</Text>
            <Text style={styles.statDesc}>Viagens</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statBlock}>
            <View style={styles.onlineDot} />
            <Text style={styles.statDesc}>Van ativa</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* ── CORPO ── */}
      <Animated.View style={[styles.body, { transform: [{ translateY: slideAnim }] }]}>

        {/* ── Ações rápidas em grid 2x2 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Acesso rápido</Text>
          <View style={styles.actionsGrid}>
            {ACTIONS.map((a, i) => (
              <TouchableOpacity
                key={a.label}
                style={styles.actionTile}
                onPress={() => router.push(a.route as any)}
                activeOpacity={0.72}
              >
                <View style={styles.actionIconBox}>
                  <Ionicons name={a.icon as any} size={22} color="#60a5fa" />
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Últimos pagamentos ── */}
        {pagamentos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>Pagamentos recentes</Text>
              <TouchableOpacity onPress={() => router.push('/(main)/pagamentos' as any)}>
                <Text style={styles.seeAll}>Ver todos →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.payCard}>
              {pagamentos.map((pg: any, i: number) => {
                const cor = pg.status === 'PAGO' ? '#22c55e' : pg.status === 'ATRASADO' ? '#ef4444' : '#f59e0b';
                return (
                  <View key={i} style={[styles.payRow, i < pagamentos.length - 1 && styles.payRowBorder]}>
                    <View style={[styles.payIndicator, { backgroundColor: cor }]} />
                    <View style={styles.payInfo}>
                      <Text style={styles.payComp}>{pg.competencia ?? '—'}</Text>
                      <Text style={[styles.payBadge, { color: cor }]}>{pg.status ?? '—'}</Text>
                    </View>
                    <Text style={styles.payValor}>
                      {pg.valor ? `R$ ${Number(pg.valor).toFixed(2)}` : '—'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Dados do passageiro ── */}
        {passageiro && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Seus dados</Text>
            <View style={styles.infoCard}>
              {[
                  {
                    label: 'Instituição',
                    value: passageiro.instituicaoEnsino ?? passageiro.intituicaoEnsino,
                    icon: 'school-outline'
                  },
                  {
                    label: 'Turno',
                    value: passageiro.turno,
                    icon: 'time-outline'
                  },
                  {
                    label: 'Telefone',
                    value: passageiro.telefone,
                    icon: 'call-outline'
                  },
                ]
              .filter(r => r.value).map((row, i, arr) => (
                <View key={row.label} style={[styles.infoRow, i < arr.length - 1 && styles.infoRowBorder]}>
                  <Ionicons
                  name={row.icon as any}
                  size={20}
                  color="#60a5fa"
                  style={{ width: 28, textAlign: 'center' }}
                  />  
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>{row.label}</Text>
                    <Text style={styles.infoValue}>{row.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

      </Animated.View>
    </Animated.ScrollView>
  );
}

const TILE = (width - 48 - 12) / 2; // 2 colunas com padding e gap

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#050a1e' },
  scroll: { paddingBottom: 48, backgroundColor: '#060c22' },

  // ── Hero ──
  hero: {
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  glowCircle: {
    position: 'absolute',
    top: -80, right: -80,
    width: 260, height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(37,99,235,0.14)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  heroText:  { gap: 4 },
  heroLabel: { fontSize: 13, color: '#4a5a7a', fontWeight: '500', letterSpacing: 0.5 },
  heroName:  { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },

  avatar: {
    width: 46, height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(37,99,235,0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(37,99,235,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 18, fontWeight: '700', color: '#60a5fa' },

  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.09)',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statBlock:  { flex: 1, alignItems: 'center', gap: 5 },
  statSep:    { width: 0.5, height: 32, backgroundColor: 'rgba(255,255,255,0.09)' },
  statNum:    { fontSize: 22, fontWeight: '800', color: '#fff' },
  statDesc:   { fontSize: 11, color: '#4a5a7a', fontWeight: '500', textAlign: 'center' },
  onlineDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },

  // ── Body ──
  body: { paddingHorizontal: 24, paddingTop: 28, gap: 32 },

  section:    {},
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionLabel:{ fontSize: 12, fontWeight: '700', color: '#4a5a7a', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14 },
  seeAll:     { fontSize: 13, color: '#2563eb', fontWeight: '600' },

  // ── Actions grid ──
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionTile: {
    width: TILE,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  actionIconBox: {
    width: 40, height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(37,99,235,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionEmoji: { fontSize: 20 },
  actionLabel: { fontSize: 13, color: '#c8d3e8', fontWeight: '600', flexShrink: 1 },

  // ── Pagamentos ──
  payCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  payRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  payIndicator: { width: 3, height: 36, borderRadius: 2 },
  payInfo:  { flex: 1, gap: 4 },
  payComp:  { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
  payBadge: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  payValor: { fontSize: 15, fontWeight: '800', color: '#f1f5f9' },

  // ── Info card ──
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  infoRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  infoIcon:  { fontSize: 18, width: 28, textAlign: 'center' },
  infoText:  { flex: 1, gap: 3 },
  infoLabel: { fontSize: 11, color: '#4a5a7a', fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  infoValue: { fontSize: 14, color: '#e2e8f0', fontWeight: '600' },
});
