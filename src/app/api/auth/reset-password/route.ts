import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../../../../infrastructure/PrismaUserRepository';
import { ResetPasswordUseCase } from '../../../../application/usecase/ResetPasswordUseCase';

const prisma = new PrismaClient();
const userRepository = new PrismaUserRepository(prisma);
const resetPasswordUseCase = new ResetPasswordUseCase(userRepository);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    // バリデーション
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    const result = await resetPasswordUseCase.execute({
      token,
      newPassword,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error resetting password:', error);

    if (error instanceof Error) {
      if (
        error.message.includes('Token and new password are required') ||
        error.message.includes('Password must be at least 8 characters long') ||
        error.message.includes('Invalid reset token') ||
        error.message.includes('Invalid or expired reset token')
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
