import Link from "next/link";
import type { CATEGORIES } from "@/lib/test-category";
import { CategoryIcon } from "@/components/category-icon";

export function CategoryHero({
  category,
}: {
  category: (typeof CATEGORIES)[number];
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl px-8 py-10 text-white"
      style={{ background: category.gradient }}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, #fff 0%, transparent 35%), radial-gradient(circle at 90% 80%, #fff 0%, transparent 30%)",
        }}
      />
      <p className="relative text-sm text-white/80">
        <Link href="/tests" className="hover:text-white">
          Tous les tests
        </Link>
        {" / "}
        {category.title}
      </p>
      <div className="relative mt-3 flex items-center gap-4">
        <CategoryIcon
          category={category.slug}
          className="h-10 w-10 shrink-0 text-white/90"
        />
        <h1 className="text-3xl font-semibold tracking-tight">
          {category.title}
        </h1>
      </div>
      <p className="relative mt-3 max-w-2xl text-white/85">
        {category.description}
      </p>
    </div>
  );
}
