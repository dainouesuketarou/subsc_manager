#!/usr/bin/env tsx

/**
 * SQLiteからSupabase PostgreSQLへのデータ移行スクリプト
 *
 * 使用方法:
 * 1. 環境変数を設定
 * 2. npm run migrate:to-supabase
 */

import { PrismaClient } from '@prisma/client';
import { supabase } from '../src/infrastructure/supabase/client';

const prisma = new PrismaClient();

interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

interface Subscription {
  id: string;
  user_id: string;
  name: string;
  price: number;
  currency: string;
  payment_cycle: string;
  category: string;
  payment_start_date: Date;
  subscribed_at: Date;
  updated_at: Date;
}

async function migrateUsers() {
  console.log('🔍 ユーザーデータの移行を開始...');

  try {
    // SQLiteからユーザーデータを取得
    const users = await prisma.user.findMany();
    console.log(`📊 ${users.length}人のユーザーが見つかりました`);

    for (const user of users) {
      try {
        // Supabaseにユーザーを作成（パスワードは手動で設定が必要）
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: 'temporary-password-123', // 一時的なパスワード
          email_confirm: true,
        });

        if (error) {
          console.error(
            `❌ ユーザー ${user.email} の作成に失敗:`,
            error.message
          );
          continue;
        }

        console.log(`✅ ユーザー ${user.email} を移行しました`);
      } catch (error) {
        console.error(`❌ ユーザー ${user.email} の移行中にエラー:`, error);
      }
    }
  } catch (error) {
    console.error('❌ ユーザー移行中にエラー:', error);
  }
}

async function migrateSubscriptions() {
  console.log('🔍 サブスクリプションデータの移行を開始...');

  try {
    // SQLiteからサブスクリプションデータを取得
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: true,
      },
    });

    console.log(
      `📊 ${subscriptions.length}件のサブスクリプションが見つかりました`
    );

    for (const subscription of subscriptions) {
      try {
        // Supabaseにサブスクリプションを挿入
        const { data, error } = await supabase.from('Subscription').insert({
          id: subscription.id,
          user_id: subscription.user_id,
          name: subscription.name,
          price: subscription.price,
          currency: subscription.currency,
          payment_cycle: subscription.payment_cycle,
          category: subscription.category,
          payment_start_date: subscription.payment_start_date.toISOString(),
          subscribed_at: subscription.subscribed_at.toISOString(),
          updated_at: subscription.updated_at.toISOString(),
        });

        if (error) {
          console.error(
            `❌ サブスクリプション ${subscription.name} の移行に失敗:`,
            error.message
          );
          continue;
        }

        console.log(
          `✅ サブスクリプション ${subscription.name} を移行しました`
        );
      } catch (error) {
        console.error(
          `❌ サブスクリプション ${subscription.name} の移行中にエラー:`,
          error
        );
      }
    }
  } catch (error) {
    console.error('❌ サブスクリプション移行中にエラー:', error);
  }
}

async function verifyMigration() {
  console.log('🔍 移行結果の検証を開始...');

  try {
    // Supabaseからユーザー数を取得
    const { data: users, error: usersError } = await supabase
      .from('User')
      .select('count');

    if (usersError) {
      console.error('❌ ユーザー数の取得に失敗:', usersError.message);
    } else {
      console.log(`✅ Supabaseに ${users.length}人のユーザーが存在します`);
    }

    // Supabaseからサブスクリプション数を取得
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('Subscription')
      .select('count');

    if (subscriptionsError) {
      console.error(
        '❌ サブスクリプション数の取得に失敗:',
        subscriptionsError.message
      );
    } else {
      console.log(
        `✅ Supabaseに ${subscriptions.length}件のサブスクリプションが存在します`
      );
    }
  } catch (error) {
    console.error('❌ 検証中にエラー:', error);
  }
}

async function main() {
  console.log('🚀 Supabase移行スクリプトを開始します...');

  try {
    // データベース接続を確認
    await prisma.$connect();
    console.log('✅ SQLiteデータベースに接続しました');

    // 移行実行
    await migrateUsers();
    await migrateSubscriptions();

    // 移行結果の検証
    await verifyMigration();

    console.log('🎉 移行が完了しました！');
  } catch (error) {
    console.error('❌ 移行中にエラーが発生しました:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプトが直接実行された場合のみmain関数を実行
if (require.main === module) {
  main();
}
