import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { motoristasService, viagensService, veiculosService } from '../services/api';
import type { AuthUser } from '../hooks/useAuth';

interface Props { user: AuthUser }

export default function DashboardMotorista({ user }: Props) {
  const [motorista, setMotorista] = useState<any>(null);
  const [viagens,   setViagens]   = useState<any[]>([]);
  const [veiculos,  setVeiculos]  = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    async function load() {
      try {
        const [m, v, ve] = await Promise.allSettled([
          motoristasService.buscarPorCpf(user.sub),
          viagensService.listar(),
          veiculosService.listar(),
        ]);
        if (m.status  === 'fulfilled') setMotorista(m.value);
        if (v.status  === 'fulfilled') setViagens((v.value as any[]).slice(0, 3));
        if (ve.status === 'fulfilled') setVeiculos((ve.value as any[]).slice(0, 2));
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

  if (loading) return <View style={styles.center}><ActivityIndicator color="#0ea5e9" size="large" /></View>;

  const viagensHoje = viagens.filter((v: any) => v.dataViagem?.startsWith(new Date().toISOString().split('T')[0]));

  return (
    <Animated.ScrollView style={{ opacity: fadeAnim }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#071428', '#050a1e']} style={styles.header}>
        <View style={styles.glowAccent} />
        <View style={styles.roleTag}><Text style={styles.roleText}>🚐 Motorista</Text></View>
        <Text style={styles.greeting}>Olá, {user.name.split(' ')[0]}!</Text>
        <Text style={styles.headerSub}>Sua jornada de hoje</Text>
        <View style={styles.statsRow}>
          <LinearGradient colors={['rgba(14,165,233,0.2)', 'rgba(14,165,233,0.05)']} style={styles.statCard}>
            <Text style={styles.statValue}>{viagensHoje.length}</Text>
            <Text style={styles.statLabel}>Viagens hoje</Text>
          </LinearGradient>
          <LinearGradient colors={['rgba(34,197,94,0.2)', 'rgba(34,197,94,0.05)']} style={styles.statCard}>
            <Text style={styles.statValue}>{veiculos.length}</Text>
            <Text style={styles.statLabel}>Veículos</Text>
          </LinearGradient>
          <LinearGradient colors={['rgba(251,191,36,0.2)', 'rgba(251,191,36,0.05)']} style={styles.statCard}>
            <Text style={styles.statValue}>{viagens.length}</Text>
            <Text style={styles.statLabel}>Total viagens</Text>
          </LinearGradient>
        </View>
      </LinearGradient>

      <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
        <Text style={styles.sectionTitle}>Ações rápidas</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: '🛣️', label: 'Viagens',    route: '/(main)/viagens',    color: '#0ea5e9' },
            { icon: '🚐', label: 'Veículos',   route: '/(main)/rotas',      color: '#22c55e' },
            { icon: '💳', label: 'Pagamentos', route: '/(main)/pagamentos', color: '#f59e0b' },
            { icon: '👤', label: 'Meu Perfil', route: '/(main)/perfil',     color: '#a78bfa' },
          ].map((a) => (
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
              <Text style={styles.sectionTitle}>Próximas viagens</Text>
              <TouchableOpacity onPress={() => router.push('/(main)/viagens' as any)}>
                <Text style={styles.seeAll}>Ver todas →</Text>
              </TouchableOpacity>
            </View>
            {viagens.map((v: any, i: number) => (
              <View key={i} style={styles.tripCard}>
                <View style={styles.tripLeft}>
                  <Text style={styles.tripCode}>#{v.codigo ?? `VG${i + 1}`}</Text>
                  <Text style={styles.tripDate}>{v.dataViagem ?? '—'}</Text>
                </View>
                <View style={[styles.tripBadge, { backgroundColor: v.status === 'CONCLUIDA' ? 'rgba(34,197,94,0.15)' : v.status === 'EM_ANDAMENTO' ? 'rgba(14,165,233,0.15)' : 'rgba(251,191,36,0.15)' }]}>
                  <Text style={[styles.tripStatus, { color: v.status === 'CONCLUIDA' ? '#22c55e' : v.status === 'EM_ANDAMENTO' ? '#0ea5e9' : '#f59e0b' }]}>{v.status ?? 'AGENDADA'}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {motorista && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Sua habilitação</Text>
            <View style={styles.infoCard}>
              {[
                { label: 'CNH',          value: motorista.cnh },
                { label: 'Categoria',    value: motorista.categoriaCnh },
                { label: 'Validade CNH', value: motorista.dataValidadeCnh },
                { label: 'Telefone',     value: motorista.telefone },
              ].map((row) => row.value ? (
                <View key={row.label} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{row.label}</Text>
                  <Text style={styles.infoValue}>{row.value}</Text>
                </View>
              ) : null)}
            </View>
          </>
        )}
      </Animated.View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#050a1e' },
  scroll:        { paddingBottom: 40, backgroundColor: '#060c22' },
  header:        { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 0, position: 'relative', overflow: 'hidden' },
  glowAccent:    { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(14,165,233,0.12)' },
  roleTag:       { alignSelf: 'flex-start', backgroundColor: 'rgba(14,165,233,0.15)', borderWidth: 0.5, borderColor: 'rgba(14,165,233,0.4)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 12 },
  roleText:      { fontSize: 12, color: '#38bdf8', fontWeight: '600' },
  greeting:      { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSub:     { fontSize: 14, color: '#64748b', marginBottom: 24 },
  statsRow:      { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard:      { flex: 1, borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', padding: 14, alignItems: 'center', gap: 4 },
  statValue:     { fontSize: 22, fontWeight: '800', color: '#fff' },
  statLabel:     { fontSize: 11, color: '#64748b', textAlign: 'center' },
  sectionTitle:  { fontSize: 15, fontWeight: '700', color: '#e2e8f0', marginBottom: 12, paddingHorizontal: 24, marginTop: 8 },
  rowBetween:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginTop: 8 },
  seeAll:        { fontSize: 13, color: '#0ea5e9', fontWeight: '600' },
  actionsGrid:   { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  actionCard:    { width: '46%', marginHorizontal: '2%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.09)', padding: 18, alignItems: 'center', gap: 10 },
  actionIconWrap:{ width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionIcon:    { fontSize: 24 },
  actionLabel:   { fontSize: 13, color: '#cbd5e1', fontWeight: '600', textAlign: 'center' },
  tripCard:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 24, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.09)', padding: 14 },
  tripLeft:      { gap: 4 },
  tripCode:      { fontSize: 14, fontWeight: '700', color: '#f1f5f9' },
  tripDate:      { fontSize: 12, color: '#64748b' },
  tripBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tripStatus:    { fontSize: 12, fontWeight: '600' },
  infoCard:      { marginHorizontal: 24, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.09)', overflow: 'hidden' },
  infoRow:       { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.06)' },
  infoLabel:     { fontSize: 13, color: '#64748b' },
  infoValue:     { fontSize: 13, color: '#e2e8f0', fontWeight: '600' },
});
