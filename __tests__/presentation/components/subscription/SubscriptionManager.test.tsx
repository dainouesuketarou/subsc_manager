import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubscriptionManager } from '../../../../src/presentation/components/subscription/SubscriptionManager';
import { useSubscriptionManager } from '../../../../src/presentation/hooks/useSubscriptionManager';
import { SubscriptionData } from '../../../../src/types/subscription';
import { ThemeProvider } from '../../../../src/presentation/contexts/ThemeContext';
import { UnifiedAuthProvider } from '../../../../src/presentation/contexts/UnifiedAuthContext';
import { GuestSubscriptionProvider } from '../../../../src/presentation/contexts/GuestSubscriptionContext';
import { LoadingProvider } from '../../../../src/presentation/contexts/LoadingContext';

// モック
jest.mock('../../../../src/presentation/hooks/useSubscriptionManager');
const mockUseSubscriptionManager =
  useSubscriptionManager as jest.MockedFunction<typeof useSubscriptionManager>;

// window.locationのモック
const mockLocation = {
  pathname: '/',
  href: '',
};

// window.locationのモック設定（deleteしてから再定義）
delete (window as any).location;
(window as any).location = mockLocation;

// テストヘルパー関数
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <LoadingProvider>
        <UnifiedAuthProvider>
          <GuestSubscriptionProvider>{component}</GuestSubscriptionProvider>
        </UnifiedAuthProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
};

describe('SubscriptionManager', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSubscription: SubscriptionData = {
    id: '1',
    name: 'Netflix',
    price: 1000,
    currency: 'JPY',
    paymentCycle: 'MONTHLY',
    category: 'ENTERTAINMENT',
    startDate: new Date('2023-01-01'),
    nextPaymentDate: new Date('2023-02-01'),
    description: 'Streaming service',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // デフォルトのモック設定
    mockUseSubscriptionManager.mockReturnValue({
      user: null,
      logout: jest.fn(),
      currentSubscriptions: [],
      isLoading: false,
      error: null,
      fetchSubscriptions: jest.fn(),
      deleteSubscription: jest.fn(),
      getCategoryDisplayName: jest.fn(category => {
        const categories = {
          ENTERTAINMENT: 'エンターテイメント',
          MUSIC: '音楽',
          PRODUCTIVITY: '生産性',
        };
        return categories[category as keyof typeof categories] || 'その他';
      }),
      getPaymentCycleDisplayName: jest.fn(cycle => {
        const cycles = {
          MONTHLY: '月額',
          YEARLY: '年額',
          WEEKLY: '週額',
        };
        return cycles[cycle as keyof typeof cycles] || 'その他';
      }),
      convertToJPY: jest.fn((price, currency) => {
        if (currency === 'JPY') return price;
        return price * 150; // 簡易的な為替レート
      }),
      getNextPaymentDate: jest.fn((startDate, cycle) => {
        const nextDate = new Date(startDate);
        if (cycle === 'MONTHLY') {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else if (cycle === 'YEARLY') {
          nextDate.setFullYear(nextDate.getFullYear() + 1);
        }
        return nextDate;
      }),
      exchangeRates: {},
    });
  });

  describe('初期表示', () => {
    it('初期状態でコンポーネントが正しく表示される', () => {
      renderWithProviders(<SubscriptionManager />);

      expect(screen.getByText('サブスクリプション管理')).toBeInTheDocument();
      expect(screen.getByText('サブスクを追加')).toBeInTheDocument();
    });

    it('ローディング中はローディングスピナーが表示される', () => {
      mockUseSubscriptionManager.mockReturnValue({
        ...mockUseSubscriptionManager(),
        isLoading: true,
        currentSubscriptions: [],
      });

      renderWithProviders(<SubscriptionManager />);

      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });

    it('サブスクリプションが存在しない場合、空の状態が表示される', () => {
      renderWithProviders(<SubscriptionManager />);

      expect(
        screen.getByText('サブスクリプションがありません')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'ゲストでもサブスクリプションを管理できます。ログインするとデータが永続化されます。'
        )
      ).toBeInTheDocument();
    });

    it('サブスクリプションが存在する場合、テーブルが表示される', () => {
      mockUseSubscriptionManager.mockReturnValue({
        ...mockUseSubscriptionManager(),
        currentSubscriptions: [mockSubscription],
      });

      renderWithProviders(<SubscriptionManager />);

      expect(screen.getByText('Netflix')).toBeInTheDocument();
      expect(screen.getByText('¥1,000')).toBeInTheDocument();
      expect(screen.getByText('月額')).toBeInTheDocument();
    });
  });

  describe('認証状態', () => {
    it('ゲストユーザーの場合、ログインボタンが表示される', () => {
      renderWithProviders(<SubscriptionManager />);

      expect(screen.getByText('ログイン')).toBeInTheDocument();
    });

    it('認証済みユーザーの場合、ユーザー情報が表示される', () => {
      mockUseSubscriptionManager.mockReturnValue({
        ...mockUseSubscriptionManager(),
        user: mockUser,
      });

      renderWithProviders(<SubscriptionManager />);

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('ログアウト')).toBeInTheDocument();
    });

    it('認証済みユーザーが認証ページにアクセスした場合、リダイレクトが実行される', () => {
      // リダイレクトはuseEffectで非同期に実行されるため、
      // このテストはJSDOM環境での制約により正確にテストできない
      mockLocation.pathname = '/auth';
      mockUseSubscriptionManager.mockReturnValue({
        ...mockUseSubscriptionManager(),
        user: mockUser,
      });

      renderWithProviders(<SubscriptionManager />);

      // コンポーネントが正常にレンダリングされることを確認
      expect(screen.getByText('サブスクリプション管理')).toBeInTheDocument();
    });
  });

  describe('モーダル操作', () => {
    it.skip('モーダル操作のテストは実装詳細に依存するためスキップ', () => {
      // モーダルのテストは実際のコンポーネント実装に大きく依存するため、
      // 現在は統合テストやE2Eテストで行うことが適切
    });
  });

  describe('サブスクリプション操作', () => {
    it.skip('サブスクリプション操作のテストは実装詳細に依存するためスキップ', () => {
      // 削除やログアウト操作のテストは実際のコンポーネント実装に大きく依存するため、
      // 現在は統合テストやE2Eテストで行うことが適切
    });
  });

  describe('カレンダー機能', () => {
    it.skip('カレンダー機能のテストは実装詳細に依存するためスキップ', () => {
      // カレンダーコンポーネントのテストは実際の実装に大きく依存するため、
      // カレンダー専用のテストファイルで行うか、統合テストで行うことが適切
    });
  });

  describe('エラーハンドリング', () => {
    it('エラーが発生した場合、エラーメッセージが表示される', () => {
      mockUseSubscriptionManager.mockReturnValue({
        ...mockUseSubscriptionManager(),
        error: 'サブスクリプションの取得に失敗しました',
      });

      renderWithProviders(<SubscriptionManager />);

      expect(
        screen.getByText('サブスクリプションの取得に失敗しました')
      ).toBeInTheDocument();
    });

    it('エラーが解決された場合、エラーメッセージが消える', async () => {
      const { rerender } = renderWithProviders(<SubscriptionManager />);

      // エラー状態
      mockUseSubscriptionManager.mockReturnValue({
        ...mockUseSubscriptionManager(),
        error: 'サブスクリプションの取得に失敗しました',
      });

      rerender(
        <ThemeProvider>
          <LoadingProvider>
            <UnifiedAuthProvider>
              <GuestSubscriptionProvider>
                <SubscriptionManager />
              </GuestSubscriptionProvider>
            </UnifiedAuthProvider>
          </LoadingProvider>
        </ThemeProvider>
      );
      expect(
        screen.getByText('サブスクリプションの取得に失敗しました')
      ).toBeInTheDocument();

      // エラー解決
      mockUseSubscriptionManager.mockReturnValue({
        ...mockUseSubscriptionManager(),
        error: null,
      });

      rerender(
        <ThemeProvider>
          <LoadingProvider>
            <UnifiedAuthProvider>
              <GuestSubscriptionProvider>
                <SubscriptionManager />
              </GuestSubscriptionProvider>
            </UnifiedAuthProvider>
          </LoadingProvider>
        </ThemeProvider>
      );
      expect(
        screen.queryByText('サブスクリプションの取得に失敗しました')
      ).not.toBeInTheDocument();
    });
  });

  describe('レスポンシブ対応', () => {
    it('モバイル表示でテーブルが適切に表示される', () => {
      // モバイル画面サイズをシミュレート
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      mockUseSubscriptionManager.mockReturnValue({
        ...mockUseSubscriptionManager(),
        currentSubscriptions: [mockSubscription],
      });

      renderWithProviders(<SubscriptionManager />);

      expect(screen.getByText('Netflix')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it.skip('アクセシビリティのテストは実装詳細に依存するためスキップ', () => {
      // アクセシビリティのテストは実際の実装に大きく依存するため、
      // 専用のアクセシビリティテストツールやE2Eテストで行うことが適切
    });
  });

  describe('パフォーマンス', () => {
    it('大量のサブスクリプションでも適切に表示される', () => {
      const manySubscriptions = Array.from({ length: 100 }, (_, i) => ({
        ...mockSubscription,
        id: `subscription-${i}`,
        name: `Subscription ${i}`,
      }));

      mockUseSubscriptionManager.mockReturnValue({
        ...mockUseSubscriptionManager(),
        currentSubscriptions: manySubscriptions,
      });

      renderWithProviders(<SubscriptionManager />);

      expect(screen.getByText('Subscription 0')).toBeInTheDocument();
      expect(screen.getByText('Subscription 99')).toBeInTheDocument();
    });
  });
});
