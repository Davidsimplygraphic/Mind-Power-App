import { signOutAction } from "@/app/actions/auth";
import { requireAuthenticatedUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await requireAuthenticatedUser();

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center pt-2">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="surface p-5 space-y-4">
        <div>
          <p className="eyebrow">Account</p>
          <p className="mt-2 text-base font-semibold">{user.email}</p>
        </div>

        <form action={signOutAction}>
          <button className="secondary-button w-full" type="submit">
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
