import MemberLookup from "@/components/MemberLookup";
import ReportDebtForm from "@/components/ReportDebtForm";
import BcvStatusBadge from "@/components/BcvStatusBadge";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Top Header with BCV Rate */}
      <header className="p-4 bg-blue-900 text-white flex justify-between items-center">
        <span className="font-bold">Hogar Canario Link</span>
        <BcvStatusBadge /> {/* A small component showing current rate */}
      </header>

      <div className="p-4 space-y-8">
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
            Verify Member Status
          </h2>
          <MemberLookup />
        </section>

        <hr className="border-gray-100" />

        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
            Register Unpaid Tab
          </h2>
          <ReportDebtForm />
        </section>
      </div>
    </main>
  );
}