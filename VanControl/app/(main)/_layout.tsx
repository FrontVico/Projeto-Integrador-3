import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import type { Role } from '../../constants/navigation';

const TABS = [
  { name: 'index',      label: 'Início',     iconName: 'home-outline',       allowedRoles: ['ADMIN', 'MOTORISTA', 'PASSAGEIRO'] as Role[] },
  { name: 'rotas',      label: 'Rotas',      iconName: 'map-outline',        allowedRoles: ['ADMIN', 'MOTORISTA', 'PASSAGEIRO'] as Role[] },
  { name: 'viagens',    label: 'Viagens',    iconName: 'navigate-outline',   allowedRoles: ['ADMIN', 'MOTORISTA', 'PASSAGEIRO'] as Role[] },
  { name: 'pagamentos', label: 'Pagamentos', iconName: 'card-outline',       allowedRoles: ['ADMIN', 'MOTORISTA', 'PASSAGEIRO'] as Role[] },
  { name: 'veiculos',   label: 'Veículos',   iconName: 'bus-outline',        allowedRoles: ['ADMIN', 'MOTORISTA'] as Role[] },
  { name: 'motoristas', label: 'Motoristas', iconName: 'people-outline',     allowedRoles: ['ADMIN'] as Role[] },
  { name: 'passageiros',label: 'Passageiros',iconName: 'school-outline',     allowedRoles: ['ADMIN'] as Role[] },
  { name: 'perfil',     label: 'Perfil',     iconName: 'person-outline',     allowedRoles: ['ADMIN', 'MOTORISTA', 'PASSAGEIRO'] as Role[] },
];

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  // Filtrar abas baseado na role do usuário
  const visibleRoutes = state.routes.filter((route) => {
    const tab = TABS.find(t => t.name === route.name);
    if (!tab) return true;
    if (!user?.role) return false;
    return tab.allowedRoles.includes(user.role);
  });
  
  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || 12 }]}>
      {visibleRoutes.map((route) => {
        const isFocused = state.index === state.routes.findIndex(r => r.key === route.key);
        const tab = TABS.find(t => t.name === route.name) ?? TABS[0];
        const color = isFocused ? '#2563eb' : '#64748b';
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <TouchableOpacity key={route.key} onPress={onPress} activeOpacity={0.7} style={styles.tabItem}>
            {isFocused && <View style={styles.activePill} />}
            <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
              <Ionicons name={tab.iconName as any} size={21} color={color} />
            </View>
            <Text style={[styles.tabLabel, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function MainLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index"      options={{ title: 'Início' }} />
      <Tabs.Screen name="rotas"      options={{ title: 'Rotas' }} />
      <Tabs.Screen name="viagens"    options={{ title: 'Viagens' }} />
      <Tabs.Screen name="pagamentos" options={{ title: 'Pagamentos' }} />
      <Tabs.Screen name="veiculos"   options={{ title: 'Veículos' }} />
      <Tabs.Screen name="motoristas" options={{ title: 'Motoristas' }} />
      <Tabs.Screen name="passageiros" options={{ title: 'Passageiros' }} />
      <Tabs.Screen name="perfil"     options={{ title: 'Perfil' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar:        { flexDirection: 'row', backgroundColor: 'rgba(8,14,36,0.97)', borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: 10, paddingHorizontal: 8, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.3, shadowRadius: 12 }, android: { elevation: 20 } }) },
  tabItem:       { flex: 1, alignItems: 'center', position: 'relative', paddingTop: 4, gap: 4 },
  activePill:    { position: 'absolute', top: -10, width: 32, height: 3, borderRadius: 2, backgroundColor: '#2563eb' },
  iconWrap:      { width: 40, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive:{ backgroundColor: 'rgba(37,99,235,0.15)' },
  tabLabel:      { fontSize: 10, fontWeight: '500', letterSpacing: 0.2 },
});
