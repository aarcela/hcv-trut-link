import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const error = (await searchParams)?.error;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-2xl font-bold text-blue-900 mb-2">HCV Trust-Link</h1>
        <p className="text-gray-500 mb-6 text-sm">Concessionaire Portal</p>
        
        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <form action={login} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full p-3 mt-1 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="restaurante@hogarcanario.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full p-3 mt-1 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all">
            Enter System
          </button>
        </form>
      </div>
    </div>
  )
}