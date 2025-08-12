import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { value: 'light', label: 'ライト', icon: '☀️' },
    { value: 'dark', label: 'ダーク', icon: '🌙' },
    { value: 'auto', label: '自動', icon: '🔄' },
  ] as const;

  const currentTheme = themes.find(t => t.value === theme);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-all duration-200 shadow-sm hover:shadow-md border border-white/30"
        title="テーマを切り替え"
      >
        <span className="text-lg">{currentTheme?.icon}</span>
      </button>

      {isOpen && (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* ドロップダウンメニュー */}
          <div className="absolute right-0 top-full mt-2 w-32 bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/50 z-50">
            <div className="py-1">
              {themes.map(themeOption => (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                    theme === themeOption.value
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-base">{themeOption.icon}</span>
                  <span>{themeOption.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
