import express from 'express';
import cors from 'cors';
import pg from 'pg';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const upload = multer();
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.post('/api/leads', upload.none(), async (req, res) => {
  try {
    const data = req.body;
    
    if (data._honey) {
      return res.status(200).json({ success: true, message: "Honeypot triggered" });
    }

    // Map HTML form names to backend variables
    const firstName = data.first_name || data['First name'] || '';
    const lastName = data.last_name || data['Last name'] || '';
    const phone = data.phone_number || data['Phone'] || '';
    const email = data.email || data['Email'] || '';
    const zipCode = data.zip_code || data['ZIP code'] || '';
    const model = data.model_interest || data['Model interest'] || '';
    const timeline = data.buying_timeline || data['Purchase timeline'] || '';
    const budget = data.budget_preference || data['Estimated budget'] || '';
    const utmSource = data.utm_source || data['UTM source'] || '';
    const utmCampaign = data.utm_campaign || data['UTM campaign'] || '';
    const fbclid = data.fbclid || data['Facebook click ID'] || '';
    const landingPageUrl = data.landing_page_url || data['Landing page URL'] || data['landing-page-url'] || '';

    const insertQuery = `
      INSERT INTO zebra_leads (
        first_name, last_name, phone_number, email, zip_code, 
        model_interest, buying_timeline, budget_preference, 
        utm_source, utm_campaign, fbclid, landing_page_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (phone_number) 
      DO UPDATE SET 
        first_name = EXCLUDED.first_name,
        model_interest = EXCLUDED.model_interest,
        created_at = CURRENT_TIMESTAMP
      RETURNING id;
    `;

    const values = [
      firstName, lastName, phone, email, zipCode, model, 
      timeline, budget, utmSource, utmCampaign, fbclid, landingPageUrl
    ];

    if (!phone) {
        console.error("❌ Phone number is empty, cannot trigger AI!");
    } else {
        const result = await pool.query(insertQuery, values);
        
        try {
            const aiPayload = {
                first_name: firstName,
                phone_number: phone,
                model_interest: model
            };
            await fetch('https://zebra-ai-assistant-production.up.railway.app/api/new-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(aiPayload)
            });
            console.log(`🤖 Triggered AI Outreach for ${phone}`);
        } catch (aiErr) {
            console.error("❌ Failed to trigger AI outreach:", aiErr);
        }
    }

    if (req.headers.accept === 'application/json') {
      return res.status(200).json({ success: true });
    }
    res.redirect('/thank-you.html');
  } catch (err) {
    console.error("❌ Error saving lead:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
