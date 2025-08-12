import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '../../../../src/infrastructure/services/SupabaseAuthService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // バリデーション
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // パスワードの強度チェック
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Supabase認証を使用
    const result = await SupabaseAuthService.signUp(email, password);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    if (!result.user) {
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: result.user,
      session: result.session,
      message: 'Registration successful',
    });
  } catch (error) {
    console.error('Error in Supabase registration:', error);

    const isProduction = process.env.NODE_ENV === 'production';
    const errorMessage = isProduction
      ? 'Internal server error'
      : error instanceof Error
        ? error.message
        : 'Unknown error';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
