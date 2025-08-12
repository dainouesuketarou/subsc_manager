import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isDark, setIsDark] = useState(false);

  // テーマを設定する関数
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    // HTML要素にクラスを適用
    const html = document.documentElement;
    html.classList.remove('light', 'dark');

    if (newTheme === 'auto') {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      html.classList.add(prefersDark ? 'dark' : 'light');
      setIsDark(prefersDark);
    } else {
      html.classList.add(newTheme);
      setIsDark(newTheme === 'dark');
    }
  };

  // 初期化時にローカルストレージからテーマを読み込み
  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'light';
    setThemeState(savedTheme);

    // HTML要素にクラスを適用
    const html = document.documentElement;
    html.classList.remove('light', 'dark');

    if (savedTheme === 'auto') {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      html.classList.add(prefersDark ? 'dark' : 'light');
      setIsDark(prefersDark);
    } else {
      html.classList.add(savedTheme);
      setIsDark(savedTheme === 'dark');
    }
  }, []);

  // システムのカラーモード変更を監視
  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const html = document.documentElement;
        html.classList.remove('light', 'dark');
        html.classList.add(e.matches ? 'dark' : 'light');
        setIsDark(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
