import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../../../../src/infrastructure/PrismaUserRepository';
import { LogoutUserUseCase } from '../../../../src/application/usecase/LogoutUserUseCase';
import {
  AuthMiddleware,
  AuthenticatedRequest,
} from '../../../../src/infrastructure/middleware/AuthMiddleware';

const prisma = new PrismaClient();
const userRepository = new PrismaUserRepository(prisma);
const logoutUserUseCase = new LogoutUserUseCase(userRepository);

async function handleLogout(request: AuthenticatedRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.substring(7); // "Bearer "を除去

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const result = await logoutUserUseCase.execute({
      token,
      userId: request.user!.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error logging out user:', error);

    if (error instanceof Error) {
      if (
        error.message.includes('Token and userId are required') ||
        error.message.includes('Invalid token for user')
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

export const POST = AuthMiddleware.withAuth(handleLogout);
