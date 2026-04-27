import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Svg, { Path, Circle } from 'react-native-svg';

function IconHome({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={color} strokeWidth={1.8} strokeLinejoin="round"/>
      <Path d="M9 21V12h6v9" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    </Svg>
  );
}
function IconRoutes({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 17c0-1.1.9-2 2-2h14a2 2 0 010 4H5a2 2 0 01-2-2z" stroke={color} strokeWidth={1.8}/>
      <Path d="M3 7c0-1.1.9-2 2-2h8a2 2 0 010 4H5a2 2 0 01-2-2z" stroke={color} strokeWidth={1.8}/>
      <Circle cx="19" cy="7" r="2" stroke={color} strokeWidth={1.8}/>
    </Svg>
  );
}
function IconTrips({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-2" stroke={color} strokeWidth={1.8} strokeLinejoin="round"/>
      <Circle cx="7.5" cy="17.5" r="2.5" stroke={color} strokeWidth={1.8}/>
      <Circle cx="17.5" cy="17.5" r="2.5" stroke={color} strokeWidth={1.8}/>
    </Svg>
  );
}
function IconPayments({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 8h20M2 8v10a2 2 0 002 2h16a2 2 0 002-2V8M2 8V6a2 2 0 012-2h16a2 2 0 012 2v2" stroke={color} strokeWidth={1.8} strokeLinejoin="round"/>
      <Path d="M6 12h4" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    </Svg>
  );
}
function IconProfile({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={1.8}/>
      <Path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    </Svg>
  );
}

const TABS = [
  { name: 'index',      label: 'Início',     Icon: IconHome },
  { name: 'rotas',      label: 'Rotas',      Icon: IconRoutes },
  { name: 'viagens',    label: 'Viagens',    Icon: IconTrips },
  { name: 'pagamentos', label: 'Pagamentos', Icon: IconPayments },
  { name: 'perfil',     label: 'Perfil',     Icon: IconProfile },
];

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || 12 }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
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
              <tab.Icon color={color} size={21} />
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
