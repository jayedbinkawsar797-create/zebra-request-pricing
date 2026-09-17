# Zebra Golf Cart — Request Pricing Landing Page & Lead Funnel

A high-converting, fully responsive landing page and lead capture funnel for **Zebra Golf Cart** ([zebragolfcart.com](https://zebragolfcart.com)).

Cloned from: `https://zebra-request-pricing.rabih-nachabe.chatgpt.site`

## Features

- **Responsive Hero Section**: High-resolution WebP hero banners for both desktop and mobile viewports with fast delivery.
- **Interactive Multi-Step Lead Form**:
  - Model interest selection (4-seat forward, 6-seat forward, 4+2 passenger, 8-seat shuttle)
  - Purchase timeline selector
  - Estimated budget & payment preference selectors
  - ZIP code and contact details
  - Honeypot anti-spam protection (`_honey`)
- **UTM Tracking & Attribution**:
  - Automatically captures query parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `fbclid`, and landing page URL) and attaches them to form submissions.
- **Dedicated Thank-You Confirmation Flow**:
  - `thank-you.html` page with instant click-to-call and click-to-SMS links.
- **Meta Pixel Tracking**:
  - Meta Pixel ID `452282614546759` integrated.
  - Automatic `PageView` tracking on all pages.
  - Fires `Lead` conversion event on thank-you page after successful submission.

## Tech Stack

- Clean HTML5, Modern CSS3 (Variables, Grid, Flexbox), Vanilla ES6+ JavaScript.
- Zero build step required — deployable directly to GitHub Pages, Vercel, Netlify, Cloudflare Pages, or Railway.

## Local Development

Preview the site locally with any static HTTP server:

```bash
# Using Node / npx:
npm run dev

# Or using Python:
python3 -m http.server 3000
```

Open `http://localhost:3000` in your browser.

## Deployment

Deployable as a static site to:
- **Vercel**: `vercel`
- **GitHub Pages**: Settings -> Pages -> Deploy from branch `main`
- **Netlify**: Drag and drop folder or link repository

## License

© 2026 Zebra E-Carts Corp. All rights reserved.
