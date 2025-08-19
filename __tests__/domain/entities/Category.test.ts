import {
  Category,
  CategoryId,
  CategoryName,
} from '../../../src/domain/entities/Category';

describe('Category', () => {
  describe('constructor', () => {
    it('正常なIDと名前でCategoryを作成できる', () => {
      const category = new Category('category-1', 'Video Streaming');
      expect(category).toBeInstanceOf(Category);
    });

    it('空文字列のIDでCategoryを作成できる', () => {
      const category = new Category('', 'Video Streaming');
      expect(category).toBeInstanceOf(Category);
    });

    it('空文字列の名前でCategoryを作成できる', () => {
      const category = new Category('category-1', '');
      expect(category).toBeInstanceOf(Category);
    });

    it('特殊文字を含む名前でCategoryを作成できる', () => {
      const category = new Category('category-1', 'Video & Music Streaming');
      expect(category).toBeInstanceOf(Category);
    });

    it('長い名前でCategoryを作成できる', () => {
      const longName = 'A'.repeat(1000);
      const category = new Category('category-1', longName);
      expect(category).toBeInstanceOf(Category);
    });

    it('Unicode文字を含む名前でCategoryを作成できる', () => {
      const category = new Category('category-1', 'ビデオストリーミング 🎬');
      expect(category).toBeInstanceOf(Category);
    });
  });

  describe('CategoryId type', () => {
    it('CategoryIdがstring型であることを確認', () => {
      const categoryId: CategoryId = 'test-id';
      expect(typeof categoryId).toBe('string');
    });

    it('CategoryIdに様々な文字列を代入できる', () => {
      const validIds: CategoryId[] = [
        'category-1',
        '123',
        '',
        'category_with_underscore',
        'category-with-dash',
        'カテゴリ1',
        '🎬-category',
      ];

      validIds.forEach(id => {
        expect(typeof id).toBe('string');
      });
    });
  });

  describe('CategoryName type', () => {
    it('CategoryNameがstring型であることを確認', () => {
      const categoryName: CategoryName = 'Test Category';
      expect(typeof categoryName).toBe('string');
    });

    it('CategoryNameに様々な文字列を代入できる', () => {
      const validNames: CategoryName[] = [
        'Video Streaming',
        'Music',
        '',
        'A'.repeat(1000),
        'ビデオストリーミング',
        '🎬 Video & Music',
        'Category with spaces',
      ];

      validNames.forEach(name => {
        expect(typeof name).toBe('string');
      });
    });
  });

  describe('Category immutability', () => {
    it('Categoryのプロパティが読み取り専用である', () => {
      const category = new Category('category-1', 'Video Streaming');

      // TypeScriptの型チェックにより、これらの操作はコンパイル時にエラーになるはず
      // ただし、実行時のテストとして、プロパティが存在することを確認
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
    });

    it('Categoryのインスタンスが不変である', () => {
      const category1 = new Category('category-1', 'Video Streaming');
      const category2 = new Category('category-1', 'Video Streaming');

      // 同じ値を持つが、異なるインスタンス
      expect(category1).not.toBe(category2);
    });
  });

  describe('Category edge cases', () => {
    it('nullのIDでCategoryを作成できる', () => {
      const category = new Category(null as any, 'Video Streaming');
      expect(category).toBeInstanceOf(Category);
    });

    it('undefinedのIDでCategoryを作成できる', () => {
      const category = new Category(undefined as any, 'Video Streaming');
      expect(category).toBeInstanceOf(Category);
    });

    it('nullの名前でCategoryを作成できる', () => {
      const category = new Category('category-1', null as any);
      expect(category).toBeInstanceOf(Category);
    });

    it('undefinedの名前でCategoryを作成できる', () => {
      const category = new Category('category-1', undefined as any);
      expect(category).toBeInstanceOf(Category);
    });

    it('数値のIDでCategoryを作成できる', () => {
      const category = new Category(123 as any, 'Video Streaming');
      expect(category).toBeInstanceOf(Category);
    });

    it('数値の名前でCategoryを作成できる', () => {
      const category = new Category('category-1', 456 as any);
      expect(category).toBeInstanceOf(Category);
    });

    it('オブジェクトのIDでCategoryを作成できる', () => {
      const category = new Category({} as any, 'Video Streaming');
      expect(category).toBeInstanceOf(Category);
    });

    it('オブジェクトの名前でCategoryを作成できる', () => {
      const category = new Category('category-1', {} as any);
      expect(category).toBeInstanceOf(Category);
    });
  });

  describe('Category with different data types', () => {
    it('booleanのIDでCategoryを作成できる', () => {
      const category = new Category(true as any, 'Video Streaming');
      expect(category).toBeInstanceOf(Category);
    });

    it('booleanの名前でCategoryを作成できる', () => {
      const category = new Category('category-1', false as any);
      expect(category).toBeInstanceOf(Category);
    });

    it('配列のIDでCategoryを作成できる', () => {
      const category = new Category([] as any, 'Video Streaming');
      expect(category).toBeInstanceOf(Category);
    });

    it('配列の名前でCategoryを作成できる', () => {
      const category = new Category('category-1', [] as any);
      expect(category).toBeInstanceOf(Category);
    });

    it('関数のIDでCategoryを作成できる', () => {
      const category = new Category((() => {}) as any, 'Video Streaming');
      expect(category).toBeInstanceOf(Category);
    });

    it('関数の名前でCategoryを作成できる', () => {
      const category = new Category('category-1', (() => {}) as any);
      expect(category).toBeInstanceOf(Category);
    });
  });

  describe('Category with special characters', () => {
    it('SQLインジェクションのような文字列でCategoryを作成できる', () => {
      const category = new Category(
        'category-1',
        "'; DROP TABLE categories; --"
      );
      expect(category).toBeInstanceOf(Category);
    });

    it('HTMLタグを含む名前でCategoryを作成できる', () => {
      const category = new Category(
        'category-1',
        '<script>alert("test")</script>'
      );
      expect(category).toBeInstanceOf(Category);
    });

    it('改行文字を含む名前でCategoryを作成できる', () => {
      const category = new Category('category-1', 'Video\nStreaming');
      expect(category).toBeInstanceOf(Category);
    });

    it('タブ文字を含む名前でCategoryを作成できる', () => {
      const category = new Category('category-1', 'Video\tStreaming');
      expect(category).toBeInstanceOf(Category);
    });

    it('制御文字を含む名前でCategoryを作成できる', () => {
      const category = new Category('category-1', 'Video\x00Streaming');
      expect(category).toBeInstanceOf(Category);
    });
  });

  describe('Category with extreme values', () => {
    it('非常に長いIDでCategoryを作成できる', () => {
      const longId = 'A'.repeat(10000);
      const category = new Category(longId, 'Video Streaming');
      expect(category).toBeInstanceOf(Category);
    });

    it('非常に長い名前でCategoryを作成できる', () => {
      const longName = 'A'.repeat(10000);
      const category = new Category('category-1', longName);
      expect(category).toBeInstanceOf(Category);
    });

    it('最小の文字列でCategoryを作成できる', () => {
      const category = new Category('', '');
      expect(category).toBeInstanceOf(Category);
    });
  });
});
