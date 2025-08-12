import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
      console.log('SupabaseAuthMiddleware: Starting authentication...');

      // Authorizationヘッダーからトークンを取得
      const authHeader = request.headers.get('authorization');
      console.log(
        'SupabaseAuthMiddleware: Authorization header:',
        authHeader ? 'Present' : 'Missing'
      );

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log(
          'SupabaseAuthMiddleware: Invalid authorization header format'
        );
        return NextResponse.json(
          { error: 'Authorization header is required' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7); // "Bearer "を除去
      console.log('SupabaseAuthMiddleware: Token length:', token.length);
      console.log(
        'SupabaseAuthMiddleware: Token starts with:',
        token.substring(0, 20) + '...'
      );

      // Supabaseクライアントを使用した検証
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error(
          'SupabaseAuthMiddleware: Missing Supabase environment variables'
        );
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        );
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      try {
        // Supabaseセッションを検証
        console.log(
          'SupabaseAuthMiddleware: Validating token with Supabase...'
        );
        const { data, error } = await supabase.auth.getUser(token);

        if (error) {
          console.error('SupabaseAuthMiddleware: Supabase auth error:', error);
          return NextResponse.json(
            { error: 'Invalid or expired token' },
            { status: 401 }
          );
        }

        if (!data.user) {
          console.log(
            'SupabaseAuthMiddleware: No user data returned from Supabase'
          );
          return NextResponse.json(
            { error: 'Invalid or expired token' },
            { status: 401 }
          );
        }

        console.log(
          'SupabaseAuthMiddleware: Authentication successful for user:',
          data.user.id
        );

        // 認証済みリクエストを作成
        const authenticatedRequest = request as AuthenticatedRequest;
        authenticatedRequest.user = {
          id: data.user.id,
          email: data.user.email!,
        };

        return authenticatedRequest;
      } catch (error) {
        console.error(
          'SupabaseAuthMiddleware: Unexpected authentication error:',
          error
        );
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error(
        'SupabaseAuthMiddleware: Unexpected authentication error:',
        error
      );
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
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
      // クライアントサイド用のSupabaseクライアントをインポート
      const { supabase } = await import('../supabase/client');

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
