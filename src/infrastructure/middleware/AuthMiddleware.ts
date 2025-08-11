import { NextRequest, NextResponse } from 'next/server';
import { JwtTokenManager } from '../utils/JwtTokenManager';
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../PrismaUserRepository';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
  };
}

export class AuthMiddleware {
  private static prisma = new PrismaClient();
  private static userRepository = new PrismaUserRepository(this.prisma);

  /**
   * 認証ミドルウェア
   * AuthorizationヘッダーからJWTトークンを取得し、ユーザー情報を検証する
   */
  static async authenticate(
    request: NextRequest
  ): Promise<AuthenticatedRequest | NextResponse> {
    try {
      const authHeader = request.headers.get('authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Authorization header is required' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7); // "Bearer "を除去

      // JWTトークンの検証
      const payload = JwtTokenManager.verifyToken(token);

      // ユーザーの存在確認
      const user = await this.userRepository.findById(payload.userId);

      // 認証済みリクエストを作成
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = {
        id: user.toDTO().id,
        email: user.toDTO().email.value,
      };

      return authenticatedRequest;
    } catch (error) {
      console.error('Authentication error:', error);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
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
}
