import { NextResponse } from 'next/server';

export class ApiResponse {
  /**
   * 成功レスポンス
   */
  static success<T>(data: T, status: number = 200): NextResponse {
    return NextResponse.json(data, { status });
  }

  /**
   * エラーレスポンス
   */
  static error(message: string, status: number = 500): NextResponse {
    return NextResponse.json({ error: message }, { status });
  }

  /**
   * バリデーションエラーレスポンス
   */
  static validationError(message: string): NextResponse {
    return this.error(message, 400);
  }

  /**
   * 認証エラーレスポンス
   */
  static unauthorized(message: string = '認証が必要です'): NextResponse {
    return this.error(message, 401);
  }

  /**
   * 権限エラーレスポンス
   */
  static forbidden(message: string = 'アクセスが拒否されました'): NextResponse {
    return this.error(message, 403);
  }

  /**
   * リソース未発見エラーレスポンス
   */
  static notFound(message: string = 'リソースが見つかりません'): NextResponse {
    return this.error(message, 404);
  }

  /**
   * サーバーエラーレスポンス
   */
  static serverError(
    message: string = 'サーバー内部エラーが発生しました'
  ): NextResponse {
    return this.error(message, 500);
  }
}
