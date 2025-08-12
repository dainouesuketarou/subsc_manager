import { NextRequest, NextResponse } from 'next/server';

export class DatabaseErrorMiddleware {
  static handleError(error: unknown): NextResponse {
    console.error('Database error:', error);

    if (error instanceof Error) {
      // SupabaseのIP許可リストエラー
      if (error.message.includes('FATAL: Address not in tenant allow_list')) {
        console.error(
          'Database connection error: IP address not in allow list'
        );
        return NextResponse.json(
          {
            error:
              'Database connection temporarily unavailable. Please try again in a few moments.',
            code: 'DATABASE_CONNECTION_ERROR',
          },
          { status: 503 }
        );
      }

      // Prisma接続エラー
      if (error.message.includes('PrismaClientInitializationError')) {
        console.error('Prisma initialization error:', error.message);
        return NextResponse.json(
          {
            error:
              'Database service temporarily unavailable. Please try again later.',
            code: 'DATABASE_INITIALIZATION_ERROR',
          },
          { status: 503 }
        );
      }

      // その他のデータベースエラー
      if (error.message.includes('Error querying the database')) {
        console.error('Database query error:', error.message);
        return NextResponse.json(
          {
            error: 'Database query failed. Please try again.',
            code: 'DATABASE_QUERY_ERROR',
          },
          { status: 500 }
        );
      }
    }

    // デフォルトのエラーレスポンス
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }

  static withErrorHandling(
    handler: (request: NextRequest) => Promise<NextResponse>
  ) {
    return async (request: NextRequest): Promise<NextResponse> => {
      try {
        return await handler(request);
      } catch (error) {
        return this.handleError(error);
      }
    };
  }
}
