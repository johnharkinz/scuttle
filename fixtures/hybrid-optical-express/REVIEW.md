# Review: hybrid-optical-express

**Role:** Hybrid (informational only)
**URL:** https://www.opticalexpress.co.uk/eye-tests

Labels are proposed by an agent. **The human confirms every label** (spec §10). Cause is filled in only for false positives.

## Run

```sh
npm run scuttle -- fixtures/hybrid-optical-express/initial.html fixtures/hybrid-optical-express/rendered.html --url https://www.opticalexpress.co.uk/eye-tests
```

**Findings:** 1 link and 1 text block only in initial; 12 links and 40 text blocks only after rendering. Title and meta description: no findings.

## Misses and observations

- **Cloudflare email obfuscation:** the server sends “[email protected]” linked to `/cdn-cgi/l/email-protection`, and JavaScript decodes it into `mailto:enquiries@opticalexpress.com`. That is 4 findings with one cause: crawlers that do not run JavaScript never see the address. Proposed useful, though it is a deliberate anti-spam choice.
- Everything else is the Cookiebot consent panel, including its cookie inventory. Removing it would need an exclusion list, which the spec rules out.
- **Placeholder text:** “[#IABV2SETTINGS#]” is an unfilled Cookiebot template token.

## Labels

**54 findings:** 4 useful, 50 harmless noise, 0 false positives. Useful findings are 7% of the total.

## Findings (54)

| Finding | Label | Cause | Note |
|---|---|---|---|
| Link only in initial: https://www.opticalexpress.co.uk/cdn-cgi/l/email-protection | useful (proposed) | | Email address is only readable after JavaScript decodes it (Cloudflare email obfuscation) |
| Link only after rendering: https://www.cookiebot.com/en/what-is-behind-powered-by-cookiebot/?utm_source=banner_cb&utm_medium=referral&utm_content=v2 | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Link only after rendering: https://www.cloudflare.com/privacypolicy/ | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Link only after rendering: https://business.safety.google/privacy/ | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Link only after rendering: https://stripe.com/privacy | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Link only after rendering: https://vimeo.com/privacy | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Link only after rendering: https://www.livechat.com/legal/privacy-policy/ | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Link only after rendering: https://www.livechatinc.com/legal/privacy-policy/ | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Link only after rendering: https://privacy.microsoft.com/en-us/privacystatement | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Link only after rendering: https://www.tiktok.com/legal/privacy-policy?lang=en | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Link only after rendering: https://privacy.microsoft.com/en-US/privacystatement | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Link only after rendering: https://www.cookiebot.com/ | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Link only after rendering: mailto:enquiries@opticalexpress.com | useful (proposed) | | Email address is only readable after JavaScript decodes it (Cloudflare email obfuscation) |
| Text block only in initial: “[email protected]” (li) | useful (proposed) | | Email address is only readable after JavaScript decodes it (Cloudflare email obfuscation) |
| Text block only after rendering: “Consent” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “Details” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “[#IABV2SETTINGS#]” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “Necessary 16 Necessary cookies help make a website usable by enabling basic functions like page navigation and access to secure areas of the website. The websit…” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “Cloudflare1Learn more about this providercf.turnstile.uThis cookie is used to distinguish between humans and bots. Maximum Storage Duration: PersistentType: HTM…” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “Google1Learn more about this providertest_cookieUsed to check if the user's browser supports cookies.Maximum Storage Duration: 1 dayType: HTTP Cookie” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “Some of the data collected by this provider is for the purposes of personalization and measuring advertising effectiveness. The provider may use the IP Addresse…” (p) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “Stripe3Learn more about this providermDetermines the device used to access the website. This allows the website to be formatted accordingly. Maximum Storage Dur…” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “Vimeo1Learn more about this providercf_clearanceThis cookie is used to distinguish between humans and bots. Maximum Storage Duration: 1 yearType: HTTP Cookie” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “load.ssst.opticalexpress.co.ukvimeo.com2__cf_bm [x2]This cookie is used to distinguish between humans and bots. This is beneficial for the website, in order to …” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “m.stripe.com3Learn more about this provider_abThis cookie is necessary for making credit card transactions on the website. The service is provided by Stripe.com…” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “ssst.opticalexpress.co.ukconsent.cookiebot.eu2CookieConsent [x2]Stores the user's cookie consent state for the current domainMaximum Storage Duration: 1 yearTyp…” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “www.opticalexpress.co.uk2.AspNetCore.Antiforgery.#Helps prevent Cross-Site Request Forgery (CSRF) attacks.Maximum Storage Duration: SessionType: HTTP CookieUMB_…” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “www2.opticalexpress.co.uk1PHPSESSIDPreserves user session state across page requests.Maximum Storage Duration: SessionType: HTTP Cookie” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “Preferences 4 Preference cookies enable a website to remember information that changes the way the website behaves or looks, like your preferred language or the…” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “LiveChat3Learn more about this provider__lc_cidNecessary for the functionality of the website's chat-box function. Maximum Storage Duration: 400 daysType: HTTP …” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “m.stripe.com1Learn more about this provider1This cookie is used in conjunction with the payment window - The cookie is necessary for making secure transactions …” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “Statistics 22 Statistic cookies help website owners to understand how visitors interact with websites by collecting and reporting information anonymously.” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “Livechat1Learn more about this provider_livechat_has_visitedIdentifies the visitor across devices and visits, in order to optimize the chat-box function on the …” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “Microsoft7Learn more about this providerc.gifCollects data on the user’s navigation and behavior on the website. This is used to compile statistical reports and…” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “TikTok2Learn more about this provider_tt_enable_cookie [x2]Used by the social networking service, TikTok, for tracking the use of embedded services.Maximum Stor…” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “load.ssst.opticalexpress.co.ukwww.google-analytics.com4_ga [x4]Used to send data to Google Analytics about the visitor's device and behavior. Tracks the visitor…” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “load.ssst.opticalexpress.co.ukwww.googletagmanager.com4_ga_# [x4]Used to send data to Google Analytics about the visitor's device and behavior. Tracks the visit…” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “opticalexpress.co.uk4FPAUAssigns a specific ID to the visitor. This allows the website to determine the number of specific user-visits for analysis and statisti…” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “Marketing 37 Marketing cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual use…” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “Google4Learn more about this providerads/ga-audiencesUsed by Google AdWords to re-engage visitors that are likely to convert to customers based on the visitor's…” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “Microsoft14Learn more about this provider_uetsidUsed to track visitors on multiple websites, in order to present relevant advertisement based on the visitor's p…” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “TikTok9Learn more about this providertt_appInfoUsed by the social networking service, TikTok, for tracking the use of embedded services.Maximum Storage Duration…” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “Vimeo2Learn more about this provider__cf_obPendingMaximum Storage Duration: SessionType: HTTP Cookie_cfPre_tabIdPendingMaximum Storage Duration: SessionType: HT…” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “load.ssst.opticalexpress.co.uk3_gcl_au [x2]Used to measure the efficiency of the website’s advertisement efforts, by collecting data on the conversion rate of t…” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “opticalexpress.co.uk3_dcidCollects information on user behaviour on multiple websites. This information is used in order to optimize the relevance of advertisem…” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “unpkg.com2_fbp [x2]Used by Facebook to deliver a series of advertisement products such as real time bidding from third party advertisers.Maximum Storage Duratio…” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “Unclassified 9Unclassified cookies are cookies that we are in the process of classifying, together with the providers of individual cookies.” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “Livechat3Learn more about this provider@@lc_auth_token:9367d435-c85f-4207-9d8c-7cfeb0714445PendingMaximum Storage Duration: PersistentType: HTML Local Storage@@…” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “load.ssst.opticalexpress.co.uk1gtmeecPendingMaximum Storage Duration: PersistentType: HTML Local Storage” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “opticalexpress.co.uk1oe_vidPendingMaximum Storage Duration: 400 daysType: HTTP Cookie” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “rendia.com1rendia_sessionPendingMaximum Storage Duration: 2 daysType: HTTP Cookie” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “www.opticalexpress.co.uk3oe_bucketPendingMaximum Storage Duration: 1 yearType: HTTP CookieUseCampaignIDFromSessionPendingMaximum Storage Duration: PersistentTyp…” (li) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “×” (td) | harmless noise (proposed) | | Consent panel (Cookiebot) |
| Text block only after rendering: “enquiries@opticalexpress.com” (li) | useful (proposed) | | Email address is only readable after JavaScript decodes it (Cloudflare email obfuscation) |
