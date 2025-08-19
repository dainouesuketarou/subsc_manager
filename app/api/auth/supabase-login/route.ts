import { NextRequest } from 'next/server';
import { SupabaseAuthService } from '../../../../src/infrastructure/services/SupabaseAuthService';
import { ApiResponse } from '../../../../src/infrastructure/utils/ApiResponse';
import { Validation } from '../../../../src/infrastructure/utils/Validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // バリデーション
    const validationErrors = Validation.validateFields({
      email: { value: email, rules: ['required', 'email'] },
      password: { value: password, rules: ['required', 'password'] },
    });

    if (validationErrors.length > 0) {
      return ApiResponse.validationError(validationErrors[0]);
    }

    // Supabase認証を使用
    const result = await SupabaseAuthService.signIn(email, password);

    if (result.error) {
      return ApiResponse.validationError(result.error);
    }

    if (!result.user) {
      return ApiResponse.unauthorized('認証に失敗しました');
    }

    return ApiResponse.success({
      user: result.user,
      session: result.session,
    });
  } catch (error) {
    console.error('Error in Supabase login:', error);

    const isProduction = process.env.NODE_ENV === 'production';
    const errorMessage = isProduction
      ? 'Internal server error'
      : error instanceof Error
        ? error.message
        : 'Unknown error';

    return ApiResponse.serverError(errorMessage);
  }
}
