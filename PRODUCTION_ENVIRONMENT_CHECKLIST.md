# ExpenseIQ Production Environment Checklist

Do not commit real secrets to GitHub.

## Deployment choice

- Backend: Railway Spring Boot service
- Database: Railway MySQL
- Frontend: Vercel
- Receipt storage: Railway volume later, or external object storage later

## Backend Railway environment variables

Add these variables in the Railway backend service, not in code.

### Server

ET_SERVER_PORT=${{PORT}}

### Database

Use Railway MySQL reference variables. Replace `MySQL` with your actual Railway MySQL service name if different.

ET_DB_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
ET_DB_USERNAME=${{MySQL.MYSQLUSER}}
ET_DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}

### JWT

ET_JWT_SECRET=<minimum-64-character-random-secret>
ET_JWT_ISSUER=ExpenseIQ
ET_JWT_ACCESS_TOKEN_EXPIRATION_MS=900000
ET_JWT_REFRESH_TOKEN_EXPIRATION_MS=604800000

### Security

ET_BCRYPT_STRENGTH=12

### CORS

Set this after Vercel frontend deployment:

ET_CORS_ALLOWED_ORIGINS=<vercel-production-url>

### Receipt storage

For first deployment, use this only if Railway volume is attached:

EXPENSEIQ_RECEIPT_STORAGE_PATH=/app/storage/receipts
EXPENSEIQ_RECEIPT_MAX_FILE_SIZE_BYTES=5242880
EXPENSEIQ_RECEIPT_ALLOWED_CONTENT_TYPES=image/png,image/jpeg,image/webp,application/pdf

## Frontend Vercel environment variables

Set this after Railway backend deployment:

VITE_API_BASE_URL=<railway-backend-public-url>/api/v1

## Notes

- Do not use localhost in production.
- Do not commit passwords, JWT secrets, or provider secrets.
- OAuth social login is currently disabled/hidden until real provider credentials are configured.
- Railway MySQL service name must match the reference variable prefix.
  Example: if your database service is named `expenseiq-mysql`, use `${{expenseiq-mysql.MYSQLHOST}}`.