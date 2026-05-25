import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks/useAuth';
import { passageirosService } from '../../services/api';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, RESPONSIVE } from '../../constants/colors';
import { LoadingSpinner, EmptyState, PageHeader } from '../../components/ui/CommonComponents';

export default function PassageirosScreen() {
  const { user } = useAuth();
  const [passageiros, setPassageiros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(32)).current;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    }
  }, [loading]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user?.role === 'PASSAGEIRO') {
        const data = await passageirosService.buscarPorCpf(user.sub);
        setPassageiros(data ? [data] : []);
      } else {
        const data = await passageirosService.listar();
        setPassageiros(data || []);
      }
    } catch (e: any) {
      Alert.alert('Erro', e.message);
      setPassageiros([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.card, index !== passageiros.length - 1 && styles.cardBorder]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardAvatarBox}>
            <Text style={styles.cardAvatar}>{item.nome?.[0]?.toUpperCase() ?? 'P'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.nome}</Text>
            <Text style={styles.cardSubtitle}>{item.cpf}</Text>
          </View>
        </View>
        <View style={styles.cardInfo}>
          <InfoRow icon="call-outline" label="Telefone" value={item.telefone} />
          <InfoRow icon="school-outline" label="Instituição" value={item.instituicaoEnsino} />
          <InfoRow icon="time-outline" label="Turno" value={item.turno} />
        </View>
      </View>
    </Animated.View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Animated.ScrollView
      style={[styles.container, { opacity: fadeAnim }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={COLORS.gradient.hero} style={styles.headerGradient}>
        <PageHeader 
          title="Passageiros"
          subtitle={`${passageiros.length} passageiro${passageiros.length !== 1 ? 's' : ''}`}
        />
      </LinearGradient>

      {passageiros.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState 
            icon="person-outline"
            title="Nenhum passageiro encontrado"
            description="Não há passageiros cadastrados no sistema."
          />
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlatList
            data={passageiros}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            scrollEnabled={false}
          />
        </View>
      )}
    </Animated.ScrollView>
  );
}

// ─── Info Row Helper Component ───
function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { Ionicons } = require('@expo/vector-icons');
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={14} color={COLORS.purple.bright} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    paddingBottom: SPACING.xxxl,
  },

  // Header
  headerGradient: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: RESPONSIVE.getPadding(),
  },

  // List
  listContainer: {
    paddingHorizontal: RESPONSIVE.getPadding(),
    paddingTop: SPACING.lg,
    gap: SPACING.md,
  },

  // Card
  cardWrapper: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 0.5,
    borderColor: COLORS.neutral.border,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  cardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.borderLight,
  },

  // Card Header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  cardAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(167,139,250,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardAvatar: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.purple.light,
  },
  cardTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.neutral.text.primary,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.text.secondary,
    marginTop: SPACING.xs,
  },

  // Card Info
  cardInfo: {
    gap: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neutral.text.secondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.text.primary,
    fontWeight: FONT_WEIGHTS.semibold,
    marginTop: SPACING.xs,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
});