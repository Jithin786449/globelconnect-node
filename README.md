# GlobalConnect eSIM Store (Node.js)

This repository contains a Node.js application that implements a simple e‑SIM store for **GlobalConnect**.  
It is built with Express and uses EJS templates for server‑side rendering.  
The application integrates with the **eSIM Access** partner API to fetch data package plans and to provision e‑SIMs on behalf of customers.  

Features include:

* **Responsive landing page** with hero section, features overview and call‑to‑action.
* **Plans page** that pulls available e‑SIM data packages from the eSIM Access API and displays them with pricing, data allowance and validity.
* **Plan detail pages** (optional) to show more information about a single plan.
* **How it works** page that explains the activation process for customers.
* **Contact, Terms and Privacy** pages required for payment processors.
* **Checkout stub** that demonstrates how to create an order via the eSIM Access API and return a QR code/activation details to the user (actual payment integration left to the implementer).
* **CSV/plan sync** job (optional) that can periodically refresh the list of plans from a CSV source instead of the API.

## Quick start

1. Install dependencies:

```bash
cd globelconnect-node
npm install
```

2. Copy `.env.example` to `.env` and fill in your credentials.  
   You **must** rotate any previously leaked API keys and store the new values in `.env`.  
   The application reads the following variables:

   ```env
   ESIM_ACCESS_CODE=your_access_code
   ESIM_SECRET_KEY=your_secret_key
   ESIM_BASE_URL=https://api.esimaccess.com
   PORT=3000
   PLANS_CSV_URL=optional-url-to-csv
   SYNC_CRON=*/6 * * * *    # every 6 hours
   ```

3. Run the development server:

```bash
npm run dev
```

4. Navigate to `http://localhost:3000` to view the site.

## Deploying

The application is designed to run on a small VPS or managed Node.js hosting.  
Ensure that you set the environment variables in production and configure a process manager such as **pm2** or a systemd service to keep the server alive.  

For shared hosting without Node.js support, use the WordPress + WooCommerce approach described earlier.  

## Directory structure

```
globelconnect-node/
├── README.md            – This file
├── package.json         – Node.js dependencies and scripts
├── server.js            – Express server entry point
├── .env.example         – Sample environment variables
├── utils/
│   └── esimAccess.js    – Wrapper around eSIM Access API
├── routes/
│   ├── pages.js         – Route handlers for pages
│   └── api.js           – API endpoints for AJAX calls
├── views/               – EJS templates for server‑side rendering
│   ├── layout.ejs       – HTML layout template
│   ├── index.ejs        – Landing page
│   ├── plans.ejs        – List of available plans
│   ├── plan.ejs         – Details of a single plan
│   ├── how.ejs          – How it works page
│   ├── contact.ejs      – Contact page
│   ├── terms.ejs        – Terms of service
│   └── privacy.ejs      – Privacy policy
├── public/
│   └── css/style.css    – Basic styling using a clean, modern aesthetic
└── jobs/
    └── syncPlans.js     – Optional scheduled job to sync plans from CSV/API
```

## Disclaimer

This code provides a starting point and reference architecture.  
You will need to adapt it to match your exact eSIM Access API contract, pricing rules, payment gateway integration and any additional features you require.  
Do not commit your real API keys; always load them via environment variables.