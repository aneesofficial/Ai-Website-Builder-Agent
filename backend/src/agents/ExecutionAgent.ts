import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export class ExecutionAgent {
    async setupWorkspaceAndSaveCode(code: string) {
        console.log(`\n[Execution Agent] Saving generated code and setting up Vite project...`);
        
        const frontendDir = path.join(__dirname, '../../../generated_workspace/frontend');
        const backendDir = path.join(__dirname, '../../../generated_workspace/backend');
        
        try {
            // Create directories
            await fs.mkdir(path.join(frontendDir, 'src'), { recursive: true });
            
            // Write package.json
            const packageJson = {
              "name": "ai-generated-website",
              "private": true,
              "version": "0.0.0",
              "type": "module",
              "scripts": {
                "dev": "vite",
                "build": "tsc -b && vite build",
                "preview": "vite preview"
              },
              "dependencies": {
                "lucide-react": "^0.368.0",
                "react": "^18.3.1",
                "react-dom": "^18.3.1",
                "tailwindcss": "^4.0.0",
                "@tailwindcss/vite": "^4.0.0"
              },
              "devDependencies": {
                "@types/react": "^18.3.3",
                "@types/react-dom": "^18.3.0",
                "@vitejs/plugin-react": "^4.3.1",
                "typescript": "^5.5.3",
                "vite": "^5.4.1"
              }
            };
            await fs.writeFile(path.join(frontendDir, 'package.json'), JSON.stringify(packageJson, null, 2));

            // Write vite.config.ts
            const viteConfig = `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
`;
            await fs.writeFile(path.join(frontendDir, 'vite.config.ts'), viteConfig.trim());

            // Write index.html
            const indexHtml = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Generated Website</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
            await fs.writeFile(path.join(frontendDir, 'index.html'), indexHtml.trim());

            // Write src/index.css
            await fs.writeFile(path.join(frontendDir, 'src/index.css'), `@import "tailwindcss";`);

            // Write src/main.tsx
            const mainTsx = `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`;
            await fs.writeFile(path.join(frontendDir, 'src/main.tsx'), mainTsx.trim());

            // Write the actual generated React code!
            await fs.writeFile(path.join(frontendDir, 'src/App.tsx'), code);

            // ============================================
            // STEP 2: SETUP BACKEND WORKSPACE
            // ============================================
            console.log(`[Execution Agent] Setting up Express backend project...`);
            await fs.mkdir(backendDir, { recursive: true });

            const backendPackageJson = {
              "name": "ai-generated-backend",
              "version": "1.0.0",
              "main": "server.js",
              "type": "module",
              "scripts": {
                "start": "node server.js"
              },
              "dependencies": {
                "cors": "^2.8.5",
                "express": "^4.19.2"
              }
            };
            await fs.writeFile(path.join(backendDir, 'package.json'), JSON.stringify(backendPackageJson, null, 2));

            const serverJs = `
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5001;

// Simple database using a JSON file
const DB_FILE = './leads.json';

// Ensure DB exists
try {
  await fs.access(DB_FILE);
} catch {
  await fs.writeFile(DB_FILE, '[]');
}

app.post('/api/contact', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const data = await fs.readFile(DB_FILE, 'utf-8');
    const leads = JSON.parse(data);
    leads.push({ email, date: new Date().toISOString() });
    
    await fs.writeFile(DB_FILE, JSON.stringify(leads, null, 2));
    console.log('New lead saved:', email);
    
    res.json({ success: true, message: 'Thank you! We will be in touch.' });
  } catch (error) {
    console.error('Failed to save lead:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log('Generated Backend running on http://localhost:' + PORT);
});
`;
            await fs.writeFile(path.join(backendDir, 'server.js'), serverJs.trim());

            console.log(`[Execution Agent] Workspace setup complete!`);
            return {
                status: 'success',
                message: 'Project files saved in generated_workspace/frontend and backend.',
                path: frontendDir
            };
        } catch (error) {
            console.error("[Execution Agent] Error setting up workspace:", error);
            return {
                status: 'error',
                message: 'Failed to save files to disk.'
            };
        }
    }
}
