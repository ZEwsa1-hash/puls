import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <main className="auth-page">
        <div className="settings-panel settings-panel--compact">
          <h1>Clerk не настроен</h1>
          <p>Добавь Clerk env keys, чтобы включить регистрацию.</p>
          <Link href="/settings">Открыть настройки</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <SignUp />
    </main>
  );
}
