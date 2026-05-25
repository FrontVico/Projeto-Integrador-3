import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, ViewStyle, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, RESPONSIVE } from '../../constants/colors';

// ─── Page Header ───
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: { icon: string; onPress: () => void };
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
      {action && (
        <TouchableOpacity onPress={action.onPress} activeOpacity={0.7}>
          <View style={styles.actionButton}>
            <Ionicons name={action.icon as any} size={20} color={COLORS.purple.light} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Card ───
interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({ children, onPress, style }: CardProps) {
  const Component = onPress ? TouchableOpacity : View;
  return (
    <Component 
      onPress={onPress} 
      activeOpacity={0.7}
      style={[styles.card, style]}
    >
      {children}
    </Component>
  );
}

// ─── Input Field ───
interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secureTextEntry?: boolean;
  editable?: boolean;
  error?: string;
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  editable = true,
  error,
}: InputFieldProps) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <Ionicons 
          name={keyboardType === 'email-address' ? 'mail-outline' : 'text-outline'} 
          size={16} 
          color={COLORS.purple.medium} 
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.neutral.text.secondary}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable={editable}
        />
      </View>
      {error && <Text style={styles.inputErrorText}>{error}</Text>}
    </View>
  );
}

// ─── Button ───
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.neutral.white} />
      ) : (
        <View style={styles.buttonContent}>
          {icon && <Ionicons name={icon as any} size={16} color={COLORS.neutral.white} />}
          <Text style={styles.buttonText}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Status Badge ───
type BadgeColor = 'success' | 'warning' | 'danger' | 'info' | 'default';

interface BadgeProps {
  label: string;
  color?: BadgeColor;
  icon?: string;
}

export function Badge({ label, color = 'default', icon }: BadgeProps) {
  const getColor = (): { bg: string; text: string } => {
    switch (color) {
      case 'success': return COLORS.semantic.success;
      case 'warning': return COLORS.semantic.warning;
      case 'danger': return COLORS.semantic.danger;
      case 'info': return COLORS.semantic.info;
      default: return { bg: 'rgba(167,139,250,0.15)', text: '#c4b5fd' };
    }
  };
  const colorScheme = getColor();
  
  return (
    <View style={[styles.badge, { backgroundColor: colorScheme.bg }]}>
      {icon && <Ionicons name={icon as any} size={11} color={colorScheme.text} />}
      <Text style={[styles.badgeText, { color: colorScheme.text }]}>{label}</Text>
    </View>
  );
}

// ─── List Item ───
interface ListItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  color?: string;
  rightElement?: React.ReactNode;
}

export function ListItem({ icon, title, subtitle, onPress, color = COLORS.purple.bright, rightElement }: ListItemProps) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.7}
      style={styles.listItem}
    >
      <View style={[styles.listItemIcon, { backgroundColor: color + '1a' }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.listItemSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (onPress && <Ionicons name="chevron-forward" size={16} color={COLORS.neutral.text.secondary} />)}
    </TouchableOpacity>
  );
}

// ─── Loading Spinner ───
export function LoadingSpinner() {
  return (
    <View style={styles.spinnerContainer}>
      <ActivityIndicator size="large" color={COLORS.purple.bright} />
    </View>
  );
}

// ─── Empty State ───
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export function EmptyState({ icon = 'inbox-outline', title, description }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon as any} size={48} color={COLORS.neutral.text.secondary} />
      <Text style={styles.emptyStateTitle}>{title}</Text>
      {description && <Text style={styles.emptyStateDescription}>{description}</Text>}
    </View>
  );
}

// ─── Styles ───
const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: RESPONSIVE.getPadding(),
  },
  headerTitle: {
    fontSize: RESPONSIVE.getHeaderSize(),
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.white,
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.text.secondary,
    marginTop: SPACING.xs,
  },
  actionButton: {
    padding: SPACING.md,
    backgroundColor: 'rgba(167,139,250,0.1)',
    borderRadius: BORDER_RADIUS.md,
  },

  // Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 0.5,
    borderColor: COLORS.neutral.border,
    padding: SPACING.lg,
    marginVertical: SPACING.sm,
  },

  // Input
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.neutral.text.secondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
    paddingHorizontal: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    color: COLORS.neutral.text.primary,
    fontSize: FONT_SIZES.base,
  },
  inputError: {
    borderColor: COLORS.status.danger,
  },
  inputErrorText: {
    color: COLORS.status.danger,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
  },

  // Button
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: 'rgba(167,139,250,0.3)',
    borderWidth: 0.5,
    borderColor: 'rgba(167,139,250,0.5)',
  },
  buttonSecondary: {
    backgroundColor: 'rgba(100,116,139,0.25)',
    borderWidth: 0.5,
    borderColor: 'rgba(100,116,139,0.5)',
  },
  buttonDanger: {
    backgroundColor: 'rgba(239,68,68,0.25)',
    borderWidth: 0.5,
    borderColor: 'rgba(239,68,68,0.5)',
  },
  buttonSuccess: {
    backgroundColor: 'rgba(34,197,94,0.25)',
    borderWidth: 0.5,
    borderColor: 'rgba(34,197,94,0.5)',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  buttonText: {
    color: COLORS.neutral.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0.5,
  },

  // List Item
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.md,
    marginVertical: SPACING.xs,
    borderWidth: 0.5,
    borderColor: COLORS.neutral.border,
  },
  listItemIcon: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  listItemTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.neutral.text.primary,
  },
  listItemSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.text.secondary,
  },

  // Loading
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
    gap: SPACING.md,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.neutral.text.primary,
  },
  emptyStateDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.text.secondary,
    textAlign: 'center',
    maxWidth: '80%',
  },
});
