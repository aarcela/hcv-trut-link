"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function checkMemberStatus(accionNumber: number) {
  const supabase = await createClient();

  // Search by accion_number directly in debts (since we can register debts without a members row).
  const { data: allDebts, error } = await supabase
    .from("debts")
    .select(
      `
      id,
      accion_number,
      member_name_manual,
      amount_usd,
      status,
      description,
      restaurant:restaurants (name)
    `
    )
    .eq("accion_number", accionNumber);

  if (error) {
    return { error: error.message ?? "Failed to fetch debts." };
  }

  if (!allDebts || allDebts.length === 0) {
    return { error: "Acción not found or no debt records." };
  }

  const unpaidDebts = allDebts.filter((d) => d.status === "unpaid");
  const totalDebt = unpaidDebts.reduce(
    (acc, debt) => acc + Number((debt as { amount_usd?: unknown }).amount_usd ?? 0),
    0
  );

  const name =
    allDebts.find((d) => typeof d.member_name_manual === "string" && d.member_name_manual.trim())
      ?.member_name_manual ?? `Acción ${accionNumber}`;
  
  return {
    success: true,
    data: {
      name,
      totalDebt,
      debtCount: unpaidDebts.length,
      details: unpaidDebts,
    }
  };
}

export async function reportDebt(formData: {
  accionNumber: number;
  memberName?: string; // Optional: name seen on the club card
  amountUsd: number;
  description: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { error: "Not authorized. Please log in." };

  // Ensure the authenticated restaurant exists in `restaurants` so the FK passes.
  // This assumes `restaurants.id` is the same UUID as `auth.users.id`.
  const { data: restaurant, error: restaurantLookupError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (restaurantLookupError) {
    return { error: restaurantLookupError.message ?? "Failed to look up restaurant." };
  }

  if (!restaurant?.id) {
    const { error: restaurantCreateError } = await supabase.from("restaurants").insert({
      id: user.id,
      name: user.email ?? "Restaurant",
    });

    if (restaurantCreateError) {
      return {
        error:
          restaurantCreateError.message ??
          "Restaurant profile missing and could not be created.",
      };
    }
  }

  const memberName = (formData.memberName ?? "").trim();

  const { error } = await supabase
    .from("debts")
    .insert({
      accion_number: formData.accionNumber,
      member_name_manual: memberName.length > 0 ? memberName : null,
      restaurant_id: user.id,
      amount_usd: formData.amountUsd,
      description: formData.description,
      status: "unpaid"
    });

  if (error) return { error: error.message ?? "Database error" };

  revalidatePath("/");
  return { success: true };
}