import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { passageirosService, pagamentosService, viagensService } from '../services/api';
import type { AuthUser } from '../hooks/useAuth';

interface Props { user: AuthUser }

export default function DashboardPassageiro({ user }: Props) {
  const [passageiro, setPassageiro] = useState<any>(null);
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  const [viagens,    setViagens]    = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

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
        Animated.parallel([
          Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
      }
    }
    load();
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#2563eb" size="large" /></View>;

  const pendentes = pagamentos.filter((p: any) => p.status === 'PENDENTE').length;

  return (
    <Animated.ScrollView style={{ opacity: fadeAnim }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#0a1235', '#050a1e']} style={styles.header}>
        <View style={styles.glowAccent} />
        <Text style={styles.greeting}>Olá, {user.name.split(' ')[0]} 👋</Text>
        <Text style={styles.headerSub}>Bom ter você de volta!</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>{pendentes}</Text>
            <Text style={styles.statusLabel}>Pagamentos{'\n'}pendentes</Text>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>{viagens.length}</Text>
            <Text style={styles.statusLabel}>Viagens{'\n'}disponíveis</Text>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusItem}>
            <View style={[styles.dot, { backgroundColor: '#22c55e' }]} />
            <Text style={styles.statusLabel}>Van{'\n'}ativa</Text>
          </View>
        </View>
      </LinearGradient>

      <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
        <Text style={styles.sectionTitle}>Ações rápidas</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: '🗺️', label: 'Ver Rotas',     route: '/(main)/rotas' },
            { icon: '🚐', label: 'Minhas Viagens', route: '/(main)/viagens' },
            { icon: '💳', label: 'Pagamentos',     route: '/(main)/pagamentos' },
            { icon: '👤', label: 'Meu Perfil',     route: '/(main)/perfil' },
          ].map((a) => (
            <TouchableOpacity key={a.label} style={styles.actionCard} onPress={() => router.push(a.route as any)} activeOpacity={0.75}>
              <Text style={styles.actionIcon}>{a.icon}</Text>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {pagamentos.length > 0 && (
          <>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Meus pagamentos</Text>
              <TouchableOpacity onPress={() => router.push('/(main)/pagamentos' as any)}>
                <Text style={styles.seeAll}>Ver todos →</Text>
              </TouchableOpacity>
            </View>
            {pagamentos.map((pg: any, i: number) => (
              <View key={i} style={styles.payRow}>
                <View style={[styles.payDot, { backgroundColor: pg.status === 'PAGO' ? '#22c55e' : pg.status === 'ATRASADO' ? '#ef4444' : '#f59e0b' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.payLabel}>Competência: {pg.competencia ?? '—'}</Text>
                  <Text style={styles.payStatus}>{pg.status ?? '—'}</Text>
                </View>
                <Text style={styles.payValue}>{pg.valor ? `R$ ${Number(pg.valor).toFixed(2)}` : '—'}</Text>
              </View>
            ))}
          </>
        )}

        {passageiro && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Seus dados</Text>
            <View style={styles.infoCard}>
              {[
                { label: 'Instituição', value: passageiro.instituicaoEnsino ?? passageiro.intituicaoEnsino },
                { label: 'Turno',       value: passageiro.turno },
                { label: 'Telefone',    value: passageiro.telefone },
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
  glowAccent:    { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(25,83,192,0.18)' },
  greeting:      { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSub:     { fontSize: 14, color: '#64748b', marginBottom: 24 },
  statusCard:    { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', padding: 20, marginBottom: 28, alignItems: 'center' },
  statusItem:    { flex: 1, alignItems: 'center', gap: 6 },
  statusDivider: { width: 0.5, height: 36, backgroundColor: 'rgba(255,255,255,0.1)' },
  statusValue:   { fontSize: 24, fontWeight: '800', color: '#fff' },
  statusLabel:   { fontSize: 11, color: '#64748b', textAlign: 'center', lineHeight: 15 },
  dot:           { width: 10, height: 10, borderRadius: 5 },
  sectionTitle:  { fontSize: 15, fontWeight: '700', color: '#e2e8f0', marginBottom: 12, paddingHorizontal: 24, marginTop: 8 },
  rowBetween:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginTop: 8 },
  seeAll:        { fontSize: 13, color: '#2563eb', fontWeight: '600' },
  actionsGrid:   { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  actionCard:    { width: '46%', marginHorizontal: '2%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.09)', padding: 18, alignItems: 'center', gap: 10 },
  actionIcon:    { fontSize: 26 },
  actionLabel:   { fontSize: 13, color: '#cbd5e1', fontWeight: '600', textAlign: 'center' },
  payRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.06)' },
  payDot:        { width: 8, height: 8, borderRadius: 4 },
  payLabel:      { fontSize: 13, color: '#94a3b8' },
  payStatus:     { fontSize: 12, color: '#64748b', marginTop: 2 },
  payValue:      { fontSize: 14, fontWeight: '700', color: '#f1f5f9' },
  infoCard:      { marginHorizontal: 24, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.09)', overflow: 'hidden' },
  infoRow:       { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.06)' },
  infoLabel:     { fontSize: 13, color: '#64748b' },
  infoValue:     { fontSize: 13, color: '#e2e8f0', fontWeight: '600' },
});
