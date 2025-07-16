import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <div className="text-white w-fit mx-auto my-[75px]">
      <h1 className="text-3xl font-bold mb-4">プライバシーポリシー</h1>
      <p className="mb-4">
        Menbee（以下「当サービス」）は、ユーザーの個人情報保護に最大限配慮した設計で運営されています。
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">1. 取得する情報</h2>
      <p>
        当サービスは、Googleログインを通じて、氏名、メールアドレス、プロフィール画像、Googleカレンダー情報へのアクセス権限を取得することがあります。
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">2. 利用目的</h2>
      <ul className="list-disc list-inside">
        <li>空いている面接候補日時リストの作成</li>
        <li>カレンダーに面接予定を追加する処理</li>
        <li>アプリ改善のための匿名統計データの分析</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">3. 情報の保存</h2>
      <p>
        取得したカレンダー情報はサーバーに保存されません。アクセストークンは安全なバックエンドでのみ一時的に利用され、定期的に失効・削除されます。
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">4. 第三者提供</h2>
      <p>
        ユーザーの同意なく個人情報を第三者に提供することはありません。ただし法令に基づく場合を除きます。
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">5. お問い合わせ</h2>
      <p>
        個人情報に関するご質問は、アプリ内のお問い合わせフォームよりご連絡ください。
      </p>
      <div className="w-fit mx-auto my-20">
        <Link href={"/"}>
          <Button className="bg-slate-600 hover:bg-slate-600 hover:opacity-50">
            トップに戻る
          </Button>
        </Link>
      </div>
    </div>
  );
}
