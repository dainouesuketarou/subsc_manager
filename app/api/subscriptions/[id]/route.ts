import { NextRequest } from 'next/server';
import { SupabaseAuthMiddleware } from '../../../../src/infrastructure/middleware/SupabaseAuthMiddleware';
import { PrismaSubscriptionRepository } from '../../../../src/infrastructure/PrismaSubscriptionRepository';
import { PrismaUserRepository } from '../../../../src/infrastructure/PrismaUserRepository';
import { DeleteSubscriptionUseCase } from '../../../../src/application/usecase/DeleteSubscriptionUseCase';
import { UpdateSubscriptionUseCase } from '../../../../src/application/usecase/UpdateSubscriptionUseCase';
import { ApiResponse } from '../../../../src/infrastructure/utils/ApiResponse';
import { Validation } from '../../../../src/infrastructure/utils/Validation';
import { prisma } from '../../../../src/infrastructure/utils/PrismaClient';
import {
  UpdateSubscriptionDTO,
  DeleteSubscriptionDTO,
} from '../../../../src/application/dto/subscription';

// リポジトリのインスタンス化
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
): Promise<AuthenticatedRequest | Response> {
  return SupabaseAuthMiddleware.authenticate(request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticatedRequest = await authenticate(request);

  if (authenticatedRequest instanceof Response) {
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

    const deleteRequest: DeleteSubscriptionDTO = {
      subscriptionId,
      userId,
    };

    await deleteSubscriptionUseCase.execute(deleteRequest);

    return ApiResponse.success({
      message: 'サブスクリプションが削除されました',
    });
  } catch (error) {
    console.error('Delete subscription error:', error);
    return ApiResponse.serverError(
      error instanceof Error
        ? error.message
        : 'サブスクリプションの削除に失敗しました'
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticatedRequest = await authenticate(request);

  if (authenticatedRequest instanceof Response) {
    return authenticatedRequest;
  }

  try {
    const { id } = await params;
    const subscriptionId = id;
    const userId = authenticatedRequest.user!.id;
    const body = await request.json();

    const { name, price, currency, paymentCycle, category, paymentStartDate } =
      body;

    // バリデーション
    const validationErrors = Validation.validateFields({
      name: { value: name, rules: ['required'] },
      price: { value: price, rules: ['required', 'positiveNumber'] },
      currency: { value: currency, rules: ['required'] },
      paymentCycle: { value: paymentCycle, rules: ['required'] },
    });

    if (validationErrors.length > 0) {
      return ApiResponse.validationError(validationErrors[0]);
    }

    const updateSubscriptionUseCase = new UpdateSubscriptionUseCase(
      subscriptionRepository,
      userRepository
    );

    const updateRequest: UpdateSubscriptionDTO = {
      id: subscriptionId,
      userId,
      name,
      price,
      currency,
      paymentCycle,
      category: category || 'OTHER',
      paymentStartDate,
    };

    await updateSubscriptionUseCase.execute(updateRequest);

    return ApiResponse.success({
      message: 'サブスクリプションが更新されました',
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    return ApiResponse.serverError(
      error instanceof Error
        ? error.message
        : 'サブスクリプションの更新に失敗しました'
    );
  }
}
