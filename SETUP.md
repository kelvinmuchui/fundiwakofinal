# FundiWako Development Setup Guide

## Prerequisites

- **Node.js**: v18+ (check with `node --version`)
- **npm**: v9+ (check with `npm --version`)
- **MongoDB**: Account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
- **Git**: Installed and configured

## Installation

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd fundiwako2
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example file and create your local configuration:
```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and replace placeholder values with your actual configuration:

```env
# Database
MONGODB_URI="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/fundiwako"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-with: openssl rand -base64 32>"

# Encryption (for sensitive data)
ENCRYPTION_KEY="<generate-with: openssl rand -base64 32>"

# Email Service (for verification & password reset)
EMAIL_FROM="noreply@fundiwako.com"
EMAIL_PROVIDER_HOST="smtp.gmail.com"
EMAIL_PROVIDER_PORT="587"
EMAIL_PROVIDER_USER="your-email@gmail.com"
EMAIL_PROVIDER_PASS="your-app-specific-password"

# Environment
ENVIRONMENT="development"
```

### 4. Generate Required Secrets

Create NextAuth secret:
```bash
openssl rand -base64 32
```

Create encryption key:
```bash
openssl rand -base64 32
```

Copy these values into `.env.local`.

### 5. Set Up MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier is fine)
3. Create a database user with a strong password
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/fundiwako`
5. Update `MONGODB_URI` in `.env.local`

### 6. Run Database Seed (Optional)

Populate the database with sample data:
```bash
npm run seed-db
```

## Development

### Start the Development Server
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
npm start
```

### Run Linting
```bash
npm run lint
```

## Security Notes

⚠️ **CRITICAL**:
- **Never** commit `.env.local` to git (it's in `.gitignore`)
- **Never** share your `.env.local` file
- Rotate `NEXTAUTH_SECRET` in production regularly
- Keep `ENCRYPTION_KEY` safe—losing it means encrypted data is unrecoverable
- Use environment-specific values (dev vs production)

## Project Structure

```
fundiwako2/
├── app/                    # Next.js App Router (pages, layouts, API routes)
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── auth/             # Auth pages
│   ├── dashboard/        # User dashboards
│   └── legal/            # Legal pages (privacy policy, ToS, etc.)
├── lib/                   # Utilities and helpers
│   ├── auth.ts          # Authentication utilities
│   ├── db.ts            # Database utilities
│   ├── mongodb.ts       # MongoDB connection
│   ├── encryption.ts    # Data encryption (Phase 1)
│   ├── validation.ts    # Zod schemas (Phase 1)
│   ├── models/          # Database models
│   └── services.ts      # Business logic
├── fundiwako-mobile/      # React Native Expo app
├── public/               # Static assets
├── scripts/              # Utility scripts
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── tailwind.config.ts   # Tailwind CSS config
└── next.config.ts       # Next.js config
```

## API Documentation

See [API_DOCS.md](./API_DOCS.md) for endpoint documentation.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for instructions on deploying to production.

## Compliance & Security

See [COMPLIANCE.md](./COMPLIANCE.md) for security measures, data protection, and audit logging.

## Troubleshooting

### Port 3000 Already in Use
```bash
# Find and kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### MongoDB Connection Error
- Verify `MONGODB_URI` is correct
- Check MongoDB cluster is running
- Verify IP whitelist in MongoDB Atlas includes your machine

### NextAuth Issues
- Ensure `NEXTAUTH_URL` matches your application's domain
- Clear browser cookies and try again
- Check NextAuth logs: `NODE_DEBUG=next-auth npm run dev`

### TypeScript Errors
```bash
npm run lint -- --fix
```

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Create a Pull Request

## Support

For issues, please:
1. Check existing GitHub issues
2. Create a new issue with detailed reproduction steps
3. Include your Node/npm versions and error messages
