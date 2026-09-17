-- Example test so you can see the site working end-to-end.
-- Run this AFTER schema.sql, in the Supabase SQL editor.
--
-- To add your own real tests, copy this pattern:
--   1. Insert one row into `tests`.
--   2. Insert its questions into `questions` (ordered by `position`).
--   3. Insert each question's answer choices into `question_options`.
--      The `scores` column maps a "trait key" to points, e.g. {"explorateur": 2}.
--   4. Insert one row per possible trait into `result_profiles` — whichever
--      trait ends up with the highest total after the quiz is the result shown.
--
-- Price rule: price_cents = 0 means the test is free for anyone with an account.
-- Set price_cents > 0 and a matching Stripe Price id (stripe_price_id) to sell
-- it individually. included_in_subscription controls whether an active
-- subscriber gets it for free as part of the "all access" plan.

with new_test as (
  insert into public.tests (slug, title, description, price_cents, currency, included_in_subscription)
  values (
    'quel-est-ton-animal-totem',
    'Quel est ton animal totem ?',
    'Un test de personnalité rapide pour découvrir l''animal qui te représente le mieux.',
    300, -- 3,00 EUR if bought individually
    'eur',
    true
  )
  returning id
),
q1 as (
  insert into public.questions (test_id, position, text)
  select id, 1, 'Le week-end, tu préfères plutôt :' from new_test
  returning id
),
q2 as (
  insert into public.questions (test_id, position, text)
  select id, 2, 'Face à un imprévu, ta première réaction est :' from new_test
  returning id
),
q3 as (
  insert into public.questions (test_id, position, text)
  select id, 3, 'Ton entourage te décrit comme quelqu''un de :' from new_test
  returning id
)
insert into public.question_options (question_id, position, text, scores)
select id, 1, 'Explorer un nouvel endroit', '{"explorateur": 2}'::jsonb from q1
union all
select id, 2, 'Rester au calme chez toi', '{"gardien": 2}'::jsonb from q1
union all
select id, 3, 'Voir des amis', '{"social": 2}'::jsonb from q1
union all
select id, 1, 'Improviser une solution', '{"explorateur": 2, "social": 1}'::jsonb from q2
union all
select id, 2, 'Réfléchir calmement avant d''agir', '{"gardien": 2}'::jsonb from q2
union all
select id, 3, 'Demander de l''aide à quelqu''un', '{"social": 2}'::jsonb from q2
union all
select id, 1, 'Curieux et aventurier', '{"explorateur": 2}'::jsonb from q3
union all
select id, 2, 'Fiable et posé', '{"gardien": 2}'::jsonb from q3
union all
select id, 3, 'Chaleureux et sociable', '{"social": 2}'::jsonb from q3;

insert into public.result_profiles (test_id, trait_key, title, description)
select id, 'explorateur', 'Le Renard explorateur',
  'Curieux et vif, tu aimes découvrir de nouveaux horizons et t''adapter à toute situation.'
from public.tests where slug = 'quel-est-ton-animal-totem'
union all
select id, 'gardien', 'La Tortue gardienne',
  'Posé et fiable, tu avances lentement mais sûrement, et on peut toujours compter sur toi.'
from public.tests where slug = 'quel-est-ton-animal-totem'
union all
select id, 'social', 'Le Dauphin sociable',
  'Chaleureux et énergique, tu rayonnes en groupe et tisses des liens facilement.'
from public.tests where slug = 'quel-est-ton-animal-totem';
