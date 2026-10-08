# Production Deployment

## cPanel with Node.js support

This project is a Next.js server application. Its pages, API routes, authentication, and database access require a running Node.js server; uploading the contents of `public/` or using a static export will not deploy the application.

### Requirements

- A cPanel plan with a Node.js application manager (often named **Setup Node.js App** or **Node.js Selector**).
- Node.js **20.9.0 or newer**. Use Node.js 22 if it is available.
- A long-running Node.js application with the `npm start` command supported by the hosting setup.
- A MongoDB database reachable from the hosting server.

Ask the hosting provider whether its Node.js manager supports Next.js production apps and WebSocket connections. The project includes Socket.IO client/server code, but the current Next.js startup does not initialize the Socket.IO server, so real-time chat/presence needs additional server wiring regardless of host.

### 1. Prepare the domain and database

1. Point your domain or subdomain to the cPanel account and enable its SSL certificate.
2. In MongoDB Atlas, add the hosting server's outbound IP address to the project's Network Access allowlist. Ask the host for that IP; avoid allowing access from every IP.
3. Create or confirm the MongoDB database user and production database name.

### 2. Upload the application

1. In cPanel, create the Node.js application using the highest supported Node.js version meeting the requirement above and **production** mode.
2. Use an application root in your account, for example `fundiwako-app`, rather than putting the source directly in `public_html`.
3. Upload the repository's web-app files to that root. Include `app/`, `lib/`, `public/`, `scripts/`, `package.json`, `package-lock.json`, `next.config.ts`, and the other root configuration files.
4. Do not upload `node_modules/`, `.next/`, `.env.local`, or `.git/`.
5. Set the application URL to the domain/subdomain. The project uses `npm start` (`next start`) to run its production server. If the Node.js manager requires a startup file instead of a start command, ask the provider how it expects Next.js applications to be launched; this project does not currently include a cPanel-specific startup file.

### 3. Configure production environment variables

Set these in the Node.js application's environment-variable settings. Use real production values; do not upload or commit `.env.local`.

```text
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.example
NEXTAUTH_SECRET=<a-long-random-secret>
MONGODB_URI=<your-MongoDB-connection-string>
ENCRYPTION_KEY=<a-long-random-secret>
NEXT_PUBLIC_APP_URL=https://your-domain.example
```

Configure email delivery if account verification and password-reset emails are needed:

```text
EMAIL_FROM=<your-sender-address>
EMAIL_PROVIDER_HOST=<your-SMTP-host>
EMAIL_PROVIDER_PORT=587
EMAIL_PROVIDER_USER=<your-SMTP-user>
EMAIL_PROVIDER_PASS=<your-SMTP-password>
```

Set `NEXT_PUBLIC_APP_URL` before building because public environment variables are included in browser assets at build time. If it changes later, rebuild the application. Add payment-provider credentials and callback URLs only when production M-Pesa payments are configured; never use sandbox/test credentials for live payments.

### 4. Install, build, and start

From cPanel Terminal, change to the application root and run:

```bash
npm ci
npm run build
```

Then start or restart the app using the cPanel Node.js application manager. The configured start command should be:

```bash
npm start
```

Use the application manager's restart control after changing code or environment variables. Do not run `npm run dev` in production.

### 5. Verify the deployment

- Open the HTTPS site and check that pages load without server errors.
- Test registration/login and an operation that reads/writes MongoDB.
- Check cPanel's application logs if the app does not start or API calls fail.
- If MongoDB connections fail, confirm the URI, database-user permissions, and Atlas allowlist.
- Confirm the domain in `NEXTAUTH_URL` exactly matches the public HTTPS URL. Configure any payment callbacks with that same public domain.
- Ask the host whether WebSocket upgrades are enabled before relying on real-time features.

## Other Node.js hosts

For a Node.js host that supports production Next.js servers, install dependencies with `npm ci`, build with `npm run build`, and run with `npm start`. Configure the production environment variables above in the host's environment settings.
