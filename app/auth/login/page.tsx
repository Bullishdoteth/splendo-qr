import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-gradient-to-br from-zinc-50 via-emerald-950/5 to-zinc-100 dark:from-zinc-950 dark:via-emerald-950/20 dark:to-zinc-900">
      <LoginForm />
    </div>
  );
}
