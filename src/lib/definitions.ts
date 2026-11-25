import { z } from "zod";

export const GENDER_OPTIONS = [
  { value: "femme", label: "Femme" },
  { value: "homme", label: "Homme" },
  { value: "autre", label: "Autre" },
  { value: "non_precise", label: "Je préfère ne pas préciser" },
] as const;

export const SignupFormSchema = z.object({
  firstName: z.string().trim().min(1, "Merci d'indiquer ton prénom."),
  // Last name, gender and birth date are no longer asked at signup (they
  // cost conversions and nothing needs them to unlock a report): they stay
  // optional so older accounts and the account page keep working.
  lastName: z.string().trim().optional(),
  gender: z.enum(["femme", "homme", "autre", "non_precise"]).optional(),
  birthDate: z.string().optional(),
  email: z.string().trim().email("Merci d'entrer un email valide."),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères."),
});

export const LoginFormSchema = z.object({
  email: z.string().trim().email("Merci d'entrer un email valide."),
  password: z.string().min(1, "Merci d'entrer ton mot de passe."),
});

export type SignupFormState =
  | {
      errors?: {
        firstName?: string[];
        lastName?: string[];
        gender?: string[];
        birthDate?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export const ForgotPasswordFormSchema = z.object({
  email: z.string().trim().email("Merci d'entrer un email valide."),
});

export type ForgotPasswordFormState =
  | {
      errors?: { email?: string[] };
      message?: string;
      success?: boolean;
    }
  | undefined;

export const ResetPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les deux mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormState =
  | {
      errors?: { password?: string[]; confirmPassword?: string[] };
      message?: string;
    }
  | undefined;
