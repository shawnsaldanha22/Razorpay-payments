# Payment pages

Create a product (title, description, mentor, price) and get a hosted page with a direct Razorpay payment link and a registration-form link. Prices are stored in the database and Razorpay orders are created on the server, so buyers cannot change the amount. Payments are verified by signature and by webhook.

**Stack:** Next.js 14 (App Router), Neon Postgres, Razorpay. No other dependencies.

## Deploy (about 10 minutes)

1. Push this folder to a new GitHub repo.
2. On vercel.com: **Add New > Project**, import the repo.
3. In the project, open **Storage > Create Database > Neon** (Postgres). This adds `DATABASE_URL` automatically.
4. Add the other variables from `.env.example` under **Settings > Environment Variables**, then redeploy.
5. In Razorpay Dashboard > **Webhooks**, add `https://YOUR-APP.vercel.app/api/webhook`, tick `payment.captured` and `order.paid`, and use the same secret as `RAZORPAY_WEBHOOK_SECRET`.
6. Open `/admin`, log in with `ADMIN_PASSWORD`, create a product, and share its payment link.

Start with `rzp_test_` keys, make a test payment, then switch to live keys.

## Run locally
`cp .env.example .env.local`, fill it in, then `npm install && npm run dev`.
