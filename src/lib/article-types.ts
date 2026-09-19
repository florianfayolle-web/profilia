// Shared shape for the `public.articles` table, written by the
// `seo-daily-article` scheduled task and read by /blog, /blog/[slug] and
// /blog/preview/[id]. See scripts/add-draft-article.mjs for how rows are
// inserted.

export type ArticleCategory = "recrutement" | "fun";

export type ArticleSection = { heading: string; body: string[] };

export type ArticleRow = {
  id: string;
  slug: string;
  category: ArticleCategory;
  title: string;
  meta_description: string;
  intro: string;
  sections: ArticleSection[];
  related_slugs: string[];
  status: "draft" | "published";
  publish_token: string;
  created_at: string;
  published_at: string | null;
  /** Set by the reader on the preview page to ask for a rewrite; cleared
   * once the next scheduled-task run applies it (see scripts/apply-revision.mjs). */
  pending_revision: string | null;
};

export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = {
  recrutement: "Tests & recrutement",
  fun: "Tests entre amis & en famille",
};
