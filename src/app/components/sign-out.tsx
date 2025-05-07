
import { signOut } from "../../../auth";
import { LogOut } from "lucide-react";

export default function LogOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button type="submit" className="">
        <LogOut size={34}/>
      </button>
    </form>
  );
};
