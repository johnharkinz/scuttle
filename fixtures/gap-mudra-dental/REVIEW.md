# Review: gap-mudra-dental

**Role:** Gap case
**URL:** https://mudradentalcare.lovable.app/

Labels were proposed by an agent and **confirmed by the human** (spec §10). Cause is filled in only for false positives.

## Run

```sh
npm run scuttle -- fixtures/gap-mudra-dental/initial.html fixtures/gap-mudra-dental/rendered.html --url https://mudradentalcare.lovable.app/
```

**Findings:** 10 links and 70 text blocks, all only after rendering. Title and meta description: no findings. The initial snapshot is an empty Lovable (Vite/React) shell.

## Misses and observations

- **Joined text:** adjacent inline elements with no whitespace between them are joined in evidence, e.g. “Mudra's Dental CarePediatric & Family”, “+91 83209 26665+91 94093 52547” and “…8:30pmSun: 10am-1pm”. Scuttle cannot see CSS, so it does not know these render on separate lines. Evidence is still readable; not a false positive.
- All five internal page links (/about, /services, /doctors, /contact and the home page) and every contact route (two phone numbers, WhatsApp, email, Instagram) exist only after rendering.

## Labels

**80 findings:** 72 useful, 8 harmless noise, 0 false positives. Useful findings are 90% of the total.

## Findings (80)

| Finding | Label | Cause | Note |
|---|---|---|---|
| Link only after rendering: https://mudradentalcare.lovable.app/ | useful | | Internal page link appears only after rendering |
| Link only after rendering: https://mudradentalcare.lovable.app/about | useful | | Internal page link appears only after rendering |
| Link only after rendering: https://mudradentalcare.lovable.app/services | useful | | Internal page link appears only after rendering |
| Link only after rendering: https://mudradentalcare.lovable.app/doctors | useful | | Internal page link appears only after rendering |
| Link only after rendering: https://mudradentalcare.lovable.app/contact | useful | | Internal page link appears only after rendering |
| Link only after rendering: tel:+918320926665 | useful | | Contact or booking route appears only after rendering |
| Link only after rendering: https://wa.me/918320926665 | useful | | Contact or booking route appears only after rendering |
| Link only after rendering: https://instagram.com/mudradentalcare | useful | | Icon-only social link |
| Link only after rendering: tel:+919409352547 | useful | | Contact or booking route appears only after rendering |
| Link only after rendering: mailto:mudrasdentalcare@gmail.com | useful | | Contact or booking route appears only after rendering |
| Text block only after rendering: “Mudra's Dental Care” (h1) | useful | | The page's only h1 |
| Text block only after rendering: “"Creating Confident Smiles with Care"” (p) | useful | |  |
| Text block only after rendering: “Experience gentle, comprehensive dental care for your entire family. From pediatric specialists to advanced implantology, we're here to make every smile shine.” (p) | useful | |  |
| Text block only after rendering: “Mon - Sat” (p) | useful | |  |
| Text block only after rendering: “10am-1pm \| 4:30pm-8:30pm” (p) | useful | |  |
| Text block only after rendering: “Call Now” (p) | harmless noise | | Button label |
| Text block only after rendering: “Comprehensive Dental Care” (h2) | useful | |  |
| Text block only after rendering: “From preventive care to advanced treatments, we provide a full range of dental services for patients of all ages.” (p) | useful | |  |
| Text block only after rendering: “Pediatric Dentistry” (h3) | useful | |  |
| Text block only after rendering: “Gentle, child-friendly dental care with specialized pediatric treatments” (p) | useful | |  |
| Text block only after rendering: “Teeth Whitening” (h3) | useful | |  |
| Text block only after rendering: “Professional bleaching for a brighter, more confident smile” (p) | useful | |  |
| Text block only after rendering: “Dental Implants” (h3) | useful | |  |
| Text block only after rendering: “Permanent tooth replacement with advanced implant technology” (p) | useful | |  |
| Text block only after rendering: “Root Canal” (h3) | useful | |  |
| Text block only after rendering: “Pain-free root canal treatment with modern techniques” (p) | useful | |  |
| Text block only after rendering: “Family Dentistry” (h3) | useful | |  |
| Text block only after rendering: “Comprehensive dental care for the whole family” (p) | useful | |  |
| Text block only after rendering: “Orthodontics” (h3) | useful | |  |
| Text block only after rendering: “Metal braces, ceramic braces, and clear aligners available” (p) | useful | |  |
| Text block only after rendering: “Dedicated Smile Studios” (h2) | useful | |  |
| Text block only after rendering: “Separate specialized spaces designed for the unique needs of children and adults.” (p) | useful | |  |
| Text block only after rendering: “Smile Studio-I” (h3) | useful | |  |
| Text block only after rendering: “Colorful, fun environment with dedicated play area. Making dental visits exciting for children!” (p) | useful | |  |
| Text block only after rendering: “Smile Studio-II” (h3) | useful | |  |
| Text block only after rendering: “State-of-the-art equipment with conscious sedation for anxiety-free treatment.” (p) | useful | |  |
| Text block only after rendering: “Expert Dental Professionals” (h2) | useful | |  |
| Text block only after rendering: “Our experienced doctors combine expertise with compassionate care.” (p) | useful | |  |
| Text block only after rendering: “Dr. Yash Shah” (h3) | useful | |  |
| Text block only after rendering: “BDS, MDS – Pediatric Dentist” (p) | useful | |  |
| Text block only after rendering: “Specialized in children's dentistry with expertise in behavior management and preventive care.” (p) | useful | |  |
| Text block only after rendering: “Dr. Mudra Shah” (h3) | useful | |  |
| Text block only after rendering: “BDS, MDS – Periodontist & Implantologist” (p) | useful | |  |
| Text block only after rendering: “Expert in gum treatments, dental implants, and advanced restorative dentistry.” (p) | useful | |  |
| Text block only after rendering: “Your Family's Smile is Our Priority” (h2) | useful | |  |
| Text block only after rendering: “At Mudra's Dental Care, we combine cutting-edge technology with compassionate care to provide the best dental experience for you and your loved ones.” (p) | useful | |  |
| Text block only after rendering: “Dedicated Pediatric Section (Smile Studio-I)” (li) | useful | |  |
| Text block only after rendering: “Adult Section (Smile Studio-II)” (li) | useful | |  |
| Text block only after rendering: “Conscious Sedation for Anxiety-Free Treatment” (li) | useful | |  |
| Text block only after rendering: “Child-Friendly Environment with Play Area” (li) | useful | |  |
| Text block only after rendering: “Advanced Digital X-Ray & Diagnostics” (li) | useful | |  |
| Text block only after rendering: “Experienced & Caring Dental Team” (li) | useful | |  |
| Text block only after rendering: “Book Your Visit” (h3) | useful | |  |
| Text block only after rendering: “Location” (h4) | useful | |  |
| Text block only after rendering: “1st Floor, FF-118 & 119, Embe Opulence,Manjalpur, Vadodara – 390011” (p) | useful | |  |
| Text block only after rendering: “Phone” (h4) | useful | |  |
| Text block only after rendering: “+91 83209 26665 \| +91 94093 52547” (p) | useful | |  |
| Text block only after rendering: “Timings” (h4) | useful | |  |
| Text block only after rendering: “Mon-Sat: 10am-1pm \| 4:30pm-8:30pmSun: 10am-1pm (By Appointment)” (p) | useful | |  |
| Text block only after rendering: “Ready for a Healthier Smile?” (h2) | useful | |  |
| Text block only after rendering: “Schedule your appointment today and experience the difference of personalized, gentle dental care.” (p) | useful | |  |
| Text block only after rendering: “Pediatric & Family” (p) | useful | |  |
| Text block only after rendering: “Creating Confident Smiles with Care. Your trusted partner for pediatric and family dentistry in Vadodara.” (p) | useful | |  |
| Text block only after rendering: “Quick Links” (h4) | harmless noise | | Footer heading for quick links |
| Text block only after rendering: “Home” (li) | harmless noise | | Footer quick-link label, duplicating the nav |
| Text block only after rendering: “About Us” (li) | harmless noise | | Footer quick-link label, duplicating the nav |
| Text block only after rendering: “Services” (li) | harmless noise | | Footer quick-link label, duplicating the nav |
| Text block only after rendering: “Our Doctors” (li) | harmless noise | | Footer quick-link label, duplicating the nav |
| Text block only after rendering: “Contact” (li) | harmless noise | | Footer quick-link label, duplicating the nav |
| Text block only after rendering: “Our Services” (h4) | useful | |  |
| Text block only after rendering: “Root Canal Treatment” (li) | useful | |  |
| Text block only after rendering: “Braces & Aligners” (li) | useful | |  |
| Text block only after rendering: “Conscious Sedation” (li) | useful | |  |
| Text block only after rendering: “Contact Us” (h4) | useful | |  |
| Text block only after rendering: “1st Floor, FF-118 & 119, Embe Opulence,Opp. Shalin Complex, Eva Mall Cross Road,Manjalpur, Vadodara – 390011” (li) | useful | |  |
| Text block only after rendering: “+91 83209 26665+91 94093 52547” (li) | useful | |  |
| Text block only after rendering: “mudrasdentalcare@gmail.com” (li) | useful | |  |
| Text block only after rendering: “Mon - Sat: 10am - 1pm \| 4:30pm - 8:30pm” (p) | useful | |  |
| Text block only after rendering: “Sunday: 10am - 1pm (By Appointment)” (p) | useful | |  |
| Text block only after rendering: “© 2026 Mudra's Dental Care. All rights reserved.” (p) | harmless noise | | Copyright line |
