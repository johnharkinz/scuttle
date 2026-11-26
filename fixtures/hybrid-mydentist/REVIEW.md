# Review: hybrid-mydentist

**Role:** Hybrid (informational only)
**URL:** https://www.mydentist.co.uk/

Labels are proposed by an agent. **The human confirms every label** (spec §10). Cause is filled in only for false positives.

## Run

```sh
npm run scuttle -- fixtures/hybrid-mydentist/initial.html fixtures/hybrid-mydentist/rendered.html --url https://www.mydentist.co.uk/
```

**Findings:** 1 link and 17 text blocks only after rendering, 1 text block only in initial. Title and meta description: no findings.

## Misses and observations

- **SEO links injected by JavaScript:** an “Also of Interest” block (`be-` classes, which look like BrightEdge's related-links widget) adds three footer items only after rendering. Their URLs already appear elsewhere in the initial snapshot, so only the text blocks are findings. The block's “Also of Interest” label is a `div`, not a block element, so it is a miss.
- **Consent button rename:** OneTrust rewrites the footer button “Cookie Settings” to “Cookie Preferences”, which shows as one block in each direction.

## Labels

**19 findings:** 16 harmless noise, 3 useful, 0 false positives. Useful findings are 16% of the total.

## Findings (19)

| Finding | Label | Cause | Note |
|---|---|---|---|
| Link only after rendering: https://www.onetrust.com/solutions/consent-and-preferences/ | harmless noise (proposed) | | Consent panel (OneTrust) |
| Text block only in initial: “Cookie Settings” (li) | harmless noise (proposed) | | Consent button label, rewritten by OneTrust |
| Text block only after rendering: “Local Dentists in United Kingdom” (li) | useful (proposed) | | “Also of Interest” related link injected by JavaScript |
| Text block only after rendering: “NHS Treatments and Costs in United Kingdom” (li) | useful (proposed) | | “Also of Interest” related link injected by JavaScript |
| Text block only after rendering: “Invisalign braces” (li) | useful (proposed) | | “Also of Interest” related link injected by JavaScript |
| Text block only after rendering: “Cookie Preferences” (li) | harmless noise (proposed) | | Consent button label, rewritten by OneTrust |
| Text block only after rendering: “Our site uses cookies to give you the best experience” (h2) | harmless noise (proposed) | | Consent panel (OneTrust) |
| Text block only after rendering: “Cookie Preference Centre” (h2) | harmless noise (proposed) | | Consent panel (OneTrust) |
| Text block only after rendering: “Manage Consent Preferences” (h3) | harmless noise (proposed) | | Consent panel (OneTrust) |
| Text block only after rendering: “Strictly Necessary Cookies” (h4) | harmless noise (proposed) | | Consent panel (OneTrust) |
| Text block only after rendering: “These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you …” (p) | harmless noise (proposed) | | Consent panel (OneTrust) |
| Text block only after rendering: “Performance Cookies” (h4) | harmless noise (proposed) | | Consent panel (OneTrust) |
| Text block only after rendering: “These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the m…” (p) | harmless noise (proposed) | | Consent panel (OneTrust) |
| Text block only after rendering: “Functional Cookies” (h4) | harmless noise (proposed) | | Consent panel (OneTrust) |
| Text block only after rendering: “These cookies enable the website to provide enhanced functionality and personalisation. They may be set by us or by third party providers whose services we have…” (p) | harmless noise (proposed) | | Consent panel (OneTrust) |
| Text block only after rendering: “Targeting Cookies” (h4) | harmless noise (proposed) | | Consent panel (OneTrust) |
| Text block only after rendering: “These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you rel…” (p) | harmless noise (proposed) | | Consent panel (OneTrust) |
| Text block only after rendering: “Cookie List” (h3) | harmless noise (proposed) | | Consent panel (OneTrust) |
| Text block only after rendering: “checkbox label label” (li) | harmless noise (proposed) | | Consent panel (OneTrust) |
