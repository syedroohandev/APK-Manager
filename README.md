# APK Management System

A full-stack web application for managing, storing, and distributing Android APK files. The system provides a centralized dashboard where administrators can upload APKs, manage application versions, and distribute files efficiently.

## Features

- APK Upload Management
- Version Tracking
- APK Download Support
- APK Record Deletion
- MySQL Database Integration
- Responsive Dashboard
- File Storage Management
- Secure Environment Configuration

## Tech Stack

### Frontend

- React.js
- Vite
- Axios
- CSS3

### Backend

- Node.js
- Express.js
- Multer
- CORS

### Database

- MySQL

## Project Structure

```text
APK_SYSTEM/
│
├── apk-frontend/
│   ├── src/
│   ├── public/
│   ├── dist/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── README.md
│
├── backend/
│   ├── uploads/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
└── README.md
```


## Getting Started

### Clone the Repository

```bash
git clone https://github.com/syedroohandev/APK-Manager.git
cd APK_SYSTEM
```

### Install Frontend Dependencies

```bash
cd apk-frontend
npm install
```

### Install Backend Dependencies

```bash
cd ../backend
npm install
```

## Environment Variables

### Frontend (`apk-frontend/.env`)

```env
VITE_API_URL=http://localhost:3000/api
```


### Backend (`backend/.env`)

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=apk_management
PORT=3000
```


> Make sure the frontend API URL points to your backend server URL. Update it accordingly when deploying to production.

## Running the Application

### Start Backend

```bash
node server.js
```


### Start Frontend

```bash
cd apk-frontend
npm run dev
```


The frontend development server will typically run on:

```text
http://localhost:5173
```

## Build Frontend

```bash
npm run build
```

The production build will be generated inside the `dist` folder.

## Deployment

### Frontend

Recommended platforms:

- Vercel
- Netlify

### Backend

Recommended platforms:

- Render
- DigitalOcean App Platform
- DigitalOcean Droplet
- VPS (Ubuntu)

## Security Notes

- Do not commit `.env` files.
- Do not commit uploaded APK files.
- Store sensitive credentials using environment variables.
- Restrict database access to authorized users only.
- Validate uploaded files before storing them on the server.

## .gitignore

### Frontend

```gitignore
node_modules/
dist/
.env
```

### Backend

```gitignore
node_modules/
uploads/
.env
```

## Future Improvements

- User Authentication
- Role-Based Access Control
- Search & Filtering
- APK Version History
- Download Analytics
- Cloud Storage Integration (AWS S3, DigitalOcean Spaces)
- Activity Logging
- Bulk APK Upload Support

## License

This project is intended for APK management and distribution purposes. Feel free to modify and adapt it according to your requirements.