import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../../../../src/infrastructure/PrismaUserRepository';
import { LoginUserUseCase } from '../../../../src/application/usecase/LoginUserUseCase';

const prisma = new PrismaClient();
const userRepository = new PrismaUserRepository(prisma);
const loginUserUseCase = new LoginUserUseCase(userRepository);

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

    const result = await loginUserUseCase.execute({
      email,
      password,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error logging in user:', error);

    if (error instanceof Error) {
      if (
        error.message.includes('Email and password are required') ||
        error.message.includes('Invalid email or password') ||
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
