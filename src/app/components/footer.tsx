import Link from "next/link";

export default function Footer() {
  return (
    <div className="py-4 bg-slate-900 text-white w-fit mx-auto text-center">©2025 Menbee <div className="flex gap-4"><Link href={"/terms"} className="underline">利用規約</Link><Link href={"/privacy"} className="underline">プライバシーポリシー</Link></div></div>
  )
}