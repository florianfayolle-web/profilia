import { z } from "zod";

export const SignupFormSchema = z.object({
  fullName: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères."),
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
        fullName?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
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
