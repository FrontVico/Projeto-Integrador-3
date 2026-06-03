import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, TextInput } from 'react-native';
import { useEffect, useState, useRef, useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import type { AuthUser } from '../../hooks/useAuth';
import { veiculosService } from '../../services/api';

type Veiculo = {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  capacidade: number;
  status?: string;
};

interface Props {
  user: AuthUser;
}

export default function VeiculosPassageiroScreen({ user }: Props) {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchPlaca, setSearchPlaca] = useState('');
  const [searching, setSearching] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 520, useNativeDriver: true }),
    ]).start();
  };

  const loadVeiculos = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const data = await veiculosService.listar();
      setVeiculos(Array.isArray(data) ? data : []);
    } catch (exception) {
      setError((exception as Error).message || 'Não foi possível carregar os veículos.');
    } finally {
      setLoading(false);
      animateIn();
    }
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    loadVeiculos();
  }, [loadVeiculos]);

  const handleSearch = async () => {
    if (!searchPlaca.trim()) {
      loadVeiculos();
      return;
    }

    setError(null);
    setSearching(true);

    try {
      const data = await veiculosService.buscarPorPlaca(searchPlaca.trim().toUpperCase());
      setVeiculos(data ? [data] : []);
    } catch (exception) {
      setError((exception as Error).message || 'Falha ao buscar veículo por placa.');
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchPlaca('');
    loadVeiculos();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#0ea5e9" size="large" />
      </View>
    );
  }

  if (!user || user.role !== 'PASSAGEIRO') {
    return (
      <View style={styles.center}>
        <Text style={styles.lockTitle}>Acesso restrito</Text>
        <Text style={styles.lockSubtitle}>Somente passageiros podem acessar esta tela.</Text>
      </View>
    );
  }

  return (
    <Animated.ScrollView
      style={[styles.container, { opacity: fadeAnim }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={['#050a1e', '#07152f']} style={styles.hero}>
        <View style={styles.heroGlow} />
        <Text style={styles.heroLabel}>Veículos</Text>
        <Text style={styles.heroTitle}>Veículos para passageiros</Text>
        <Text style={styles.heroSubtitle}>Busque por placa e confira os veículos disponíveis no sistema.</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardBlue]}>
            <Text style={styles.statValue}>{veiculos.length}</Text>
            <Text style={styles.statLabel}>Veículos</Text>
          </View>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.body, { transform: [{ translateY: slideAnim }] }]}> 
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Buscar por placa</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={searchPlaca}
              onChangeText={setSearchPlaca}
              placeholder="Digite a placa"
              placeholderTextColor="#94a3b8"
              style={styles.input}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleSearch} activeOpacity={0.75} disabled={searching}>
              <Text style={styles.primaryButtonText}>{searching ? 'Buscando...' : 'Buscar'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleClearSearch} activeOpacity={0.75}>
            <Text style={styles.secondaryButtonText}>Mostrar todos</Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={[styles.messageCard, styles.errorCard]}>
            <Text style={styles.messageTitle}>Atenção</Text>
            <Text style={styles.messageText}>{error}</Text>
          </View>
        ) : null}

        {veiculos.length === 0 ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>Nenhum veículo encontrado</Text>
            <Text style={styles.messageText}>Use a busca para localizar um veículo pelo número da placa.</Text>
          </View>
        ) : (
          veiculos.map((veiculo) => (
            <View key={veiculo.placa} style={styles.routeCard}>
              <View style={styles.routeHeader}>
                <Text style={styles.routeTitle}>{veiculo.placa}</Text>
                <View style={styles.routeTag}>
                  <Text style={styles.routeTagText}>{veiculo.status ?? 'N/A'}</Text>
                </View>
              </View>
              <Text style={styles.routeDescription}>{veiculo.marca} {veiculo.modelo}</Text>
              <Text style={styles.messageText}>Ano: {veiculo.ano} • Capacidade: {veiculo.capacidade} passageiros</Text>
            </View>
          ))
        )}
      </Animated.View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060c22' },
  content: { paddingBottom: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#050a1e', padding: 28 },
  hero: { paddingTop: 56, paddingHorizontal: 24, paddingBottom: 26, position: 'relative', overflow: 'hidden' },
  heroGlow: { position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(37,99,235,0.16)' },
  heroLabel: { fontSize: 11, fontWeight: '700', color: '#38bdf8', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#f8fafc', marginBottom: 8, lineHeight: 34 },
  heroSubtitle: { fontSize: 14, color: '#94a3b8', lineHeight: 20, maxWidth: '90%' },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  statCard: { flex: 1, borderRadius: 18, padding: 16, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  statCardBlue: { borderColor: '#2563eb' },
  statValue: { fontSize: 24, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, color: '#94a3b8', marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.9 },
  body: { paddingHorizontal: 24, paddingTop: 20, gap: 16 },
  sectionCard: { borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)', padding: 18, gap: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#e2e8f0' },
  inputRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  input: { flex: 1, minHeight: 48, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)', color: '#fff', paddingHorizontal: 14, paddingVertical: 12 },
  primaryButton: { borderRadius: 16, backgroundColor: '#2563eb', paddingVertical: 14, alignItems: 'center' },
  secondaryButton: { borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { color: '#eff6ff', fontWeight: '700' },
  secondaryButtonText: { color: '#cbd5e1', fontWeight: '700' },
  messageCard: { borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)', padding: 18 },
  errorCard: { borderColor: 'rgba(239,68,68,0.25)', backgroundColor: 'rgba(239,68,68,0.08)' },
  messageTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 6 },
  messageText: { fontSize: 13, color: '#cbd5e1', lineHeight: 20 },
  routeCard: { borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)', padding: 20, gap: 16 },
  routeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routeTitle: { fontSize: 18, fontWeight: '800', color: '#f8fafc' },
  routeTag: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(37,99,235,0.15)' },
  routeTagText: { fontSize: 11, fontWeight: '700', color: '#7dd3fc' },
  routeDescription: { fontSize: 13, color: '#cbd5e1', lineHeight: 20 },
  lockTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 10, textAlign: 'center' },
  lockSubtitle: { fontSize: 14, lineHeight: 20, color: '#94a3b8', textAlign: 'center' },
});
