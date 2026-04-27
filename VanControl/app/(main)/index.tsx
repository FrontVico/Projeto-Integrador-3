import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import DashboardPassageiro from '../../components/DashboardPassageiro';
import DashboardMotorista  from '../../components/DashboardMotorista';
import DashboardAdmin      from '../../components/DashboardAdmin';

export default function DashboardScreen() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#050a1e' }}>
        <ActivityIndicator color="#2563eb" size="large" />
      </View>
    );
  }

  if (!user) return null;

  switch (user.role) {
    case 'ADMIN':     return <DashboardAdmin      user={user} />;
    case 'MOTORISTA': return <DashboardMotorista  user={user} />;
    default:          return <DashboardPassageiro user={user} />;
  }
}
