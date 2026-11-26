# Review: gap-mens-scalp-expert

**Role:** Gap case
**URL:** https://mens-scalp-expert.lovable.app/

Labels were proposed by an agent and **confirmed by the human** (spec §10). Cause is filled in only for false positives.

## Run

```sh
npm run scuttle -- fixtures/gap-mens-scalp-expert/initial.html fixtures/gap-mens-scalp-expert/rendered.html --url https://mens-scalp-expert.lovable.app/
```

**Findings:** 15 links and 95 text blocks, all only after rendering. Title and meta description: no findings. Spec §10 expects about 15 links and 95 text blocks, so this matches exactly.

## Misses and observations

- **Header navigation labels** (Início, Serviços, Expert, Contato) are `<a href="#…">` fragment links with text outside any block, so they produce neither a link nor a text block. This is expected under the spec. The `/cursos` link in the same nav is reported.
- **"Edit with Lovable" badge:** the badge (`aside#lovable-badge` with its `lovable.dev` link) is already in the initial snapshot. Correctly, there is no finding.
- **Marquee:** its sentence repeats four times in the rendered DOM, and is reported once (“​MODERN CARE FOR MODERN MAN”), as the spec intends.
- **Zero-width space:** that block starts with U+200B, which normalisation keeps (spec §4). It causes no false positive here, because there is no counterpart in the initial snapshot.
- **Bare statistics and prices:** 12 blocks such as “10+”, “5” and “€24,99” are extracted apart from the label that gives them meaning (“Anos de Experiência”, “Especialistas”), which is a separate finding. They are labelled harmless noise because they do not make sense from the report alone. This is a known limitation of block extraction, not a false positive.
- **Facebook link:** points to the Facebook home page, not a profile. The finding is real and may expose a broken link on the site.

## Labels

**110 findings:** 91 useful, 19 harmless noise, 0 false positives. Useful findings are 83% of the total.

## Findings (110)

| Finding | Label | Cause | Note |
|---|---|---|---|
| Link only after rendering: https://mens-scalp-expert.lovable.app/cursos | useful | | The only internal page link appears only after rendering |
| Link only after rendering: https://www.fresha.com/book-now/menscalp-expert-uz07jto0/services?lid=1042419&share=true&pId=988136 | useful | | Booking route (Fresha) appears only after rendering |
| Link only after rendering: tel:+351966616502 | useful | | Phone booking route appears only after rendering |
| Link only after rendering: https://www.fresha.com/book-now/menscalp-expert-uz07jto0/services?lid=1042419&oiid=sv%3A14028687&share=true&pId=988136 | useful | | Booking route (Fresha) appears only after rendering |
| Link only after rendering: https://www.fresha.com/book-now/menscalp-expert-uz07jto0/services?lid=1042419&oiid=sv%3A14028686&share=true&pId=988136 | useful | | Booking route (Fresha) appears only after rendering |
| Link only after rendering: https://www.fresha.com/book-now/menscalp-expert-uz07jto0/services?lid=1042419&oiid=sv%3A17707714&share=true&pId=988136 | useful | | Booking route (Fresha) appears only after rendering |
| Link only after rendering: https://www.fresha.com/book-now/menscalp-expert-uz07jto0/paid-plans?id=3019900&share=true&pId=988136 | useful | | Membership plan purchase link appears only after rendering |
| Link only after rendering: https://www.fresha.com/book-now/menscalp-expert-uz07jto0/paid-plans?id=1130160&share=true&pId=988136 | useful | | Membership plan purchase link appears only after rendering |
| Link only after rendering: https://www.fresha.com/book-now/menscalp-expert-uz07jto0/paid-plans?id=3085025&share=true&pId=988136 | useful | | Membership plan purchase link appears only after rendering |
| Link only after rendering: https://maps.app.goo.gl/cr9EThBqeqwJ6eDW8?g_st=ic | useful | | Location and reviews link appears only after rendering |
| Link only after rendering: https://www.fresha.com/book-now/menscalp-expert-uz07jto0/gift-cards?share=true&pId=988136 | useful | | Gift card purchase link appears only after rendering |
| Link only after rendering: https://www.instagram.com/menscalp_expert_ | useful | | Icon-only social link appears only after rendering |
| Link only after rendering: https://www.facebook.com/?locale=pt_PT | useful | | Icon-only social link; points to the Facebook home page, not a profile |
| Link only after rendering: mailto:menscalp@gmail.com | useful | | Contact email appears only after rendering |
| Link only after rendering: https://wa.me/351966616502?text=Ola%20Preciso%20de%20suporte%20e%20gostaria%20de%20mais%20informacoes | useful | | WhatsApp support route appears only after rendering |
| Text block only after rendering: “MALE IMAGE” (h1) | useful | | The page's only h1, and it reads like placeholder text. Worth knowing either way |
| Text block only after rendering: “​MODERN CARE FOR MODERN MAN” (p) | useful | | Starts with a zero-width space (spec §10); harmless here, because no initial block competes for it |
| Text block only after rendering: “Experiência premium em cuidados masculinos e saúde capilar integrativa avançada.” (p) | useful | |  |
| Text block only after rendering: “10+” (p) | harmless noise | | Bare statistic or price; meaningful only next to its label, which is a separate finding, so it does not make sense from the report alone |
| Text block only after rendering: “Anos de Experiência” (p) | useful | |  |
| Text block only after rendering: “5K+” (p) | harmless noise | | Bare statistic or price; meaningful only next to its label, which is a separate finding, so it does not make sense from the report alone |
| Text block only after rendering: “Clientes Satisfeitos” (p) | useful | |  |
| Text block only after rendering: “5.0” (p) | harmless noise | | Bare statistic or price; meaningful only next to its label, which is a separate finding, so it does not make sense from the report alone |
| Text block only after rendering: “Avaliação Google” (p) | useful | |  |
| Text block only after rendering: “Excelência em Cada Detalhe” (h2) | useful | | Heading only after rendering |
| Text block only after rendering: “Serviços premium executados por profissionais certificados, utilizando técnicas avançadas e produtos de alta qualidade.” (p) | useful | |  |
| Text block only after rendering: “Cortes Exclusivos” (h3) | useful | | Heading only after rendering |
| Text block only after rendering: “Do clássico ao moderno, cortes precisos adaptados ao seu estilo e formato de rosto.” (p) | useful | |  |
| Text block only after rendering: “Barba & Grooming” (h3) | useful | | Heading only after rendering |
| Text block only after rendering: “Modelagem, hidratação e tratamentos especiais para uma barba impecável.” (p) | useful | |  |
| Text block only after rendering: “Skincare Masculino” (h3) | useful | | Heading only after rendering |
| Text block only after rendering: “Tratamento masculino com protocolos personalizados para manter a pele saudável.” (p) | useful | |  |
| Text block only after rendering: “Experiências Completas” (h3) | useful | | Heading only after rendering |
| Text block only after rendering: “Essencial” (h4) | useful | | Heading only after rendering |
| Text block only after rendering: “€24,99” (p) | harmless noise | | Bare statistic or price; meaningful only next to its label, which is a separate finding, so it does not make sense from the report alone |
| Text block only after rendering: “✓ Corte de Cabelo” (li) | useful | |  |
| Text block only after rendering: “✓ 2 visitas por mês” (li) | useful | |  |
| Text block only after rendering: “Premium” (h4) | useful | | Heading only after rendering |
| Text block only after rendering: “€49,99” (p) | harmless noise | | Bare statistic or price; meaningful only next to its label, which is a separate finding, so it does not make sense from the report alone |
| Text block only after rendering: “✓ Cabelo + Barba” (li) | useful | |  |
| Text block only after rendering: “✓ 5% Desconto Produtos e Bebidas” (li) | useful | |  |
| Text block only after rendering: “VIP” (h4) | useful | | Heading only after rendering |
| Text block only after rendering: “€16,99” (p) | harmless noise | | Bare statistic or price; meaningful only next to its label, which is a separate finding, so it does not make sense from the report alone |
| Text block only after rendering: “✓ Barba Clássica” (li) | useful | |  |
| Text block only after rendering: “✓ Visitas Ilimitadas” (li) | useful | |  |
| Text block only after rendering: “Sobre Nós” (h2) | useful | | Heading only after rendering |
| Text block only after rendering: “.Men's Scalp Expert nasceu da paixão por elevar a experiência masculina. Mais do que uma barbearia, somos um espaço dedicado ao cuidado integral do homem modern…” (p) | useful | |  |
| Text block only after rendering: “Tudo começou ouvindo mais do que pedidos de corte. Na cadeira, surgiam histórias de queda de cabelo, desconforto no couro cabeludo e perda de confiança.” (p) | useful | |  |
| Text block only after rendering: “Percebemos que não era só estética. Era saúde. Era autoestima.” (p) | useful | |  |
| Text block only after rendering: “Foi desse desejo genuíno de ajudar que nasceu a decisão de ir além da barbearia tradicional e estudar tricologia integrativa.” (p) | useful | |  |
| Text block only after rendering: “Hoje, unimos personalização, ciência e cuidado real. Cada cliente é único. Cada tratamento é pensado para você.” (p) | useful | |  |
| Text block only after rendering: “Aqui, não cuidamos apenas do cabelo. Cuidamos da sua história.” (p) | useful | |  |
| Text block only after rendering: “8+” (p) | harmless noise | | Bare statistic or price; meaningful only next to its label, which is a separate finding, so it does not make sense from the report alone |
| Text block only after rendering: “Anos” (p) | useful | |  |
| Text block only after rendering: “1000+” (p) | harmless noise | | Bare statistic or price; meaningful only next to its label, which is a separate finding, so it does not make sense from the report alone |
| Text block only after rendering: “Clientes” (p) | useful | |  |
| Text block only after rendering: “100%” (p) | harmless noise | | Bare statistic or price; meaningful only next to its label, which is a separate finding, so it does not make sense from the report alone |
| Text block only after rendering: “Dedicação” (p) | useful | |  |
| Text block only after rendering: “Ciência a Serviço da Saúde Capilar” (h2) | useful | | Heading only after rendering |
| Text block only after rendering: “Combinamos conhecimento avançado em tricologia com anos de experiência prática para oferecer soluções que realmente funcionam.” (p) | useful | |  |
| Text block only after rendering: “Análise Tricológica” (h3) | useful | | Heading only after rendering |
| Text block only after rendering: “Diagnóstico completo do couro cabeludo utilizando equipamentos de última geração para identificar problemas e criar soluções personalizadas.” (p) | useful | |  |
| Text block only after rendering: “Tratamentos Personalizados” (h3) | useful | | Heading only after rendering |
| Text block only after rendering: “Protocolos exclusivos desenvolvidos com base na análise individual de cada cliente, garantindo resultados efetivos e duradouros.” (p) | useful | |  |
| Text block only after rendering: “Saúde Capilar Integral” (h3) | useful | | Heading only after rendering |
| Text block only after rendering: “Abordagem holística que considera nutrição, estresse, genética e hábitos para promover a saúde completa dos fios e couro cabeludo.” (p) | useful | |  |
| Text block only after rendering: “Prevenção & Manutenção” (h3) | useful | | Heading only after rendering |
| Text block only after rendering: “Programas preventivos para manter a saúde capilar a longo prazo, com acompanhamento regular e ajustes de tratamento.” (p) | useful | |  |
| Text block only after rendering: “Produtos Recomendados” (h2) | useful | | Heading only after rendering |
| Text block only after rendering: “Seleção profissional para cuidados avançados e resultados reais.” (p) | useful | |  |
| Text block only after rendering: “Tratamento Anti-Queda” (h3) | useful | | Heading only after rendering |
| Text block only after rendering: “Fortalece o cabelo da raiz às pontas e restaura a espessura. Resultados visíveis a partir do 3º mês.” (p) | useful | |  |
| Text block only after rendering: “Kit Desparasitação” (h3) | useful | | Heading only after rendering |
| Text block only after rendering: “Produtos naturais para tratar e eliminar parasitas intestinais em adultos de forma segura e eficaz.” (p) | useful | |  |
| Text block only after rendering: “Androgenetic” (h3) | useful | | Heading only after rendering |
| Text block only after rendering: “Auxilia na redução da queda capilar, estimula o crescimento de novos fios e melhora a densidade capilar. Tratamento não invasivo, com boa tolerabilidade e mínim…” (p) | useful | |  |
| Text block only after rendering: “Porque é que o seu cabelo não responde aos tratamentos? A resposta pode estar no seu intestino” (h2) | useful | | Heading only after rendering |
| Text block only after rendering: “Descubra o protocolo clínico de limpeza biológica que prepara o seu organismo para absorver até 3x mais nutrientes — e finalmente ver resultados duradouros no s…” (p) | useful | |  |
| Text block only after rendering: “Consulta Especializada” (h3) | useful | | Heading only after rendering |
| Text block only after rendering: “Agende uma consulta com nossos especialistas em tricologia para uma avaliação completa e personalizada. Descubra as melhores soluções para a saúde do seu couro …” (p) | useful | |  |
| Text block only after rendering: “500+” (p) | harmless noise | | Bare statistic or price; meaningful only next to its label, which is a separate finding, so it does not make sense from the report alone |
| Text block only after rendering: “Tratamentos Realizados” (p) | useful | |  |
| Text block only after rendering: “95%” (p) | harmless noise | | Bare statistic or price; meaningful only next to its label, which is a separate finding, so it does not make sense from the report alone |
| Text block only after rendering: “Taxa de Satisfação” (p) | useful | |  |
| Text block only after rendering: “5” (p) | harmless noise | | Bare statistic or price; meaningful only next to its label, which is a separate finding, so it does not make sense from the report alone |
| Text block only after rendering: “Especialistas” (p) | useful | |  |
| Text block only after rendering: “O Que Dizem os Clientes” (h2) | useful | | Heading only after rendering |
| Text block only after rendering: “"Já corto o cabelo com esta empresa há algum tempo e posso dizer que não houve uma única vez que saísse insatisfeito. O Rafael é um profissional de mão cheia co…” (p) | useful | |  |
| Text block only after rendering: “"Sempre levo meu filho para cortar o cabelo e temos uma experiência muito boa."” (p) | useful | |  |
| Text block only after rendering: “"Fiz corte de cabelo e barba, fiquei muito satisfeito com o ótimo serviço prestado, muito profissionalismo e um resultado excelente. Recomendo fortemente para q…” (p) | useful | |  |
| Text block only after rendering: “"I've been several times. I've always been delighted. I highly recommend it."” (p) | useful | |  |
| Text block only after rendering: “Onde Estamos” (h2) | useful | | Heading only after rendering |
| Text block only after rendering: “Av. da República 1485-A, 2775-275 Parede, Cascais, Portugal” (p) | useful | |  |
| Text block only after rendering: “Presente Especial” (h3) | useful | | Heading only after rendering |
| Text block only after rendering: “Surpreenda alguém com um vale-presente exclusivo” (p) | useful | |  |
| Text block only after rendering: “Especialistas em cuidado masculino e saúde capilar. Experiência premium com resultados excepcionais.” (p) | useful | |  |
| Text block only after rendering: “Links Rápidos” (h4) | harmless noise | | Footer heading for quick links |
| Text block only after rendering: “Início” (li) | harmless noise | | Footer quick-link label; its link is a same-page fragment, so only the label is reported |
| Text block only after rendering: “Serviços” (li) | harmless noise | | Footer quick-link label; its link is a same-page fragment, so only the label is reported |
| Text block only after rendering: “Cursos” (li) | harmless noise | | Footer quick-link label; its link is a same-page fragment, so only the label is reported |
| Text block only after rendering: “Expert” (li) | harmless noise | | Footer quick-link label; its link is a same-page fragment, so only the label is reported |
| Text block only after rendering: “Contato” (li) | harmless noise | | Footer quick-link label; its link is a same-page fragment, so only the label is reported |
| Text block only after rendering: “Tratamentos Capilares” (li) | useful | |  |
| Text block only after rendering: “Pacotes Premium” (li) | useful | |  |
| Text block only after rendering: “Vale-Presente” (li) | useful | |  |
| Text block only after rendering: “Av. da República 1.485 A 2775-275​Parede,Cascais,Portugal.” (li) | useful | | Contains a zero-width space |
| Text block only after rendering: “(+351) 966 616 502” (li) | useful | |  |
| Text block only after rendering: “menscalp@gmail.com” (li) | useful | |  |
| Text block only after rendering: “Seg-Sáb: 10h - 20h” (li) | useful | |  |
| Text block only after rendering: “© 2025 Men'Scalp Expert. Todos os direitos reservados.” (p) | harmless noise | | Copyright line |
