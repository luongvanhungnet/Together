# Together

Together is a sliding puzzle game with optional accounts and PostgreSQL save sync.

## Run locally

Requires Node.js 22 or newer. Use Docker Compose or a PostgreSQL database you already run.

1. Copy `.env.example` to `.env`. Set `POSTGRES_PASSWORD` and enter the same
   password in `DATABASE_URL`. Choose a password with letters and digits, or
   URL-encode special characters in the connection string.
2. Run:

   ```sh
   docker compose up -d --wait postgres
   npm ci
   npm start
   ```

3. Open http://127.0.0.1:4173/ and expand **Account and save sync**.

For an existing PostgreSQL instance, set `DATABASE_URL` to a database where
the configured user can create tables, then skip the Docker command. The app
creates its tables on startup. Compose stores database data in a named volume.
Use `docker compose stop` to stop the database and preserve its data.

Registration can import guest progress from the same browser and origin.
Progress, scores, medals, daily records, gold, and unlocked styles sync to
the shared server. **Sync now** also checks for changes from another browser.
If browsers change the same save concurrently, choose which version to keep.

The app listens on loopback by default. To serve other devices, use a shared
server behind a trusted HTTPS reverse proxy and set `TOGETHER_SECURE_COOKIE=1`.
The existing static Sites release does not run the account server.
