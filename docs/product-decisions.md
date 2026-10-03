# KurbConnect — Product Decisions

Decisions made, why, and what would change them. Written 2026-10-02.

---

## 1. Three provider types, two products

**Decision.** Municipalities and rural haulers are served by one product. Roll-off
companies are not a third pillar; roll-off becomes a module inside Pro, later.

**Why.** Municipalities and rural haulers ask residents the same question —
"when is my pickup" — against a recurring schedule tied to an address. The only
difference is how an address resolves to a day. Roll-off has no recurring
schedule at all: deliver, sit, swap, haul off. The resident app's main screen
would have nothing to display.

**What would change it.** A rural hauler whose roll-off business is larger than
their residential business, asking for it as a condition of signing.

---

## 2. Address-first resolution, with polygons as the fallback

**Decision.** An explicit per-address assignment wins. Polygon containment is the
fallback when no assignment exists. Not the other way round.

**Why.** Rural Waste Management's actual route data settled this. Their territory
is roughly 55 × 45 miles across a dozen towns, with Monday's and Thursday's routes
interleaving through the same ground. It cannot be drawn as clean shapes, and
nobody there thinks about it that way. Their 2,486 stops already carry latitude
and longitude, so the customer list *is* the resolution table.

Exceptions are also constant in this business — the house on the corner that's
always been on Tuesday, the three places down a private drive. A polygon can't
express those. An address row can.

**Resolution order.**
1. Match the address to a `service_locations` row for that organization → use its zone
2. No row → polygon containment, as today
3. Neither → outside the service area

**What would change it.** Nothing likely. Cities will lean on polygons and rural
haulers on address lists, and this ordering serves both.

---

## 3. Evidence from the Rural Waste data

Worth keeping, because it drove the decision above.

- 2,486 stops across 15 routes — 5 days × 3 trucks
- **Every customer is on exactly one route.** 2,301 distinct accounts, 2 duplicated.
  One address, one pickup day. No biweekly, no twice-weekly, no seasonal.
- Day flags were consistent on all 2,486 rows
- 2,478 of 2,486 rows had usable coordinates — no geocoding required
- 85% of their addresses matched the TxGIO address points exactly through
  `normalize_address`, which turned out not to matter since they bring their own
  coordinates
- Three trucks run the same day in the same area, so the truck is operational
  detail; residents only need the day

Maps onto the schema as: 5 collection zones (one per weekday), 15 routes,
2,486 service locations.

---

## 4. The resident app has no accounts

**Decision.** No sign-up, no login, no password. Address in, schedule out.

**Why.** It removes the largest drop-off point in the funnel for an app someone
uses for ten seconds twice a week, and it keeps the privacy policy short and
honest — there is no account to breach.

**Cost.** Preferences live on the device and don't follow a person to a new
phone. Accepted.

---

## 5. Pro is a separate codebase

**Decision.** `kurbconnect-pro` is its own repo and deployment, sharing only the
Supabase backend.

**Why.** The resident app ships to the App Store; admin code would ride along in
a binary Apple reviews, for screens no resident can reach. Different auth models
— the resident app deliberately has none. Different release cadence: Pro iterates
constantly with a pilot customer while the resident app sits stable between store
submissions.

---

## 6. Alerts are bilingual with English fallback

**Decision.** Every alert carries optional Spanish. Missing Spanish falls back to
English rather than failing or hiding.

**Why.** Both the feed and push already honor the device's language. Fallback
means a provider is never blocked from posting urgent information because nobody
was available to translate it.

---

## 7. Delivered notifications cannot be recalled

**Decision.** Build scheduling and cancel-before-send rather than pretending
retraction is possible.

**Why.** Neither FCM nor APNs supports recalling a delivered notification. What
is possible: cancel before the send job picks it up, and remove from the feed
afterward. The UI says which of those actually happened rather than implying
something was unsent.

**Side effect.** Scheduling solves the undo problem — a scheduled alert is
cancellable for its entire wait, without imposing a delay on genuinely urgent ones.

---

## 8. Roll-off's customer-facing piece is a link, not an app

**Decision.** When roll-off is built, the customer-facing surface is a per-job
tracking page sent by text. Not an installable app.

**Why.** A contractor with one dumpster for three weeks will not install
anything, but will tap a link. The package-tracking pattern matches the shape of
the relationship — one job, short duration, then gone. It also avoids a second
app store listing, review cycle and push certificate.

---

## 9. Open questions

- **Service area boundary.** Still a hand-typed rectangle. For Rural Waste it can
  be computed from the hull of their 2,478 points. Cities will need to draw theirs,
  which is the real argument for the drawing tool.
- **Pro checks membership, not role.** Anyone in `organization_users` can post and
  retract. Needs a role check once a read-only role exists.
- **Pro schedules in the browser's timezone**, not the organization's. Correct while
  both are America/Chicago; fix before a second organization exists.
- **Per-org resolution mode.** `organization_features` exists and could carry
  polygon-first vs address-first, if a customer ever needs the override.
- **Push sends are sequential.** Fine at pilot scale; needs batching past a few
  hundred devices in one organization.
