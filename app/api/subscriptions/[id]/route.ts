import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { SupabaseAuthMiddleware } from '../../../../src/infrastructure/middleware/SupabaseAuthMiddleware';
import { PrismaSubscriptionRepository } from '../../../../src/infrastructure/PrismaSubscriptionRepository';
import { PrismaUserRepository } from '../../../../src/infrastructure/PrismaUserRepository';
import { DeleteSubscriptionUseCase } from '../../../../src/application/usecase/DeleteSubscriptionUseCase';
import { UpdateSubscriptionUseCase } from '../../../../src/application/usecase/UpdateSubscriptionUseCase';

const prisma = new PrismaClient();
const subscriptionRepository = new PrismaSubscriptionRepository(prisma);
const userRepository = new PrismaUserRepository(prisma);

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
  };
}

async function authenticate(
  request: NextRequest
): Promise<AuthenticatedRequest | NextResponse> {
  return SupabaseAuthMiddleware.authenticate(request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticatedRequest = await authenticate(request);

  if (authenticatedRequest instanceof NextResponse) {
    return authenticatedRequest;
  }

  try {
    const { id } = await params;
    const subscriptionId = id;
    const userId = authenticatedRequest.user!.id;

    const deleteSubscriptionUseCase = new DeleteSubscriptionUseCase(
      subscriptionRepository,
      userRepository
    );

    await deleteSubscriptionUseCase.execute({
      subscriptionId,
      userId,
    });

    return NextResponse.json({ message: 'サブスクリプションが削除されました' });
  } catch (error) {
    console.error('Delete subscription error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'サブスクリプションの削除に失敗しました',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticatedRequest = await authenticate(request);

  if (authenticatedRequest instanceof NextResponse) {
    return authenticatedRequest;
  }

  try {
    const { id } = await params;
    const subscriptionId = id;
    const userId = authenticatedRequest.user!.id;
    const body = await request.json();

    const { name, price, currency, paymentCycle, category, paymentStartDate } =
      body;

    if (!name || !price || !currency || !paymentCycle) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    const updateSubscriptionUseCase = new UpdateSubscriptionUseCase(
      subscriptionRepository,
      userRepository
    );

    await updateSubscriptionUseCase.execute({
      subscriptionId,
      userId,
      name,
      price,
      currency,
      paymentCycle,
      category: category || 'OTHER',
      paymentStartDate,
    });

    return NextResponse.json({ message: 'サブスクリプションが更新されました' });
  } catch (error) {
    console.error('Update subscription error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'サブスクリプションの更新に失敗しました',
      },
      { status: 500 }
    );
  }
}
