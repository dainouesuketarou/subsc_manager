import { ExchangeRateService } from '../../../src/infrastructure/services/ExchangeRateService';

// fetchのモック
global.fetch = jest.fn();

// console.errorとconsole.warnをモック
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// 環境変数のモック
const originalEnv = process.env;

describe('ExchangeRateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ExchangeRateService.clearCache();
    // 環境変数をリセット
    process.env = { ...originalEnv };
    // console.errorとconsole.warnをモック
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(() => {
    // 環境変数を元に戻す
    process.env = originalEnv;
    // console.errorとconsole.warnを元に戻す
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  describe('getExchangeRates', () => {
    it('正常に為替レートを取得する', async () => {
      // APIキーを設定
      process.env.EXCHANGE_RATE_API_KEY = 'test_api_key';

      const mockResponse = {
        result: 'success',
        documentation: 'https://www.exchangerate-api.com/docs',
        terms_of_use: 'https://www.exchangerate-api.com/terms',
        time_last_update_unix: 1640995200,
        time_last_update_utc: '2022-01-01 00:00:00',
        time_next_update_unix: 1640998800,
        time_next_update_utc: '2022-01-01 01:00:00',
        base_code: 'JPY',
        conversion_rates: {
          USD: 0.0087,
          EUR: 0.0076,
          GBP: 0.0064,
          JPY: 1,
        },
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const rates = await ExchangeRateService.getExchangeRates();

      expect(rates).toEqual({
        JPY: 1,
        USD: 1 / 0.0087, // 約115.0
        EUR: 1 / 0.0076, // 約131.6
        GBP: 1 / 0.0064, // 約156.3
      });
      expect(fetch).toHaveBeenCalledWith(
        'https://v6.exchangerate-api.com/v6/test_api_key/latest/JPY'
      );
    });

    it('APIキーが設定されていない場合、フォールバックレートを使用する', async () => {
      // APIキーを未設定にする
      delete process.env.EXCHANGE_RATE_API_KEY;

      const rates = await ExchangeRateService.getExchangeRates();

      expect(rates).toEqual({
        JPY: 1,
        USD: 150,
        EUR: 160,
        GBP: 190,
        CAD: 110,
        AUD: 100,
        CHF: 170,
        CNY: 21,
        KRW: 0.11,
        SGD: 110,
      });
    });

    it('HTTPエラー時にフォールバックレートを使用する', async () => {
      // APIキーを設定
      process.env.EXCHANGE_RATE_API_KEY = 'test_api_key';

      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const rates = await ExchangeRateService.getExchangeRates();

      expect(rates).toEqual({
        JPY: 1,
        USD: 150,
        EUR: 160,
        GBP: 190,
        CAD: 110,
        AUD: 100,
        CHF: 170,
        CNY: 21,
        KRW: 0.11,
        SGD: 110,
      });
    });

    it('APIエラー時にフォールバックレートを使用する', async () => {
      // APIキーを設定
      process.env.EXCHANGE_RATE_API_KEY = 'test_api_key';

      const mockResponse = {
        result: 'error',
        'error-type': 'invalid-key',
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const rates = await ExchangeRateService.getExchangeRates();

      expect(rates).toEqual({
        JPY: 1,
        USD: 150,
        EUR: 160,
        GBP: 190,
        CAD: 110,
        AUD: 100,
        CHF: 170,
        CNY: 21,
        KRW: 0.11,
        SGD: 110,
      });
    });

    it('ネットワークエラー時にフォールバックレートを使用する', async () => {
      // APIキーを設定
      process.env.EXCHANGE_RATE_API_KEY = 'test_api_key';

      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const rates = await ExchangeRateService.getExchangeRates();

      expect(rates).toEqual({
        JPY: 1,
        USD: 150,
        EUR: 160,
        GBP: 190,
        CAD: 110,
        AUD: 100,
        CHF: 170,
        CNY: 21,
        KRW: 0.11,
        SGD: 110,
      });
    });

    it('キャッシュを正しく使用する', async () => {
      // APIキーを設定
      process.env.EXCHANGE_RATE_API_KEY = 'test_api_key';

      const mockResponse = {
        result: 'success',
        base_code: 'JPY',
        conversion_rates: {
          USD: 0.0087,
          JPY: 1,
        },
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // 最初の呼び出し
      const rates1 = await ExchangeRateService.getExchangeRates();
      expect(fetch).toHaveBeenCalledTimes(1);

      // 2回目の呼び出し（キャッシュを使用）
      const rates2 = await ExchangeRateService.getExchangeRates();
      expect(fetch).toHaveBeenCalledTimes(1); // キャッシュが使用されるため、fetchは呼ばれない

      expect(rates1).toEqual(rates2);
    });
  });

  describe('convertToJPY', () => {
    it('JPYを正しく変換する', async () => {
      // APIキーを設定
      process.env.EXCHANGE_RATE_API_KEY = 'test_api_key';

      const mockResponse = {
        result: 'success',
        base_code: 'JPY',
        conversion_rates: {
          USD: 0.0087,
          EUR: 0.0076,
          JPY: 1,
        },
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ExchangeRateService.convertToJPY(100, 'JPY');
      expect(result).toBe(100);
    });

    it('USDを正しく円に変換する', async () => {
      // APIキーを設定
      process.env.EXCHANGE_RATE_API_KEY = 'test_api_key';

      const mockResponse = {
        result: 'success',
        base_code: 'JPY',
        conversion_rates: {
          USD: 0.0087,
          JPY: 1,
        },
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ExchangeRateService.convertToJPY(10, 'USD');
      expect(result).toBe(10 * (1 / 0.0087)); // 約1150円
    });

    it('未知の通貨に対してフォールバックレートを使用する', async () => {
      // APIキーを設定
      process.env.EXCHANGE_RATE_API_KEY = 'test_api_key';

      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await ExchangeRateService.convertToJPY(100, 'UNKNOWN');
      expect(result).toBe(100); // フォールバックレートでは1として扱われる
    });
  });

  describe('clearCache', () => {
    it('キャッシュを正しくクリアする', async () => {
      // APIキーを設定
      process.env.EXCHANGE_RATE_API_KEY = 'test_api_key';

      const mockResponse = {
        result: 'success',
        base_code: 'JPY',
        conversion_rates: {
          USD: 0.0087,
          JPY: 1,
        },
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // 最初の呼び出し
      await ExchangeRateService.getExchangeRates();
      expect(fetch).toHaveBeenCalledTimes(1);

      // キャッシュをクリア
      ExchangeRateService.clearCache();

      // 2回目の呼び出し（キャッシュがクリアされているため、再度fetchが呼ばれる）
      await ExchangeRateService.getExchangeRates();
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});
