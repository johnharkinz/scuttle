# Review: gap-dentrw

**Role:** Gap case
**URL:** https://dentrw.vercel.app/

Labels were proposed by an agent and **confirmed by the human** (spec §10). Cause is filled in only for false positives.

## Run

```sh
npm run scuttle -- fixtures/gap-dentrw/initial.html fixtures/gap-dentrw/rendered.html --url https://dentrw.vercel.app/
```

**Findings:** 3 links and 89 text blocks, all only after rendering. Title and meta description: no findings. The initial snapshot is an empty React shell on Vercel (not Lovable).

## Misses and observations

- **Placeholder links:** 19 anchor texts (“Learn more”, the footer service links, “Facebook”, “Twitter”…) all point at the home page, so they collapse into one link finding. The site uses `/` as a placeholder href. The finding is correct; the anchor-text list makes the cause visible.
- **Nav links:** the nav labels (Home, Services, Insurance, Team, Book Now) appear as text blocks but not as links, so their hrefs are fragment-only or not `<a href>` at all.
- **Joined text:** “Meet yourDentist” and “enfr” (an EN/FR language switcher) are adjacent elements joined without whitespace.
- Demo or student project (GitHub hbapte/dentrw-alx). Judge “useful” as if you were the owner.

## Labels

**92 findings:** 62 useful, 30 harmless noise, 0 false positives. Useful findings are 67% of the total.

## Findings (92)

| Finding | Label | Cause | Note |
|---|---|---|---|
| Link only after rendering: https://dentrw.hbapte.com/ | useful | | “Explore now” link to a separate DentRW site appears only after rendering |
| Link only after rendering: https://dentrw.vercel.app/ | useful | | Home-page link; 19 placeholder anchors share this URL |
| Link only after rendering: https://hbapte.com/ | harmless noise | | Developer credit in footer |
| Text block only after rendering: “Home” (li) | harmless noise | | Nav label |
| Text block only after rendering: “Services” (li) | harmless noise | | Nav label |
| Text block only after rendering: “Insurance” (li) | harmless noise | | Nav label |
| Text block only after rendering: “Team” (li) | harmless noise | | Nav label |
| Text block only after rendering: “Book Now” (li) | harmless noise | | Nav label |
| Text block only after rendering: “enfr” (li) | harmless noise | | Language switcher (EN/FR), joined |
| Text block only after rendering: “Meet yourDentist” (h2) | useful | |  |
| Text block only after rendering: “Harmonizing Oral health and creating beautiful smiles. Bringing confidence and wellness to your life through modern dental care!” (p) | useful | |  |
| Text block only after rendering: “We are dedicated to providing comprehensive, quality dental care” (p) | useful | |  |
| Text block only after rendering: “Leading dental clinic in Kigali, Rwanda” (p) | useful | |  |
| Text block only after rendering: “The Suite of dental Services we offers” (h2) | useful | |  |
| Text block only after rendering: “DentRw provide a comprehensive suite of dental services including General, Cosmetic, Restorative, Pediatric and Emergency Dentistry.” (p) | useful | |  |
| Text block only after rendering: “Cleaning & Teeth whitening” (h3) | useful | |  |
| Text block only after rendering: “X-ray” (h3) | useful | |  |
| Text block only after rendering: “Orthodontic Treatment” (h3) | useful | |  |
| Text block only after rendering: “Dental Bridge” (h3) | useful | |  |
| Text block only after rendering: “Toothache relief” (h3) | useful | |  |
| Text block only after rendering: “Extraction” (h3) | useful | |  |
| Text block only after rendering: “Root Canal Treatment” (h3) | useful | |  |
| Text block only after rendering: “Check-ups and Consultation” (h3) | useful | |  |
| Text block only after rendering: “We work with Insurance companies for your coverage” (h2) | useful | |  |
| Text block only after rendering: “Features” (p) | harmless noise | | Section eyebrow label |
| Text block only after rendering: “Your Comprehensive Dental Care Solution” (h2) | useful | |  |
| Text block only after rendering: “we are dedicated to delivering exceptional dental care with a focus on convenience, prevention, and effective treatments.” (p) | useful | |  |
| Text block only after rendering: “Virtual Consultation” (h6) | useful | |  |
| Text block only after rendering: “Embracing Technology for your convenience, we understand that your time is valuable, explore treatments where you are.” (p) | useful | |  |
| Text block only after rendering: “Online Booking” (h6) | useful | |  |
| Text block only after rendering: “Streamlining your dental experience. We come to believe dental care should be easily accessible everytime and hassle-free.” (p) | useful | |  |
| Text block only after rendering: “Preventive Care” (h6) | useful | |  |
| Text block only after rendering: “Foundation for Lifelong Dental Wellness. We prioritize preventive care as cornerstone of mantaining optimal oral health.” (p) | useful | |  |
| Text block only after rendering: “Physical Treatment” (h6) | useful | |  |
| Text block only after rendering: “Whether your require cosmetic, restorative, pediatric, orthodontic procedures and more. Our team awaits you.” (p) | useful | |  |
| Text block only after rendering: “Meet Our Expert Team” (h2) | useful | |  |
| Text block only after rendering: “Our dedicated team of dental professionals is committed to providing you with the best dental care possible. Each member of our team is highly skilled and exper…” (p) | useful | |  |
| Text block only after rendering: “GATEME Gaby” (h3) | useful | |  |
| Text block only after rendering: “MAHORO Eunice” (h3) | useful | |  |
| Text block only after rendering: “IBAKA M. Theodat” (h3) | useful | |  |
| Text block only after rendering: “DUKUNDE Arriana” (h3) | useful | |  |
| Text block only after rendering: “Testimonials” (p) | harmless noise | | Section eyebrow label |
| Text block only after rendering: “Read reviews from Our Patients” (h2) | useful | |  |
| Text block only after rendering: “UWIMBABAZI Providence” (h5) | harmless noise | | Testimonial attribution; does not make sense from the report alone |
| Text block only after rendering: “Manager - BPR Rwanda” (p) | harmless noise | | Testimonial attribution; does not make sense from the report alone |
| Text block only after rendering: “I had an outstanding experience at Dentrw dental clinic. Their staff is very friendly and their facilities are state-of-the-art. They took great care of me, the…” (p) | useful | |  |
| Text block only after rendering: “RUSHATI Emmanuel” (h5) | harmless noise | | Testimonial attribution; does not make sense from the report alone |
| Text block only after rendering: “Driver” (p) | harmless noise | | Testimonial attribution; does not make sense from the report alone |
| Text block only after rendering: “I've been a patient of DentRw dental clinic for several years and I highly recommend them to everyone looking for a reliable and professional dental service. Th…” (p) | useful | |  |
| Text block only after rendering: “Chance Divine” (h5) | harmless noise | | Testimonial attribution; does not make sense from the report alone |
| Text block only after rendering: “Engineer” (p) | harmless noise | | Testimonial attribution; does not make sense from the report alone |
| Text block only after rendering: “I recently had a dental emergency and DentRw dental clinic came to my rescue. I was impressed by their efficient service and the quality of their work in such s…” (p) | useful | |  |
| Text block only after rendering: “TUMUKUNDE Candide” (h5) | harmless noise | | Testimonial attribution; does not make sense from the report alone |
| Text block only after rendering: “CTO - Kasha” (p) | harmless noise | | Testimonial attribution; does not make sense from the report alone |
| Text block only after rendering: “I had an outstanding experience at Dentrw dental cinic. Their staff is very friendly and their facilities are state-of-the-art. They took great care of me, the …” (p) | useful | |  |
| Text block only after rendering: “NDIKUMANA M. Olivier” (h5) | harmless noise | | Testimonial attribution; does not make sense from the report alone |
| Text block only after rendering: “Businessman” (p) | harmless noise | | Testimonial attribution; does not make sense from the report alone |
| Text block only after rendering: “UMWASE Castro Samuel” (h5) | harmless noise | | Testimonial attribution; does not make sense from the report alone |
| Text block only after rendering: “UR Student” (p) | harmless noise | | Testimonial attribution; does not make sense from the report alone |
| Text block only after rendering: “If you're looking for exceptional dental care, look no further than DentRw. The staff was attentive and the treatment I received was outstanding. They made me f…” (p) | useful | |  |
| Text block only after rendering: “Frequently Asked Questions” (h2) | useful | |  |
| Text block only after rendering: “DentRw offers a wide range of dental services, including preventative care, virtual consultation, cleanings, fillings, root canals, extractions and more. Our Ex…” (p) | useful | |  |
| Text block only after rendering: “It's important to note that tooth bud extraction can have serious and detrimental effects on oral health. The tooth buds are the immature teeth that are still d…” (p) | useful | |  |
| Text block only after rendering: “Some potential effects of tooth bud extraction include: Misalignment of Teeth, Impacted Teeth, Bite Problems ,Psychological Impact. It's essential to prioritize…” (p) | useful | |  |
| Text block only after rendering: “To schedule appointment at DentRw simpy fill below form and submit.” (p) | useful | |  |
| Text block only after rendering: “Besides our online booking system, you can also give us a call. We offer flexible scheduling options to ensure that you can receive the care you need at a time …” (p) | useful | |  |
| Text block only after rendering: “Contact” (p) | harmless noise | | Section eyebrow label |
| Text block only after rendering: “Get In Touch” (h3) | useful | |  |
| Text block only after rendering: “Book an appointment with our doctors, Our team is ready and waiting to serve you.” (p) | useful | |  |
| Text block only after rendering: “Clinic Hours” (p) | useful | |  |
| Text block only after rendering: “Monday - Friday: 06:00 - 17:00” (p) | useful | |  |
| Text block only after rendering: “Saturday: 10:00 - 16:00” (p) | useful | |  |
| Text block only after rendering: “Sunday : Closed” (p) | useful | |  |
| Text block only after rendering: “+250727108418” (p) | useful | |  |
| Text block only after rendering: “ijbapte@gmail.com” (p) | useful | |  |
| Text block only after rendering: “KG 14 Ave - Remera, Rwanda” (p) | useful | |  |
| Text block only after rendering: “Subscribe to our newsletter!” (h2) | useful | |  |
| Text block only after rendering: “Subscribe and be the first to know about the latest oral health tips, special offers, events, and discounts in your inbox.” (p) | useful | |  |
| Text block only after rendering: “X-rays” (li) | useful | | Footer service name |
| Text block only after rendering: “Filling” (li) | useful | | Footer service name |
| Text block only after rendering: “Implants” (li) | useful | | Footer service name |
| Text block only after rendering: “Cleaning” (li) | useful | | Footer service name |
| Text block only after rendering: “Restoration” (li) | useful | | Footer service name |
| Text block only after rendering: “Consultation” (li) | useful | | Footer service name |
| Text block only after rendering: “COMPANY” (h3) | harmless noise | | Footer link label |
| Text block only after rendering: “Privacy” (li) | harmless noise | | Footer link label |
| Text block only after rendering: “About us” (li) | harmless noise | | Footer link label |
| Text block only after rendering: “Terms & Conditions” (li) | harmless noise | | Footer link label |
| Text block only after rendering: “HELP DESK” (h3) | harmless noise | | Footer link label |
| Text block only after rendering: “FAQS” (li) | harmless noise | | Footer link label |
| Text block only after rendering: “Pricing” (li) | harmless noise | | Footer link label |
| Text block only after rendering: “Booking” (li) | harmless noise | | Footer link label |
