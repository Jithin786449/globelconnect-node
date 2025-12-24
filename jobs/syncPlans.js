import axios from 'axios';
import { parse } from 'csv-parse/sync';
import cron from 'node-cron';
import { setPlans } from '../utils/dataStore.js';
import { listPackages } from '../utils/esimAccess.js';

/*
 * Plan synchronisation job
 *
 * If the environment variable `PLANS_CSV_URL` is provided, this job will
 * download the CSV, parse it and update the in-memory plan cache.  When
 * `PLANS_CSV_URL` is blank, the job falls back to pulling plans from the
 * eSIM Access API.  Use the `SYNC_CRON` environment variable to control
 * how often the job runs; it defaults to every 6 hours.
 */
export function startPlanSync() {
  const csvUrl = process.env.PLANS_CSV_URL || '';
  const schedule = process.env.SYNC_CRON || '0 */6 * * *';

  async function runSync() {
    try {
      let plans = [];
      if (csvUrl) {
        // Fetch and parse CSV
        const res = await axios.get(csvUrl, { timeout: 20000 });
        const records = parse(res.data, { columns: true, skip_empty_lines: true });
        // Normalize CSV fields to match API format
        plans = records.map((row) => ({
          packageCode: row.sku || row.packageCode,
          name: row.name,
          region: row.region,
          country: row.countries || row.country,
          dataGb: parseFloat(row.data_gb || row.dataGb || row.data) || null,
          validityDays: parseInt(row.validity_days || row.validityDays || row.validity, 10) || null,
          price: parseInt(row.price, 10) || 0,
          status: row.status || 'active',
        }));
      } else {
        plans = await listPackages();
      }
      setPlans(plans);
      console.log(`[${new Date().toISOString()}] Plan sync completed. Loaded ${plans.length} plans.`);
    } catch (err) {
      console.error('Plan sync failed:', err.message);
    }
  }

  // Run immediately on startup
  runSync();

  // Schedule periodic runs
  cron.schedule(schedule, () => {
    runSync();
  });
}
