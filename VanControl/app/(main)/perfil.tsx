import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, ActivityIndicator, Modal,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { NAVIGATION_ITEMS } from '../../constants/navigation';


// 1. Tipagem das roles permitidas
type Role = 'ADMIN' | 'MOTORISTA' | 'PASSAGEIRO';

// 2. Adição da propriedade allowedRoles no MenuItem
type MenuItem = {
  icon: string;
  label: string;
  sub?: string;
  route?: string;
  action?: () => void;
  color: string;
  danger?: boolean;
  allowedRoles?: Role[];
};

export default function Perfil() { // Sugestão: Renomear de PerfilAdmin para Perfil, já que agora é dinâmico
  const { user, loading } = useAuth();

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;
  
  const [confirmacaoLogout, setConfirmacaoLogout] = useState(false);
  const [loadingAcao, setLoadingAcao] = useState(false);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    }
  }, [loading, fadeAnim, slideAnim]);

  const handleConfirmarLogout = async () => {
    setLoadingAcao(true);
    try {
      await authService.logout();
    } catch (e: any) {
      console.error('Erro ao fazer logout:', e);
    } finally {
      setLoadingAcao(false);
      setConfirmacaoLogout(false);
      router.push('/login');
    }
  };

  const renderConfirmacaoInline = ({
    mensagem,
    textoBotao,
    estiloBotao,
    onConfirmar,
    onCancelar,
  }: {
    mensagem: string;
    textoBotao: string;
    estiloBotao: object;
    onConfirmar: () => void;
    onCancelar: () => void;
  }) => (
    <View style={styles.confirmacaoContainer}>
      <Text style={styles.confirmacaoTexto}>{mensagem}</Text>
      <View style={styles.confirmacaoBotoes}>
        <TouchableOpacity
          style={[styles.btnAction, styles.btnSecondary, styles.btnFlex]}
          onPress={onCancelar}
          disabled={loadingAcao}
        >
          <Text style={styles.btnText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnAction, estiloBotao, styles.btnFlex]}
          onPress={onConfirmar}
          disabled={loadingAcao}
        >
          {loadingAcao ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.btnText}>{textoBotao}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // 3. Definição do Menu com o mapeamento de permissões (allowedRoles)
  const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Gerenciamento',
      items: [
        NAVIGATION_ITEMS.ROTAS,
        NAVIGATION_ITEMS.VIAGENS,
        NAVIGATION_ITEMS.PAGAMENTOS,
        NAVIGATION_ITEMS.VEICULOS,
        NAVIGATION_ITEMS.MOTORISTAS,
        NAVIGATION_ITEMS.PASSAGEIROS,
      ],
    },
    {
      title: 'Conta',
      items: [
        { icon: 'shield-checkmark-outline', label: 'Segurança',     sub: 'Senha e autenticação',   color: '#64748b', route: undefined },
        { icon: 'notifications-outline',    label: 'Notificações',  sub: 'Preferências de alerta', color: '#64748b', route: undefined },
        { icon: 'information-circle-outline', label: 'Sobre o app', sub: 'VanControl v1.0.0',      color: '#64748b', route: undefined },
      ],
    },
    {
      title: 'Sessão',
      items: [
        { icon: 'log-out-outline', label: 'Sair da conta', sub: 'Encerrar sessão atual', color: '#ef4444', danger: true, action: () => {} },
      ],
    },
  ];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#a78bfa" size="large" />
      </View>
    );
  }

  // 4. Identificar a role do usuário (fallback para passageiro como segurança)
  const userRole = (user?.role as Role) || 'PASSAGEIRO';

  // 5. Filtrar o menu com base na role
  const filteredSections = MENU_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => 
      !item.allowedRoles || item.allowedRoles.includes(userRole)
    )
  })).filter(section => section.items.length > 0); // Remove seção se todos os itens forem filtrados

  // 6. Configurar o Badge Dinâmico
  const getRoleBadgeInfo = (role: string) => {
    switch (role) {
      case 'ADMIN': return { label: 'Administrador', icon: 'flash-outline' };
      case 'MOTORISTA': return { label: 'Motorista', icon: 'bus-outline' };
      case 'PASSAGEIRO': return { label: 'Passageiro', icon: 'person-outline' };
      default: return { label: 'Usuário', icon: 'person-outline' };
    }
  };
  const roleInfo = getRoleBadgeInfo(userRole);

  return (
    <Animated.ScrollView
      style={{ flex: 1, opacity: fadeAnim, backgroundColor: '#060c22' }}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HERO ── */}
      <LinearGradient colors={['#100d28', '#070e28']} style={styles.hero}>
        <View style={styles.glowCircle} />
        <View style={styles.glowCircle2} />

        <Animated.View style={[styles.heroContent, { transform: [{ translateY: slideAnim }] }]}>
          {/* Avatar grande */}
          <LinearGradient
            colors={['rgba(167,139,250,0.35)', 'rgba(167,139,250,0.1)']}
            style={styles.avatarRing}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </Text>
            </View>
          </LinearGradient>

          {/* Info */}
          <Text style={styles.heroName}>{user?.name ?? '—'}</Text>
          <Text style={styles.heroEmail}>{user?.email ?? '—'}</Text>

          {/* Badge de role dinâmico */}
          <View style={styles.roleBadge}>
            <Ionicons name={roleInfo.icon as any} size={11} color="#c4b5fd" />
            <Text style={styles.roleText}>{roleInfo.label}</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* ── MENU SECTIONS ── */}
      <Animated.View style={[styles.body, { transform: [{ translateY: slideAnim }] }]}>
        {/* Renderiza apenas as sessões filtradas */}
        {filteredSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionLabel}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuRow,
                    i < section.items.length - 1 && styles.menuRowBorder,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (item.action) { 
                      if (item.label === 'Sair da conta') {
                        setConfirmacaoLogout(true);
                      } else {
                        item.action(); 
                      }
                      return; 
                    }
                    if (item.route) router.push(item.route as any);
                  }}
                >
                  {/* Ícone */}
                  <View style={[styles.menuIconBox, { backgroundColor: item.color + '1a' }]}>
                    <Ionicons name={item.icon as any} size={18} color={item.color} />
                  </View>

                  {/* Texto */}
                  <View style={styles.menuText}>
                    <Text style={[styles.menuLabel, item.danger && { color: '#ef4444' }]}>
                      {item.label}
                    </Text>
                    <Text style={styles.menuSub}>{item.sub}</Text>
                  </View>

                  {/* Chevron */}
                  {!item.danger && (
                    <Ionicons name="chevron-forward" size={16} color="#2a3550" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

      </Animated.View>

      {/* ── Modal Confirmação Logout ── */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmacaoLogout}
        onRequestClose={() => setConfirmacaoLogout(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {renderConfirmacaoInline({
              mensagem: 'Tem certeza que deseja sair da conta?',
              textoBotao: '✕ Confirmar saída',
              estiloBotao: styles.btnDanger,
              onConfirmar: handleConfirmarLogout,
              onCancelar: () => setConfirmacaoLogout(false),
            })}
          </View>
        </View>
      </Modal>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#050a1e' },
  scroll: { paddingBottom: 48, backgroundColor: '#060c22' },

  // ── Hero ──
  hero: {
    paddingTop: 72,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  glowCircle: {
    position: 'absolute',
    top: -80, right: -80,
    width: 260, height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(167,139,250,0.13)',
  },
  glowCircle2: {
    position: 'absolute',
    bottom: -60, left: -60,
    width: 200, height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(37,99,235,0.08)',
  },
  heroContent: { alignItems: 'center', gap: 8 },

  avatarRing: {
    width: 88, height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.3)',
  },
  avatar: {
    width: 72, height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(167,139,250,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 30, fontWeight: '800', color: '#c4b5fd' },

  heroName:  { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: 0.2, marginTop: 4 },
  heroEmail: { fontSize: 13, color: '#4a5a7a', fontWeight: '500' },

  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(167,139,250,0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(167,139,250,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 6,
  },
  roleText: { fontSize: 11, color: '#c4b5fd', fontWeight: '700', letterSpacing: 0.5 },

  // ── Body ──
  body: { paddingHorizontal: 24, paddingTop: 28, gap: 28 },

  section: {},
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4a5a7a',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  menuCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  menuRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  menuIconBox: {
    width: 38, height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText:  { flex: 1, gap: 3 },
  menuLabel: { fontSize: 14, color: '#e2e8f0', fontWeight: '600' },
  menuSub:   { fontSize: 12, color: '#4a5a7a', fontWeight: '400' },

  // ── Modal Confirmação ──
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: 'rgba(20, 20, 40, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.3)',
    padding: 24,
    width: '80%',
    maxWidth: 340,
  },
  confirmacaoContainer: {
    gap: 16,
  },
  confirmacaoTexto: {
    fontSize: 15,
    color: '#e2e8f0',
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '500',
  },
  confirmacaoBotoes: {
    flexDirection: 'row',
    gap: 10,
  },
  btnAction: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  btnSecondary: {
    backgroundColor: 'rgba(100,116,139,0.25)',
    borderWidth: 0.5,
    borderColor: 'rgba(100,116,139,0.5)',
  },
  btnDanger: {
    backgroundColor: 'rgba(239,68,68,0.25)',
  },
  btnFlex: {
    flex: 1,
  },
});