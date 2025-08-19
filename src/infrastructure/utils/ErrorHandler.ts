import { ApiResponse } from './ApiResponse';

export class ErrorHandler {
  /**
   * APIエラーの処理
   */
  static handleApiError(error: unknown, context: string): Response {
    // テスト環境ではエラーログを抑制
    if (process.env.NODE_ENV === 'test') {
      // テスト環境ではログを出力しない
    } else {
      console.error(`Error in ${context}:`, error);
    }

    const isProduction = process.env.NODE_ENV === 'production';

    if (error instanceof Error) {
      // 既知のエラータイプの処理
      if (
        error.message.includes('Invalid payment cycle') ||
        error.message.includes('Invalid currency') ||
        error.message.includes('Invalid email') ||
        error.message.includes('Password must be')
      ) {
        return ApiResponse.validationError(error.message);
      }

      if (
        error.message.includes('User not found') ||
        error.message.includes('Subscription not found')
      ) {
        return ApiResponse.notFound(error.message);
      }

      if (
        error.message.includes('Unauthorized') ||
        error.message.includes('Authentication failed')
      ) {
        return ApiResponse.unauthorized(error.message);
      }

      // 本番環境では詳細なエラー情報を隠す
      const errorMessage = isProduction
        ? 'Internal server error'
        : error.message;

      return ApiResponse.serverError(errorMessage);
    }

    // 未知のエラータイプ
    const errorMessage = isProduction
      ? 'Internal server error'
      : 'Unknown error occurred';

    return ApiResponse.serverError(errorMessage);
  }

  /**
   * 非同期関数のエラーハンドリングラッパー
   */
  static async withErrorHandling<T>(
    fn: () => Promise<T>,
    context: string
  ): Promise<T | Response> {
    try {
      return await fn();
    } catch (error) {
      return this.handleApiError(error, context);
    }
  }
}
