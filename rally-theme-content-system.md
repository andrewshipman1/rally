# Rally — Theme Content System v0
**17 themes. Each one is a full content package, not just a palette.**

Status: draft for review · Author: design pass · Date: 2026-04-07

---

## 0. What this is

Themes in Rally are not skins. A theme is a **content system** — palette, voice, stickers, marquee phrases, RSVP flavor, nudge copy, CTAs. A Bachelorette trip page and a Camping trip page should read *and* look like two different products that share a chassis.

This doc is the source of truth for all 17 themes. Claude Code reads the palette tokens from here; lexicon reads the strings from here. Every user-facing string that differs by theme lives in this file.

**Cost per theme (today):** palette (6 tokens) + ~20 critical strings. More can be added later — this is the MVP content pack.

**Theme categories:**
- **Occasions (7):** tied to the *reason* for the trip
- **Settings (9):** tied to the *place* of the trip
- **Default (1):** the generic fallback

If a theme is ever ambiguous (e.g., "Bachelorette in Tulum"), organizer picks — Rally doesn't auto-select.

### Hard rule: theme-aware text colors

When a surface renders multiple `data-theme` contexts on one page (e.g., dashboard cards, passport stamps), every text element and avatar initial inside a themed container **MUST** use a theme-aware color value (`var(--ink)`, `var(--on-surface)`, `var(--accent)`) — never hardcoded `white`, `#fff`, or any fixed light color. The chassis theming system sets `--ink` per theme to guarantee contrast against that theme's `--bg`. Surfaces like the trip page have dark backgrounds where white text works, but dashboard cards and passport stamps can resolve to light-themed palettes (e.g., `just-because`, `birthday-trip`) where white text becomes invisible. **Rule: if text sits inside a `[data-theme]` container, its color must come from a CSS custom property defined in that theme's palette.**

---

## String schema

Each theme ships with these 20 critical strings:

1. `palette.*` — 6 color tokens
2. `vibe` — one-line description (shown in theme picker)
3. `sticker.new` — header sticker in builder state
4. `sticker.invite` — header sticker in invitee state
5. `sticker.locked` — header sticker in lock/go state
6. `marquee` — array of 5 loop phrases
7. `hint.name` — placeholder copy for trip name field
8. `hint.dates` — placeholder copy for dates field
9. `hint.invite` — placeholder copy for invite field
10. `empty.no_activities` — itinerary empty state
11. `empty.no_extras` — extras empty state
12. `rsvp.in` — "i'm in" variant
13. `rsvp.holding` — "hold my seat" variant
14. `rsvp.out` — "can't make it" variant
15. `nudge.t14` — 14 days out
16. `nudge.t7` — 7 days out
17. `nudge.t3` — 3 days out
18. `nudge.cutoff` — cutoff deadline
19. `cta.send` — primary "send it" button
20. `caption.invite` — live-row caption on the trip page

---

# OCCASIONS

## 01 · Bachelorette
**Type:** occasion

**Palette:**
- `--bg` #fde9ed · `--ink` #1a0a12 · `--accent` #ff2e7e · `--accent2` #c4ff7a · `--sticker-bg` #ffe45a · `--surface` #2a1018

**Vibe:** Sail-her-off-into-the-sunset weekend. Hot pink, lime, lemon. Glitter-adjacent without the cringe.

- `sticker.new` → "new bach ✨"
- `sticker.invite` → "you're invited 💍"
- `sticker.locked` → "last hurrah 🥂"
- `marquee` → ["bride to be", "matching tees", "drinks on her", "dance floor destroyer", "say yes to the dress code"]
- `hint.name` → "something only the bride will get"
- `hint.dates` → "when's her last weekend?"
- `hint.invite` → "pull the bridal party in"
- `empty.no_activities` → "add the brunch, add the club, add the aftermath"
- `empty.no_extras` → "playlist? packing list? mandatory matching pjs?"
- `rsvp.in` → "i'm in 💅"
- `rsvp.holding` → "hold my seat 💭"
- `rsvp.out` → "can't make it 😭"
- `nudge.t14` → "the bride wants to know who's in"
- `nudge.t7` → "maid of honor is counting you"
- `nudge.t3` → "72h til the bach rally — get in or forever hold"
- `nudge.cutoff` → "pencils down, bride sees the final list tomorrow"
- `cta.send` → "send the invite 💌"
- `caption.invite` → "her last free weekend"

---

## 02 · Boys Trip
**Type:** occasion

**Palette:**
- `--bg` #0f0e10 · `--ink` #f0e8d8 · `--accent` #e84a1a · `--accent2` #4aa3d9 · `--sticker-bg` #ffd84d · `--surface` #1a1a1e

**Vibe:** Vegas. Fantasy draft weekend. Bachelor party. Four-day golf bender. Dark mode, orange + blue, no apologies.

- `sticker.new` → "new rally 🍺"
- `sticker.invite` → "the boys are calling 🎲"
- `sticker.locked` → "it's on 🔥"
- `marquee` → ["the boys are back", "what happens stays", "tee time 7am", "over/unders open", "last one in pays"]
- `hint.name` → "the group chat already knows the name"
- `hint.dates` → "how long we getting out of dodge?"
- `hint.invite` → "pull the boys in"
- `empty.no_activities` → "sportsbook, steak, tee time, repeat"
- `empty.no_extras` → "packing list so nobody forgets the putter"
- `rsvp.in` → "i'm in 🤝"
- `rsvp.holding` → "tentative 🤔"
- `rsvp.out` → "can't do it 🫡"
- `nudge.t14` → "2 weeks out, who's locked?"
- `nudge.t7` → "7 days — send the cash to the group"
- `nudge.t3` → "72h, last chance to bail without heat"
- `nudge.cutoff` → "roster closes tomorrow, send it"
- `cta.send` → "send it 🚀"
- `caption.invite` → "the boys are going"

---

## 03 · Birthday Trip
**Type:** occasion

**Palette:**
- `--bg` #fff5e1 · `--ink` #2a1a0f · `--accent` #ff4757 · `--accent2` #4d9fff · `--sticker-bg` #ffd84d · `--surface` #3a1f24

**Vibe:** Friend's 30th. Balloon red, confetti blue, cream base. Less wedding-weekend than Bachelorette — just a big birthday.

- `sticker.new` → "new birthday 🎈"
- `sticker.invite` → "you're invited 🎂"
- `sticker.locked` → "it's on 🎉"
- `marquee` → ["turning {age}", "cake mandatory", "dress to party", "the big one", "we love you"]
- `hint.name` → "something like '{name}s 30th'"
- `hint.dates` → "when's the birthday weekend?"
- `hint.invite` → "pull the friends in"
- `empty.no_activities` → "add the dinner, add the bar, add the recovery brunch"
- `empty.no_extras` → "playlist for the birthday kid?"
- `rsvp.in` → "i'll be there 🎉"
- `rsvp.holding` → "trying 🙏"
- `rsvp.out` → "can't make it 💔"
- `nudge.t14` → "2 weeks til the birthday — who's in?"
- `nudge.t7` → "7 days out, reservations dropping"
- `nudge.t3` → "72h, the birthday kid is asking about you"
- `nudge.cutoff` → "final count tomorrow, don't leave them hanging"
- `cta.send` → "send the invite 🎉"
- `caption.invite` → "{name} is turning {age}"

---

## 04 · Couples Trip
**Type:** occasion

**Palette:**
- `--bg` #fde6d4 · `--ink` #3a1f24 · `--accent` #c44d3a · `--accent2` #5a8f9f · `--sticker-bg` #f4c37a · `--surface` #2a1418

**Vibe:** Group of couples, cabin weekend or rental house. Peach, terracotta, dusty teal. Not romantic-getaway-for-two — this is double dates at scale.

- `sticker.new` → "new rally 🏡"
- `sticker.invite` → "you two are invited 💕"
- `sticker.locked` → "locked in 🔑"
- `marquee` → ["couples only", "bring your person", "cabin cooking", "wine by the fire", "we love the group"]
- `hint.name` → "the annual? the cabin weekend?"
- `hint.dates` → "when can everyone + plus ones?"
- `hint.invite` → "add the couples, not individuals"
- `empty.no_activities` → "dinner in, wine out, hike Saturday"
- `empty.no_extras` → "playlist? house rules for 4 couples sharing a kitchen?"
- `rsvp.in` → "we're in 💕"
- `rsvp.holding` → "checking with {partner}"
- `rsvp.out` → "can't make it 😔"
- `nudge.t14` → "2 weeks — lock it in with your partner"
- `nudge.t7` → "7 days, groceries are being planned"
- `nudge.t3` → "72h, final head count tomorrow"
- `nudge.cutoff` → "the rally closes tomorrow — are you two in?"
- `cta.send` → "send the invite 💕"
- `caption.invite` → "the couples are gathering"

---

## 05 · Wellness Retreat
**Type:** occasion

**Palette:**
- `--bg` #eaeee4 · `--ink` #1a3329 · `--accent` #d98b2f · `--accent2` #7aa86a · `--sticker-bg` #f4e4a0 · `--surface` #1a2a22

**Vibe:** Sage, matcha, turmeric, terracotta. Yoga at sunrise, natural wine at sunset, unhinged at midnight. Aspirational on the surface, feral underneath.

- `sticker.new` → "new reset 🌿"
- `sticker.invite` → "you're invited 🧘"
- `sticker.locked` → "we're doing it 🍵"
- `marquee` → ["reset mode", "sunrise yoga", "green juice mandatory", "natural wine only", "what happens at the retreat"]
- `hint.name` → "the annual reset"
- `hint.dates` → "when do we all need this?"
- `hint.invite` → "bring the ones who need it"
- `empty.no_activities` → "add the yoga, add the hike, add the group dinner"
- `empty.no_extras` → "playlist? packing list? group journaling exercise?"
- `rsvp.in` → "i need this 🧘"
- `rsvp.holding` → "manifesting 🌙"
- `rsvp.out` → "can't rn 🙏"
- `nudge.t14` → "2 weeks to reset mode"
- `nudge.t7` → "7 days, start tapering the caffeine"
- `nudge.t3` → "72h, pack your mat"
- `nudge.cutoff` → "final yes needed — class sizes matter"
- `cta.send` → "send the invite 🌿"
- `caption.invite` → "everyone needs a reset"

---

## 06 · Reunion Weekend
**Type:** occasion

**Palette:**
- `--bg` #f4ede0 · `--ink` #2a1f18 · `--accent` #b84a2f · `--accent2` #2d6b8f · `--sticker-bg` #f4c94a · `--surface` #1a1410

**Vibe:** College friends, the annual, "we're still doing this." Warm cream, vintage red, faded denim blue. Nostalgic but not sad.

- `sticker.new` → "the annual 📓"
- `sticker.invite` → "still doing it 🫶"
- `sticker.locked` → "year {n} 📓"
- `marquee` → ["we're still doing this", "year {n}", "the usual suspects", "throwback weekend", "no excuses"]
- `hint.name` → "'{group} annual' or whatever we've always called it"
- `hint.dates` → "same weekend as last year?"
- `hint.invite` → "pull the original crew in"
- `empty.no_activities` → "the usual bar, the usual diner, the usual bad decisions"
- `empty.no_extras` → "packing list with one rule: the jersey"
- `rsvp.in` → "i'm there 🙌"
- `rsvp.holding` → "trying to swing it 🤞"
- `rsvp.out` → "can't this year 😔"
- `nudge.t14` → "2 weeks til the annual — don't break the streak"
- `nudge.t7` → "7 days, this is the year someone skips — don't be them"
- `nudge.t3` → "72h, flights are boarding"
- `nudge.cutoff` → "final yes tomorrow — year {n} can't wait"
- `cta.send` → "send the invite 📓"
- `caption.invite` → "the annual is back"

---

## 07 · Festival Run
**Type:** occasion

**Palette:**
- `--bg` #1a0a2e · `--ink` #f4e6ff · `--accent` #ff3a8c · `--accent2` #5aff9e · `--sticker-bg` #ffe14a · `--surface` #2a1540`

**Vibe:** Coachella, ACL, EDC, F1 weekend, Super Bowl. The event IS the trip. Dark purple base, neon pink + acid green. Loud, fast, a lot.

- `sticker.new` → "new run 🎟️"
- `sticker.invite` → "you're on the list 🎟️"
- `sticker.locked` → "it's happening 🔊"
- `marquee` → ["wristbands on", "set times locked", "find me at the main stage", "who's got the tickets", "front row or bust"]
- `hint.name` → "'{festival} {year}' does the trick"
- `hint.dates` → "festival dates"
- `hint.invite` → "pull the crew in fast — wristbands sell out"
- `empty.no_activities` → "add the headliner, add the pregame, add the hotel"
- `empty.no_extras` → "packing list for the sun + the rain + the night"
- `rsvp.in` → "i got my ticket 🎟️"
- `rsvp.holding` → "working on tickets 🎫"
- `rsvp.out` → "can't swing it 😩"
- `nudge.t14` → "2 weeks, do you have your wristband?"
- `nudge.t7` → "7 days, where are we meeting day 1?"
- `nudge.t3` → "72h, charge your portable battery"
- `nudge.cutoff` → "final roster tomorrow, see you at the gates"
- `cta.send` → "send the invite 🎟️"
- `caption.invite` → "the festival run is on"

---

# SETTINGS

## 08 · Beach Trip
**Type:** setting

**Palette:**
- `--bg` #e6f6f4 · `--ink` #0a2a3a · `--accent` #ff6a3d · `--accent2` #ffd84d · `--sticker-bg` #ffd84d · `--surface` #0a3a4a

**Vibe:** Sea foam, coral, sun yellow. Domestic US coast — OBX, Gulf Shores, Rosemary, Tahoe lake. Not tropical — Beach has a different vowel than Tropical.

- `sticker.new` → "new beach 🏖️"
- `sticker.invite` → "sand szn 🏖️"
- `sticker.locked` → "we're going 🌊"
- `marquee` → ["toes in", "sunscreen check", "beers on the beach", "sunset walk", "rosé all day"]
- `hint.name` → "which beach, which year?"
- `hint.dates` → "when's the water warm?"
- `hint.invite` → "pull the crew in"
- `empty.no_activities` → "add the house, add the restaurant, add the boat day"
- `empty.no_extras` → "packing list: swimsuit, backup swimsuit"
- `rsvp.in` → "sand szn 🏖️"
- `rsvp.holding` → "checking the calendar 📅"
- `rsvp.out` → "can't make it 🥲"
- `nudge.t14` → "2 weeks til toes in"
- `nudge.t7` → "7 days, grocery run being planned"
- `nudge.t3` → "72h — start the packing"
- `nudge.cutoff` → "final count tomorrow, house is splitting cost"
- `cta.send` → "send the invite 🏖️"
- `caption.invite` → "sand szn is on"

---

## 09 · Ski Chalet
**Type:** setting

**Palette:**
- `--bg` #f1ebd9 · `--ink` #1a1f1a · `--accent` #c44d3a · `--accent2` #d9a344 · `--sticker-bg` #f4e4a0 · `--surface` #1a2018

**Vibe:** Bone, oxblood, ochre, forest. Park City to Niseko. Same chaos, in a Filson jacket.

- `sticker.new` → "new ski trip 🎿"
- `sticker.invite` → "send it ❄️"
- `sticker.locked` → "the mountain is open 🏔️"
- `marquee` → ["first chair 7am", "après at 3", "hot tub at 9", "the mountain is open", "send it"]
- `hint.name` → "'{mountain} {year}' or something sillier"
- `hint.dates` → "when is the snow good?"
- `hint.invite` → "pull the crew in"
- `empty.no_activities` → "add the cabin, add the mountain, add après"
- `empty.no_extras` → "packing list: long johns, hand warmers, the flask"
- `rsvp.in` → "send it 🎿"
- `rsvp.holding` → "checking the pass 🎫"
- `rsvp.out` → "can't swing it ❄️"
- `nudge.t14` → "2 weeks til first chair"
- `nudge.t7` → "7 days, tune your edges"
- `nudge.t3` → "72h — check the forecast"
- `nudge.cutoff` → "final count tomorrow, mountain's calling"
- `cta.send` → "send it 🎿"
- `caption.invite` → "the mountain is calling"

---

## 10 · Euro Summer
**Type:** setting

**Palette:**
- `--bg` #f5e9d3 · `--ink` #2a1a0f · `--accent` #c4532a · `--accent2` #7a8a3a · `--sticker-bg` #f4c94a · `--surface` #1a140a

**Vibe:** Linen, burnt orange, olive, ochre. Mykonos, Mallorca, Puglia — too much olive oil, too many boat days.

- `sticker.new` → "new euro szn 🍋"
- `sticker.invite` → "come to europe 🍋"
- `sticker.locked` → "locked in 🏛️"
- `marquee` → ["too much olive oil", "spritz at noon", "boat day", "walk the coast", "dinner at 10pm"]
- `hint.name` → "'{place} summer'"
- `hint.dates` → "when can we get away?"
- `hint.invite` → "pull the crew in early — flights"
- `empty.no_activities` → "add the villa, add the boat day, add the long dinner"
- `empty.no_extras` → "packing list: 6 linen shirts, 1 dress code for dinner"
- `rsvp.in` → "ciao 🍋"
- `rsvp.holding` → "checking flights ✈️"
- `rsvp.out` → "can't swing it 🥲"
- `nudge.t14` → "2 weeks, book your flights"
- `nudge.t7` → "7 days, the villa needs a head count"
- `nudge.t3` → "72h — start packing the linen"
- `nudge.cutoff` → "final roster tomorrow — ciao"
- `cta.send` → "send it 🍋"
- `caption.invite` → "europe is calling"

---

## 11 · City Weekend
**Type:** setting

**Palette:**
- `--bg` #141416 · `--ink` #f4ede0 · `--accent` #ff2e7e · `--accent2` #2dd4d4 · `--sticker-bg` #ffd84d · `--surface` #2a2a2e`

**Vibe:** Dark mode entry. Charcoal, cream, hot magenta, electric cyan. NYC, Tokyo, CDMX after dark. Dense, loud, late.

- `sticker.new` → "new city rally 🌃"
- `sticker.invite` → "the city is calling 🌃"
- `sticker.locked` → "locked in 🌃"
- `marquee` → ["the city is ours", "dinner at 9", "late drinks", "walk home at 3", "everything's open"]
- `hint.name` → "'{city} {month}' works"
- `hint.dates` → "which weekend?"
- `hint.invite` → "pull the crew in"
- `empty.no_activities` → "add the restaurant, add the bar, add the show"
- `empty.no_extras` → "playlist? walking shoes?"
- `rsvp.in` → "i'm in 🌃"
- `rsvp.holding` → "checking the calendar 📅"
- `rsvp.out` → "can't make it 😔"
- `nudge.t14` → "2 weeks, reservations are dropping"
- `nudge.t7` → "7 days, lock the dinner spot"
- `nudge.t3` → "72h — pack the black stuff"
- `nudge.cutoff` → "final count tomorrow, the city is waiting"
- `cta.send` → "send it 🌃"
- `caption.invite` → "the city weekend is on"

---

## 12 · Wine Country
**Type:** setting

**Palette:**
- `--bg` #f4ede0 · `--ink` #3e1f3a · `--accent` #8a2e3e · `--accent2` #a8945a · `--sticker-bg` #e8d4a0 · `--surface` #2a1420

**Vibe:** Bone, plum, rose, sage. Sonoma, Willamette, Tuscany, Mendoza. For people who pretend to know wine, and for people who actually do.

- `sticker.new` → "new tasting 🍷"
- `sticker.invite` → "pour yourself in 🍷"
- `sticker.locked` → "decanted 🍷"
- `marquee` → ["tasting at 11", "tannins discussed", "cheese plate obligatory", "designated driver decided", "long lunch"]
- `hint.name` → "'{region} weekend'"
- `hint.dates` → "when's harvest / when's the quiet season?"
- `hint.invite` → "pull the wine people in"
- `empty.no_activities` → "add the vineyard, add the long lunch, add the nap"
- `empty.no_extras` → "packing list: the notebook, the good jacket"
- `rsvp.in` → "pour me in 🍷"
- `rsvp.holding` → "swirling on it 🍇"
- `rsvp.out` → "can't make it 😔"
- `nudge.t14` → "2 weeks til the tasting"
- `nudge.t7` → "7 days, reservations at the flagship drop"
- `nudge.t3` → "72h — book the driver"
- `nudge.cutoff` → "final count tomorrow, the vineyard needs numbers"
- `cta.send` → "send it 🍷"
- `caption.invite` → "the wine weekend is on"

---

## 13 · Lake Weekend
**Type:** setting

**Palette:**
- `--bg` #dfeef0 · `--ink` #0e2a3e · `--accent` #c4532a · `--accent2` #f4c94a · `--sticker-bg` #f4c94a · `--surface` #0a1a24

**Vibe:** Pale water blue, navy, cherry red, sun yellow. Lake James, Tahoe, Coeur d'Alene, Lake of the Ozarks. Floaties, beer pong, pontoon.

- `sticker.new` → "new lake day 🛶"
- `sticker.invite` → "lake szn 🛶"
- `sticker.locked` → "launching 🚤"
- `marquee` → ["floaties ready", "pontoon fueled", "beer pong set up", "sunset on the water", "grill by 6"]
- `hint.name` → "'{lake} {year}' or 'lake szn'"
- `hint.dates` → "when's the water warm?"
- `hint.invite` → "pull the lake crew in"
- `empty.no_activities` → "add the house, add the boat, add the grill"
- `empty.no_extras` → "packing list: floatie, sunscreen, backup floatie"
- `rsvp.in` → "lake szn 🛶"
- `rsvp.holding` → "pontoon pending 🚤"
- `rsvp.out` → "can't make it 🥲"
- `nudge.t14` → "2 weeks til launch"
- `nudge.t7` → "7 days, who's hauling the cooler?"
- `nudge.t3` → "72h — inflate the floaties"
- `nudge.cutoff` → "final count tomorrow, the boat's waiting"
- `cta.send` → "send it 🛶"
- `caption.invite` → "lake szn is calling"

---

## 14 · Desert Trip
**Type:** setting

**Palette:**
- `--bg` #f4e4cf · `--ink` #3a1f10 · `--accent` #d94a1a · `--accent2` #7a5a8f · `--sticker-bg` #f4c94a · `--surface` #2a1508

**Vibe:** Joshua Tree, Marfa, Palm Springs, Sedona. Sandstone cream, burnt sienna, dusty purple (the sunset), ochre. Big skies, slow mornings, loud nights.

- `sticker.new` → "new desert run 🌵"
- `sticker.invite` → "the desert is calling 🌵"
- `sticker.locked` → "see you under the stars ✨"
- `marquee` → ["big sky", "slow morning", "loud night", "stargaze at 10", "pool at noon"]
- `hint.name` → "'{place} weekend' or something dumber"
- `hint.dates` → "when's the weather livable?"
- `hint.invite` → "pull the crew in"
- `empty.no_activities` → "add the pool day, add the hike, add the roadside diner"
- `empty.no_extras` → "packing list: sunscreen, warm layer for nights, playlist for the drive"
- `rsvp.in` → "see you there 🌵"
- `rsvp.holding` → "maybe 🌄"
- `rsvp.out` → "can't make it 😔"
- `nudge.t14` → "2 weeks til the desert"
- `nudge.t7` → "7 days, where are we staying?"
- `nudge.t3` → "72h — gas up the car"
- `nudge.cutoff` → "final count tomorrow, the desert doesn't wait"
- `cta.send` → "send it 🌵"
- `caption.invite` → "the desert is calling"

---

## 15 · Camping Trip
**Type:** setting

**Palette:**
- `--bg` #e8e4d4 · `--ink` #1a2418 · `--accent` #8a4a1a · `--accent2` #4a7a3a · `--sticker-bg` #f4c94a · `--surface` #1a1a10

**Vibe:** National park, cabin, tent, pines, woodsmoke. Earthy cream, bark brown, pine green, campfire yellow. Quiet, slow, stars.

- `sticker.new` → "new camp 🏕️"
- `sticker.invite` → "meet at camp 🏕️"
- `sticker.locked` → "see you at the fire 🔥"
- `marquee` → ["tents up", "fire at dusk", "no signal, on purpose", "stars at 10", "coffee on the stove"]
- `hint.name` → "'{park} {year}' — make it clear which trip"
- `hint.dates` → "when's the weather good?"
- `hint.invite` → "pull the crew in — sites fill up"
- `empty.no_activities` → "add the site, add the hike, add the campfire"
- `empty.no_extras` → "packing list: headlamp, rain layer, the bourbon"
- `rsvp.in` → "see you at camp 🏕️"
- `rsvp.holding` → "checking my gear 🎒"
- `rsvp.out` → "can't swing it 😔"
- `nudge.t14` → "2 weeks, book your site + your flights"
- `nudge.t7` → "7 days, pack the tent"
- `nudge.t3` → "72h — check the weather"
- `nudge.cutoff` → "final count tomorrow, the fire is waiting"
- `cta.send` → "send it 🏕️"
- `caption.invite` → "the fire is calling"

---

## 16 · Tropical
**Type:** setting

**Palette:**
- `--bg` #e4f4e8 · `--ink` #0a2a1f · `--accent` #ff5a3a · `--accent2` #3ab8d4 · `--sticker-bg` #ffd84d · `--surface` #0a2418

**Vibe:** Turks, Tulum, Maui, Bali, Phuket. Distinct from Beach — this is passport-required. Electric teal, hibiscus orange, palm shadow. Warmer, more saturated, more "we actually escaped."

- `sticker.new` → "new escape 🌴"
- `sticker.invite` → "island time 🌴"
- `sticker.locked` → "passports ready 🛂"
- `marquee` → ["island time", "barefoot bar", "reef by day", "hibiscus at sunset", "no signal except sun"]
- `hint.name` → "'{island} {year}'"
- `hint.dates` → "when can we all get passports aligned?"
- `hint.invite` → "pull the crew in early — flights"
- `empty.no_activities` → "add the resort, add the snorkel day, add the beach dinner"
- `empty.no_extras` → "packing list: reef-safe sunscreen, 2 swimsuits, the good shirt"
- `rsvp.in` → "island time 🌴"
- `rsvp.holding` → "checking flights ✈️"
- `rsvp.out` → "can't this year 🥲"
- `nudge.t14` → "2 weeks, is your passport ready?"
- `nudge.t7` → "7 days, confirm your flights"
- `nudge.t3` → "72h — pack the sunscreen"
- `nudge.cutoff` → "final roster tomorrow — we're leaving"
- `cta.send` → "send it 🌴"
- `caption.invite` → "we're leaving the country"

---

# DEFAULT

## 17 · Just Because
**Type:** neutral default

**Palette:**
- `--bg` #fafafa · `--ink` #1a1a1a · `--accent` #ff5a1f · `--accent2` #1fa8ff · `--sticker-bg` #ffd84d · `--surface` #1a1a1a

**Vibe:** White, hot orange, electric blue, sun yellow. Universal default. "We don't need a reason." Use when no other theme fits.

- `sticker.new` → "new rally ✨"
- `sticker.invite` → "you're invited 💌"
- `sticker.locked` → "it's on 🚀"
- `marquee` → ["why not", "we don't need a reason", "just go", "pack a bag", "send it"]
- `hint.name` → "give it a name only your group would get"
- `hint.dates` → "when are we doing this?"
- `hint.invite` → "who's in?"
- `empty.no_activities` → "add the first thing that makes it feel real"
- `empty.no_extras` → "packing list? playlist? whatever helps"
- `rsvp.in` → "i'm in 🙌"
- `rsvp.holding` → "hold my seat 🧗"
- `rsvp.out` → "can't make it —"
- `nudge.t14` → "2 weeks out, who's locked in?"
- `nudge.t7` → "7 days, who else?"
- `nudge.t3` → "72h til go time"
- `nudge.cutoff` → "final count tomorrow — last call"
- `cta.send` → "send it 🚀"
- `caption.invite` → "something's happening"

---

## Open calls / gaps

- **Emoji-only users:** some theme strings depend on emoji to carry the vibe. If emoji-off is ever a user preference, each theme needs a text-only fallback string set. Cut for v0.
- **Localization:** all strings are en-US. i18n is v0.1+.
- **Organizer overrides:** any string can be manually overridden by the organizer on their trip. The theme sets the defaults; the organizer has the last word.
- **Auto-theme suggestion:** eventually Rally could suggest a theme based on the trip name and destination ("Park City" → Ski Chalet). Not in v0 — organizer picks.
- **RSVP chip emojis (LOCKED GLOBAL v0):** 🙌 / 🧗 / — are the three-state chip icons. They are GLOBAL and do NOT theme. See lexicon §5.10. Only the button CTA text (`rsvp.in`, `rsvp.holding`, `rsvp.out` in the per-theme pack below — e.g. "pour me in 🍷") is themeable, and those only appear on the viewer-side action surface. Pipeline chips, crew rows, buzz events, and organizer dashboard always render the global icons.
- **Festival variable strings:** `{festival}`, `{age}`, `{partner}`, `{park}`, `{city}`, `{place}`, `{lake}`, `{mountain}`, `{region}`, `{island}`, `{group}`, `{n}` are organizer-supplied or computed. Lexicon §5.22 (pending) will catalog all variables.

---

## Review checklist (for Andrew)

- [ ] Do any themes feel redundant? (I'm watching Bachelorette ↔ Birthday Trip, Beach ↔ Tropical, Reunion ↔ Boys Trip)
- [ ] Any strings that read cringe? (I've tried to avoid corporate-fun but some are subjective)
- [ ] Any occasions I missed that are frequent in the target audience? (Weddings-as-guest, baby moon, milestone anniversary)
- [ ] Any palette that reads wrong? (I haven't visually tested — that's the picker spec's job)
- [ ] Anything too on-the-nose or stereotyped? (Especially flagging Boys Trip, Wellness Retreat, and Wine Country for review)
