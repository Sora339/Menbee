
import Link from "next/link";
import { auth } from "../../../auth";
import LogOutButton from "./sign-out";
import Image from "next/image";

export default async function Header() {
  const session = await auth();
  return (
    <div>
      <div className="text-3xl font-bold text-white bg-gradient-to-r from-slate-600 to-slate-900 flex items-center justify-between px-12">
        <Link href="/">
        <div className="flex items-center py-2">

        <Image src="/image/logo2.webp" alt="logo" width={512} height={512} className="h-10 w-10"/>
        <p className="">endee</p>
        </div>
        </Link>
        {session && <LogOutButton />}
      </div>
    </div>
  );
}
