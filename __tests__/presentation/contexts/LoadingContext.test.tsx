import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  LoadingProvider,
  useLoading,
} from '../../../src/presentation/contexts/LoadingContext';

// テスト用のコンポーネント
const TestComponent: React.FC = () => {
  const { isLoading, showLoading, hideLoading } = useLoading();

  return (
    <div>
      <div data-testid="loading-state">{isLoading.toString()}</div>
      <button onClick={() => showLoading()}>Show Loading</button>
      <button onClick={() => hideLoading()}>Hide Loading</button>
    </div>
  );
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(<LoadingProvider>{component}</LoadingProvider>);
};

describe('LoadingContext', () => {
  describe('初期化', () => {
    it('初期状態ではisLoadingがfalseである', () => {
      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
    });
  });

  describe('showLoading', () => {
    it('showLoadingを呼び出すとisLoadingがtrueになる', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('loading-state')).toHaveTextContent('false');

      await act(async () => {
        await user.click(screen.getByText('Show Loading'));
      });

      expect(screen.getByTestId('loading-state')).toHaveTextContent('true');
    });

    it('複数回showLoadingを呼び出してもisLoadingはtrueのまま', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      await act(async () => {
        await user.click(screen.getByText('Show Loading'));
      });

      expect(screen.getByTestId('loading-state')).toHaveTextContent('true');

      await act(async () => {
        await user.click(screen.getByText('Show Loading'));
      });

      expect(screen.getByTestId('loading-state')).toHaveTextContent('true');
    });
  });

  describe('hideLoading', () => {
    it('hideLoadingを呼び出すとisLoadingがfalseになる', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      // まずローディング状態にする
      await act(async () => {
        await user.click(screen.getByText('Show Loading'));
      });

      expect(screen.getByTestId('loading-state')).toHaveTextContent('true');

      // ローディングを隠す
      await act(async () => {
        await user.click(screen.getByText('Hide Loading'));
      });

      expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
    });

    it('既にfalseの状態でhideLoadingを呼び出してもfalseのまま', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('loading-state')).toHaveTextContent('false');

      await act(async () => {
        await user.click(screen.getByText('Hide Loading'));
      });

      expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
    });

    it('複数回hideLoadingを呼び出してもisLoadingはfalseのまま', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      // まずローディング状態にする
      await act(async () => {
        await user.click(screen.getByText('Show Loading'));
      });

      // 複数回ローディングを隠す
      await act(async () => {
        await user.click(screen.getByText('Hide Loading'));
      });

      expect(screen.getByTestId('loading-state')).toHaveTextContent('false');

      await act(async () => {
        await user.click(screen.getByText('Hide Loading'));
      });

      expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
    });
  });

  describe('状態の切り替え', () => {
    it('showLoadingとhideLoadingを交互に呼び出して状態を切り替えられる', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('loading-state')).toHaveTextContent('false');

      // ローディング表示
      await act(async () => {
        await user.click(screen.getByText('Show Loading'));
      });

      expect(screen.getByTestId('loading-state')).toHaveTextContent('true');

      // ローディング非表示
      await act(async () => {
        await user.click(screen.getByText('Hide Loading'));
      });

      expect(screen.getByTestId('loading-state')).toHaveTextContent('false');

      // 再度ローディング表示
      await act(async () => {
        await user.click(screen.getByText('Show Loading'));
      });

      expect(screen.getByTestId('loading-state')).toHaveTextContent('true');
    });

    it('高速で状態を切り替えても正しく動作する', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      await act(async () => {
        await user.click(screen.getByText('Show Loading'));
        await user.click(screen.getByText('Hide Loading'));
        await user.click(screen.getByText('Show Loading'));
      });

      expect(screen.getByTestId('loading-state')).toHaveTextContent('true');
    });
  });

  describe('複数のコンポーネント間での状態共有', () => {
    it('同じプロバイダー内の複数のコンポーネントで状態が共有される', async () => {
      const user = userEvent.setup();

      const TestComponent2: React.FC = () => {
        const { isLoading } = useLoading();
        return <div data-testid="loading-state-2">{isLoading.toString()}</div>;
      };

      renderWithProvider(
        <div>
          <TestComponent />
          <TestComponent2 />
        </div>
      );

      expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
      expect(screen.getByTestId('loading-state-2')).toHaveTextContent('false');

      await act(async () => {
        await user.click(screen.getByText('Show Loading'));
      });

      expect(screen.getByTestId('loading-state')).toHaveTextContent('true');
      expect(screen.getByTestId('loading-state-2')).toHaveTextContent('true');
    });
  });

  describe('useLoading hook', () => {
    it('LoadingProviderの外で使用した場合、エラーを投げる', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useLoading must be used within a LoadingProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('非同期処理との組み合わせ', () => {
    it('非同期処理中にローディング状態を管理できる', async () => {
      const user = userEvent.setup();

      const AsyncTestComponent: React.FC = () => {
        const { isLoading, showLoading, hideLoading } = useLoading();

        const handleAsyncOperation = async () => {
          showLoading();
          await new Promise(resolve => setTimeout(resolve, 100));
          hideLoading();
        };

        return (
          <div>
            <div data-testid="loading-state">{isLoading.toString()}</div>
            <button onClick={handleAsyncOperation}>Async Operation</button>
          </div>
        );
      };

      renderWithProvider(<AsyncTestComponent />);

      expect(screen.getByTestId('loading-state')).toHaveTextContent('false');

      await act(async () => {
        await user.click(screen.getByText('Async Operation'));
      });

      // 非同期処理中はローディング状態
      expect(screen.getByTestId('loading-state')).toHaveTextContent('true');

      // 非同期処理完了後はローディング非表示
      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('非同期処理でエラーが発生してもローディング状態が適切に管理される', async () => {
      const user = userEvent.setup();

      const ErrorTestComponent: React.FC = () => {
        const { isLoading, showLoading, hideLoading } = useLoading();

        const handleErrorOperation = async () => {
          showLoading();
          try {
            await new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Test error')), 100)
            );
          } catch (error) {
            // エラーが発生してもローディングを隠す
            hideLoading();
          }
        };

        return (
          <div>
            <div data-testid="loading-state">{isLoading.toString()}</div>
            <button onClick={handleErrorOperation}>Error Operation</button>
          </div>
        );
      };

      renderWithProvider(<ErrorTestComponent />);

      expect(screen.getByTestId('loading-state')).toHaveTextContent('false');

      await act(async () => {
        await user.click(screen.getByText('Error Operation'));
      });

      // エラー発生後もローディング状態が適切に管理される
      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
      });
    });
  });
});
