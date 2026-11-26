# Review: gap-posh-barber

**Role:** Gap case
**URL:** https://poshbarber.lovable.app/

Labels are proposed by an agent. **The human confirms every label** (spec §10). Cause is filled in only for false positives.

## Run

```sh
npm run scuttle -- fixtures/gap-posh-barber/initial.html fixtures/gap-posh-barber/rendered.html --url https://poshbarber.lovable.app/
```

**Findings:** 2 links and 96 text blocks, all only after rendering. Title and meta description: no findings. The initial snapshot is an empty Lovable (Vite/React) shell.

## Misses and observations

- **Placeholder content ships:** the page includes “Sample testimonials for illustration”, “Placeholder hours — please confirm with the shop” and a “Promotion Ideas” section addressed to the business owner. They are real JS-only content, so they are labelled useful, like the v1 “MALE IMAGE” h1. Worth telling the owner either way.
- **Miss: FAQ answers.** The five FAQ questions are reported but their answers are not in the rendered DOM, presumably an accordion that renders answers only when opened. Capture did no clicking (by design).
- **Miss: contact values.** “Address”, “Phone” and “Opening Hours” headings are reported, but their values sit outside any block element (spec §3, accepted miss).
- Walk-in barber, not appointment-led. The phone and directions links are its conversion routes.

## Labels

**98 findings:** 88 useful, 10 harmless noise, 0 false positives. Useful findings are 90% of the total.

## Findings (98)

| Finding | Label | Cause | Note |
|---|---|---|---|
| Link only after rendering: tel:07927727622 | useful (proposed) | | Phone route appears only after rendering |
| Link only after rendering: https://www.google.com/maps/dir/?api=1&destination=9+Weston+Sq,+Macclesfield+SK11+8SS | useful (proposed) | | Directions link appears only after rendering |
| Text block only after rendering: “Premium Cuts, No Appointment Required” (h1) | useful (proposed) | | The page's only h1 |
| Text block only after rendering: “Macclesfield's top-rated barber shop. Walk in, get a fresh cut, and leave looking your best. It's that simple.” (p) | useful (proposed) | |  |
| Text block only after rendering: “9 Weston Sq, Macclesfield SK11 8SS” (p) | useful (proposed) | |  |
| Text block only after rendering: “About Posh Barber” (h2) | useful (proposed) | |  |
| Text block only after rendering: “Nestled in the heart of Macclesfield, Posh Barber has built a reputation for delivering premium haircuts and grooming services in a relaxed, welcoming environme…” (p) | useful (proposed) | |  |
| Text block only after rendering: “4.9 Rating” (h3) | useful (proposed) | |  |
| Text block only after rendering: “146 five-star reviews” (p) | useful (proposed) | |  |
| Text block only after rendering: “All Welcome” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Men, kids & everyone” (p) | useful (proposed) | |  |
| Text block only after rendering: “Walk-In” (h3) | useful (proposed) | |  |
| Text block only after rendering: “No appointment needed” (p) | useful (proposed) | |  |
| Text block only after rendering: “Our Services” (h2) | useful (proposed) | |  |
| Text block only after rendering: “Quality grooming at honest prices. Walk in anytime.” (p) | useful (proposed) | |  |
| Text block only after rendering: “Prices shown are estimates — confirm in-store for the latest pricing.” (p) | useful (proposed) | |  |
| Text block only after rendering: “Skin Fade” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Sharp, clean skin fades tailored to your style” (p) | useful (proposed) | |  |
| Text block only after rendering: “Classic Cut” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Timeless cuts with modern precision” (p) | useful (proposed) | |  |
| Text block only after rendering: “Beard Trim” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Shaping and grooming for a sharp beard” (p) | useful (proposed) | |  |
| Text block only after rendering: “Fade & Beard” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Complete grooming — fresh fade plus beard trim” (p) | useful (proposed) | |  |
| Text block only after rendering: “Kids Cut” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Stylish cuts for the little ones (under 12)” (p) | useful (proposed) | |  |
| Text block only after rendering: “Hot Towel Shave” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Traditional wet shave with hot towel treatment” (p) | useful (proposed) | |  |
| Text block only after rendering: “Hair Wash & Style” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Wash, condition, and style to finish” (p) | useful (proposed) | |  |
| Text block only after rendering: “Eyebrow Tidy” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Quick clean-up to frame your face” (p) | useful (proposed) | |  |
| Text block only after rendering: “Our Work” (h2) | useful (proposed) | |  |
| Text block only after rendering: “Real cuts from real customers. Walk in and leave looking this sharp.” (p) | useful (proposed) | |  |
| Text block only after rendering: “Why Choose Posh Barber” (h2) | useful (proposed) | |  |
| Text block only after rendering: “Here's what makes us Macclesfield's go-to barber shop.” (p) | useful (proposed) | |  |
| Text block only after rendering: “4.9★ Rated” (h3) | useful (proposed) | |  |
| Text block only after rendering: “One of the highest-rated barbers in Macclesfield with 146 reviews.” (p) | useful (proposed) | |  |
| Text block only after rendering: “Central Location” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Easy to find on Weston Square, right in the heart of town.” (p) | useful (proposed) | |  |
| Text block only after rendering: “Walk-In Friendly” (h3) | useful (proposed) | |  |
| Text block only after rendering: “No appointments, no waiting around online. Just pop in.” (p) | useful (proposed) | |  |
| Text block only after rendering: “Quality Every Time” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Consistent, premium cuts from skilled, experienced barbers.” (p) | useful (proposed) | |  |
| Text block only after rendering: “Welcoming Vibe” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Friendly atmosphere for men, kids, and everyone in between.” (p) | useful (proposed) | |  |
| Text block only after rendering: “Trusted Locally” (h3) | useful (proposed) | |  |
| Text block only after rendering: “A neighbourhood favourite backed by years of reputation.” (p) | useful (proposed) | |  |
| Text block only after rendering: “4.9 out of 5” (h2) | useful (proposed) | |  |
| Text block only after rendering: “Based on 146 Google reviews” (p) | useful (proposed) | |  |
| Text block only after rendering: “"Best barber in Macclesfield, hands down. Always leave looking sharp. The lads are sound and the fades are clean."” (p) | useful (proposed) | |  |
| Text block only after rendering: “— James T.” (p) | harmless noise (proposed) | | Testimonial attribution; does not make sense from the report alone |
| Text block only after rendering: “"Took my son for his first proper haircut. They were brilliant with him. We'll be regulars from now on."” (p) | useful (proposed) | |  |
| Text block only after rendering: “— Mark S.” (p) | harmless noise (proposed) | | Testimonial attribution; does not make sense from the report alone |
| Text block only after rendering: “"Walk-in service is so convenient. No messing about with apps and bookings. Just turn up and get sorted."” (p) | useful (proposed) | |  |
| Text block only after rendering: “— Dan W.” (p) | harmless noise (proposed) | | Testimonial attribution; does not make sense from the report alone |
| Text block only after rendering: “"Been coming here for months now. Consistent quality every time. The beard trim is top notch."” (p) | useful (proposed) | |  |
| Text block only after rendering: “— Chris P.” (p) | harmless noise (proposed) | | Testimonial attribution; does not make sense from the report alone |
| Text block only after rendering: “Sample testimonials for illustration. Real reviews available on Google.” (p) | useful (proposed) | | Placeholder or owner-facing content shipped on the live page |
| Text block only after rendering: “Walk in anytime during opening hours. First come, first served — just how a great barber should be.” (p) | useful (proposed) | |  |
| Text block only after rendering: “Visit Us” (h2) | useful (proposed) | |  |
| Text block only after rendering: “Find us on Weston Square in Macclesfield town centre.” (p) | useful (proposed) | |  |
| Text block only after rendering: “Address” (h3) | harmless noise (proposed) | | Heading whose value is not extracted; does not make sense alone |
| Text block only after rendering: “Phone” (h3) | harmless noise (proposed) | | Heading whose value is not extracted; does not make sense alone |
| Text block only after rendering: “Opening Hours” (h3) | harmless noise (proposed) | | Heading whose value is not extracted; does not make sense alone |
| Text block only after rendering: “Placeholder hours — please confirm with the shop.” (p) | useful (proposed) | | Placeholder or owner-facing content shipped on the live page |
| Text block only after rendering: “Promotion Ideas” (h2) | useful (proposed) | | Placeholder or owner-facing content shipped on the live page |
| Text block only after rendering: “Strategies to grow your customer base and keep regulars coming back.” (p) | useful (proposed) | | Placeholder or owner-facing content shipped on the live page |
| Text block only after rendering: “For the business owner — update with your live promotions.” (p) | useful (proposed) | | Placeholder or owner-facing content shipped on the live page |
| Text block only after rendering: “Loyalty Cards” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Reward regulars — e.g. every 10th cut free.” (p) | useful (proposed) | |  |
| Text block only after rendering: “Referral Offers” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Give a discount when a customer brings a mate.” (p) | useful (proposed) | |  |
| Text block only after rendering: “Student Deals” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Discounted cuts for students with valid ID.” (p) | useful (proposed) | |  |
| Text block only after rendering: “Seasonal Promos” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Back-to-school, Christmas, summer specials.” (p) | useful (proposed) | |  |
| Text block only after rendering: “Local Flyer Drops” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Targeted flyers in nearby neighbourhoods.” (p) | useful (proposed) | |  |
| Text block only after rendering: “Google Business Updates” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Post offers and photos to your Google profile.” (p) | useful (proposed) | |  |
| Text block only after rendering: “Before & After Content” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Share transformation photos on social media.” (p) | useful (proposed) | |  |
| Text block only after rendering: “Local Partnerships” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Cross-promote with nearby cafés and shops.” (p) | useful (proposed) | |  |
| Text block only after rendering: “Frequently Asked Questions” (h2) | useful (proposed) | |  |
| Text block only after rendering: “Do I need to book an appointment?” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Where are you located?” (h3) | useful (proposed) | |  |
| Text block only after rendering: “What services do you offer?” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Do you accept kids?” (h3) | useful (proposed) | |  |
| Text block only after rendering: “How can I contact you?” (h3) | useful (proposed) | |  |
| Text block only after rendering: “Get in Touch” (h2) | useful (proposed) | |  |
| Text block only after rendering: “Got a question? Drop us a message below. For haircuts, just walk in — no booking needed!” (p) | useful (proposed) | |  |
| Text block only after rendering: “This form is for general enquiries only — not appointment requests.” (p) | useful (proposed) | |  |
| Text block only after rendering: “Macclesfield's premium walk-in barber shop. Quality cuts, no appointment required.” (p) | useful (proposed) | |  |
| Text block only after rendering: “Contact” (h3) | harmless noise (proposed) | | Footer heading |
| Text block only after rendering: “Quick Links” (h3) | harmless noise (proposed) | | Footer heading |
| Text block only after rendering: “© 2026 Posh Barber. All rights reserved.” (p) | harmless noise (proposed) | | Copyright line |
