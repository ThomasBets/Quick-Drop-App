# Project Setup Guide

Follow these steps to set up and run the project locally.

---

##  Requirements
Make sure the following are installed on your computer:
- **PHP** (v8.0+ recommended)  
- **Composer** (PHP dependency manager)  
- **MySQL / MariaDB** (or another supported database)  
- **Node.js & npm** (for frontend assets, if applicable)  
- **Git** (to clone the repository)  

---

##  Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/your-laravel-project.git
cd your-laravel-project
```

### 2. Install PHP Dependencies
```bash
composer install
```

### 3. Install Node Dependencies (if applicable)
```bash
npm install
npm install -g vite
```

### 4. Configure Environment
- Copy `.env.example` to `.env`:
  ```bash
  cp .env.example .env
  ```
- Or create a `.env` file if `.env.example` does not exist
  
- Open `.env` and update:
  - Database name  
  - Database username  
  - Database password  
  - (Other configs like mail, API keys, etc.)  

#### Firestore Setup
If your project uses **Google Firestore** for storing/retrieving data, you need to configure Firebase credentials.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).  
2. Select your Firebase project (or create a new one).  
3. Navigate to **Project Settings → Service Accounts**.  
4. Click **Generate new private key**. This will download a JSON file containing your service account credentials.  
5. Save this file somewhere safe (e.g., `storage/firebase-service-account.json`) and **do not commit it to Git**.  
6. In your `.env` file, add the following variables:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_SERVICE_ACCOUNT=/absolute/path/to/firebase-service-account.json
   ```

- `FIREBASE_PROJECT_ID` → Your Firebase project ID (found in Firebase console).  
- `FIREBASE_SERVICE_ACCOUNT` → The **absolute path** to the downloaded service account JSON file.  

#### Important Security Note
Add the Firebase service account JSON file to your `.gitignore` to prevent accidentally committing it to version control:

```
# Firebase service account
/storage/firebase-service-account.json
```

---

### 5. Generate Application Key
```bash
php artisan key:generate
```

### 6. Set Up Database
- Create a database in MySQL (use the name from `.env`).
  ```bash
  docker compose up
  ```
- Run migrations:
  ```bash
  php artisan migrate
  ```
- (Optional) Seed demo data:
  ```bash
  php artisan db:seed
  ```
### 7. Syncing Database's data with the Firestore
```bash
php artisan app:sync-deliveries-rest
```

### 8. Build Frontend Assets (if applicable)
```bash
npm run dev
```
(or `npm run build` for production)

### 9. Run the Development Server
```bash
php artisan serve
```
Now visit [http://localhost:8000](http://localhost:8000)

---

## Sample `.env` File

Here’s a sample `.env` with the most important variables for database and Firestore setup:

```env
APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# Firestore / Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT=/absolute/path/to/firebase-service-account.json

# Mail (optional)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"
```

