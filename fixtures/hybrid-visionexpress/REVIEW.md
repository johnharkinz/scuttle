# Review: hybrid-visionexpress

**Role:** Hybrid (informational only)
**URL:** https://www.visionexpress.com/eye-test

Labels are proposed by an agent. **The human confirms every label** (spec §10). Cause is filled in only for false positives.

## Run

```sh
npm run scuttle -- fixtures/hybrid-visionexpress/initial.html fixtures/hybrid-visionexpress/rendered.html --url https://www.visionexpress.com/eye-test
```

**Findings:** 11 links and 22 text blocks, all only after rendering. Title and meta description: no findings. Spec §10 expects about 11 links and 22 text blocks (consent panel and account menu, plus "Find a store", cart and wishlist), so this matches exactly.

## Misses and observations

- None noted. The finding set is the consent panel, the account menu, empty cart and wishlist panels, and one content link (“Find a store”).

## Findings (33)

| Finding | Label | Cause | Note |
|---|---|---|---|
| Link only after rendering: https://www.visionexpress.com/wishlist | harmless noise (proposed) | | Empty wishlist panel |
| Link only after rendering: https://www.visionexpress.com/cart | harmless noise (proposed) | | Empty basket panel |
| Link only after rendering: https://www.visionexpress.com/my-account/orders | harmless noise (proposed) | | Account menu |
| Link only after rendering: https://www.visionexpress.com/my-account/appointments | harmless noise (proposed) | | Account menu |
| Link only after rendering: https://www.visionexpress.com/my-account/wishlist | harmless noise (proposed) | | Account menu |
| Link only after rendering: https://www.visionexpress.com/my-account/ccc | harmless noise (proposed) | | Account menu |
| Link only after rendering: https://www.visionexpress.com/my-account/settings | harmless noise (proposed) | | Account menu |
| Link only after rendering: https://www.visionexpress.com/my-account/login?returnPath=%2Feye-test | harmless noise (proposed) | | Account menu |
| Link only after rendering: https://www.visionexpress.com/opticians?icmp=fas | useful (proposed) | | “Find a store” link in main content appears only after rendering |
| Link only after rendering: https://www.visionexpress.com/customer-services/legal-notices/cookie-policy | harmless noise (proposed) | | Consent panel |
| Link only after rendering: https://www.onetrust.com/products/cookie-consent/ | harmless noise (proposed) | | Consent panel |
| Text block only after rendering: “My appointments” (li) | harmless noise (proposed) | | Account menu |
| Text block only after rendering: “My online orders” (li) | harmless noise (proposed) | | Account menu |
| Text block only after rendering: “My wishlist” (li) | harmless noise (proposed) | | Account menu |
| Text block only after rendering: “My contact lens subscription” (li) | harmless noise (proposed) | | Account menu |
| Text block only after rendering: “My settings” (li) | harmless noise (proposed) | | Account menu |
| Text block only after rendering: “Sign in” (li) | harmless noise (proposed) | | Account menu |
| Text block only after rendering: “Our cookies” (h2) | harmless noise (proposed) | | Consent panel |
| Text block only after rendering: “Privacy preference centre” (h2) | harmless noise (proposed) | | Consent panel |
| Text block only after rendering: “Your privacy” (h3) | harmless noise (proposed) | | Consent panel |
| Text block only after rendering: “Performance Cookies” (h3) | harmless noise (proposed) | | Consent panel |
| Text block only after rendering: “Strictly Necessary Cookies” (h3) | harmless noise (proposed) | | Consent panel |
| Text block only after rendering: “Targeting Cookies” (h3) | harmless noise (proposed) | | Consent panel |
| Text block only after rendering: “Functional Cookies” (h3) | harmless noise (proposed) | | Consent panel |
| Text block only after rendering: “When you visit any website, it may store or retrieve information on your browser, mostly in the form of cookies. This information might be about you, your prefe…” (p) | harmless noise (proposed) | | Consent panel |
| Text block only after rendering: “These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the m…” (p) | harmless noise (proposed) | | Consent panel |
| Text block only after rendering: “These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you …” (p) | harmless noise (proposed) | | Consent panel |
| Text block only after rendering: “These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you rel…” (p) | harmless noise (proposed) | | Consent panel |
| Text block only after rendering: “Switch Label label” (li) | harmless noise (proposed) | | Consent panel toggle label (placeholder text) |
| Text block only after rendering: “Social Media Cookies” (h5) | harmless noise (proposed) | | Consent panel |
| Text block only after rendering: “These cookies are set by a range of social media services that we have added to the site to enable you to share our content with your friends and networks. They…” (p) | harmless noise (proposed) | | Consent panel |
| Text block only after rendering: “These cookies enable the website to provide enhanced functionality and personalisation. They may be set by us or by third party providers whose services we have…” (p) | harmless noise (proposed) | | Consent panel |
| Text block only after rendering: “Cookie List” (h3) | harmless noise (proposed) | | Consent panel |
