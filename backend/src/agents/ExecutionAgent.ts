import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export class ExecutionAgent {
    async setupWorkspaceAndSaveCode(code: string) {
        console.log(`\n[Execution Agent] Saving generated code and setting up Vite project...`);
        
        // Go up from backend/src/agents to the root folder, then into generated_workspace/frontend
        const rootDir = path.join(__dirname, '../../../generated_workspace/frontend');
        
        try {
            // Create directories
            await fs.mkdir(path.join(rootDir, 'src'), { recursive: true });
            
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
            await fs.writeFile(path.join(rootDir, 'package.json'), JSON.stringify(packageJson, null, 2));

            // Write vite.config.ts
            const viteConfig = `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
`;
            await fs.writeFile(path.join(rootDir, 'vite.config.ts'), viteConfig.trim());

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
            await fs.writeFile(path.join(rootDir, 'index.html'), indexHtml.trim());

            // Write src/index.css
            await fs.writeFile(path.join(rootDir, 'src/index.css'), `@import "tailwindcss";`);

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
            await fs.writeFile(path.join(rootDir, 'src/main.tsx'), mainTsx.trim());

            // Write the actual generated React code!
            await fs.writeFile(path.join(rootDir, 'src/App.tsx'), code);

            console.log(`[Execution Agent] Workspace setup complete!`);
            return {
                status: 'success',
                message: 'Project files saved in generated_workspace/frontend. Ready to run npm install!',
                path: rootDir
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
