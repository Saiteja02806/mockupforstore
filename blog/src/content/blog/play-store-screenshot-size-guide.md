---
title: "Play Store Screenshot Size Guide"
description: "Portrait and landscape dimensions, Google Play screenshot requirements, tablet tracks, export presets, rejection pitfalls, and a pre-upload checklist—so assets stay sharp in listing, search, and discovery placements."
pubDate: 2026-04-28
updatedDate: 2026-04-28
category: Play Store
featured: true
ctaFrame: dynamic-island-camera
readingTime: 16 min read
canonical: "https://www.mockupeditor.site/blog/play-store-screenshot-size-guide/"
keywords:
  - Play Store screenshot sizes
  - Google Play screenshot requirements
  - Android screenshot dimensions
---

## Why size matters on Google Play

Screenshot dimensions affect how your listing renders on the store, in **search**, and in **homepage-style placements**—not only on your detail page. Undersized images look soft; wrong aspect ratios may be letterboxed or cropped unpredictably.

**Treat your screenshot as a discovery asset:** many users first see a tiny preview next to your icon and title. If the headline or UI is unreadable at that scale, you lose the click before anyone opens the full gallery.

Always verify **current** minimums in [Google Play Console Help](https://support.google.com/googleplay/android-developer/) before a major launch; this article is practical guidance, not a legal spec sheet.

For tooling, use the [Play Store screenshot editor](/play-store-screenshot-editor/) and the workflow article [how to create Play Store screenshots](/blog/how-to-create-play-store-screenshots/).

## Google Play screenshot requirements (summary table)

Exact numbers change—confirm in Console. Typical expectations as of this writing:

| Track | Role | Notes |
|-------|------|--------|
| Phone | Default consumer story | Portrait most common; min short-edge often **1080px** class |
| Tablet | Large-screen story | Separate compositions—not stretched phones |
| Wear / TV (if used) | Specialized | Follow device-specific help articles |

For a policy-aligned overview, see [Google Play screenshot requirements](/blog/google-play-screenshot-requirements/) on our blog.

## Phone screenshot dimensions

- **Portrait 9:16 class** is the workhorse for consumer Android listings.  
- Design with **safe margins** for status bars, notches, and store overlays.  
- Export **PNG or JPEG** at high enough quality that text remains crisp—avoid extreme JPEG artifacts on typography.  

Pair sizes with capture hygiene: [best device frame sizes for Google Play](/blog/best-device-frame-sizes-for-google-play-2025/).

## Tablet screenshot dimensions

- Use **native tablet captures** or recomposed layouts with more horizontal space.  
- Headlines that fit phones may **overflow** on tablets if you blindly scale—re-linebreak per locale.  
- If you do not ship a tablet experience, reconsider whether tablet assets should promise features that feel phone-only.  

## Landscape screenshot examples

Games and media apps often lead with **landscape** hero shots. Rules still apply: one idea per frame, readable text at thumbnail size, honest UI. If you mix portrait and landscape in one listing, keep **one visual system** (typography, frame, background language) so the set still feels cohesive.

## Export presets for Mockup Studio

1. Decide which **tracks** you are shipping (phone first, then tablet).  
2. Note the **minimum short edge** and **aspect** for each track from Console.  
3. Build masters at **native or higher** resolution—never upscale from tiny emulator grabs.  
4. Export each slot from the same grid system (margins, headline band, frame choice).  

Open the [Play Store mockup editor](/play-store-mockup-editor/) when you want composite-first language; the product surface is the same browser workflow.

## Common rejection mistakes

- **Misleading UI** (features not in app, fabricated balances).  
- **Illegible promotional text** crammed into small previews.  
- **Device images** that imply unsupported hardware.  
- **Wrong aspect or undersized** assets for the slot you uploaded into.  

Cross-check [common Play Store screenshot mistakes](/blog/common-play-store-screenshot-mistakes/).

## Play Store screenshot checklist before upload

- [ ] Dimensions verified per **track** in Console today—not from a 2022 blog screenshot  
- [ ] Thumbnail test passed for **headline + primary UI**  
- [ ] Phone and tablet sets **visually consistent** where both exist  
- [ ] Localizations reviewed for **line length** and clipping  
- [ ] File format and compression balanced for **quality vs weight**  
- [ ] No policy conflicts (health, finance, contests) in the visuals  
- [ ] Story order matches onboarding **truth**  

## File format and weight

PNG preserves UI edges; JPEG can be fine at high quality. Keep sizes reasonable for slower networks—**clarity first**, then optimize.

## How to check your exports before upload

1. Open each file at **100%** and read every headline.  
2. Compare dimensions to the **current** Play Console spec sheet.  
3. View the set as a **grid**—does the story read in order (RTL where needed)?  
4. Confirm localized variants share one **layout system**.  

## FAQ

### Where do I find the official numbers?

Use Google Play Console Help under **preview assets** and screenshot requirements. Treat third-party summaries (including ours) as orientation—**Console wins**.

### Can I reuse App Store screenshots on Play?

Aspect ratios and safe areas differ. Reuse underlying UI captures, **recompose** for each store. See [Play Store vs App Store screenshots](/blog/play-store-vs-app-store-screenshots/).

### How many screenshots?

See [how many screenshots on Google Play](/blog/how-many-screenshots-should-you-add-to-google-play/) (dedicated short guide).

## Try export presets in the editor

[Mockup Studio](https://www.mockupeditor.site/) helps you compose Play-ready mockups with frames, backgrounds, and text, then export at consistent dimensions. Pair this guide with [how to create Play Store screenshots](/blog/how-to-create-play-store-screenshots/) for capture → frame → text → export → upload.
