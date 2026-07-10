import { Platform, TextStyle, ViewStyle } from "react-native";

/**
 * Design tokens únicos do app. Toda cor, espaçamento e estilo de texto
 * vem daqui — nenhuma tela deve declarar hex próprio.
 */

export const colors = {
  // Marca
  primary: "#0E3A5E",
  primaryPressed: "#0B2E4C",
  primaryTint: "#E8EFF5",
  primaryTintPressed: "#D8E4EE",

  // Neutros
  bg: "#F5F7FA",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  divider: "#EEF2F6",
  ink: "#0F172A",
  body: "#334155",
  muted: "#64748B",

  // Semânticas
  danger: "#DC2626",
  dangerTint: "#FEF2F2",
  dangerTintPressed: "#FEE2E2",
  success: "#15803D",
  successTint: "#F0FDF4",

  white: "#FFFFFF",
  overlay: "rgba(15, 23, 42, 0.45)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

/** Altura mínima de qualquer alvo de toque (Material: 48dp). */
export const touchTarget = 48;

export const type = {
  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.3,
  } as TextStyle,
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.ink,
  } as TextStyle,
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.ink,
  } as TextStyle,
  body: {
    fontSize: 15,
    fontWeight: "400",
    color: colors.body,
    lineHeight: 22,
  } as TextStyle,
  meta: {
    fontSize: 13,
    fontWeight: "400",
    color: colors.muted,
  } as TextStyle,
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.muted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  } as TextStyle,
  button: {
    fontSize: 15,
    fontWeight: "600",
  } as TextStyle,
};

/** Sombra sutil para superfícies elevadas (cards, modais). */
export const shadow: ViewStyle = Platform.select({
  web: { boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)" } as ViewStyle,
  default: {
    shadowColor: colors.ink,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
}) as ViewStyle;
