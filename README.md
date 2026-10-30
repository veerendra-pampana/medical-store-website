# MediStore Manager

A browser-based medical store management project with a Node.js server that requires sign-in. App data (medicines, customers, sales) is stored in the browser using localStorage; login credentials are stored server-side as salted password hashes.

## Login required

The app now runs behind a real server-side login. Opening the app in a browser without a valid session redirects you to `login.html`, and every page/asset request is checked against a server-side session cookie - not just hidden in the browser.

**Default login (created automatically the first time you run the server):**

```text
Username: admin
Password: admin123
```

Change this immediately - see "Managing users" below.

## Features

- Dashboard with medicine count, low stock alerts, expiry alerts, and revenue.
- Owner notification banner for medicines that are empty or below the reorder level.
- Optional desktop stock alert button when the browser supports notifications.
- Inventory CRUD for medicines, categories, batches, suppliers, quantity, reorder level, expiry date, and GST.
- Billing screen with customer selection, medicine picker, GST calculation, discount, invoice preview, and print support.
- Customer records with name, phone, reason for treatment/medicine, and total cost.
- Sales history with invoice lookup.
- In-app medicine bot for inventory questions and general medicine information.
- Sample data loader and full reset option.
- Server-side login with hashed passwords, session cookies, and basic login rate-limiting.

## Run

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

You'll land on the sign-in page first. Log in with the default credentials above (or your own, once set).

Note: you can no longer just double-click `index.html` to use the app - the login and session logic requires the Node server to be running.

## Managing users

Credentials are stored (as salted hashes, never plain text) in `data/users.json`, created automatically on first run.

**Change the default password:**

```bash
node server.js --set-password admin yourNewPassword
```

**Add another staff login:**

```bash
node server.js --set-password newusername theirPassword
```

Run either command while the server is stopped or in a separate terminal - it just updates the file and exits.

Sessions last 8 hours and are stored in memory, so they reset if you restart the server (everyone will need to log in again). Login attempts are rate-limited: 5 failed tries locks that IP out for 1 minute.

## Files

- `index.html` - App structure (protected; requires login).
- `styles.css` - Responsive layout and visual design.
- `app.js` - Inventory, billing, customers, sales, storage, and invoice logic.
- `login.html` / `login.css` / `login.js` - Sign-in page (publicly accessible).
- `server.js` - Static file server with session-based authentication and login API.
- `data/users.json` - Auto-created; stores hashed user credentials (not committed to version control).
- `package.json` - Start script.

## Notes

This is a local project starter. The medicine bot gives general store-assistant information only and should not be used as medical advice or a prescription tool. For real production pharmacy use, also add HTTPS, a persistent session store, database storage, audit logs, prescription validation, compliant tax settings, backups, role-based permissions, and verified clinical medicine references.