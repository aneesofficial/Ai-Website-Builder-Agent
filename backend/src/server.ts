import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OrchestratorAgent } from './agents/OrchestratorAgent';
import { DesignAgent } from './agents/DesignAgent';
import { ExecutionAgent } from './agents/ExecutionAgent';
import { AssetAgent } from './agents/AssetAgent';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Agents
const orchestrator = new OrchestratorAgent();
const designAgent = new DesignAgent();
const executionAgent = new ExecutionAgent();
const assetAgent = new AssetAgent();

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Agent Backend is running!' });
});

// Start Building Route
app.post('/api/build', async (req, res) => {
  const { businessName, description, tone, brandColor } = req.body;
  
  console.log(`\n--- NEW BUILD REQUEST ---`);
  console.log(`Business: ${businessName}`);
  
  try {
    // Step 1: Orchestrator plans the website
    const plan = await orchestrator.planWebsite(businessName, description, tone);
    
    // For now, return the plan to the frontend
    res.json({ 
      message: 'Orchestrator has successfully planned the website!',
      plan: plan,
      jobId: `job_${Date.now()}` 
    });
  } catch (error) {
    console.error("Error during build process:", error);
    res.status(500).json({ error: "Failed to process build request" });
  }
});

// Generate Code Route (Design Agent)
app.post('/api/generate', async (req, res) => {
  const { businessName, description, tone, brandColor, plan } = req.body;
  
  console.log(`\n--- NEW CODE GENERATION REQUEST ---`);
  
  try {
    const assets = await assetAgent.getAssetsForBusiness(businessName, description);
    const design = await designAgent.generatePageCode(businessName, description, tone, brandColor, plan, assets);
    res.json(design);
  } catch (error) {
    console.error("Error during code generation:", error);
    res.status(500).json({ error: "Failed to generate code" });
  }
});

// Execute Code Route (Execution Agent)
app.post('/api/execute', async (req, res) => {
  const { code } = req.body;
  
  console.log(`\n--- NEW EXECUTION REQUEST ---`);
  
  try {
    const result = await executionAgent.setupWorkspaceAndSaveCode(code);
    res.json(result);
  } catch (error) {
    console.error("Error during execution:", error);
    res.status(500).json({ error: "Failed to execute" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});
