// Jestのセットアップファイル
// テスト環境でNODE_ENVを設定
Object.defineProperty(process.env, 'NODE_ENV', {
  value: 'test',
  writable: true,
});

// Supabaseの環境変数を設定
Object.defineProperty(process.env, 'NEXT_PUBLIC_SUPABASE_URL', {
  value: 'https://test.supabase.co',
  writable: true,
});

Object.defineProperty(process.env, 'NEXT_PUBLIC_SUPABASE_ANON_KEY', {
  value: 'test-anon-key',
  writable: true,
});

// Prismaクライアントのモック
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest
        .fn()
        .mockResolvedValue({ id: 'user-1', email: 'test@example.com' }),
      update: jest
        .fn()
        .mockResolvedValue({ id: 'user-1', email: 'test@example.com' }),
    },
    subscription: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest
        .fn()
        .mockResolvedValue({ id: 'sub-1', name: 'Test Subscription' }),
      update: jest
        .fn()
        .mockResolvedValue({ id: 'sub-1', name: 'Updated Subscription' }),
      delete: jest.fn().mockResolvedValue({ id: 'sub-1' }),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}));

// Supabaseクライアントのモック
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
      signUp: jest.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({
        error: null,
      }),
      getUser: jest.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      resetPasswordForEmail: jest.fn().mockResolvedValue({
        error: null,
      }),
      updateUser: jest.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      then: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
}));

// Next.jsのモック
jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    constructor(
      public url: string,
      public init?: RequestInit
    ) {
      this.url = url;
      this.headers = new Map();
      this.body = typeof init?.body === 'string' ? init.body : '';
      if (init?.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          this.headers.set(key, value as string);
        });
      }
    }
    headers: Map<string, string>;
    body: string;
    json() {
      try {
        return Promise.resolve(JSON.parse(this.body));
      } catch {
        return Promise.resolve({});
      }
    }
  },
  NextResponse: class NextResponse {
    constructor(
      public body?: unknown,
      public init?: ResponseInit
    ) {
      this.status = init?.status || 200;
      this.headers = new Map();
      this.headers.set('content-type', 'application/json');
    }
    status: number;
    headers: Map<string, string>;
    json() {
      return Promise.resolve(this.body === undefined ? null : this.body);
    }
    static json(data: unknown, init?: ResponseInit) {
      return new NextResponse(data, init);
    }
  },
}));

// Web APIのモック
global.Request = class Request {
  constructor(
    public url: string,
    public init?: RequestInit
  ) {}
} as typeof Request;

global.Response = class Response {
  constructor(
    public body?: unknown,
    public init?: ResponseInit
  ) {}
  static json(data: unknown, init?: ResponseInit) {
    return new Response(JSON.stringify(data), init);
  }
} as typeof Response;

// windowオブジェクトのモック
global.window = {
  location: {
    origin: 'http://localhost:3000',
  },
} as typeof window;

// テスト環境でのコンソールエラーと警告を抑制
console.error = jest.fn();

// テスト環境での警告を抑制（ただし、テストの意図的な警告は保持）
const originalWarn = console.warn;
console.warn = jest.fn((...args) => {
  // Supabase接続エラーやユーザー関連の警告は抑制
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('Failed to create user in Prisma') ||
      message.includes('Failed to find user by Supabase ID'))
  ) {
    return;
  }
  // その他の警告は通常通り出力
  originalWarn.apply(console, args);
});

// React Testing Libraryのセットアップ
import '@testing-library/jest-dom';

// localStorageのモック
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.localStorage = localStorageMock as Storage;

// matchMediaのモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
