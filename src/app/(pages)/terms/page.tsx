import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <div className="text-white w-fit mx-auto my-[75px]">
      <h1 className="text-3xl font-bold mb-4">利用規約</h1>
      <p className="mb-4">
        この利用規約（以下「本規約」といいます。）は、Menbee（以下「当サービス」といいます。）の提供条件および利用者の皆様（以下「ユーザー」といいます。）との関係を定めるものです。
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">第1条（適用）</h2>
      <p>
        本規約は、ユーザーと当サービスとの間のすべての関係に適用されるものとします。
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">第2条（禁止事項）</h2>
      <ul className="list-disc list-inside">
        <li>法令または公序良俗に違反する行為</li>
        <li>サーバーやネットワークに著しい負荷をかける行為</li>
        <li>他のユーザーの個人情報を収集・開示する行為</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">
        第3条（サービス内容の変更等）
      </h2>
      <p>
        当サービスは、ユーザーに事前に通知することなく、サービス内容を変更、追加または廃止することがあります。
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">第4条（免責事項）</h2>
      <p>
        当サービスは、ユーザーのGoogleカレンダーの情報を読み取り、日程リストを作成しますが、カレンダーの正確性や利用結果に関して一切の責任を負いません。
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">
        第5条（準拠法および裁判管轄）
      </h2>
      <p>
        本規約は日本法を準拠法とし、本サービスに起因または関連する一切の紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
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
