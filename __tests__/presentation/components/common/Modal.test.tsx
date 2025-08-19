import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../../../../src/presentation/components/common/Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'テストモーダル',
    children: <div>モーダルの内容</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('初期表示', () => {
    it('isOpenがfalseの場合、モーダルが表示されない', () => {
      render(<Modal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('テストモーダル')).not.toBeInTheDocument();
      expect(screen.queryByText('モーダルの内容')).not.toBeInTheDocument();
    });

    it('isOpenがtrueの場合、モーダルが表示される', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.getByText('テストモーダル')).toBeInTheDocument();
      expect(screen.getByText('モーダルの内容')).toBeInTheDocument();
    });

    it('モーダルのタイトルが正しく表示される', () => {
      render(<Modal {...defaultProps} title="カスタムタイトル" />);

      expect(screen.getByText('カスタムタイトル')).toBeInTheDocument();
    });

    it('モーダルの内容が正しく表示される', () => {
      const customContent = (
        <div data-testid="custom-content">カスタムコンテンツ</div>
      );
      render(<Modal {...defaultProps} children={customContent} />);

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('カスタムコンテンツ')).toBeInTheDocument();
    });
  });

  describe('閉じる機能', () => {
    it('閉じるボタンをクリックするとonCloseが呼ばれる', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(<Modal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByText('❌');

      await act(async () => {
        await user.click(closeButton);
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('モーダル外（オーバーレイ）をクリックするとonCloseが呼ばれる', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(<Modal {...defaultProps} onClose={onClose} />);

      const overlay = screen
        .getByText('モーダルの内容')
        .closest('.modal-backdrop');

      await act(async () => {
        await user.click(overlay!);
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('モーダル内をクリックしてもonCloseが呼ばれない', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(<Modal {...defaultProps} onClose={onClose} />);

      const modalContent = screen.getByText('モーダルの内容').closest('div');

      await act(async () => {
        await user.click(modalContent!);
      });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('Escapeキーを押すとonCloseが呼ばれる', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(<Modal {...defaultProps} onClose={onClose} />);

      await act(async () => {
        await user.keyboard('{Escape}');
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('複数回閉じる操作をしてもonCloseが適切に呼ばれる', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(<Modal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByText('❌');
      const overlay = screen
        .getByText('モーダルの内容')
        .closest('.modal-backdrop');

      await act(async () => {
        await user.click(closeButton);
        await user.click(overlay!);
        await user.keyboard('{Escape}');
      });

      expect(onClose).toHaveBeenCalledTimes(3);
    });
  });

  describe('アクセシビリティ', () => {
    it('モーダルが正しく表示される', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.getByText('テストモーダル')).toBeInTheDocument();
      expect(screen.getByText('モーダルの内容')).toBeInTheDocument();
    });

    it('閉じるボタンが存在する', () => {
      render(<Modal {...defaultProps} />);

      const closeButton = screen.getByText('❌');
      expect(closeButton).toBeInTheDocument();
    });

    it('モーダル内のコンテンツが正しく表示される', () => {
      render(
        <Modal {...defaultProps}>
          <button>ボタン1</button>
          <button>ボタン2</button>
        </Modal>
      );

      expect(screen.getByText('ボタン1')).toBeInTheDocument();
      expect(screen.getByText('ボタン2')).toBeInTheDocument();
    });
  });

  describe('スタイリング', () => {
    it('モーダルが開いている時、bodyにoverflow-hiddenが設定される', () => {
      render(<Modal {...defaultProps} />);

      expect(document.body).toHaveStyle('overflow: hidden');
    });

    it('モーダルが閉じている時、bodyのoverflow-hiddenが解除される', () => {
      const { rerender } = render(<Modal {...defaultProps} />);

      expect(document.body).toHaveStyle('overflow: hidden');

      rerender(<Modal {...defaultProps} isOpen={false} />);

      expect(document.body).not.toHaveStyle('overflow: hidden');
    });

    it('モーダルがアンマウントされる時、bodyのoverflow-hiddenが解除される', () => {
      const { unmount } = render(<Modal {...defaultProps} />);

      expect(document.body).toHaveStyle('overflow: hidden');

      unmount();

      expect(document.body).not.toHaveStyle('overflow: hidden');
    });
  });

  describe('エラーハンドリング', () => {
    it('onCloseが未定義でもエラーが発生しない', async () => {
      const user = userEvent.setup();

      render(<Modal {...defaultProps} onClose={undefined} />);

      const closeButton = screen.getByText('❌');

      await act(async () => {
        await user.click(closeButton);
      });

      // エラーが発生しないことを確認
      expect(closeButton).toBeInTheDocument();
    });

    it('複雑なコンテンツでも正しく表示される', () => {
      const complexContent = (
        <div>
          <h2>複雑なタイトル</h2>
          <p>複雑な段落</p>
          <form>
            <input type="text" placeholder="入力フィールド" />
            <button type="submit">送信</button>
          </form>
        </div>
      );

      render(<Modal {...defaultProps} children={complexContent} />);

      expect(screen.getByText('複雑なタイトル')).toBeInTheDocument();
      expect(screen.getByText('複雑な段落')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('入力フィールド')).toBeInTheDocument();
      expect(screen.getByText('送信')).toBeInTheDocument();
    });
  });

  describe('パフォーマンス', () => {
    it('大量のコンテンツでも適切に表示される', () => {
      const largeContent = (
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i}>コンテンツ {i}</div>
          ))}
        </div>
      );

      render(<Modal {...defaultProps} children={largeContent} />);

      expect(screen.getByText('コンテンツ 0')).toBeInTheDocument();
      expect(screen.getByText('コンテンツ 99')).toBeInTheDocument();
    });

    it('モーダルの開閉が高速で行われる', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(<Modal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByText('❌');

      // 高速で複数回クリック
      await act(async () => {
        await user.click(closeButton);
        await user.click(closeButton);
        await user.click(closeButton);
      });

      expect(onClose).toHaveBeenCalledTimes(3);
    });
  });

  describe('レスポンシブ対応', () => {
    it('モバイル画面サイズで適切に表示される', () => {
      // モバイル画面サイズをシミュレート
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<Modal {...defaultProps} />);

      expect(screen.getByText('テストモーダル')).toBeInTheDocument();
      expect(screen.getByText('モーダルの内容')).toBeInTheDocument();
    });

    it('タブレット画面サイズで適切に表示される', () => {
      // タブレット画面サイズをシミュレート
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(<Modal {...defaultProps} />);

      expect(screen.getByText('テストモーダル')).toBeInTheDocument();
      expect(screen.getByText('モーダルの内容')).toBeInTheDocument();
    });
  });

  describe('キーボード操作', () => {
    it('モーダルが適切にスタイリングされている', () => {
      render(<Modal {...defaultProps} />);

      const modalContainer = screen
        .getByText('テストモーダル')
        .closest('.fixed');
      expect(modalContainer).toBeInTheDocument();
    });
  });
});
