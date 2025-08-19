import {
  SupabaseAuthMiddleware,
  AuthenticatedRequest,
} from '../../../src/infrastructure/middleware/SupabaseAuthMiddleware';
import { supabase } from '../../../src/infrastructure/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

// Supabaseクライアントのモック
jest.mock('../../../src/infrastructure/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

describe('SupabaseAuthMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('有効なBearerトークンで認証が成功する', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer valid-token',
        },
      });

      const result = await SupabaseAuthMiddleware.authenticate(request);

      expect(supabase.auth.getUser).toHaveBeenCalledWith('valid-token');
      expect(result).toBeInstanceOf(NextRequest);
      expect((result as AuthenticatedRequest).user).toEqual({
        id: 'user-1',
        email: 'test@example.com',
      });
    });

    it('Authorizationヘッダーが存在しない場合、401エラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      const result = await SupabaseAuthMiddleware.authenticate(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(401);
      const responseData = await (result as NextResponse).json();
      expect(responseData).toEqual({
        error: 'Authorization header is required',
      });
    });

    it('AuthorizationヘッダーがBearerで始まらない場合、401エラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Invalid valid-token',
        },
      });

      const result = await SupabaseAuthMiddleware.authenticate(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(401);
      const responseData = await (result as NextResponse).json();
      expect(responseData).toEqual({
        error: 'Authorization header is required',
      });
    });

    it('無効なトークンの場合、401エラーを返す', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      const result = await SupabaseAuthMiddleware.authenticate(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(401);
      const responseData = await (result as NextResponse).json();
      expect(responseData).toEqual({
        error: 'Invalid or expired token',
      });
    });

    it('ユーザーが存在しない場合、401エラーを返す', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer valid-token',
        },
      });

      const result = await SupabaseAuthMiddleware.authenticate(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(401);
      const responseData = await (result as NextResponse).json();
      expect(responseData).toEqual({
        error: 'Invalid or expired token',
      });
    });

    it('Supabaseエラーが発生した場合、401エラーを返す', async () => {
      (supabase.auth.getUser as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer valid-token',
        },
      });

      const result = await SupabaseAuthMiddleware.authenticate(request);

      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(401);
      const responseData = await (result as NextResponse).json();
      expect(responseData).toEqual({
        error: 'Authentication failed',
      });
    });

    it('予期しないエラーが発生した場合、401エラーを返す', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (supabase.auth.getUser as jest.Mock).mockRejectedValue(
        new Error('Unexpected error')
      );

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer valid-token',
        },
      });

      const result = await SupabaseAuthMiddleware.authenticate(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        'SupabaseAuthMiddleware: Authentication error:',
        expect.any(Error)
      );
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(401);

      consoleSpy.mockRestore();
    });
  });

  describe('withAuth', () => {
    it('認証が成功した場合、ハンドラーを実行する', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockHandler = jest
        .fn()
        .mockResolvedValue(NextResponse.json({ success: true }));

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer valid-token',
        },
      });

      const wrappedHandler = SupabaseAuthMiddleware.withAuth(mockHandler);
      const result = await wrappedHandler(request);

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: {
            id: 'user-1',
            email: 'test@example.com',
          },
        })
      );
      expect(result).toBeInstanceOf(NextResponse);
      expect(await result.json()).toEqual({ success: true });
    });

    it('認証が失敗した場合、ハンドラーを実行せずにエラーを返す', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      const mockHandler = jest.fn();

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      const wrappedHandler = SupabaseAuthMiddleware.withAuth(mockHandler);
      const result = await wrappedHandler(request);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(401);
    });
  });

  describe('getCurrentUser', () => {
    it('正常に現在のユーザーを取得する', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await SupabaseAuthMiddleware.getCurrentUser();

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
      });
    });

    it('ユーザーが存在しない場合、nullを返す', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await SupabaseAuthMiddleware.getCurrentUser();

      expect(result).toBeNull();
    });

    it('Supabaseエラーが発生した場合、nullを返す', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Session error' },
      });

      const result = await SupabaseAuthMiddleware.getCurrentUser();

      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });

    it('予期しないエラーが発生した場合、nullを返す', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (supabase.auth.getUser as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const result = await SupabaseAuthMiddleware.getCurrentUser();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error getting current user:',
        expect.any(Error)
      );
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe('エラーハンドリング', () => {
    it('複雑なエラーシナリオを適切に処理する', async () => {
      // 最初は成功、次は失敗するシナリオ
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      (supabase.auth.getUser as jest.Mock)
        .mockResolvedValueOnce({
          data: { user: mockUser },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { user: null },
          error: { message: 'Token expired' },
        });

      const request1 = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer valid-token',
        },
      });

      const request2 = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer expired-token',
        },
      });

      const result1 = await SupabaseAuthMiddleware.authenticate(request1);
      const result2 = await SupabaseAuthMiddleware.authenticate(request2);

      expect(result1).toBeInstanceOf(NextRequest);
      expect(result2).toBeInstanceOf(NextResponse);
      expect((result2 as NextResponse).status).toBe(401);
    });

    it('異なるAuthorizationヘッダーフォーマットを適切に処理する', async () => {
      const testCases = [
        { header: 'Bearer token', expected: 'token' },
        { header: 'Bearer token123', expected: 'token123' },
        { header: 'Bearer ', expected: '' },
      ];

      for (const { header, expected } of testCases) {
        const mockUser = {
          id: 'user-1',
          email: 'test@example.com',
        };

        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        const request = new NextRequest('http://localhost:3000/api/test', {
          headers: {
            authorization: header,
          },
        });

        const result = await SupabaseAuthMiddleware.authenticate(request);

        if (header.startsWith('Bearer ')) {
          expect(supabase.auth.getUser).toHaveBeenCalledWith(expected);
        } else {
          expect(result).toBeInstanceOf(NextResponse);
          expect((result as NextResponse).status).toBe(401);
        }

        // モックをリセット
        jest.clearAllMocks();
      }
    });
  });
});
