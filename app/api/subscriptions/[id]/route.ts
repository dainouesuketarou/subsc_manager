import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { JwtTokenManager } from '../../../../src/infrastructure/utils/JwtTokenManager';
import { PrismaUserRepository } from '../../../../src/infrastructure/PrismaUserRepository';
import { PrismaSubscriptionRepository } from '../../../../src/infrastructure/PrismaSubscriptionRepository';
import { DeleteSubscriptionUseCase } from '../../../../src/application/usecase/DeleteSubscriptionUseCase';
import { UpdateSubscriptionUseCase } from '../../../../src/application/usecase/UpdateSubscriptionUseCase';

const prisma = new PrismaClient();
const userRepository = new PrismaUserRepository(prisma);
const subscriptionRepository = new PrismaSubscriptionRepository(prisma);

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
  };
}

async function authenticate(
  request: NextRequest
): Promise<AuthenticatedRequest | NextResponse> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = JwtTokenManager.verifyToken(token);
    const user = await userRepository.findById(payload.userId);

    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = {
      id: user.toDTO().id,
      email: user.toDTO().email.value,
    };

    return authenticatedRequest;
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
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
      subscriptionRepository
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
      subscriptionRepository
    );

    const result = await updateSubscriptionUseCase.execute({
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
