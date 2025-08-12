import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaSubscriptionRepository } from '../../../src/infrastructure/PrismaSubscriptionRepository';
import { RegisterSubscriptionUseCase } from '../../../src/application/usecase/RegisterSubscriptionUseCase';
import { GetSubscriptionsUseCase } from '../../../src/application/usecase/GetSubscriptionsUseCase';
import {
  SupabaseAuthMiddleware,
  AuthenticatedRequest,
} from '../../../src/infrastructure/middleware/SupabaseAuthMiddleware';

const prisma = new PrismaClient();
const subscriptionRepository = new PrismaSubscriptionRepository(prisma);
const registerUseCase = new RegisterSubscriptionUseCase(subscriptionRepository);
const getSubscriptionsUseCase = new GetSubscriptionsUseCase(
  subscriptionRepository
);

async function handleGet(request: AuthenticatedRequest) {
  try {
    const result = await getSubscriptionsUseCase.execute({
      userId: request.user!.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = SupabaseAuthMiddleware.withAuth(handleGet);

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
      name,
      price,
      currency,
      paymentCycle,
      category,
      paymentStartDate,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error registering subscription:', error);

    if (error instanceof Error) {
      if (
        error.message.includes('Invalid payment cycle') ||
        error.message.includes('Invalid currency')
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

export const POST = SupabaseAuthMiddleware.withAuth(handlePost);
