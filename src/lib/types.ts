export type TestFormat =
  | "single_choice"
  | "forced_choice_pair"
  | "forced_choice_quad"
  | "situational_judgment"
  | "likert_scale"
  | "bipolar_pairs"
  | "disc_quad"
  | "pcm_likert"
  | "logic_mcq"
  | "career_balance"
  | "sosie_v2"
  | "orientation_riasec";

export type Test = {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover_image_url: string | null;
  price_cents: number;
  currency: string;
  stripe_price_id: string | null;
  is_active: boolean;
  included_in_subscription: boolean;
  format: TestFormat;
  language: string;
  created_at: string;
};

export type Question = {
  id: string;
  test_id: string;
  position: number;
  text: string;
  question_options: QuestionOption[];
};

export type QuestionOption = {
  id: string;
  question_id: string;
  position: number;
  text: string;
  scores: Record<string, number>;
};

export type ResultProfile = {
  id: string;
  test_id: string;
  trait_key: string;
  title: string;
  description: string;
  image_url: string | null;
};

export type Attempt = {
  id: string;
  user_id: string | null;
  test_id: string;
  answers: unknown;
  scores: Record<string, number>;
  result_profile_id: string | null;
  result: unknown;
  // Set only for guest (user_id null) attempts on a free test.
  guest_email: string | null;
  // False only for a guest attempt on a free test awaiting the unlock
  // micro-payment; true for every other attempt.
  unlocked: boolean;
  completed_at: string;
};

export type Purchase = {
  id: string;
  user_id: string;
  test_id: string;
  status: "pending" | "paid" | "refunded";
  amount_cents: number | null;
  currency: string | null;
  created_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: string;
  current_period_end: string | null;
};

export function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}
