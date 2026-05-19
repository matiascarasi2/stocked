export const colors = {
  primary: "#155dfc",
  text: "#0a0a0a",
  textMuted: "#4a5565",
  border: "#d1d5dc",
  placeholder: "rgba(10,10,10,0.5)",
  white: "#ffffff",
  surface: "#f9fafb",
  welcomeGradientStart: "#eff6ff",
  divider: "#e5e7eb",
  positive: "#00a63e",
  negative: "#e7000b",
  chartGrid: "#e5e7eb",
  chartAxis: "#6b7280",
  rangeInactiveBg: "#f3f4f6",
  rangeInactiveText: "#364153",
  chartCursor: "#d1d5dc",
} as const;

export const spacing = {
  screen: 24,
  fieldGap: 16,
  sectionGap: 32,
  labelGap: 8,
  buttonGap: 16,
} as const;

export const radii = {
  button: 10,
  input: 10,
  logo: 40,
} as const;

export const sizes = {
  buttonHeight: 48,
  inputHeight: 49,
  logo: 80,
  icon: 40,
  backIcon: 20,
  headerIcon: 20,
  trendIcon: 16,
  iconButton: 36,
  listRowMinHeight: 80,
} as const;

export const typography = {
  display: {
    fontSize: 36,
    lineHeight: 40,
    fontFamily: "Inter_500Medium",
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontFamily: "Inter_500Medium",
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Inter_400Regular",
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_500Medium",
  },
  footer: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
  screenTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: "Inter_500Medium",
  },
  stockSymbol: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Inter_500Medium",
  },
  stockDetailPrice: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: "Inter_500Medium",
  },
  chartAxis: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter_400Regular",
  },
} as const;

export const theme = {
  colors,
  spacing,
  radii,
  sizes,
  typography,
} as const;
