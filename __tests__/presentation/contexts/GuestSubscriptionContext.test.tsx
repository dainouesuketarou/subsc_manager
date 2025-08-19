import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  GuestSubscriptionProvider,
  useGuestSubscriptions,
} from '../../../src/presentation/contexts/GuestSubscriptionContext';
import { SubscriptionData } from '../../../src/types/subscription';

// テスト用のコンポーネント
const TestComponent: React.FC = () => {
  const {
    subscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    clearAllSubscriptions,
  } = useGuestSubscriptions();

  return (
    <div>
      <div data-testid="subscription-count">{subscriptions.length}</div>
      <div data-testid="subscriptions">
        {subscriptions.map((sub, index) => (
          <div key={index} data-testid={`subscription-${index}`}>
            {sub.name} - {sub.price}
          </div>
        ))}
      </div>
      <button
        onClick={() =>
          addSubscription({
            name: 'Netflix',
            price: 1000,
            currency: 'JPY',
            paymentCycle: 'MONTHLY',
            category: 'ENTERTAINMENT',
            startDate: new Date('2023-01-01'),
            nextPaymentDate: new Date('2023-02-01'),
            description: 'Streaming service',
            isActive: true,
          })
        }
      >
        Add Netflix
      </button>
      <button
        onClick={() => {
          if (subscriptions.length > 0) {
            updateSubscription(subscriptions[0].id, {
              name: 'Netflix Premium',
              price: 1500,
            });
          }
        }}
      >
        Update Netflix
      </button>
      <button
        onClick={() => {
          if (subscriptions.length > 0) {
            deleteSubscription(subscriptions[0].id);
          }
        }}
      >
        Delete Netflix
      </button>
      <button onClick={() => clearAllSubscriptions()}>Clear All</button>
    </div>
  );
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <GuestSubscriptionProvider>{component}</GuestSubscriptionProvider>
  );
};

describe('GuestSubscriptionContext', () => {
  beforeEach(() => {
    // localStorageをクリア
    localStorage.clear();
  });

  describe('初期化', () => {
    it('初期状態では空のサブスクリプションリストを持つ', () => {
      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('subscription-count')).toHaveTextContent('0');
    });

    it('localStorageに保存されたサブスクリプションを復元する', () => {
      const mockSubscriptions: SubscriptionData[] = [
        {
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
        },
      ];

      localStorage.setItem(
        'guestSubscriptions',
        JSON.stringify(mockSubscriptions)
      );

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('subscription-count')).toHaveTextContent('1');
      expect(screen.getByTestId('subscription-0')).toHaveTextContent(
        'Netflix - 1000'
      );
    });

    it('localStorageのデータが無効な場合、エラーが発生する', () => {
      localStorage.setItem('guestSubscriptions', 'invalid-json');

      // JSON解析エラーが発生することを確認
      expect(() => {
        renderWithProvider(<TestComponent />);
      }).toThrow();
    });
  });

  describe('addSubscription', () => {
    it('新しいサブスクリプションを追加できる', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('subscription-count')).toHaveTextContent('0');

      await act(async () => {
        await user.click(screen.getByText('Add Netflix'));
      });

      expect(screen.getByTestId('subscription-count')).toHaveTextContent('1');
      expect(screen.getByTestId('subscription-0')).toHaveTextContent(
        'Netflix - 1000'
      );
    });

    it('複数のサブスクリプションを追加できる', async () => {
      const user = userEvent.setup();

      const TestComponentWithMultiple = () => {
        const { subscriptions, addSubscription } = useGuestSubscriptions();

        return (
          <div>
            <div data-testid="subscription-count">{subscriptions.length}</div>
            <button
              onClick={() =>
                addSubscription({
                  name: 'Netflix',
                  price: 1000,
                  currency: 'JPY',
                  paymentCycle: 'MONTHLY',
                  category: 'ENTERTAINMENT',
                  startDate: new Date('2023-01-01'),
                  nextPaymentDate: new Date('2023-02-01'),
                  description: 'Streaming service',
                  isActive: true,
                })
              }
            >
              Add Netflix
            </button>
            <button
              onClick={() =>
                addSubscription({
                  name: 'Spotify',
                  price: 500,
                  currency: 'JPY',
                  paymentCycle: 'MONTHLY',
                  category: 'MUSIC',
                  startDate: new Date('2023-01-01'),
                  nextPaymentDate: new Date('2023-02-01'),
                  description: 'Music streaming',
                  isActive: true,
                })
              }
            >
              Add Spotify
            </button>
          </div>
        );
      };

      renderWithProvider(<TestComponentWithMultiple />);

      await act(async () => {
        await user.click(screen.getByText('Add Netflix'));
      });

      await act(async () => {
        await user.click(screen.getByText('Add Spotify'));
      });

      expect(screen.getByTestId('subscription-count')).toHaveTextContent('2');
    });

    it('localStorageにサブスクリプションが保存される', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      await act(async () => {
        await user.click(screen.getByText('Add Netflix'));
      });

      const savedData = localStorage.getItem('guestSubscriptions');
      expect(savedData).toBeTruthy();

      const parsedData = JSON.parse(savedData!);
      expect(parsedData).toHaveLength(1);
      expect(parsedData[0].name).toBe('Netflix');
    });
  });

  describe('updateSubscription', () => {
    it('既存のサブスクリプションを更新できる', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      // まずサブスクリプションを追加
      await act(async () => {
        await user.click(screen.getByText('Add Netflix'));
      });

      expect(screen.getByTestId('subscription-0')).toHaveTextContent(
        'Netflix - 1000'
      );

      // サブスクリプションを更新
      await act(async () => {
        await user.click(screen.getByText('Update Netflix'));
      });

      expect(screen.getByTestId('subscription-0')).toHaveTextContent(
        'Netflix Premium - 1500'
      );
    });

    it('存在しないサブスクリプションを更新しようとした場合、何も起こらない', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('subscription-count')).toHaveTextContent('0');

      await act(async () => {
        await user.click(screen.getByText('Update Netflix'));
      });

      expect(screen.getByTestId('subscription-count')).toHaveTextContent('0');
    });

    it('更新後、localStorageに変更が保存される', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      await act(async () => {
        await user.click(screen.getByText('Add Netflix'));
      });

      await act(async () => {
        await user.click(screen.getByText('Update Netflix'));
      });

      const savedData = localStorage.getItem('guestSubscriptions');
      const parsedData = JSON.parse(savedData!);
      expect(parsedData[0].name).toBe('Netflix Premium');
      expect(parsedData[0].price).toBe(1500);
    });
  });

  describe('deleteSubscription', () => {
    it('既存のサブスクリプションを削除できる', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      // まずサブスクリプションを追加
      await act(async () => {
        await user.click(screen.getByText('Add Netflix'));
      });

      expect(screen.getByTestId('subscription-count')).toHaveTextContent('1');

      // サブスクリプションを削除
      await act(async () => {
        await user.click(screen.getByText('Delete Netflix'));
      });

      expect(screen.getByTestId('subscription-count')).toHaveTextContent('0');
    });

    it('存在しないサブスクリプションを削除しようとした場合、何も起こらない', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('subscription-count')).toHaveTextContent('0');

      await act(async () => {
        await user.click(screen.getByText('Delete Netflix'));
      });

      expect(screen.getByTestId('subscription-count')).toHaveTextContent('0');
    });

    it('削除後、localStorageからも削除される', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      await act(async () => {
        await user.click(screen.getByText('Add Netflix'));
      });

      await act(async () => {
        await user.click(screen.getByText('Delete Netflix'));
      });

      const savedData = localStorage.getItem('guestSubscriptions');
      const parsedData = JSON.parse(savedData!);
      expect(parsedData).toHaveLength(0);
    });
  });

  describe('clearSubscriptions', () => {
    it('すべてのサブスクリプションを削除できる', async () => {
      const user = userEvent.setup();

      const TestComponentWithMultiple = () => {
        const { subscriptions, addSubscription, clearAllSubscriptions } =
          useGuestSubscriptions();

        return (
          <div>
            <div data-testid="subscription-count">{subscriptions.length}</div>
            <button
              onClick={() =>
                addSubscription({
                  name: 'Netflix',
                  price: 1000,
                  currency: 'JPY',
                  paymentCycle: 'MONTHLY',
                  category: 'ENTERTAINMENT',
                  startDate: new Date('2023-01-01'),
                  nextPaymentDate: new Date('2023-02-01'),
                  description: 'Streaming service',
                  isActive: true,
                })
              }
            >
              Add Netflix
            </button>
            <button
              onClick={() =>
                addSubscription({
                  name: 'Spotify',
                  price: 500,
                  currency: 'JPY',
                  paymentCycle: 'MONTHLY',
                  category: 'MUSIC',
                  startDate: new Date('2023-01-01'),
                  nextPaymentDate: new Date('2023-02-01'),
                  description: 'Music streaming',
                  isActive: true,
                })
              }
            >
              Add Spotify
            </button>
            <button onClick={() => clearAllSubscriptions()}>Clear All</button>
          </div>
        );
      };

      renderWithProvider(<TestComponentWithMultiple />);

      await act(async () => {
        await user.click(screen.getByText('Add Netflix'));
      });

      await act(async () => {
        await user.click(screen.getByText('Add Spotify'));
      });

      expect(screen.getByTestId('subscription-count')).toHaveTextContent('2');

      await act(async () => {
        await user.click(screen.getByText('Clear All'));
      });

      expect(screen.getByTestId('subscription-count')).toHaveTextContent('0');
    });

    it('空のリストでclearSubscriptionsを呼んでもエラーが発生しない', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('subscription-count')).toHaveTextContent('0');

      await act(async () => {
        await user.click(screen.getByText('Clear All'));
      });

      expect(screen.getByTestId('subscription-count')).toHaveTextContent('0');
    });

    it('clearSubscriptions後、localStorageもクリアされる', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      await act(async () => {
        await user.click(screen.getByText('Add Netflix'));
      });

      await act(async () => {
        await user.click(screen.getByText('Clear All'));
      });

      const savedData = localStorage.getItem('guestSubscriptions');
      expect(savedData).toBeNull();
    });
  });

  describe('useGuestSubscriptions hook', () => {
    it('GuestSubscriptionProviderの外で使用した場合、エラーを投げる', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow(
        'useGuestSubscriptions must be used within a GuestSubscriptionProvider'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('localStorageの永続化', () => {
    it('サブスクリプションの変更がlocalStorageに即座に反映される', async () => {
      const user = userEvent.setup();

      renderWithProvider(<TestComponent />);

      await act(async () => {
        await user.click(screen.getByText('Add Netflix'));
      });

      let savedData = localStorage.getItem('guestSubscriptions');
      let parsedData = JSON.parse(savedData!);
      expect(parsedData).toHaveLength(1);

      await act(async () => {
        await user.click(screen.getByText('Update Netflix'));
      });

      savedData = localStorage.getItem('guestSubscriptions');
      parsedData = JSON.parse(savedData!);
      expect(parsedData[0].name).toBe('Netflix Premium');

      await act(async () => {
        await user.click(screen.getByText('Delete Netflix'));
      });

      savedData = localStorage.getItem('guestSubscriptions');
      parsedData = JSON.parse(savedData!);
      expect(parsedData).toHaveLength(0);
    });
  });
});
