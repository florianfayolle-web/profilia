"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ResetPasswordFormSchema, ResetPasswordFormState } from "@/lib/definitions";

// Password change from the account page: the visitor already has an active
// session, so this skips the recovery-token dance resetPassword() does for
// the "forgot password" email flow entirely.
export async function updateAccountPassword(
  _state: ResetPasswordFormState,
  formData: FormData
): Promise<ResetPasswordFormState> {
  const validatedFields = ResetPasswordFormSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect("/login?next=/account");
  }

  const { error } = await supabase.auth.updateUser({
    password: validatedFields.data.password,
  });

  if (error) {
    return {
      message:
        error.code === "same_password"
          ? "Choisis un mot de passe différent de l'ancien."
          : "Impossible de mettre à jour le mot de passe. Réessaie.",
    };
  }

  redirect("/account?password=success");
}

// Permanently deletes the visitor's own account: auth user + every row that
// references it (profile, purchases, subscriptions, attempts — all
// `on delete cascade`). Uses the admin client because self-deletion isn't a
// normal authenticated-client operation in Supabase; the user id comes from
// the caller's own session, never from client input, so this can only ever
// delete the account making the request.
export async function deleteAccount() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    redirect("/login?next=/account");
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    redirect("/account?delete=error");
  }

  await supabase.auth.signOut();
  redirect("/?account=deleted");
}
