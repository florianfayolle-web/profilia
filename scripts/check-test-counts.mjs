// Fails if a test's public description claims a number of questions that
// doesn't match what the test really serves (e.g. "20 affirmations" for a
// 12-question test). Run before/after editing descriptions or test content:
//   node --env-file=.env.local scripts/check-test-counts.mjs
import { createClient } from "@supabase/supabase-js";

const a = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const UNITS = /(\d+)\s*(questions?|affirmations?|paires?|énoncés|groupes?|items?|tétrades|triades|mises en situation|scenarios?|propositions)/gi;

const { data: tests } = await a.from("tests").select("id,slug,format,description").order("slug");
let bad = 0;
for (const t of tests) {
  let real;
  if (t.format === "single_choice") {
    real = (await a.from("questions").select("id", { count: "exact", head: true }).eq("test_id", t.id)).count;
  } else {
    const { data: c } = await a.from("test_content").select("definition").eq("test_id", t.id).single();
    const d = c.definition;
    real = (d.items ?? []).length + (d.contextItems?.length ?? 0);
  }
  const claimed = [...t.description.matchAll(UNITS)].map((m) => Number(m[1]));
  if (claimed.length && !claimed.includes(real)) {
    bad++;
    console.log(`MISMATCH ${t.slug}: réel=${real}, description annonce ${claimed.join(", ")}`);
  }
}
console.log(bad ? `${bad} écart(s)` : `OK : ${tests.length} tests cohérents`);
process.exit(bad ? 1 : 0);
