"use server";

import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  ForgotPasswordFormSchema,
  ForgotPasswordFormState,
  LoginFormSchema,
  LoginFormState,
  ResetPasswordFormSchema,
  ResetPasswordFormState,
  SignupFormSchema,
  SignupFormState,
} from "@/lib/definitions";
import { SITE_URL } from "@/lib/site";
import { safeNextPath } from "@/lib/safe";

export async function signup(
  _state: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const validatedFields = SignupFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    gender: formData.get("gender"),
    birthDate: formData.get("birthDate"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { firstName, lastName, gender, birthDate, email, password } =
    validatedFields.data;
  const fullName = `${firstName} ${lastName}`.trim();
  const testSlug = formData.get("testSlug");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    return { message: signupErrorMessage(error) };
  }

  if (data.user) {
    // Best-effort: the trigger that creates the profile row only sets
    // id/email, so fill in the rest here. Not worth failing the signup
    // over if this update errors.
    await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        gender,
        birth_date: birthDate,
        ...(typeof testSlug === "string" && testSlug
          ? { interested_test_slug: testSlug }
          : {}),
      })
      .eq("id", data.user.id);
  }

  // With email confirmation enabled, signUp succeeds but returns no
  // session — the account exists but isn't usable until the link in the
  // confirmation email is clicked. Redirecting to /tests here would just
  // land the visitor on a page that looks logged out, with no explanation.
  if (!data.session) {
    return {
      success: true,
      message:
        "Compte créé ! Vérifie ta boîte mail (et tes spams) pour confirmer ton adresse avant de te connecter.",
    };
  }

  redirect("/tests");
}

function signupErrorMessage(error: { code?: string; message: string }): string {
  switch (error.code) {
    case "user_already_exists":
      return "Un compte existe déjà avec cet email. Essaie de te connecter.";
    case "over_email_send_rate_limit":
      return "Trop de tentatives d'inscription en peu de temps. Réessaie dans quelques minutes.";
    case "weak_password":
      return "Ce mot de passe est trop simple, choisis-en un autre.";
    default:
      return "Impossible de créer le compte pour le moment. Réessaie dans quelques instants.";
  }
}

export async function login(
  _state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password } = validatedFields.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        message:
          "Ton email n'est pas encore confirmé. Vérifie ta boîte mail (et tes spams) pour le lien de confirmation.",
      };
    }
    return { message: "Email ou mot de passe incorrect." };
  }

  const next = formData.get("next");
  redirect(safeNextPath(next, "/tests"));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// Always returns the same success message whether or not the email is
// registered — confirming/denying an account's existence to an anonymous
// visitor is an information leak, not a UX nicety.
const FORGOT_PASSWORD_SUCCESS_MESSAGE =
  "Si un compte existe avec cet email, un lien de réinitialisation vient de lui être envoyé. Vérifie ta boîte mail (et tes spams).";

export async function requestPasswordReset(
  _state: ForgotPasswordFormState,
  formData: FormData
): Promise<ForgotPasswordFormState> {
  const validatedFields = ForgotPasswordFormSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { email } = validatedFields.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Points straight at the reset-password form with the token still in
    // the URL, rather than an auto-verifying route: some email providers
    // (Gmail among them) prefetch links to scan them for safety, which
    // silently consumes a single-use recovery link before the person ever
    // clicks it. Verifying only when they submit the new-password form
    // means the token is spent by an explicit action, not a page load.
    redirectTo: `${SITE_URL}/reset-password`,
  });

  // A rate-limit error is worth surfacing (the visitor should know to wait);
  // any other error (including "user not found", which Supabase doesn't
  // actually return here) stays behind the generic message above.
  if (error?.code === "over_email_send_rate_limit") {
    return {
      message:
        "Trop de demandes en peu de temps. Réessaie dans quelques minutes.",
    };
  }

  return { success: true, message: FORGOT_PASSWORD_SUCCESS_MESSAGE };
}

export async function resetPassword(
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

  // The recovery token travels as hidden fields instead of being consumed
  // by an earlier page load (see the comment on resetPasswordForEmail's
  // redirectTo above) — this submit is the first and only place it's used.
  const tokenHash = formData.get("token_hash");
  const type = formData.get("type");
  if (typeof tokenHash === "string" && tokenHash && typeof type === "string") {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    });
    if (verifyError) {
      return {
        message:
          "Ce lien de réinitialisation a expiré ou n'est plus valide. Refais une demande.",
      };
    }
  } else {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return {
        message:
          "Ce lien de réinitialisation a expiré ou n'est plus valide. Refais une demande.",
      };
    }
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

  redirect("/login?reset=success");
}
