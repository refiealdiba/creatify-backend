import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const port = process.env.PORT;
const userService = process.env.USER_SERVICE_URL;
const paymentService = process.env.PAYMENT_SERVICE_URL;
const orderService = process.env.ORDER_SERVICE_URL;
const reviewService = process.env.REVIEW_SERVICE_URL;
const gigBenefitService = process.env.GIG_BENEFIT_SERVICE_URL;
const gigPackageService = process.env.GIG_PACKAGE_SERVICE_URL;
const gigService = process.env.GIG_SERVICE_URL;

// Proxy setup
app.use(
    "/api-user",
    createProxyMiddleware({
        target: userService!,
        changeOrigin: true,
    })
);
app.use(
    "/api-payment",
    createProxyMiddleware({
        target: paymentService!,
        changeOrigin: true,
    })
);
app.use(
    "/api-order",
    createProxyMiddleware({
        target: orderService!,
        changeOrigin: true,
    })
);
app.use(
    "/api-review",
    createProxyMiddleware({
        target: reviewService!,
        changeOrigin: true,
    })
);
app.use(
    "/api-gig-benefit",
    createProxyMiddleware({
        target: gigBenefitService!,
        changeOrigin: true,
    })
);
app.use(
    "/api-gig-package",
    createProxyMiddleware({
        target: gigPackageService!,
        changeOrigin: true,
    })
);
app.use(
    "/api-gig",
    createProxyMiddleware({
        target: gigService!,
        changeOrigin: true,
    })
);

app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
});
