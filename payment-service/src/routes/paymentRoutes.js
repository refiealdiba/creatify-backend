const express = require('express');
const router = express.Router();
const midtransClient = require('midtrans-client');

// Inisialisasi Midtrans Snap
const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// Endpoint untuk membuat transaksi pembayaran
router.post('/', async (req, res) => {
    const parameter = {
        transaction_details: {
            order_id: req.body.order_id,
            gross_amount: req.body.amount,
        },
        customer_details: {
            first_name: req.body.first_name,
            email: req.body.email,
        }
    };

    try {
        const transaction = await snap.createTransaction(parameter);
        res.json(transaction);
    } catch (error) {
        console.error('Midtrans error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;