import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import VeiculosMotoristaScreen from './veiculosMotorista';
import VeiculosPassageiroScreen from './veiculosPassageiro';

export default function VeiculosScreen() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#0ea5e9" size="large" />
      </View>
    );
  }

  if (!user) return null;

  if (user.role === 'MOTORISTA' || user.role === 'ADMIN') return <VeiculosMotoristaScreen user={user} />;
  if (user.role === 'PASSAGEIRO') return <VeiculosPassageiroScreen user={user} />;

  return (
    <View style={styles.center}>
      <Text style={styles.lockTitle}>Acesso restrito</Text>
      <Text style={styles.lockSubtitle}>Sua conta não tem permissão para visualizar esta área.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#050a1e', padding: 28 },
  lockTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 10, textAlign: 'center' },
  lockSubtitle: { fontSize: 14, lineHeight: 20, color: '#94a3b8', textAlign: 'center' },
});
