/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;



export const colors = {
  background: "#081525",
  backgroundSecondary: "#101E33",

  surface: "#14243A",
  surfaceElevated: "#1C3049",
  surfaceInput: "#26374D",

  primary: "#2478F5",
  primaryLight: "#32C5F4",
  primaryDark: "#1557D4",

  text: "#F5F8FF",
  textSecondary: "#B9C7D8",
  textMuted: "#8295AD",

  border: "#354C68",
  borderLight: "#45627E",

  success: "#35C9A4",
  error: "#FF6B7A",
  warning: "#F2BE63",

  white: "#FFFFFF",
  transparent: "transparent",

 // Light interface
  backgroundLight: "#F1F6FF",
  backgroundLightSecondary: "#E5EEFF",
  surfaceLight: "#FFFFFF",
  surfaceLightBlue: "#EAF3FF",

  // Home interface
  navy: "#102544",
  navyDeep: "#0B1C35",
  navySoft: "#193A64",

  textDark: "#102544",
  textDarkSecondary: "#536783",

  borderLightBlue: "#D6E5FA"


} as const;

export const gradients = {
  background: [
    "#081525",
    "#102443",
    "#081525"
  ],

  primary: [
    "#32C5F4",
    "#2478F5"
  ],

  surface: [
    "#1B344E",
    "#111D32"
  ]
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 32,
  full: 999
} as const;

export const typography = {
  size: {
    caption: 12,
    small: 14,
    body: 16,
    subtitle: 18,
    title: 28,
    heading: 34
  },

  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700"
  }
} as const;

export const theme = {
  colors,
  gradients,
  spacing,
  borderRadius,
  typography
} as const;



 