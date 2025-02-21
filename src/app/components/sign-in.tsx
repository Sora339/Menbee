import { redirect } from "next/dist/server/api-utils";
import { signIn } from "../../../auth";
import Image from "next/image";

export default function LoginButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/myPage" });
      }}
    >
      <button type="submit" className="w-fit">
        ログイン
      </button>
    </form>
  );
}
