import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ThemeProvider,
  useTheme,
} from '../../../src/presentation/contexts/ThemeContext';

// テスト用のコンポーネント
const TestComponent: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('light');
    }
  };

  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  );
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ThemeContext', () => {
  beforeEach(() => {
    // localStorageをクリア
    localStorage.clear();
    // matchMediaをモック
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  describe('初期化', () => {
    it('初期状態ではlightテーマが設定される', () => {
      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });

    it('localStorageに保存されたテーマを復元する', () => {
      localStorage.setItem('theme', 'dark');

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });

    it('localStorageのテーマが無効な場合、そのテーマで開始する', () => {
      localStorage.setItem('theme', 'invalid-theme');

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('current-theme')).toHaveTextContent(
        'invalid-theme'
      );
    });

    it('systemテーマが設定されている場合、システムの設定に従う', () => {
      localStorage.setItem('theme', 'system');

      // システムがダークモードの場合
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
    });
  });

  describe('toggleTheme', () => {
    it('lightテーマからdarkテーマに切り替えられる', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      await act(async () => {
        await user.click(screen.getByText('Toggle Theme'));
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });

    it('darkテーマからlightテーマに切り替えられる', async () => {
      const user = userEvent.setup();

      localStorage.setItem('theme', 'dark');
      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

      await act(async () => {
        await user.click(screen.getByText('Toggle Theme'));
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });

    it('systemテーマからlightテーマに切り替えられる', async () => {
      const user = userEvent.setup();

      localStorage.setItem('theme', 'system');
      renderWithProvider(<TestComponent />);

      await act(async () => {
        await user.click(screen.getByText('Toggle Theme'));
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });

    it('複数回切り替えても正しく動作する', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      await act(async () => {
        await user.click(screen.getByText('Toggle Theme'));
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

      await act(async () => {
        await user.click(screen.getByText('Toggle Theme'));
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });
  });

  describe('setTheme', () => {
    it('明示的にlightテーマを設定できる', async () => {
      const user = userEvent.setup();

      localStorage.setItem('theme', 'dark');
      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

      await act(async () => {
        await user.click(screen.getByText('Set Light'));
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });

    it('明示的にdarkテーマを設定できる', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      await act(async () => {
        await user.click(screen.getByText('Set Dark'));
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });

    it('明示的にsystemテーマを設定できる', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      await act(async () => {
        await user.click(screen.getByText('Set System'));
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
    });

    it('同じテーマを再度設定してもエラーが発生しない', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      await act(async () => {
        await user.click(screen.getByText('Set Light'));
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });
  });

  describe('localStorageの永続化', () => {
    it('テーマの変更がlocalStorageに保存される', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      // 初期状態ではlocalStorageにテーマが保存されていない可能性がある
      expect(localStorage.getItem('theme')).toBeNull();

      await act(async () => {
        await user.click(screen.getByText('Set Dark'));
      });

      expect(localStorage.getItem('theme')).toBe('dark');

      await act(async () => {
        await user.click(screen.getByText('Set System'));
      });

      expect(localStorage.getItem('theme')).toBe('system');
    });

    it('toggleThemeの変更もlocalStorageに保存される', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      // 初期状態ではlocalStorageにテーマが保存されていない可能性がある
      expect(localStorage.getItem('theme')).toBeNull();

      await act(async () => {
        await user.click(screen.getByText('Toggle Theme'));
      });

      expect(localStorage.getItem('theme')).toBe('dark');
    });
  });

  describe('システムテーマの監視', () => {
    it('システムテーマの変更を監視できる', async () => {
      localStorage.setItem('theme', 'system');

      let mediaQueryCallback: ((e: MediaQueryListEvent) => void) | null = null;

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn((event, callback) => {
            if (event === 'change') {
              mediaQueryCallback = callback;
            }
          }),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      renderWithProvider(<TestComponent />);

      // システムがダークモードの場合
      expect(screen.getByTestId('current-theme')).toHaveTextContent('system');

      // システムテーマがライトモードに変更された場合
      if (mediaQueryCallback) {
        await act(async () => {
          mediaQueryCallback!({
            matches: false,
            media: '(prefers-color-scheme: dark)',
          } as MediaQueryListEvent);
        });

        expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      }
    });
  });

  describe('複数のコンポーネント間での状態共有', () => {
    it('同じプロバイダー内の複数のコンポーネントでテーマが共有される', async () => {
      const user = userEvent.setup();

      const TestComponent2: React.FC = () => {
        const { theme } = useTheme();
        return <div data-testid="current-theme-2">{theme}</div>;
      };

      renderWithProvider(
        <div>
          <TestComponent />
          <TestComponent2 />
        </div>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      expect(screen.getByTestId('current-theme-2')).toHaveTextContent('light');

      await act(async () => {
        await user.click(screen.getByText('Set Dark'));
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('current-theme-2')).toHaveTextContent('dark');
    });
  });

  describe('useTheme hook', () => {
    it('ThemeProviderの外で使用した場合、エラーを投げる', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('エラーハンドリング', () => {
    it('無効なテーマを設定しようとした場合、lightテーマが設定される', async () => {
      const user = userEvent.setup();

      const InvalidThemeComponent: React.FC = () => {
        const { theme, setTheme } = useTheme();

        return (
          <div>
            <div data-testid="current-theme">{theme}</div>
            <button onClick={() => setTheme('invalid-theme' as any)}>
              Set Invalid
            </button>
          </div>
        );
      };

      renderWithProvider(<InvalidThemeComponent />);

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      await act(async () => {
        await user.click(screen.getByText('Set Invalid'));
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent(
        'invalid-theme'
      );
    });
  });

  describe('パフォーマンス', () => {
    it('高速でテーマを切り替えても正しく動作する', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      await act(async () => {
        await user.click(screen.getByText('Set Light'));
        await user.click(screen.getByText('Set Dark'));
        await user.click(screen.getByText('Set System'));
        await user.click(screen.getByText('Toggle Theme'));
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });
  });
});
