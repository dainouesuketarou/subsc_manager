import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../../../../infrastructure/PrismaUserRepository';
import { RegisterUserUseCase } from '../../../../application/usecase/RegisterUserUseCase';

const prisma = new PrismaClient();
const userRepository = new PrismaUserRepository(prisma);
const registerUserUseCase = new RegisterUserUseCase(userRepository);

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

    const result = await registerUserUseCase.execute({
      email,
      password,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);

    if (error instanceof Error) {
      if (
        error.message.includes('Email and password are required') ||
        error.message.includes('Password must be at least 8 characters long') ||
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
