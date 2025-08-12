import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('シード処理を開始します...');

  // 既存のユーザーを確認
  const existingUser = await prisma.user.findUnique({
    where: { email: 'gotodaiki1110@icloud.com' },
  });

  let sampleUser;
  if (existingUser) {
    console.log('既存のユーザーが見つかりました:', existingUser.email);
    sampleUser = existingUser;
  } else {
    // 新しいユーザーを作成（Supabase認証では手動でユーザーを作成する必要があります）
    console.log(
      'Supabase認証を使用しているため、ユーザーは手動で作成してください'
    );
    console.log(
      'Supabaseダッシュボードでユーザーを作成するか、アプリケーションで登録してください'
    );
    return;
  }

  console.log('サンプルユーザーが作成されました:', sampleUser);

  // 既存のサブスクリプションを確認
  const existingSubscription = await prisma.subscription.findUnique({
    where: { id: 'sample-subscription-id' },
  });

  let sampleSubscription;
  if (existingSubscription) {
    console.log(
      '既存のサブスクリプションが見つかりました:',
      existingSubscription.name
    );
    sampleSubscription = existingSubscription;
  } else {
    // 新しいサブスクリプションを作成
    sampleSubscription = await prisma.subscription.create({
      data: {
        id: 'sample-subscription-id',
        user_id: sampleUser.id,
        name: 'Netflix',
        price: 1000,
        currency: 'JPY',
        payment_cycle: 'MONTHLY',
        category: 'VIDEO_STREAMING',
        payment_start_date: new Date(),
      },
    });
    console.log(
      '新しいサブスクリプションが作成されました:',
      sampleSubscription.name
    );
  }

  console.log(
    'サンプルサブスクリプションが作成されました:',
    sampleSubscription
  );
}

main()
  .catch(e => {
    console.error('シードエラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
