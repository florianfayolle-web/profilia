"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ArticleRow } from "@/lib/article-types";

// Publishes a draft article once its publish_token (emailed to the owner by
// the seo-daily-article scheduled task) is confirmed. A POST-only server
// action — never triggered by a GET link, so an email client's link
// pre-scanner can't publish something by accident.
export async function publishArticle(formData: FormData) {
  const id = formData.get("id");
  const token = formData.get("token");
  if (typeof id !== "string" || typeof token !== "string") {
    throw new Error("Missing id/token");
  }

  const supabase = createAdminClient();
  const { data: article } = await supabase
    .from("articles")
    .select("id, slug, status, publish_token")
    .eq("id", id)
    .maybeSingle<Pick<ArticleRow, "id" | "slug" | "status" | "publish_token">>();

  if (!article || article.publish_token !== token || article.status === "published") {
    throw new Error("Invalid or already-published article");
  }

  await supabase
    .from("articles")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/blog");
  revalidatePath(`/blog/${article.slug}`);
  redirect(`/blog/${article.slug}`);
}
