
```markdown
# Communityersity Digital Library Catalog System

A full-stack web application built to manage a physical library's catalog digitally using the Dewey Decimal Classification system.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS (via Vite Plugin), Axios, React Router
- **Backend:** Node.js, Express.js, Prisma ORM
- **Database:** PostgreSQL
- **Version Control:** Git & GitHub
- **Package Manager:** npm

## 📁 Project Structure

```
communityersity-digital-library/
├── backend/                 # Node.js + Express API Server
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Custom middleware
│   │   ├── routes/          # API endpoint definitions
│   │   └── utils/           # Helper functions
│   ├── prisma/
│   │   └── schema.prisma    # Database schema definition
│   ├── .env                 # Environment variables (NOT versioned)
│   └── package.json
├── frontend/                # React Application (Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── features/        # Feature-based modules
│   │   ├── pages/           # Page components
│   │   └── hooks/           # Custom React hooks
│   ├── public/              # Static assets
│   └── package.json
├── docs/                    # Project documentation
└── README.md               # This file
```

## 🚀 Local Development Setup

Follow these steps to get the project running on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed on your system:
- **Node.js** (v20 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **PostgreSQL** (v16 or higher) - [Download here](https://www.postgresql.org/download/) OR use Docker

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <your-repository-name>
```

### 2. Database Setup

#### Option A: Using Docker (Recommended)
1. Ensure Docker Desktop is installed and running
2. From the project root, run:
```bash
docker-compose up -d
```
This will start a PostgreSQL container with default credentials.

#### Option B: Using Local PostgreSQL Installation
1. Install PostgreSQL on your machine
2. Create a new database called `communityersity_library`
3. Note your database credentials (username, password, port)

### 3. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Environment Configuration:
   - Copy the `.env.example` file to `.env` (if available)
   - Or create a new `.env` file with the following variables:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/communityersity_library?schema=public"
PORT=5000
JWT_SECRET="your-super-secret-jwt-key-here-change-this-in-production"
NODE_ENV="development"
```
   - Replace `username`, `password`, and `5432` with your PostgreSQL credentials
   - Generate a strong random string for `JWT_SECRET`

4. Database Migration:
```bash
# Generate Prisma client
npx prisma generate

# Run migrations to create database tables
npx prisma migrate dev --name init
```

5. Start the development server:
```bash
npm run dev
```
The backend should now be running on `http://localhost:5000`

### 4. Frontend Setup (Using Vite + Tailwind CSS Vite Plugin)

1. **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2. **Install dependencies:** This installs React, the new Tailwind CSS Vite plugin, and other essential libraries.
    ```bash
    npm install
    npm install @tailwindcss/vite react-router-dom axios @heroicons/react
    ```

3. **Configure Vite:** Open `vite.config.js` in the frontend root and add the `@tailwindcss/vite` plugin.
    ```javascript
    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'
    import tailwindcss from '@tailwindcss/vite'

    // https://vitejs.dev/config/
    export default defineConfig({
      plugins: [
        react(),
        tailwindcss(), // Add the Tailwind CSS Vite plugin
      ],
    })
    ```

4. **Import Tailwind CSS:** Replace the entire content of your `src/index.css` file with a single import directive.
    ```css
    @import "tailwindcss";
    ```
    *That's it! No need for a `tailwind.config.js` or `postcss.config.js` file for basic setup. The plugin handles it.*

5. **Start the development server:**
    ```bash
    npm run dev
    ```
    The frontend should now be running on `http://localhost:5173`.

6. **Test Tailwind CSS:** Open `src/App.jsx`. Replace its content to test if Tailwind is working:
    ```jsx
    function App() {
      return (
        <div className="text-3xl font-bold underline text-blue-600 p-8">
          Communityersity Library - Vite + React + Tailwind CSS (Vite Plugin)
        </div>
      )
    }
    export default App
    ```
    Save the file. Your browser should automatically update and display the styled text.

### 5. Verify the Setup

1. **Backend Health Check:** Open `http://localhost:5000/api/health` in your browser or Postman. You should see:
```json
{"message":"API is healthy!"}
```

2. **Frontend Health Check:** Open `http://localhost:5173` in your browser. You should see the React application homepage.

## 🧪 Testing the Database Connection

1. Explore your database using Prisma Studio:
```bash
cd backend
npx prisma studio
```
This will open a browser window where you can view and manipulate your database tables.

## 📝 Common Commands

### Backend Commands
```bash
npm run dev          # Start development server
npm run start        # Start production server
npx prisma generate  # Generate Prisma client
npx prisma studio    # Open database GUI
npx prisma migrate dev --name <name>  # Create new migration
```

### Frontend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🤝 Team Workflow

1. **Create a feature branch**: `git checkout -b feat/your-feature-name`
2. **Make your changes**
3. **Test your changes** thoroughly
4. **Commit your changes**: `git commit -m "feat: describe your changes"`
5. **Push to GitHub**: `git push origin feat/your-feature-name`
6. **Create a Pull Request** on GitHub
7. **Request a review** from at least one team member
8. **Merge** after approval

## 🆘 Troubleshooting

- **Port already in use**: Change the `PORT` in backend/.env or kill the process using the port.
- **Database connection errors**: Double-check your `DATABASE_URL` in backend/.env.
- **Docker issues**: Ensure Docker Desktop is running and has enough resources allocated.
- **Module not found**: Run `npm install` in both frontend and backend directories.

## 📞 Support

For technical support, contact your team lead or refer to the documentation in the `/docs` directory.

---

**Happy Coding! 🚀**
```
