import { auth } from "../../../auth";
import LogOutButton from "./sign-out";

export default async function Header() {
  const session = await auth();
  return (
    <div>
      <div className="text-3xl font-bold text-white bg-gradient-to-r from-slate-600 to-slate-900 flex items-center justify-between px-12">
        <p className="py-2">Menbee</p>
        {session && <LogOutButton />}
      </div>
    </div>
  );
}
