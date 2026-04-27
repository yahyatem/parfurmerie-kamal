"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (data.session) {
        document.cookie = "admin-auth=1; Path=/; Max-Age=2592000; SameSite=Lax";
        router.replace("/admin/dashboard");
      }
    }

    checkSession();
    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    document.cookie = "admin-auth=1; Path=/; Max-Age=2592000; SameSite=Lax";
    setIsLoading(false);
    router.replace("/admin/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f5f6fa] px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-[#97002f]">Admin Login</h1>
          <p className="mt-1 text-sm text-zinc-500">Parfumerie PK</p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">Email</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#97002f]/20"
                placeholder="admin@parfumeriepk.com"
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#97002f]/20"
                placeholder="••••••••"
                required
              />
            </div>
          </label>

          {errorMessage && (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#97002f] text-sm font-semibold text-white transition hover:bg-[#7f0228] disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connexion...
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
