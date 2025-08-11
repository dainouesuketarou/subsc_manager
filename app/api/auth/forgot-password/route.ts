import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../../../../src/infrastructure/PrismaUserRepository';
import { RequestPasswordResetUseCase } from '../../../../src/application/usecase/RequestPasswordResetUseCase';

const prisma = new PrismaClient();
const userRepository = new PrismaUserRepository(prisma);
const requestPasswordResetUseCase = new RequestPasswordResetUseCase(
  userRepository
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // バリデーション
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const result = await requestPasswordResetUseCase.execute({
      email,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error requesting password reset:', error);

    if (error instanceof Error) {
      if (
        error.message.includes('Email is required') ||
        error.message.includes('Invalid email format')
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
