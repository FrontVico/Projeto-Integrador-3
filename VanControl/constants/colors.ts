/**
 * Design System Colors and Spacing
 * Baseado no design elegante da página de Perfil
 */

import { Platform, Dimensions } from 'react-native';

// ─── Color Palette ───
export const COLORS = {
  // Background
  background: {
    primary: '#060c22',
    secondary: '#070e28',
    tertiary: '#100d28',
    light: '#0a0f2e',
  },

  // Accent (Purple)
  purple: {
    bright: '#a78bfa', // Roxo claro
    light: '#c4b5fd', // Roxo muito claro
    medium: '#9f7aea', // Roxo médio
    dark: '#7c3aed', // Roxo escuro
  },

  // Neutrals
  neutral: {
    white: '#ffffff',
    text: {
      primary: '#e2e8f0',
      secondary: '#4a5a7a',
      tertiary: '#94a3b8',
    },
    border: 'rgba(255,255,255,0.08)',
    borderLight: 'rgba(255,255,255,0.06)',
  },

  // Status Colors
  status: {
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#2563eb',
  },

  // Semantic Status Colors
  semantic: {
    success: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
    warning: { bg: 'rgba(251,191,36,0.15)', text: '#f59e0b' },
    danger: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
    info: { bg: 'rgba(37,99,235,0.15)', text: '#2563eb' },
  },

  // Gradients
  gradient: {
    hero: ['#100d28', '#070e28'],
    overlay: ['#100d28', '#0a0f2e'],
  },
};

// ─── Spacing Scale ───
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// ─── Font Sizes ───
export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  '2xl': 22,
  '3xl': 28,
  '4xl': 32,
};

// ─── Font Weights ───
export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// ─── Border Radius ───
export const BORDER_RADIUS = {
  sm: 8,
  md: 11,
  lg: 14,
  xl: 18,
  full: 999,
};

// ─── Responsive Utilities ───
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export const RESPONSIVE = {
  isSmallScreen: screenWidth < 375,
  isMediumScreen: screenWidth >= 375 && screenWidth < 768,
  isLargeScreen: screenWidth >= 768,
  isTablet: screenWidth >= 768,
  screenWidth,
  screenHeight,
  
  // Padding adjustments
  getPadding: () => {
    if (screenWidth < 375) return SPACING.md;
    if (screenWidth < 768) return SPACING.lg;
    return SPACING.xl;
  },
  
  // Font size adjustments
  getHeaderSize: () => {
    if (screenWidth < 375) return FONT_SIZES.xl;
    if (screenWidth < 768) return FONT_SIZES['2xl'];
    return FONT_SIZES['3xl'];
  },

  // Gap adjustments
  getGap: () => {
    if (screenWidth < 375) return SPACING.sm;
    if (screenWidth < 768) return SPACING.md;
    return SPACING.lg;
  },

  // Card dimensions
  getCardHeight: (baseHeight: number) => {
    if (screenWidth < 375) return baseHeight * 0.85;
    if (screenWidth < 768) return baseHeight;
    return baseHeight * 1.1;
  },
};

// ─── Shadow ───
export const SHADOWS = {
  sm: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1,
  },
  md: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  lg: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
};
