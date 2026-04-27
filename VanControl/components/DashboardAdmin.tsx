import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { rotasService, veiculosService, motoristasService, viagensService } from '../services/api';
import type { AuthUser } from '../hooks/useAuth';

interface Props { user: AuthUser }

export default function DashboardAdmin({ user }: Props) {
  const [counts,  setCounts]  = useState({ rotas: 0, veiculos: 0, motoristas: 0, viagens: 0 });
  const [viagens, setViagens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

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
        Animated.parallel([
          Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
      }
    }
    load();
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#a78bfa" size="large" /></View>;

  const STATS = [
    { label: 'Rotas',      value: counts.rotas,      icon: '🗺️', color: '#2563eb' },
    { label: 'Veículos',   value: counts.veiculos,   icon: '🚐', color: '#0ea5e9' },
    { label: 'Motoristas', value: counts.motoristas, icon: '👨‍✈️', color: '#22c55e' },
    { label: 'Viagens',    value: counts.viagens,    icon: '🛣️', color: '#f59e0b' },
  ];

  const ACTIONS = [
    { icon: '🗺️', label: 'Rotas',       route: '/(main)/rotas',      color: '#2563eb' },
    { icon: '🚐', label: 'Veículos',    route: '/(main)/rotas',      color: '#0ea5e9' },
    { icon: '👨‍✈️', label: 'Motoristas', route: '/(main)/rotas',      color: '#22c55e' },
    { icon: '🛣️', label: 'Viagens',     route: '/(main)/viagens',    color: '#f59e0b' },
    { icon: '💳', label: 'Pagamentos',  route: '/(main)/pagamentos', color: '#a78bfa' },
    { icon: '🎓', label: 'Passageiros', route: '/(main)/perfil',     color: '#f472b6' },
  ];

  return (
    <Animated.ScrollView style={{ opacity: fadeAnim }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#0d0a1f', '#050a1e']} style={styles.header}>
        <View style={styles.glowAccent} />
        <View style={styles.roleTag}><Text style={styles.roleText}>⚡ Administrador</Text></View>
        <Text style={styles.greeting}>Painel de controle</Text>
        <Text style={styles.headerSub}>Olá, {user.name.split(' ')[0]}! Visão geral do sistema.</Text>
      </LinearGradient>

      <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
        <Text style={styles.sectionTitle}>Resumo do sistema</Text>
        <View style={styles.statsGrid}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: s.color + '22' }]}>
                <Text style={styles.statIcon}>{s.icon}</Text>
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Gestão rápida</Text>
        <View style={styles.actionsGrid}>
          {ACTIONS.map((a) => (
            <TouchableOpacity key={a.label} style={styles.actionCard} onPress={() => router.push(a.route as any)} activeOpacity={0.75}>
              <View style={[styles.actionIconWrap, { backgroundColor: a.color + '22' }]}>
                <Text style={styles.actionIcon}>{a.icon}</Text>
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {viagens.length > 0 && (
          <>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Últimas viagens</Text>
              <TouchableOpacity onPress={() => router.push('/(main)/viagens' as any)}>
                <Text style={styles.seeAll}>Ver todas →</Text>
              </TouchableOpacity>
            </View>
            {viagens.map((v: any, i: number) => (
              <View key={i} style={styles.tripCard}>
                <View style={styles.tripLeft}>
                  <Text style={styles.tripCode}>#{v.codigo ?? `VG00${i + 1}`}</Text>
                  <Text style={styles.tripDate}>{v.dataViagem ?? '—'}</Text>
                </View>
                <View style={[styles.tripBadge, { backgroundColor: v.status === 'CONCLUIDA' ? 'rgba(34,197,94,0.15)' : v.status === 'EM_ANDAMENTO' ? 'rgba(14,165,233,0.15)' : v.status === 'CANCELADA' ? 'rgba(239,68,68,0.15)' : 'rgba(251,191,36,0.15)' }]}>
                  <Text style={[styles.tripStatus, { color: v.status === 'CONCLUIDA' ? '#22c55e' : v.status === 'EM_ANDAMENTO' ? '#0ea5e9' : v.status === 'CANCELADA' ? '#ef4444' : '#f59e0b' }]}>{v.status ?? 'AGENDADA'}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </Animated.View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#050a1e' },
  scroll:        { paddingBottom: 40, backgroundColor: '#060c22' },
  header:        { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 28, position: 'relative', overflow: 'hidden' },
  glowAccent:    { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(167,139,250,0.12)' },
  roleTag:       { alignSelf: 'flex-start', backgroundColor: 'rgba(167,139,250,0.15)', borderWidth: 0.5, borderColor: 'rgba(167,139,250,0.4)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 12 },
  roleText:      { fontSize: 12, color: '#c4b5fd', fontWeight: '600' },
  greeting:      { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSub:     { fontSize: 14, color: '#64748b' },
  sectionTitle:  { fontSize: 15, fontWeight: '700', color: '#e2e8f0', marginBottom: 12, paddingHorizontal: 24, marginTop: 8 },
  rowBetween:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginTop: 8 },
  seeAll:        { fontSize: 13, color: '#a78bfa', fontWeight: '600' },
  statsGrid:     { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  statCard:      { width: '46%', marginHorizontal: '2%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.09)', padding: 16, alignItems: 'center', gap: 8 },
  statIconWrap:  { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statIcon:      { fontSize: 22 },
  statValue:     { fontSize: 28, fontWeight: '800', color: '#fff' },
  statLabel:     { fontSize: 12, color: '#64748b', fontWeight: '500' },
  actionsGrid:   { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  actionCard:    { width: '29%', marginHorizontal: '1.8%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.09)', padding: 14, alignItems: 'center', gap: 8 },
  actionIconWrap:{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionIcon:    { fontSize: 20 },
  actionLabel:   { fontSize: 11, color: '#cbd5e1', fontWeight: '600', textAlign: 'center' },
  tripCard:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 24, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.09)', padding: 14 },
  tripLeft:      { gap: 4 },
  tripCode:      { fontSize: 14, fontWeight: '700', color: '#f1f5f9' },
  tripDate:      { fontSize: 12, color: '#64748b' },
  tripBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tripStatus:    { fontSize: 12, fontWeight: '600' },
});
    