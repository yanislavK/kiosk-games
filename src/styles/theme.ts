export const theme = {
  colors: {
    blue: '#2563eb',
    blueLight: '#3b82f6',
    blueDark: '#1d4ed8',
    green: '#16a34a',
    greenLight: '#22c55e',
    purple: '#7c3aed',
    purpleLight: '#8b5cf6',
    orange: '#ea580c',
    orangeLight: '#f97316',
    red: '#dc2626',
    bg: '#f0f6ff',
    card: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
  },
  radius: {
    sm: '12px',
    md: '20px',
    lg: '28px',
    xl: '40px',
  },
  shadow: {
    sm: '0 2px 8px rgba(0,0,0,0.08)',
    md: '0 4px 20px rgba(0,0,0,0.12)',
    lg: '0 8px 40px rgba(0,0,0,0.15)',
  },
  spacing: {
    xs: '8px',
    sm: '16px',
    md: '24px',
    lg: '40px',
    xl: '64px',
  },
} as const;

export type Theme = typeof theme;
