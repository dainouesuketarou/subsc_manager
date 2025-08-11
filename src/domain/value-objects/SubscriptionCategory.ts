export enum SubscriptionCategory {
  VIDEO_STREAMING = 'VIDEO_STREAMING',
  MUSIC_STREAMING = 'MUSIC_STREAMING',
  READING = 'READING',
  GAMING = 'GAMING',
  FITNESS = 'FITNESS',
  EDUCATION = 'EDUCATION',
  PRODUCTIVITY = 'PRODUCTIVITY',
  CLOUD_STORAGE = 'CLOUD_STORAGE',
  SECURITY = 'SECURITY',
  OTHER = 'OTHER',
}

export class SubscriptionCategoryValue {
  constructor(private readonly value: SubscriptionCategory) {}

  public static create(value: string): SubscriptionCategoryValue {
    if (
      !Object.values(SubscriptionCategory).includes(
        value as SubscriptionCategory
      )
    ) {
      throw new Error(`Invalid subscription category: ${value}`);
    }
    return new SubscriptionCategoryValue(value as SubscriptionCategory);
  }

  public getValue(): SubscriptionCategory {
    return this.value;
  }

  public getDisplayName(): string {
    const displayNames: Record<SubscriptionCategory, string> = {
      [SubscriptionCategory.VIDEO_STREAMING]: '動画配信',
      [SubscriptionCategory.MUSIC_STREAMING]: '音楽配信',
      [SubscriptionCategory.READING]: '読書',
      [SubscriptionCategory.GAMING]: 'ゲーム',
      [SubscriptionCategory.FITNESS]: 'フィットネス',
      [SubscriptionCategory.EDUCATION]: '教育',
      [SubscriptionCategory.PRODUCTIVITY]: '生産性',
      [SubscriptionCategory.CLOUD_STORAGE]: 'クラウドストレージ',
      [SubscriptionCategory.SECURITY]: 'セキュリティ',
      [SubscriptionCategory.OTHER]: 'その他',
    };
    return displayNames[this.value];
  }
}
