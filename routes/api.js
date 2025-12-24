import express from 'express';
import {
  orderProfiles,
  queryAllocatedProfiles,
  formatPrice,
} from '../utils/esimAccess.js';

/**
 * API routes used by the front-end for AJAX calls.
 * These routes return JSON and are prefixed with `/api` when mounted.
 */
export default function apiRouter() {
  const router = express.Router();
  router.use(express.json());

  /**
   * Create an eSIM order.
   *
   * Expects a JSON body like:
   * {
   *   "planCode": "packageCode",
   *   "email": "user@example.com"
   * }
   *
   * On success, responds with { success: true, orderNo, transactionId, esim } where `esim`
   * contains the QR code and activation details (subject to vendor API timing).
   */
  router.post('/order', async (req, res) => {
    const { planCode, email } = req.body;
    if (!planCode || !email) {
      return res.status(400).json({ success: false, error: 'planCode and email are required' });
    }

    // Generate a unique transaction ID (timestamp + random)
    const transactionId = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
    // We don't provide price/amount here; vendor will charge your account at their price.
    const packageInfoList = [
      {
        packageCode: planCode,
        count: 1,
      },
    ];

    const orderResp = await orderProfiles({ transactionId, packageInfoList });
    if (!orderResp || orderResp.success !== true) {
      return res.status(500).json({ success: false, error: orderResp?.errorMsg || 'Order creation failed' });
    }

    const orderNo = orderResp.obj?.orderNo;

    // Poll the API for allocated profiles (could take up to ~30 seconds). We'll try once here.
    const queryResp = await queryAllocatedProfiles({ orderNo });
    let esimList = [];
    if (queryResp && queryResp.success === true && Array.isArray(queryResp.obj?.esimList)) {
      esimList = queryResp.obj.esimList;
    }

    // Ideally you should implement retry logic or webhook notifications; this example returns
    // whatever is available now.

    return res.json({ success: true, orderNo, transactionId, esim: esimList });
  });

  return router;
}
