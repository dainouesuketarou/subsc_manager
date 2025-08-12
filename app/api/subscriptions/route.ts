import { NextResponse } from 'next/server';
import { PrismaSubscriptionRepository } from '../../../src/infrastructure/PrismaSubscriptionRepository';
import { PrismaUserRepository } from '../../../src/infrastructure/PrismaUserRepository';
import { RegisterSubscriptionUseCase } from '../../../src/application/usecase/RegisterSubscriptionUseCase';
import { GetSubscriptionsUseCase } from '../../../src/application/usecase/GetSubscriptionsUseCase';
import {
  SupabaseAuthMiddleware,
  AuthenticatedRequest,
} from '../../../src/infrastructure/middleware/SupabaseAuthMiddleware';
import { DatabaseErrorMiddleware } from '../../../src/infrastructure/middleware/DatabaseErrorMiddleware';
import { prisma } from '../../../src/infrastructure/supabase/client';

const subscriptionRepository = new PrismaSubscriptionRepository(prisma);
const userRepository = new PrismaUserRepository(prisma);
const registerUseCase = new RegisterSubscriptionUseCase(
  subscriptionRepository,
  userRepository
);
const getSubscriptionsUseCase = new GetSubscriptionsUseCase(
  subscriptionRepository,
  userRepository
);

async function handleGet(request: AuthenticatedRequest) {
  try {
    const result = await getSubscriptionsUseCase.execute({
      userId: request.user!.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    return DatabaseErrorMiddleware.handleError(error);
  }
}

async function handlePost(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { name, price, currency, paymentCycle, category, paymentStartDate } =
      body;

    // バリデーション
    if (!name || !price || !currency || !paymentCycle || !category) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    const result = await registerUseCase.execute({
      userId: request.user!.id,
      userEmail: request.user!.email,
      name,
      price,
      currency,
      paymentCycle,
      category,
      paymentStartDate,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes('Invalid payment cycle') ||
        error.message.includes('Invalid currency')
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return DatabaseErrorMiddleware.handleError(error);
  }
}

export const GET = SupabaseAuthMiddleware.withAuth(handleGet);
export const POST = SupabaseAuthMiddleware.withAuth(handlePost);
