import {
  SubscriptionCategoryValue,
  SubscriptionCategory,
} from '../../../src/domain/value-objects/SubscriptionCategory';

describe('SubscriptionCategoryValue', () => {
  describe('create', () => {
    it('有効なカテゴリー値でSubscriptionCategoryValueを作成できる', () => {
      const category = SubscriptionCategoryValue.create('VIDEO_STREAMING');
      expect(category).toBeInstanceOf(SubscriptionCategoryValue);
      expect(category.getValue()).toBe('VIDEO_STREAMING');
    });

    it('すべての有効なカテゴリー値でSubscriptionCategoryValueを作成できる', () => {
      const validCategories = [
        'VIDEO_STREAMING',
        'MUSIC_STREAMING',
        'READING',
        'GAMING',
        'FITNESS',
        'EDUCATION',
        'PRODUCTIVITY',
        'CLOUD_STORAGE',
        'SECURITY',
        'OTHER',
      ];

      validCategories.forEach(categoryValue => {
        const category = SubscriptionCategoryValue.create(categoryValue);
        expect(category).toBeInstanceOf(SubscriptionCategoryValue);
        expect(category.getValue()).toBe(categoryValue);
      });
    });

    it('無効なカテゴリー値でエラーをスローする', () => {
      expect(() => {
        SubscriptionCategoryValue.create('INVALID_CATEGORY');
      }).toThrow('Invalid subscription category: INVALID_CATEGORY');
    });

    it('空文字列でエラーをスローする', () => {
      expect(() => {
        SubscriptionCategoryValue.create('');
      }).toThrow('Invalid subscription category: ');
    });
  });

  describe('getValue', () => {
    it('カテゴリー値を取得できる', () => {
      const category = SubscriptionCategoryValue.create('MUSIC_STREAMING');
      expect(category.getValue()).toBe('MUSIC_STREAMING');
    });
  });

  describe('getDisplayName', () => {
    it('正しい表示名を取得できる', () => {
      const displayNameMap = {
        VIDEO_STREAMING: '動画配信',
        MUSIC_STREAMING: '音楽配信',
        READING: '読書',
        GAMING: 'ゲーム',
        FITNESS: 'フィットネス',
        EDUCATION: '教育',
        PRODUCTIVITY: '生産性',
        CLOUD_STORAGE: 'クラウドストレージ',
        SECURITY: 'セキュリティ',
        OTHER: 'その他',
      };

      Object.entries(displayNameMap).forEach(([value, expectedDisplayName]) => {
        const category = SubscriptionCategoryValue.create(value);
        expect(category.getDisplayName()).toBe(expectedDisplayName);
      });
    });
  });

  describe('SubscriptionCategory enum', () => {
    it('すべてのカテゴリー値が定義されている', () => {
      expect(SubscriptionCategory.VIDEO_STREAMING).toBe('VIDEO_STREAMING');
      expect(SubscriptionCategory.MUSIC_STREAMING).toBe('MUSIC_STREAMING');
      expect(SubscriptionCategory.READING).toBe('READING');
      expect(SubscriptionCategory.GAMING).toBe('GAMING');
      expect(SubscriptionCategory.FITNESS).toBe('FITNESS');
      expect(SubscriptionCategory.EDUCATION).toBe('EDUCATION');
      expect(SubscriptionCategory.PRODUCTIVITY).toBe('PRODUCTIVITY');
      expect(SubscriptionCategory.CLOUD_STORAGE).toBe('CLOUD_STORAGE');
      expect(SubscriptionCategory.SECURITY).toBe('SECURITY');
      expect(SubscriptionCategory.OTHER).toBe('OTHER');
    });
  });
});
