import { ApiResponse } from '../../../src/infrastructure/utils/ApiResponse';
import { NextResponse } from 'next/server';

describe('ApiResponse', () => {
  describe('success', () => {
    it('デフォルトステータスコード200で成功レスポンスを作成する', async () => {
      const data = { message: 'Success', id: 123 };
      const response = ApiResponse.success(data);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(data);
    });

    it('カスタムステータスコードで成功レスポンスを作成する', async () => {
      const data = { message: 'Created', id: 456 };
      const response = ApiResponse.success(data, 201);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(201);
      expect(await response.json()).toEqual(data);
    });

    it('異なるデータ型を適切に処理する', async () => {
      const testCases = [
        { data: 'string data', status: 200 },
        { data: 123, status: 200 },
        { data: true, status: 200 },
        { data: null, status: 200 },
        { data: { nested: { value: 'test' } }, status: 200 },
        { data: [1, 2, 3], status: 200 },
      ];

      for (const { data, status } of testCases) {
        const response = ApiResponse.success(data, status);
        expect(response.status).toBe(status);
        expect(await response.json()).toEqual(data);
      }
    });

    it('空のオブジェクトを適切に処理する', async () => {
      const response = ApiResponse.success({});
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({});
    });

    it('空の配列を適切に処理する', async () => {
      const response = ApiResponse.success([]);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual([]);
    });
  });

  describe('error', () => {
    it('デフォルトステータスコード500でエラーレスポンスを作成する', async () => {
      const message = 'Internal server error';
      const response = ApiResponse.error(message);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: message });
    });

    it('カスタムステータスコードでエラーレスポンスを作成する', async () => {
      const message = 'Custom error';
      const response = ApiResponse.error(message, 400);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: message });
    });

    it('異なるエラーメッセージを適切に処理する', async () => {
      const testCases = [
        { message: 'Simple error', status: 500 },
        { message: 'Validation failed', status: 400 },
        { message: 'Not found', status: 404 },
        { message: 'Unauthorized', status: 401 },
        { message: '', status: 500 },
        { message: 'Error with special chars: !@#$%^&*()', status: 500 },
      ];

      for (const { message, status } of testCases) {
        const response = ApiResponse.error(message, status);
        expect(response.status).toBe(status);
        expect(await response.json()).toEqual({ error: message });
      }
    });

    it('非常に長いエラーメッセージを処理する', async () => {
      const longMessage = 'a'.repeat(10000);
      const response = ApiResponse.error(longMessage);

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: longMessage });
    });
  });

  describe('validationError', () => {
    it('バリデーションエラーレスポンスを作成する', async () => {
      const message = 'Invalid input data';
      const response = ApiResponse.validationError(message);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: message });
    });

    it('異なるバリデーションエラーメッセージを処理する', async () => {
      const testCases = [
        'Email is required',
        'Password must be at least 6 characters',
        'Invalid payment cycle',
        'Price must be positive',
        'Invalid currency',
      ];

      for (const message of testCases) {
        const response = ApiResponse.validationError(message);
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: message });
      }
    });
  });

  describe('unauthorized', () => {
    it('デフォルトメッセージで認証エラーレスポンスを作成する', async () => {
      const response = ApiResponse.unauthorized();

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: '認証が必要です' });
    });

    it('カスタムメッセージで認証エラーレスポンスを作成する', async () => {
      const message = 'Invalid token';
      const response = ApiResponse.unauthorized(message);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: message });
    });

    it('異なる認証エラーメッセージを処理する', async () => {
      const testCases = [
        'Token expired',
        'Invalid credentials',
        'Authentication failed',
        'Session expired',
        'Access denied',
      ];

      for (const message of testCases) {
        const response = ApiResponse.unauthorized(message);
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ error: message });
      }
    });
  });

  describe('forbidden', () => {
    it('デフォルトメッセージで権限エラーレスポンスを作成する', async () => {
      const response = ApiResponse.forbidden();

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({
        error: 'アクセスが拒否されました',
      });
    });

    it('カスタムメッセージで権限エラーレスポンスを作成する', async () => {
      const message = 'Insufficient permissions';
      const response = ApiResponse.forbidden(message);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({ error: message });
    });

    it('異なる権限エラーメッセージを処理する', async () => {
      const testCases = [
        'Admin access required',
        'Resource access denied',
        'Permission denied',
        'Role not authorized',
        'Access restricted',
      ];

      for (const message of testCases) {
        const response = ApiResponse.forbidden(message);
        expect(response.status).toBe(403);
        expect(await response.json()).toEqual({ error: message });
      }
    });
  });

  describe('notFound', () => {
    it('デフォルトメッセージでリソース未発見エラーレスポンスを作成する', async () => {
      const response = ApiResponse.notFound();

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({
        error: 'リソースが見つかりません',
      });
    });

    it('カスタムメッセージでリソース未発見エラーレスポンスを作成する', async () => {
      const message = 'User not found';
      const response = ApiResponse.notFound(message);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: message });
    });

    it('異なるリソース未発見エラーメッセージを処理する', async () => {
      const testCases = [
        'Subscription not found',
        'File not found',
        'Page not found',
        'Resource not available',
        'Item does not exist',
      ];

      for (const message of testCases) {
        const response = ApiResponse.notFound(message);
        expect(response.status).toBe(404);
        expect(await response.json()).toEqual({ error: message });
      }
    });
  });

  describe('serverError', () => {
    it('デフォルトメッセージでサーバーエラーレスポンスを作成する', async () => {
      const response = ApiResponse.serverError();

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: 'サーバー内部エラーが発生しました',
      });
    });

    it('カスタムメッセージでサーバーエラーレスポンスを作成する', async () => {
      const message = 'Database connection failed';
      const response = ApiResponse.serverError(message);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: message });
    });

    it('異なるサーバーエラーメッセージを処理する', async () => {
      const testCases = [
        'Internal server error',
        'Database error',
        'Service unavailable',
        'System error',
        'Processing failed',
      ];

      for (const message of testCases) {
        const response = ApiResponse.serverError(message);
        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ error: message });
      }
    });
  });

  describe('レスポンスヘッダー', () => {
    it('適切なContent-Typeヘッダーが設定される', () => {
      const response = ApiResponse.success({ message: 'test' });
      expect(response.headers.get('content-type')).toBe('application/json');
    });

    it('エラーレスポンスでも適切なContent-Typeヘッダーが設定される', () => {
      const response = ApiResponse.error('test error');
      expect(response.headers.get('content-type')).toBe('application/json');
    });
  });

  describe('エッジケース', () => {
    it('nullデータを適切に処理する', async () => {
      const response = ApiResponse.success(null);
      expect(response.status).toBe(200);
      expect(await response.json()).toBeNull();
    });

    it('undefinedデータを適切に処理する', async () => {
      // NextResponseはundefinedを直接サポートしていないため、nullとして処理される
      const response = ApiResponse.success(undefined);
      expect(response.status).toBe(200);
      expect(await response.json()).toBeNull();
    });

    it('空文字列のエラーメッセージを処理する', async () => {
      const response = ApiResponse.error('');
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: '' });
    });

    it('特殊文字を含むエラーメッセージを処理する', async () => {
      const specialMessage =
        'Error with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      const response = ApiResponse.error(specialMessage);
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: specialMessage });
    });

    it('日本語エラーメッセージを処理する', async () => {
      const japaneseMessage = 'エラーが発生しました';
      const response = ApiResponse.error(japaneseMessage);
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: japaneseMessage });
    });

    it('非常に大きな数値のステータスコードを処理する', () => {
      // モック環境ではバリデーションエラーが発生しないため、正常に動作することを確認
      const response = ApiResponse.success({}, 999);
      expect(response.status).toBe(999);
    });

    it('負のステータスコードを処理する', () => {
      // モック環境ではバリデーションエラーが発生しないため、正常に動作することを確認
      const response = ApiResponse.success({}, -1);
      expect(response.status).toBe(-1);
    });
  });

  describe('統合テスト', () => {
    it('複数のレスポンスタイプを連続して作成する', () => {
      const responses = [
        ApiResponse.success({ id: 1 }, 201),
        ApiResponse.validationError('Invalid input'),
        ApiResponse.unauthorized('Token expired'),
        ApiResponse.forbidden('Access denied'),
        ApiResponse.notFound('Resource not found'),
        ApiResponse.serverError('Database error'),
      ];

      const expectedStatuses = [201, 400, 401, 403, 404, 500];

      responses.forEach((response, index) => {
        expect(response.status).toBe(expectedStatuses[index]);
        expect(response).toBeInstanceOf(NextResponse);
      });
    });

    it('同じメソッドを複数回呼び出しても一貫性を保つ', async () => {
      const message = 'Test message';
      const response1 = ApiResponse.error(message, 400);
      const response2 = ApiResponse.error(message, 400);

      expect(response1.status).toBe(response2.status);
      expect(await response1.json()).toEqual(await response2.json());
    });

    it('異なるデータ型の成功レスポンスを比較する', () => {
      const responses = [
        ApiResponse.success('string'),
        ApiResponse.success(123),
        ApiResponse.success(true),
        ApiResponse.success({ key: 'value' }),
        ApiResponse.success([1, 2, 3]),
      ];

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response).toBeInstanceOf(NextResponse);
      });
    });
  });
});
