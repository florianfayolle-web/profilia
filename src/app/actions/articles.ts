"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ArticleRow } from "@/lib/article-types";
import { tokensMatch } from "@/lib/safe";

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

  if (!article || !tokensMatch(article.publish_token, token) || article.status === "published") {
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

// Flags a draft for rewrite with the reviewer's notes. Picked up by the next
// run of the seo-daily-article scheduled task (scripts/apply-revision.mjs),
// which rewrites the article and re-sends the review email — it does not
// happen instantly, since nothing is listening for this in real time.
export async function requestRevision(formData: FormData) {
  const id = formData.get("id");
  const token = formData.get("token");
  const notes = formData.get("notes");
  if (typeof id !== "string" || typeof token !== "string" || typeof notes !== "string" || !notes.trim()) {
    throw new Error("Missing id/token/notes");
  }

  const supabase = createAdminClient();
  const { data: article } = await supabase
    .from("articles")
    .select("id, publish_token, status")
    .eq("id", id)
    .maybeSingle<Pick<ArticleRow, "id" | "publish_token" | "status">>();

  if (!article || !tokensMatch(article.publish_token, token) || article.status !== "draft") {
    throw new Error("Invalid or non-draft article");
  }

  await supabase.from("articles").update({ pending_revision: notes.trim() }).eq("id", id);

  revalidatePath(`/blog/preview/${id}`);
}
