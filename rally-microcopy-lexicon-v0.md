# Rally — Microcopy Lexicon v0

*Every string in the app, written in voice. Plus the rules for when you have to write a string that isn't in this doc.*
*Andrew Shipman · April 2026*

---

## How to use this doc

This is the source of truth for every word in the Rally product. If a string isn't in here, the voice rules below are how you write it. **If a string is in here, use it verbatim — don't paraphrase.** The whole point of the lexicon is that the brand sounds like one person, not a committee.

The voice is doing as much brand work as the visuals. A perfectly designed Rally page with calendar-app copy isn't Rally. A medium-pretty page with the right strings still is.

---

## 1. The voice in one paragraph

Rally sounds like the friend in the group chat who's been to Lisbon, knows the bartender, and is texting you the only three things you actually need to know — at 11pm, in lowercase, with one emoji and a sentence fragment. Knowing but not condescending. Hyped but not cringe. Says "the vibe is immaculate" without irony. Never says "trip planner." Never sounds like a calendar app. Never asks you to "RSVP." Always uses *let's go*, *we're in*, *vamos*, *lock it*, *send it* over the corporate equivalents.

If a string in the app could plausibly appear in Google Calendar, Eventbrite, or Notion, it's wrong.

---

## 2. Voice rules (the hard rules)

These are non-negotiable. Every string must pass all six.

1. **Lowercase by default.** Titles, buttons, labels, toasts. Sentence case is fine for paragraphs. Title Case is banned everywhere except the wordmark and trip names the user typed. Caps for emphasis are allowed and encouraged ("LFG").
2. **Sentence fragments are preferred over sentences.** "5 going. 21 days out. cabin's locked." beats "There are 5 people going on this trip in 21 days and the cabin is locked."
3. **Verbs over nouns.** "let's go" beats "trip start." "lock it" beats "trip confirmation." "we're in" beats "RSVP submitted."
4. **Specific over generic.** "21 days until vino in barcelona" beats "21 days until your trip." If the trip context lets you be more specific, you must be.
5. **One step too much, never one step too tasteful.** When in doubt, the louder/weirder/more unhinged option wins. Tasteful is the failure mode.
6. **Never break the fourth wall.** Rally never refers to itself as "the app," "Rally," or "we" inside trip-context strings. The voice is the friend talking, not the brand talking *about* the friend talking.

---

## 3. The word bank

### Always say

| Use this | Instead of |
|---|---|
| we're in | RSVP submitted, attending, confirmed |
| in or out? | Are you attending? |
| lock it | Confirm, finalize, commit |
| send it | Submit, proceed, continue |
| let's go / lfg | Let's begin, Get started |
| vamos | Continue, Next |
| 21 days out | 21 days until trip |
| who's coming? | Attendee list |
| the crew | Attendees, guests, participants |
| ride or dies | Closest friends, VIPs |
| the vibe | Theme, mood, atmosphere |
| the link is live | Trip page published |
| done. share it. | Successfully created |
| oh no | Error |
| we couldn't find that | 404 |
| your move | Awaiting your action |
| 0 yes's so far | No RSVPs yet |
| just because | Casual / no-occasion trip |
| the daydream | Trip in sketch state |
| the pitch | Trip in sell state |
| locked in | Trip in lock state |
| countdown | Trip in go state |

### Never say

trip planner · attendee · participant · event · invitee · confirm attendance · save the date · RSVP (as a noun in user-facing copy — fine in code) · itinerary · agenda · schedule · planner · organizer (as a label) · host · admin · collaborator · stakeholder · please · kindly · thank you for · we appreciate · successfully · failed to · invalid · required field · submit · cancel (as a button on a destructive action — use the actual verb) · loading · processing · pending · awaiting · n/a · TBD (use "tbd" lowercase if you must) · click here · learn more · get started · join now · sign up · log in (use "let me in" instead)

### The asterisked exception

The word **"RSVP"** is allowed exactly once: in the email subject line of the invitation, because that's the word inboxes scan for. Everywhere inside the product, the verb is "we're in" and the question is "in or out?"

---

## 4. The four lifecycle voices

The same trip page sounds different in each lifecycle state. Use these as tone presets.

### Sketch (the daydream)
The trip is a maybe. The organizer is throwing options at the wall. Voice is **playful, low-stakes, dream-coded.** Lots of question marks. Short. Like a group chat that's just opened a tab.

> "lisbon? · 4 nights · august-ish · still figuring it out"
> "throwing this out there. tell me if you're even slightly into it."

### Sell (the pitch)
RSVPs are open. The organizer is rallying. Voice is **hyped, urgent, FOMO-forward.** This is the loudest state. The countdown is to the lock deadline. Every microcopy beat is pushing toward "we're in."

> "8 days to lock it in. 5 yes's. don't be the one we're missing."
> "in or out? we book the cabin friday."

### Lock (the commitment)
Enough yes's, organizer is locking the trip. Voice is **decisive, celebratory, almost ceremonial.** Short bursts. Confetti energy. The tone shifts from begging to congratulating.

> "we're going. cabin's booked. see you in 21."
> "locked in. you're on the list."

### Go (the countdown)
Trip is locked, dates are real, the countdown is the heartbeat of the page. Voice is **anticipatory, sensory, specific.** Reference the actual things — vino, the cabin hot tub, the 4am bodega slice. Make people taste the trip.

> "21 days until 4am bodega slices"
> "1 week. start packing. don't forget the speaker."

---

## 5. String inventory by surface

Every string the v1 product needs. If it's not in here and you need to write one, use the voice rules.

### 5.1 Auth

| Context | String |
|---|---|
| Login screen H1 | rally |
| Login screen subhead | how friend groups get to "let's go" |
| Login screen email field placeholder | your email |
| Login screen primary button | let me in |
| Magic link sent state | check your inbox. we just sent the door. |
| Magic link email subject | your rally door is open |
| Magic link email body | tap to let yourself in. expires in 15. |
| Magic link expired error | that link's stale. want a fresh one? |
| Magic link expired button | resend |
| First-time welcome H1 | you're in |
| First-time welcome sub | start a trip or open a link a friend sent you |

### 5.2 Dashboard (organizer's home)

The dashboard is a **game board**, not a list. Cards have countdown stamps, sell-state cards have a rally meter (progress bar), and the card needing the user's action pulses with an accent halo. Below the H1 is a scoreboard chip row that summarizes the user's whole game state in one line.

**Header**

| Context | String |
|---|---|
| Dashboard H1 (returning user) | where to next? ✈️ |
| Dashboard live-row indicator (top) | {n} trip needs your move |
| Dashboard live-row (no action needed) | all caught up |
| Empty state H1 (no trips ever) | the daydream starts here |
| Empty state body | every trip starts as a vague "we should." rally turns it into a date on the calendar. |
| Empty state CTA | start a trip 🔥 |

**Scoreboard chips (under H1)** — always lowercase, always with a count. The "your move" chip uses the `.hot` accent variant; the rest are neutral. When invitees on any trip are in *holding* state, a "holding" chip appears.

| Chip | String | Notes |
|---|---|---|
| Action required | your move {n} | hot variant, pulses |
| Active trips in any non-locked state | cooking {n} | neutral |
| Invitees on hold across all trips | holding {n} | neutral, shows when ≥1 hold exists |
| Locked trips | locked {n} | neutral |
| Past trips | done {n} | neutral |

**Sections**

| Context | String |
|---|---|
| Active trips section H | what you're cooking |
| Past trips section H | the archive |

**Trip card stamps** — replaced the v1 badges. Stamp = countdown sticker in the top-right of each card. State signals through stamp color, not label text.

| State | Stamp num | Stamp sub | Color (--bg) | Notes |
|---|---|---|---|---|
| Sketch | `?` | `soon` | light grey | no rally meter, no shadow pulse |
| Sell — normal | `{n}` | `to lock` | yellow (default sticker-bg) | rally meter visible |
| Sell — urgent (your move) | `{n}` | `to lock!` | accent (orange/red) | rally meter w/ diagonal stripes; card pulses; CTA = button-style |
| Lock | `{n}` | `days` | lime (#c4ff7a) | no rally meter |
| Go | `{n}` | `days` | yellow (default) | no rally meter |
| Done | `✓` | `done` | transparent w/ ink border | card opacity 0.75 (faded) |

**Rally meter (sell-state cards only)**

| Context | String |
|---|---|
| Meter label (left) | rallied so far |
| Meter count (right) | {n} / {target} ride or dies |
| Meter count alt (when target unset) | {n} yes · {n} maybes |

**Trip card meta lines** — short, sentence fragment, lexicon voice. Avoid repeating info that's already in the stamp (don't say "21 days out" if the stamp says "21 days"). Use the meta to add color.

| State | Meta example |
|---|---|
| Sketch | `just a sketch · still feeling it out` |
| Sell — normal | `5 yes's · 6 days to lock it · {organizer note}` |
| Sell — urgent | `{n} days to lock it · {n} maybes still on the fence` |
| Lock | `cabin's booked · {n} ride or dies · nothing to do but show up` |
| Go | `{destination summary} · {n} going · the crew is set` |
| Done | `that happened · {n} went · {n} photos in the wall` |

**Trip card actions (bottom right)**

| State | Action |
|---|---|
| Sketch | keep building → |
| Sell — normal | tap in → |
| Sell — urgent | nudge them → *(button-style, accent bg)* |
| Lock | tap in → |
| Go | tap in → |
| Done | re-live it → |

**Sticky CTA** — `start a trip 🔥`

**Notifications**

| Context | String |
|---|---|
| New yes | {name} is in. |
| Lock deadline approaching | {n} days to lock {trip}. |
| Trip locked | {trip} is locked. ride or dies confirmed. |
| Trip starts soon | {n} days to {trip}. start packing. |
| Friend dropped | {name} bailed on {trip}. |

### 5.3 Trip creation flow

This is a 5-step flow. Each step is one question, one input.

| Step | Prompt | Placeholder | Button |
|---|---|---|---|
| 1 — Name | what are we calling this? | "loose ham 2026" | next → |
| 2 — Where | where's it happening? | tulum, miami, your friend's cabin... | next → |
| 3 — When | when? | aug 14–18 (or "still tbd") | next → |
| 4 — Who | who's getting the link? | drop emails or just pick a vibe | next → |
| 5 — Vibe | pick a vibe | (theme grid) | done. send it → |
| Confirmation H1 | the daydream is live |
| Confirmation sub | here's your link. drop it in the chat. |
| Confirmation primary action | copy the link |
| Confirmation secondary action | open my page |
| Toast on copy | link copied. go forth. |

### 5.4 Trip page — shared elements (all states)

| Context | String |
|---|---|
| "trip is live" indicator | trip is live |
| Wordmark (always present) | rally! |
| Going row label | who's coming 👇 |
| Going row label (alt) | the crew |
| Lodging section H2 | the spot |
| Lodging carousel cta | scroll the listing |
| Cost section H2 | what it runs |
| Cost line item label | per person, all in |
| Cost section sublabel | flights not included. obviously. |
| Polls section H2 | quick votes |
| Activity feed H2 | what's happening |
| Activity feed empty | quiet so far. you'll be the first thing here. |
| Footer (poetic, trip page only) | rally is a doorway, not an app. close it and go pack. |
| Footer (global, every other page) | made with rally |
| Share-link trigger (anywhere there's a trip link) | copy the invite link ↗ |

**Globals — these two strings are surface-agnostic and belong in a `copy.global.ts` module:**
- `footer.made_with` → "made with rally" (every page except the live trip page, which gets the poetic footer above)
- `share_link.copy` → "copy the invite link ↗" (any CTA that copies the invite URL — builder, invitee, organizer share sheet)

### 5.5 Trip page — sketch state

| Context | String |
|---|---|
| Eyebrow sticker | just a sketch |
| Hero countdown label | tbd |
| Hero countdown number | ? |
| Tagline placeholder | "throwing this out there 🤞" |
| Sticky CTA | i'm into it |
| Sticky CTA (organizer view) | turn this into the real thing |
| RSVP-pending state copy | we're not asking yet. just feeling it out. |

### 5.6 Trip page — sell state

| Context | String |
|---|---|
| Eyebrow sticker | {organizer name} is calling |
| Hero countdown 1 (anticipation) | {n} days until {sensory thing} |
| Hero countdown 2 (commitment) | {n} days to lock it in |
| Tagline | "the vibe: {one phrase}" |
| FOMO flag on countdown | (varies by theme — see §6) |
| Sticky CTA — undecided | i'm in 🍋 (emoji varies by theme) |
| Sticky CTA — secondary | i'm a maybe |
| Sticky CTA — committed view | you're in. nice. |
| Sticky CTA — organizer view | nudge the maybes |
| Cost banner | ~${n} per person, before flights |
| Lock deadline urgency (T-3 to lock) | 3 days. don't be the missing one. |
| Lock deadline urgency (T-1) | tomorrow. it's now or december. |

### 5.7 Trip page — lock state

| Context | String |
|---|---|
| Eyebrow sticker | locked in |
| Hero countdown | {n} days until {sensory thing} |
| Tagline | "we're going 🚀" |
| Sticky CTA — committed | start packing |
| Sticky CTA — organizer | post the playlist |
| Banner | the cabin is booked. the crew is set. nothing left to do but show up. |

### 5.8 Trip page — go state (countdown is the hero)

| Context | String |
|---|---|
| Eyebrow sticker | {n} days |
| Hero countdown label (T-30) | {n} days until liftoff |
| Hero countdown label (T-14) | two weeks. start the playlist. |
| Hero countdown label (T-7) | one week. it's almost real. |
| Hero countdown label (T-3) | 3 sleeps. |
| Hero countdown label (T-1) | tomorrow. |
| Hero countdown label (T-0) | today. |
| Hero countdown label (during trip) | you're in it. |
| Hero countdown label (post-trip) | that happened. |
| Sticky CTA | the group chat is in {trip}-mode |

### 5.9 Lock flow (organizer-only)

| Context | String |
|---|---|
| Lock screen H1 | time to call it |
| Lock screen sub | {n} yes's. {n} maybes. enough? |
| Primary button | lock it in |
| Secondary button | not yet, give them another day |
| Cost confirm H1 | here's the damage |
| Cost confirm body | ${n}/person all in. you'll collect from the crew. send it? |
| Cost confirm primary | send it |
| Lock success H1 | locked. |
| Lock success body | {n} ride or dies. {n} days. let's go. |
| Lock success share prompt | share the news. |

### 5.10 RSVP states (viewer-side) — THREE-STATE

Travel isn't a birthday party. The binary *yes / no* loses the single most important state in group travel: **"i want in but i need to check a thing."** That's a third button, not a cop-out.

**The three states:**

| State | Button copy (themeable) | Chip icon (GLOBAL — do not theme) | What it means |
|---|---|---|---|
| In | i'm in {theme.rsvp_in_emoji} | 🙌 | committed. cancellation policies apply once locked. |
| Holding | hold my seat 🧗 | 🧗 | wants in, needs to confirm PTO / partner / paycheck / whatever. seat is reserved until cutoff. |
| Out | can't make it | — | not this one. no shame, no prompt, no re-ask. |

**GLOBAL LOCK (v0):** The chip icons 🙌 / 🧗 / — are locked across all themes. They appear in the pipeline strip, crew subsurface, buzz feed events, and organizer dashboard. Do NOT override per theme. Only the **button CTA text** (`rsvp.in`, `rsvp.holding`, `rsvp.out` in the theme pack — e.g. "pour me in 🍷" for Wine Country) is themeable, and those CTAs live on the viewer-side action surface only.

| Context | String |
|---|---|
| In button (default theme) | i'm in 🙌 |
| Holding button (all themes) | hold my seat 🧗 |
| Out button (default theme) | can't make it — |
| In confirmation toast | you're on the list. |
| Holding confirmation toast | seat's yours. you've got until {cutoff}. |
| Out confirmation toast | next one. |
| Already-in state | you're in. {n} days out. |
| Already-holding state | you've got a seat on hold until {cutoff}. |
| Already-out state | you said no. miss us yet? change your mind. |
| Holding → In (upgrade) button | lock it in |
| Holding → Out (downgrade) button | release the seat |
| Locked-out state (trip is full) | this one's full. the next one's yours. |
| Past cutoff, no response | the door closed. tell {organizer} to start the next one. |
| Past cutoff, was holding | your hold expired. still want in? ask {organizer}. |

**Organizer-side pipeline string:** `{n_in} in · {n_hold} holding · {n_out} out · cutoff in {days} days`

### 5.11 Empty states

| Where | String |
|---|---|
| No trips on dashboard | the daydream starts here. start a trip. |
| No yes's yet on trip page | 0 yes's so far. you'll be the first one in. |
| No photos yet | no photos yet. someone with a camera, please. |
| No polls yet | no votes happening. start one if you've got opinions. |
| No activity | quiet so far. |

### 5.12 Errors

Errors should sound like a friend who screwed up, not an enterprise SaaS apologizing. Always specific. Always with a next step.

| Where | String |
|---|---|
| Generic 500 | oh no. something broke on our end. give it a sec and try again. |
| Network down | the internet is being weird. check your signal. |
| 404 trip | we couldn't find that trip. either the link's wrong or it got deleted. |
| 403 / not invited | this one's not for you. ask the organizer for a link. |
| Auth required | log in to keep going. promise it's quick. |
| Form validation: missing required | we need this one. |
| Form validation: bad email | that doesn't look like an email. |
| Payment failed | the card got declined. try another one? |
| Save failed | didn't save. don't lose your place — try again. |

### 5.13 Toasts / confirmations

| Action | String |
|---|---|
| Trip created | done. share the link. |
| RSVP submitted (in) | you're on the list. |
| RSVP submitted (maybe) | noted. |
| RSVP submitted (out) | next one. |
| Trip locked | locked. let's go. |
| Cost paid | paid. you're set. |
| Photo uploaded | added to the wall. |
| Poll vote cast | counted. |
| Link copied | link copied. drop it in the chat. |
| Settings saved | saved. |

### 5.14 System emails (Resend)

Subject lines do most of the work — they have to survive an inbox skim. Bodies are short, max 3 lines.

| Email | Subject | Body |
|---|---|---|
| Magic link | your rally door is open | tap to let yourself in. expires in 15. |
| Trip invitation | RSVP: {organizer} is calling you to {trip} | {organizer} just dropped a rally for {trip}. {n} days out. tap the link, see the pitch, decide if you're in. |
| New yes (to organizer) | {name} is in for {trip} | {n} yes's now. {n} days to lock. you're cooking. |
| Lock deadline T-3 | 3 days to lock {trip} | {n} yes's. {n} maybes. nudge the maybes. |
| Lock deadline T-0 | last call: {trip} | today's the day. lock it or push it. |
| Trip locked (to crew) | we're going. {trip} is locked. | {n} ride or dies. {n} days. start packing. |
| T-7 hype | one week until {trip} | the vibe is approaching. start the playlist. |
| T-1 hype | tomorrow. {trip}. | tomorrow. that's it. that's the email. |
| Post-trip | how was {trip}? | drop your photos in the wall. one day everyone will be glad you did. |

### 5.15 Profile / passport page

The third surface. Identity, receipts, social proof. The passport is a trophy case, not a museum.

**Profile head:**

| Element | String / pattern |
|---|---|
| H1 (display name) | {first_name} {last_initial}. |
| Tagline field (user-editable, Caveat) | e.g. "the closer of the group chat" — max 40 chars, sentence fragment, no period |
| Tagline placeholder | what's your role in the group chat? |
| Join-date line | est {year} · {n_countries} countries deep |

**Stat strip (three big Shrikhand numbers):**

| Stat | Label | Notes |
|---|---|---|
| Trips | {n} trips | all states: Sketch counts, Go counts, Done counts |
| Ride or dies | {n} ride or dies | unique people you've traveled with on ≥1 trip |
| Countries | {n} countries deep | unique countries across Done trips |

**Section headers:**

| Section | Header | Sub |
|---|---|---|
| Passport grid | your passport | every rally, stamped |
| Ride or dies | ride or dies | the people who keep showing up |
| Empty passport | first stamp is the hardest | start a rally or wait for a friend to call you up |
| Empty ride or dies | no ride or dies yet | one trip and this fills up |

**Passport stamp card strings (per trip):**

| Element | Pattern |
|---|---|
| Place name (Shrikhand) | {place} |
| Trip name (Caveat) | {trip_name} |
| Date line | {month_short} '{yy} · {n_nights} nights |
| Crew avatars | show up to 5, +N overflow pill if more |
| Stamp state: went | (default, full color) |
| Stamp state: missed (you said no) | grayscale 60%, Caveat overlay: "you said no to this one" |

**Ride or dies leaderboard row:**

| Element | Pattern |
|---|---|
| Rank number | #{n} |
| Row label | {name} · {n_trips} trips |
| Tie copy | (if tied, sort by most recent) |

**Sticky CTA:** `start a new one 🔥`

### 5.16 Builder state (trip page when empty)

The trip page IS the builder. No wizard. These strings replace the live content when the trip is in sketch state with no fields filled.

| Element | String |
|---|---|
| Live-row | draft · only you can see this |
| Sticker | new rally ✨ |
| Eyebrow | ★ you started this |
| Title placeholder (Shrikhand, 38px) | untitled rally |
| Tagline placeholder (Caveat) | why are we doing this? |
| When field placeholder | tbd ↓ |
| Where field placeholder | somewhere ↓ |
| Title hint (handwritten, below title field) | give it a name only your group would get |
| Countdown num (empty) | ?? |
| Countdown label (empty) | days until — set a date and i'll start counting |
| Countdown flag (empty) | soon™ |
| Crew label | the crew |
| Crew helper (Caveat) | just you so far. who's in? |
| Invite button | + |
| Marquee scaffolding | tap to name · set the dates · invite the crew · send it |
| Save-draft button (icon only) | ✏️ |
| CTA — disabled | add the basics first |
| CTA — ready (after name + date + 1 invite) | send it to the group 🚀 |
| Share-link copy action | copy the invite link ↗ |
| Share-link copied toast | link copied. drop it in the chat. |
| Footer (every page) | made with rally |

**Gates to un-disable CTA:** name (≥3 chars) + at least one date (or a clear "tbd" + target month) + at least one invited person other than the organizer. Cutoff date is optional in Sketch, **required to Lock**.

**Auto-save behavior:** drafts save every edit. The ✏️ button is a manual safety net, not the primary save mechanism. Consider removing in v2 if PRD doesn't call for it.

### 5.17 Invitee state (pre-login)

The first screen a non-user sees. Login gate (not RSVP gate). Every string here is pulling dual duty: convert to a user AND communicate social obligation.

| Element | String / pattern |
|---|---|
| Inviter row | {inviter_first} called you up |
| Sticker | you're invited 💌 |
| Eyebrow | ★ for {trip_title_short} |
| Live-row (replaced by inviter row) | — |
| Going label | {n} already in (1 seat with your name) 👇 |
| Empty avatar label | you? |
| Locked section header | the plan |
| Locked section pill | 🔒 locked |
| Locked overlay message (Caveat, rotated) | sign in to see the plan ↑ |
| Primary CTA (locked state) | see the plan → |
| Secondary CTA (locked state) | can't make it |
| Pre-login "can't make it" confirmation | no worries. tell {inviter} yourself? |
| Share-link copy action (invitee can re-share) | copy the invite link ↗ |
| Footer (pre-login) | made with rally |

**Post-sign-in transition:** the locked section unblurs in place, the sticky bar swaps to the three-state RSVP (§5.10), and the page becomes the full trip page. Same chassis, new permissions.

**"Can't make it" from the locked state** should still log the no for the organizer's pipeline, but with an asterisk (`{n} declined before seeing the plan`) so they know whether a no was informed.

### 5.18 Nudge automations (cutoff + pipeline chasing)

Every trip has a cutoff. Between invite and cutoff, Rally runs an escalating nudge sequence on anyone in *holding* or *no response*. Every nudge is framed as coming from the **inviter**, not from Rally.

**Sequence (for trips with cutoff > 21 days out):**

| When | Target states | Copy (push + email subject) |
|---|---|---|
| T-14 days | no response, holding | {inviter} is still holding a seat for you on {trip}. {n_open} spots left. |
| T-7 days | no response, holding | last week to decide on {trip}. {crew_short} are booking flights. |
| T-3 days | no response, holding | 48h left on {trip}. after {day} your seat opens up. |
| T-0 (cutoff hit) | still no response | auto-flip to "can't make it." send softer final ping: we released your seat — catch the next one? |
| Post-cutoff, was holding | — | your hold on {trip} expired. still want in? ask {inviter}. |

**Sequence for shorter windows (cutoff ≤ 21 days):** compress. Drop T-14. T-7 → T-5. T-3 stays. T-0 stays.

**Organizer-side nudge controls (trip page in lock-mode):**

| Element | String |
|---|---|
| Pipeline panel header | where everyone's at |
| Pipeline line | {n_in} in · {n_hold} holding · {n_no} no response · cutoff in {n} days |
| Manual nudge button (per person) | nudge {name} |
| Manual nudge confirmation toast | sent. {name} will see it. |
| Nudge history line (per person) | last nudged {relative_time} |
| Override cutoff button | push the deadline |
| Override confirmation | cutoff moved to {new_date}. everyone still holding gets another shot. |

**Rules:**
- Nudges never come from "Rally" as a sender. Always `{inviter_first} via Rally` in email, always quote the inviter's name in push.
- Max one automated nudge per 48h per person. Manual nudges from organizer are uncapped but rate-limited to 3/week per person.
- Nudges stop the moment a person moves to *in* or *out*. Holding → holding keeps the sequence running.

### 5.19 Cutoff date (required-to-lock)

A cutoff is the deadline by which everyone must move out of *holding / no response* into either *in* or *out*. Without it, the pipeline stalls forever.

| Element | String |
|---|---|
| Cutoff field label | decide by |
| Cutoff field placeholder (Sketch) | pick a deadline (required to lock) |
| Cutoff field placeholder (Sell) | pick a deadline |
| Cutoff helper (Caveat) | after this, the door closes. pick honestly. |
| Cutoff display (on trip page) | decide by {date} · {n} days left |
| Cutoff 7 days out banner | one week to lock this in. |
| Cutoff 3 days out banner | 72h. who's coming? |
| Cutoff day-of banner | today's the day. {n_hold} still holding. |
| Cutoff passed banner (organizer) | time's up. locking with the {n_in} yes's. |
| Cutoff field in Lock flow validation error | can't lock without a cutoff date. |

**Behavior:**
- Cutoff is **optional in Sketch** (don't intimidate a freshly-started trip).
- Cutoff is **required to move from Sell → Lock**. The Lock CTA is disabled until a cutoff is set.
- Organizer can extend cutoff at any time (once). Extensions ping everyone still holding: `{organizer} pushed the deadline. you've got until {new_date}.`

---

### 5.20 Lodging voting (the card)

Voting only exists for lodging in v0. Other decisions (activities, restaurants) stay informal. The card lives on the trip page and has two states — **open** (votes coming in) and **locked** (organizer committed).

| Element | String |
|---|---|
| Card title (open) | where are we crashing? |
| Card title (locked) | where we're crashing 🗝️ |
| Card status pill (open) | voting open |
| Card status pill (locked) | locked in |
| Option name placeholder | drop a link, we'll pull the rest |
| Smart-link source pill | {domain} (with ↗) |
| Smart-link tap hint (Caveat) | see it → |
| Tally caption | {n} votes |
| Tally caption (zero) | no votes yet |
| Voters label (Caveat) | {name1}, {name2} + {n} more |
| Vote CTA | tap to vote |
| Vote CTA (voted) | your pick ✓ |
| Change vote CTA | change my vote |
| Winner stamp (locked) | 🗝️ |
| Loser label (locked) | not it |
| Organizer lock CTA | lock the winner |
| Organizer lock CTA disabled tooltip | needs at least 2 votes |
| Add option CTA | add another option |
| Empty state (no options) | drop the first airbnb link. we'll pull the photos, price, everything. |
| Toast after vote | vote in. {winner_so_far} is leading. |
| Toast after lock | locked. {winner} it is. |

**Behavior:**
- Images are smart-link images — the whole image is tappable and opens the original listing URL.
- Losers stay visible after lock (greyscale + strikethrough) so there's no confusion about what was considered.
- Voting is open to everyone who's **in**. Holdings and outs can see the card but can't vote.
- Organizer can lock at any time — the "winner" is whoever has the most votes at that moment. Ties default to earliest-added option and show a `tie — organizer picks` hint.

---

### 5.21 Extras (the drawer)

Extras are the stuff that doesn't fit anywhere else: packing list, playlist, house rules, shared album. They live in a drawer accessible from the trip page. Each extra is a card with its own mini-UX, but they share the same header pattern and empty-state voice.

| Element | String |
|---|---|
| Drawer title | the extras |
| Drawer subtitle (Caveat) | the small stuff that makes it |
| Add extra CTA (empty drawer) | add something |
| Add extra CTA (populated) | + one more |
| Chooser sheet title | pick one to add |
| Chooser: packing list | packing list · what to bring |
| Chooser: playlist | playlist · the soundtrack |
| Chooser: house rules | house rules · the vibe |
| Chooser: shared album | shared album · link to photos |
| Packing list — empty | nothing on the list yet. what can't anyone forget? |
| Packing list — add placeholder | what to bring... |
| Packing list — item checked (Caveat) | got it |
| Playlist card title | the soundtrack |
| Playlist card — empty | drop a spotify or apple music link |
| Playlist card — open CTA | open in spotify → |
| Playlist card — tracks meta | {n} tracks · by {name} |
| House rules card title | the vibe |
| House rules — empty | any ground rules? (quiet hours, cleanup, etc.) |
| House rules — bullet prefix | · |
| Shared album card title | the album |
| Shared album — empty | paste an apple or google photos link |
| Shared album — populated CTA | open the album ↗ |
| Shared album — meta | {host_name} · {n} photos so far |
| Extras empty state (drawer) | nothing here yet. add the first thing. |
| Card menu: edit | edit |
| Card menu: remove | remove |
| Toast after add | added {extra_name} to extras |

**Behavior:**
- Shared album is **link-only**. Rally does not host media. It's a pass-through to the group's Apple/Google Photos album.
- Anyone on the trip (in, holding, out) can view extras. Only organizer and in members can add/edit.
- Drawer opens as a bottom sheet. Cards stack vertically. Reorder is deferred to v1.

---

### 5.22 Theme variable interpolation catalog

Themed strings are templates with `{variable}` placeholders. This section enumerates every variable the theme content system (`rally-theme-content-system.md`) uses, where it comes from, and how to resolve it. **If a new variable appears in a theme pack, add it here first.**

| Variable | Type | Source | Required? | Example |
|---|---|---|---|---|
| `{trip_name}` | string | organizer-supplied, trip creation | required | "Park City Pow" |
| `{place}` | string | organizer-supplied location field | required | "Park City" |
| `{city}` | string | organizer-supplied, city-themed trips | theme-conditional | "Lisbon" |
| `{region}` | string | organizer-supplied, region-themed trips | theme-conditional | "Sonoma" |
| `{mountain}` | string | organizer-supplied, ski-themed trips | theme-conditional | "Alta" |
| `{lake}` | string | organizer-supplied, lake-themed trips | theme-conditional | "Tahoe" |
| `{park}` | string | organizer-supplied, festival/camping | theme-conditional | "Golden Gate Park" |
| `{island}` | string | organizer-supplied, beach/tropical | theme-conditional | "Vieques" |
| `{festival}` | string | organizer-supplied, festival theme | theme-conditional | "Outside Lands" |
| `{year}` | number | organizer-supplied or current year | required | 2026 |
| `{month}` | string | derived from trip start date | required | "july" |
| `{name}` | string | user display name (first) | context-dependent | "Andrew" |
| `{partner}` | string | organizer-supplied, couples/bach | theme-conditional | "Sam" |
| `{age}` | number | organizer-supplied, birthday/bach | theme-conditional | 30 |
| `{group}` | string | organizer-supplied group label | theme-conditional | "the idiots" |
| `{n}` | number | computed (crew count, days, etc.) | required | 8 |
| `{organizer}` | string | trip host display name | required | "Andrew" |
| `{inviter_first}` | string | the person who sent this specific invite | required (invitee) | "Andrew" |
| `{trip_title_short}` | string | truncated trip name (max 20 chars) | required | "Park City Pow" |
| `{cutoff}` | date string | trip cutoff date, short format | required | "fri, feb 14" |
| `{days}` | number | days until cutoff or trip start | required | 12 |
| `{n_in}` / `{n_hold}` / `{n_out}` | number | pipeline counts | required | 8 / 3 / 2 |
| `{n_open}` | number | remaining seats | required (if cap set) | 2 |
| `{emoji}` | string | theme.rsvp_in_emoji (button only; chip is global) | theme-conditional | "🍷" |

**Resolution rules:**
- **Missing required variable** → block trip from advancing past Sketch. Show inline error in the corresponding field: "we need a {var} for this theme."
- **Missing theme-conditional variable** → fall back to the generic string without the variable. Never render `{city}` as literal text.
- **String with unresolved `{var}`** → fail loud in dev (throw), swallow + log in prod, show the unthemed fallback.
- **Theme strings are functions, not strings:** `copy.sketch.headline({ place: "Park City" })` → "Park City is happening". Enforce via types.

**Implementation note for Claude Code:** every entry in `themes/*.ts` should export its strings as `(vars: ThemeVars) => string` functions. `ThemeVars` is the union type of the variables above. If a theme references a variable not in this table, TypeScript should block the build.

---

### 5.23 Theme picker strings

The theme picker (phase 6) is the surface where the organizer chooses the vibe. Full spec in `rally-phase-6-theme-picker.html`. Copy below is the source of truth.

| Element | String |
|---|---|
| Page header (Instrument Serif) | pick the vibe |
| Subheader (Caveat) | this is the whole plan — pick what fits |
| Search placeholder | search vibes |
| Filter: all | all |
| Filter: weekends | weekends |
| Filter: big trips | big trips |
| Filter: milestones | milestones |
| Filter: chill | chill |
| Tile title (Shrikhand 26px) | {theme.name} |
| Tile tagline (Caveat 18px) | {theme.tagline} |
| Selected tile badge | picked ✓ |
| Preview header | how it'll look |
| Preview sub | your trip, this vibe |
| CTA — none picked (disabled) | pick one to keep going |
| CTA — picked | lock the vibe → |
| Change-later hint (below CTA) | you can swap it later. nothing is final. |
| Confirmation toast | vibe locked. {theme.name} it is. |
| Back link | back to the trip |

**Per-theme tile taglines** (these are the `{theme.tagline}` strings, locked for v0 — the full themed string packs live in `rally-theme-content-system.md`):

| Theme | Tile tagline |
|---|---|
| Bachelorette | her last weekend ✨ |
| Beach Trip | vamos a la playa 🌴 |
| Ski Chalet | send it ⛷️ |
| Euro Summer | ciao bella 🍋 |
| City Weekend | let's gooo 🌃 |
| Wine Country | salud 🍷 |
| Lake Weekend | dock days 🚤 |
| Birthday Trip | cake on the road 🎂 |
| Couples Trip | ride or dies 🥂 |
| Wellness Retreat | namaste lit 🧘 |
| Just Because | lfg 🔥 |
| Bach Weekend (guys) | send-off 🥃 |
| Reunion | the band's back 🎤 |
| Girls Trip | the girls 💅 |
| Boys Trip | the boys 🍻 |
| Festival | main stage 🎟️ |
| Tropical | island time 🏝️ |

**Behavior:**
- Tiles are a single colored block (no sticker, no filter tags, no meta row in v0). Background = theme primary gradient. Title = Shrikhand, tagline = Caveat.
- Search matches on theme name + tagline. Filters are OR within group.
- Picking a tile populates the live preview (right rail on desktop, sheet on mobile).
- Default theme = "Just Because" until organizer picks.

---

### 5.24 Auth / magic link

*(See `rally-phase-11-auth.html` for the full surface spec.)*

| Element | String |
|---|---|
| Landing H1 (Instrument Serif) | rally! |
| Landing sub (Caveat) | the group trip planner for people who actually go |
| Email input placeholder | your email |
| Send button | send me a link |
| Loading state | sending… |
| Sent state H1 | check your email |
| Sent state sub | we sent a link to {email}. tap it to let yourself in. |
| Resend link | didn't get it? send another |
| Resend cooldown | hang on — {n}s |
| Resend toast | sent again. |
| Error: invalid email | that doesn't look like an email. |
| Error: rate limited | too many tries. wait a minute. |
| Error: send failed | we couldn't send the link. try again? |
| Magic link expired page H1 | link's expired |
| Magic link expired sub | they only last 15 minutes. send a fresh one. |
| Magic link expired CTA | send a new one |
| Magic link invalid page H1 | that link didn't work |
| Magic link invalid sub | the link's broken or already used. grab a new one. |
| Sign-out confirm | sign out of rally? |
| Sign-out toast | signed out. |
| Email subject (magic link) | your rally door is open |
| Email body (magic link) | tap to let yourself in. expires in 15. |

**Behavior:**
- Magic link only in v0. No password, no SSO. Link expires in 15 minutes.
- Invitee flow: tapping an invite link without a session → prompts for email → sends magic link → on confirm, redirects back to the trip page (§5.17).
- Existing user: tapping an invite link with a valid session → goes straight to the trip.
- `TODO(prd): backend confirmation` — Andrew to confirm whether auth runs on Supabase, Clerk, Resend-only, or custom. Spec is provider-agnostic but Claude Code should surface this before implementing.

---

### 5.25 Crew (the guest list subsurface)

Crew is a simple expanded view of the guest list, grouped by RSVP state. Read-only in v0 — no nudges, kicks, or role changes. Anyone on the trip can open it.

| Element | String |
|---|---|
| Page title | the crew |
| Page subtitle | {n} rallied · {trip_name} |
| Back link | back to trip |
| Summary block: in | in |
| Summary block: holding | holding |
| Summary block: out | out |
| Section header: in | in |
| Section header: holding | holding |
| Section header: out | out |
| Section caption: in (default) | locked and loaded |
| Section caption: holding (default) | thinking about it |
| Section caption: out (default) | catch the next one |
| Host marker (visual) | 👑 |
| You tag | you |
| +1 sub-text | +1 · bringing {name} |
| +1 sub-text (anon) | +1 · plus guest |
| Row sub: rsvp'd | rsvp'd {when} |
| Row sub: opened | opened · hasn't rsvp'd |
| Row sub: unopened | hasn't opened the invite |
| Row sub: out reason (quoted) | "{reason}" |
| Empty state: in | nobody's rallied yet |
| Empty state: holding | everyone's decided |
| Empty state: out | nobody's out — knock on wood 🤞 |

**Behavior:**
- Section captions are themeable — per-theme overrides live in the theme content system (§rally-theme-content-system.md).
- "Out" rows stay visible but dimmed (opacity 0.55) with strikethrough on the name. Never hidden, never collapsed.
- +1s are nested as sub-text under the inviter's row, not separate rows. If the +1 has a name, it shows; otherwise "plus guest".
- Deferred: nudging, kicking, co-host promotion, last-active timestamps, contact reveal, per-person notes.

---

### 5.26 Buzz (the activity feed)

A single reverse-chron feed mixing system events (rsvps, votes, lock-ins, additions) with short chat posts. Compose at the top, newest below it. Reactions on every row. Visible to everyone on the trip.

| Element | String |
|---|---|
| Page title | the buzz |
| Page subtitle | {trip_name} · {n} rallied |
| Back link | back to trip |
| Compose placeholder (default) | what's the word? |
| Compose placeholder (ski) | what's the chair chat? |
| Compose placeholder (beach) | what's the beach gossip? |
| Compose placeholder (festival) | what set? |
| Compose placeholder (wine) | pouring thoughts? |
| Compose placeholder (city) | what'd you find? |
| Compose send button | → |
| Day divider: today | today |
| Day divider: yesterday | yesterday |
| Day divider: older | {weekday} · {date} |
| Event: rsvp in | {name} is in |
| Event: rsvp holding | {name} is holding |
| Event: rsvp out | {name} is out |
| Event: plus one added | {name} added a +1 |
| Event: vote cast | {name} voted |
| Event: vote detail | for {option_name} |
| Event: lodging locked | {host} locked the lodging |
| Event: lodging lock detail | winner: {winner} · {meta} |
| Event: activity added | {name} added an activity |
| Event: extra added | {name} added to {extra_type} |
| Event: theme changed | {host} set the vibe |
| Event: phase → lock | trip is locked in — countdown is real now |
| Event: phase → go | countdown is on. {n} days. |
| Event: trip created | {host} started the rally |
| Event: cutoff passed | time's up. locked with {n_in} yes's. |
| Post timestamp: just now | just now |
| Post timestamp: minutes | {n}m ago |
| Post timestamp: hours | {n}h ago |
| Post timestamp: yesterday | yesterday · {time} |
| Reaction: add | + (dashed circle affordance) |
| Default reaction set | 👍 🔥 😂 ❤️ 🙌 |
| Themed reaction (ski) | 🎿 |
| Themed reaction (beach) | 🏖️ |
| Themed reaction (festival) | 🎟️ |
| Themed reaction (wine) | 🍷 |
| Empty state | nothing yet — say hi 👋 |

**Behavior:**
- Two row types: **event** (flat text, sticker-colored icon, no bubble) and **post** (chat bubble, accent color if mine, flipped to the right if mine).
- Chat is intentionally short. iMessage is still where the group's real back-and-forth lives. No threading, no @mentions, no media uploads in v0.
- Reactions: tap any row to react. One pill cluster per row. Default set is themeable — each theme can add one signature reaction.
- Everyone on the trip sees the same feed regardless of RSVP state. Outs see everything; they just chose not to come.
- Events are templated server-side from the activity log. Post content is user-generated and rendered as plain text (no markdown, no links until v1).
- Deferred: threading/replies, @mentions, media, read receipts, muting, edit/delete, push notification preferences.

### 5.27 The headliner (Session 8J)

Optional, singular trip-level module that surfaces on the sketch page
when a trip is organized around a specific pre-bookable premise
(festival pass, F1 race, golf tournament, yoga retreat). Theme-agnostic —
same label, shape, and iconography across every theme.

| Key | String |
|---|---|
| `headliner.eyebrow` | the headliner |
| `headliner.addLabel` | + the headliner |
| `headliner.addHint` | for trips with a main event — festival pass, race tickets, tee times, retreat booking. |
| `headliner.drawerTitleAdd` | the headliner |
| `headliner.drawerTitleEdit` | edit the headliner |
| `headliner.linkLabel` | link |
| `headliner.linkPlaceholder` | paste a url |
| `headliner.linkHint` | optional — we'll auto-fill details from the page |
| `headliner.descriptionLabel` | description |
| `headliner.descriptionPlaceholder` | what's the headliner? |
| `headliner.costLabel` | estimated cost |
| `headliner.costUnitPerPerson` | / person |
| `headliner.costUnitTotal` | / total |
| `headliner.saveAdd` | save the headliner |
| `headliner.saveEdit` | update |
| `headliner.remove` | remove |
| `headliner.removeConfirm` | remove the headliner? |
| `headliner.removeConfirmHint` | tap remove again to confirm |
| `headliner.estimateCaption` | rough estimate |
| `headliner.pulledFrom` | pulled from {domain} · edit anytime |
| `headliner.enrichingIndicator` | pulling details… |
| `headliner.saveError` | couldn't save — try again |

**Behavior:**
- One headliner per trip, max — enforced as six nullable columns on `trips`, not a related table.
- Cost pill format: `$X,XXX / person · rough estimate` (or `/ total · rough estimate`) — uses `formatMoney` for thousands separators.
- Remove requires second-tap confirm; clears all six columns.
- Description max 80 chars.
- Enrichment reuses `/api/enrich` via the shared `enrichUrl` helper (`src/lib/enrich-url.ts`). OG strings pass through an HTML entity decoder so `&amp;`, `&#39;`, `&#8217;` etc. render as plain text.
- `saveError` renders inline above the drawer's primary action when `updateHeadliner` / `removeHeadliner` returns `{ok:false}`; cleared on any field change (Session 8K patch).

### 5.28 Activities module (Session 8K)

Sketch-phase activities collapses to a single per-person estimate field —
matches the provisions shape. Line-item/drawer/card UI is retired at
sketch; the `activities` table is retained for the sell/lock activity
mechanic in a later session.

| Key | String |
|---|---|
| `activitiesModuleLabel` | activities |
| `activitiesEstimateHint` | rough per-person budget for the stuff you book ahead |
| `activitiesEstimatePlaceholder` | $ / person |

**Behavior:**
- Stored as `trips.activities_estimate_per_person_cents` (nullable integer).
- Contributes directly per person to the sketch cost summary (no divisor math — already per-person).
- Save on blur through `setActivitiesEstimate`.
- Null state renders identically to provisions null state.

---

### 5.29 Transportation module (Session 8M)

Rebuilt from the 8I stub to match `rally-transportation-wireframe.html`.
The module captures what the crew books **together for the trip** —
rentals, charters, intra-trip flights, trains, ferries — NOT the home →
meetup leg (that lives under "getting here" above). Entry is via a
BottomDrawer with a chip-based required type picker; cards are compact,
single-line, no hero image. Enrichment runs on link paste/blur and
renders **only** inside the drawer.

All strings registered under `builderState.transport.*`.

| Key | String |
|---|---|
| `transport.moduleTitle` | transportation |
| `transport.emptyHint` | add the stuff the crew books together on the trip — rentals, charters, intra-trip flights or trains. |
| `transport.addButton` | + add transportation |
| `transport.drawerTitleAdd` | add transportation |
| `transport.drawerTitleEdit` | edit transportation |
| `transport.drawerFraming` | for what the crew books together on the trip — not how you're getting to the meetup. (the home → meetup leg lives under 'getting here.') |
| `transport.descriptionLabel` | description |
| `transport.descriptionPlaceholder` | e.g. rome → barcelona |
| `transport.typeLabel` | type |
| `transport.costLabel` | estimated cost |
| `transport.costPlaceholder` | $ |
| `transport.splitIndividual` | individual |
| `transport.splitGroup` | group split |
| `transport.splitDefaultHintPre` | split fills in once you pick a type. you can override it. |
| `transport.splitDefaultHintPost` | default for {tag} — tap to override. |
| `transport.linkLabel` | link |
| `transport.linkPlaceholder` | paste a url (optional) |
| `transport.linkHelper` | optional — we'll pull a preview in here. doesn't render on the card. |
| `transport.enrichingIndicator` | fetching preview… |
| `transport.saveAdd` | save |
| `transport.saveEdit` | save changes |
| `transport.remove` | remove |
| `transport.removeConfirm` | remove this? |
| `transport.removeConfirmHint` | tap remove again to confirm |
| `transport.saveError` | couldn't save — try again. |
| `transport.countSuffix` | lines |
| `transport.countSuffixSingular` | line |
| `transport.collapseLabel` | toggle transportation |

**Tag labels + definitions + default split** (7 tags, `transport.tagLabel.*`
and `transport.tagDefinition.*`):

| Tag | Label | Definition | Default split |
|---|---|---|---|
| `flight` | flight | intra-trip flight — rome → barcelona, small charter. not your flight to the meetup. | individual |
| `train` | train | intra-trip train ticket — amtrak, tgv. not your train in. | individual |
| `rental_car_van` | rental car/van | car, suv, van, or rv the crew drives on the trip. | group split |
| `charter_van_bus` | charter van/bus | hired van, shuttle, or bus the crew rides together. | group split |
| `charter_boat` | charter boat | boat, yacht, or fishing charter the crew takes together. | group split |
| `ferry` | ferry | scheduled ferry crossing during the trip. | individual |
| `other` | other | anything else pre-booked. pick the split that fits. | group split |

**Framing vs definition:** the drawer has two copy blocks that look
similar but serve different purposes. The **framing line** (`drawerFraming`)
sits at the top of the drawer, is always visible, and pins the boundary
between transportation (what 8M captures) and the "getting here" slot
(home leg). It uses a neutral background. The **tag definition**
(`tagDefinition.*`) appears below the chip row only after a chip is
selected, reminds the organizer what counts as that type, and uses a
yellow-tint background so it reads as a reveal, not chrome.

**Behavior:**
- Default split is applied on chip tap unless the organizer has already
  manually toggled the split; once overridden, subsequent chip changes
  do NOT re-apply the default.
- Toggle labels are UI-only — `cost_type` in the DB stays as
  `'individual'` / `'shared'`. The render layer maps `'shared'` →
  "group split."
- Enrichment preview renders inside the drawer only. If `/api/enrich`
  returns no useful fields, the preview block is hidden entirely — no
  broken-image placeholder.
- Save surfaces `transport.saveError` inline on `{ok:false}` (8J/8K
  pattern) rather than failing silently.
- Cost summary: `individual` lines contribute the full amount per
  person; `shared` lines contribute `amount / in_crew_count`.

---

### 5.30 Cost summary (Session 9O)

Eyebrow text rendered at the top-right of the cost-summary hero block.
Signals whether the current per-person estimate is still in flux
(pending viewer arrival or unlocked lodging leading vote) or stable.

| Key | String |
|---|---|
| `costBreakdown.eyebrow.firmingUp` | firming up |
| `costBreakdown.eyebrow.settled` | looking solid |

**Behavior:**
- `firmingUp` renders when any pending state exists (e.g., viewer
  arrival unset, lodging leading-vote unlocked).
- `settled` renders otherwise.
- Strings are theme-agnostic — same copy across every theme.

---

## 6. Theme microcopy library

Each theme has its own FOMO flag word, sticky CTA emoji, and signature countdown phrase. These get plugged into the templated strings above.

| Theme | FOMO flag | CTA emoji | Signature countdown |
|---|---|---|---|
| Bachelorette | i do, i do | 💍 | days until "i do" |
| Beach Trip | vamos | 🌴 | days until vino on the beach |
| Ski Chalet | send it | ⛷️ | days until first chair |
| Euro Summer | ciao bella | 🍋 | days until limoncello |
| City Weekend | let's gooo | 🌃 | days until 4am bodega slices |
| Wine Country | salud | 🍷 | days until pinot |
| Lake Weekend | send it | 🚤 | days until the dock |
| Birthday Trip | happy bday | 🎂 | days until the cake |
| Couples Trip | ride or dies | 🥂 | days until the cabin |
| Wellness Retreat | namaste lit | 🧘 | days until the silent breakfast |
| Just Because | lfg | 🔥 | days until liftoff |

When the organizer picks a theme, every templated string in §5.6–5.8 swaps the placeholder for the theme's variant. This is what makes the same chassis feel like 11 different products.

---

## 7. Voice tests

When in doubt, run the string through these. If any answer is no, rewrite.

1. Could a friend text you this verbatim without it feeling weird? **(Friend test)**
2. Is the longest word in it under 10 letters? **(Plain test)**
3. Does it use a verb? **(Verb test)**
4. Is it specific to *this* trip, not generic to *all* trips? **(Specific test)**
5. Would Eventbrite write this string? If yes, kill it. **(Eventbrite test)**
6. Read it out loud — does it sound like a person or a banner ad? **(Mouth test)**

---

## 8. Notes for Claude Code

When implementing, treat this lexicon as data, not as suggestions. Suggested approach:

- Put every string in `lib/copy.ts` as a typed object, keyed by surface and lifecycle state.
- Templated strings (with `{n}`, `{name}`, `{trip}`) are functions that take params.
- Theme-specific strings live in the theme config alongside the color palette — `themes/bachelorette.ts` exports both `palette` and `copy`.
- Never inline a user-facing string in a component. Always import from `copy.ts`.
- Sentence case enforcement is a lint rule, not a vibe — set up an ESLint plugin or codemod that flags any user-facing string starting with a capital that isn't a proper noun or the wordmark.

This makes the brand voice a *system constraint*, not a thing every PR has to remember.

---

*Status: v0. Living document. Add to it whenever you write a new string in a PR — don't let any string live in component code without first earning a slot in here.*
