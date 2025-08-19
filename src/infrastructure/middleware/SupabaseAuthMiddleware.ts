import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../supabase/client';
import { ApiResponse } from '../utils/ApiResponse';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
  };
}

export class SupabaseAuthMiddleware {
  /**
   * Supabaseセッションを使用した認証
   */
  static async authenticate(
    request: NextRequest
  ): Promise<AuthenticatedRequest | NextResponse> {
    try {
      // Authorizationヘッダーからトークンを取得
      const authHeader = request.headers.get('authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ApiResponse.unauthorized('Authorization header is required');
      }

      const token = authHeader.substring(7); // "Bearer "を除去

      // Supabaseセッションを検証
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        return ApiResponse.unauthorized('Invalid or expired token');
      }

      // 認証済みリクエストを作成
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = {
        id: data.user.id,
        email: data.user.email!,
      };

      return authenticatedRequest;
    } catch (error) {
      console.error('SupabaseAuthMiddleware: Authentication error:', error);
      return ApiResponse.unauthorized('Authentication failed');
    }
  }

  /**
   * 認証が必要なAPIエンドポイント用のラッパー関数
   */
  static withAuth(
    handler: (request: AuthenticatedRequest) => Promise<NextResponse>
  ) {
    return async (request: NextRequest): Promise<NextResponse> => {
      const authenticatedRequest = await this.authenticate(request);

      if (authenticatedRequest instanceof NextResponse) {
        return authenticatedRequest; // 認証エラー
      }

      return handler(authenticatedRequest);
    };
  }

  /**
   * セッションからユーザー情報を取得（クライアントサイド用）
   */
  static async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email!,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
}
