import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, ActivityIndicator, Dimensions,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { motoristasService, viagensService, veiculosService } from '../services/api';
import type { AuthUser } from '../hooks/useAuth';

const { width } = Dimensions.get('window');

interface Props { user: AuthUser }

export default function DashboardMotorista({ user }: Props) {
  const [motorista, setMotorista] = useState<any>(null);
  const [viagens,   setViagens]   = useState<any[]>([]);
  const [veiculos,  setVeiculos]  = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;
  const cardAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function load() {
      try {
        const [m, v, ve] = await Promise.allSettled([
          motoristasService.buscarPorCpf(user.cpf || user.sub), // Mantido o ajuste do CPF!
          viagensService.listar(),
          veiculosService.listar(),
        ]);
        if (m.status  === 'fulfilled') setMotorista(m.value);
        if (v.status  === 'fulfilled') setViagens((v.value as any[]).slice(0, 3));
        if (ve.status === 'fulfilled') setVeiculos((ve.value as any[]).slice(0, 2));
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
  }, [user.cpf, user.sub]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#0ea5e9" size="large" />
      </View>
    );
  }

  const viagensHoje = viagens.filter((v: any) => v.dataViagem?.startsWith(new Date().toISOString().split('T')[0]));

  const STATS = [
    { label: 'Viagens Hoje', value: viagensHoje.length, color: '#0ea5e9' },
    { label: 'Veículos',     value: veiculos.length,    color: '#22c55e' },
    { label: 'Total Viagens',value: viagens.length,     color: '#f59e0b' },
  ];

  const ACTIONS = [
    { icon: 'map-outline',      label: 'Rotas',      route: '/(main)/rotas',             color: '#2563eb' },
    { icon: 'navigate-outline', label: 'Viagens',    route: '/(main)/viagens',            color: '#0ea5e9' },
    { icon: 'bus-outline',      label: 'Veículos',   route: '/(main)/veiculos',           color: '#22c55e' },
    { icon: 'reader-outline',   label: 'Meus Dados', route: '/(main)/motoristaMotorista', color: '#a78bfa' },
    { icon: 'card-outline',     label: 'Pagamentos', route: '/(main)/pagamentos',         color: '#f59e0b' },
    { icon: 'person-outline',   label: 'Meu Perfil', route: '/(main)/perfil',             color: '#f472b6' },
  ];

  return (
    <Animated.ScrollView
      style={{ flex: 1, opacity: fadeAnim, backgroundColor: '#060c22' }}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HERO HEADER ── */}
      <LinearGradient colors={['#100d28', '#070e28']} style={styles.hero}>
        <View style={styles.glowCircle} />

        <Animated.View style={[styles.heroTop, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.heroText}>
            <View style={styles.roleTag}>
              <Ionicons name="car-outline" size={12} color="#38bdf8" />
              <Text style={styles.roleText}>Motorista</Text>
            </View>
            <Text style={styles.heroName}>Painel do Motorista</Text>
            <Text style={styles.heroSub}>Olá, {user.name.split(' ')[0]}! Sua jornada de hoje.</Text>
          </View>
          <View style={styles.avatar}>
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
      <Animated.View style={[styles.body, { transform: [{ translateY: slideAnim }] }]}>

        {/* ── Ações Rápidas — grid 3x2 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ações rápidas</Text>
          <View style={styles.actionsGrid}>
            {ACTIONS.map((a) => (
              <TouchableOpacity
                key={a.label}
                style={styles.actionTile}
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

        {/* ── Próximas viagens ── */}
        {viagens.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>Próximas viagens</Text>
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
                  <View key={i} style={[styles.tripRow, i < viagens.length - 1 && styles.tripRowBorder]}>
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

        {/* ── Sua Habilitação ── */}
        {motorista && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Sua habilitação</Text>
            <View style={styles.tripList}>
              {[
                { label: 'CNH',          value: motorista.cnh },
                { label: 'Categoria',    value: motorista.categoriaCnh },
                { label: 'Validade CNH', value: motorista.dataValidadeCnh },
                { label: 'Telefone',     value: motorista.telefone },
              ].map((row, i, arr) => row.value ? (
                <View key={row.label} style={[styles.infoRow, i < arr.length - 1 && styles.tripRowBorder]}>
                  <Text style={styles.infoLabel}>{row.label}</Text>
                  <Text style={styles.infoValue}>{row.value}</Text>
                </View>
              ) : null)}
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
    backgroundColor: 'rgba(14,165,233,0.12)', // Tom de azul ajustado para o motorista
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
    backgroundColor: 'rgba(14,165,233,0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(14,165,233,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  
  roleText:  { fontSize: 11, color: '#38bdf8', fontWeight: '600', letterSpacing: 0.3 },
  heroName:  { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: 0.2, lineHeight: 32 },
  heroSub:   { fontSize: 13, color: '#4a5a7a', fontWeight: '500' },

  avatar: {
    width: 46, height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(14,165,233,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(14,165,233,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    marginTop: 20,
  },
  avatarLetter: { fontSize: 18, fontWeight: '700', color: '#38bdf8' },

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
  body: { paddingHorizontal: 24, paddingTop: 28, gap: 32 },

  section:    {},
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#4a5a7a', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14 },
  seeAll:     { fontSize: 13, color: '#0ea5e9', fontWeight: '600' },

  // Actions grid 3 colunas
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionTile: {
    width: TILE_W,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 18,
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

  // Trip list e InfoCard
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
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
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

  infoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  infoLabel: { fontSize: 13, color: '#64748b' },
  infoValue: { fontSize: 13, color: '#e2e8f0', fontWeight: '600' },
});