-- A fifth project type with no rate, offered as "from $0/video".
--
-- `Reels` — capital R, so 0011's `on conflict (slug)` treated it as a
-- different row from `reels` and left it alone. It carries no rate and no
-- first-cut days, and on the brief it read as a real offer: a fifth card
-- under the four, quoting nothing per video and dating the first cut today.
--
-- Deleted rather than priced, because `reels` already covers the work and two
-- cards for it is the problem whichever one is picked.
delete from project_types
 where slug = 'Reels';

-- Nothing else in this table should be sellable at nothing either, but a
-- half-filled row is a normal thing to have open in the panel for an
-- afternoon. So the rule lives in the loader, which drops a rateless type
-- from the public form and leaves it in the panel to be finished — rather
-- than in a constraint here, which would stop it being saved at all.
