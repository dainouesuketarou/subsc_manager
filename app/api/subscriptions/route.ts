import { PrismaSubscriptionRepository } from '../../../src/infrastructure/PrismaSubscriptionRepository';
import { PrismaUserRepository } from '../../../src/infrastructure/PrismaUserRepository';
import { RegisterSubscriptionUseCase } from '../../../src/application/usecase/RegisterSubscriptionUseCase';
import { GetSubscriptionsUseCase } from '../../../src/application/usecase/GetSubscriptionsUseCase';
import {
  SupabaseAuthMiddleware,
  AuthenticatedRequest,
} from '../../../src/infrastructure/middleware/SupabaseAuthMiddleware';
import { ApiResponse } from '../../../src/infrastructure/utils/ApiResponse';
import { Validation } from '../../../src/infrastructure/utils/Validation';
import { prisma } from '../../../src/infrastructure/utils/PrismaClient';
import { CreateSubscriptionDTO } from '../../../src/application/dto/subscription';

// リポジトリとユースケースのインスタンス化
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

export async function handleGet(request: AuthenticatedRequest) {
  try {
    const result = await getSubscriptionsUseCase.execute({
      userId: request.user!.id,
    });

    return ApiResponse.success(result);
  } catch (error) {
    // テスト環境ではエラーログを抑制
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error fetching subscriptions:', error);
    }
    return ApiResponse.serverError('サブスクリプションの取得に失敗しました');
  }
}

export const GET = SupabaseAuthMiddleware.withAuth(handleGet);

export async function handlePost(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { name, price, currency, paymentCycle, category, paymentStartDate } =
      body;

    // バリデーション
    const validationErrors = Validation.validateFields({
      name: { value: name, rules: ['required'] },
      price: { value: price, rules: ['required', 'positiveNumber'] },
      currency: { value: currency, rules: ['required'] },
      paymentCycle: { value: paymentCycle, rules: ['required'] },
      category: { value: category, rules: ['required'] },
    });

    if (validationErrors.length > 0) {
      return ApiResponse.validationError(validationErrors[0]);
    }

    const createRequest: CreateSubscriptionDTO = {
      userId: request.user!.id,
      userEmail: request.user!.email,
      name,
      price,
      currency,
      paymentCycle,
      category,
      paymentStartDate,
    };

    const result = await registerUseCase.execute(createRequest);

    return ApiResponse.success(result, 201);
  } catch (error) {
    // テスト環境ではエラーログを抑制
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error registering subscription:', error);
    }

    if (error instanceof Error) {
      if (
        error.message.includes('Invalid payment cycle') ||
        error.message.includes('Invalid currency')
      ) {
        return ApiResponse.validationError(error.message);
      }
    }

    return ApiResponse.serverError('サブスクリプションの登録に失敗しました');
  }
}

export const POST = SupabaseAuthMiddleware.withAuth(handlePost);
