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

    // Supabase認証を使用
    const result = await SupabaseAuthService.signIn(email, password);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    if (!result.user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    return NextResponse.json({
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

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
