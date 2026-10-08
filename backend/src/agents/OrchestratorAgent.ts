import { GoogleGenerativeAI } from '@google/generative-ai';

export class OrchestratorAgent {
    private genAI: GoogleGenerativeAI;

    constructor() {
        // Initialize Gemini API
        const apiKey = process.env.GEMINI_API_KEY || '';
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async planWebsite(businessName: string, description: string, tone: string) {
        console.log(`\n[Orchestrator Agent] Planning landing page for: ${businessName}`);
        
        // Using the powerful Gemini 1.5 Pro model for reasoning and planning
        const model = this.genAI.getGenerativeModel({ 
            model: "gemini-3.5-flash",
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            ]
        });

        const prompt = `
You are an expert Frontend Architect and Website Orchestrator. 
A user wants to build a landing page for their business.
Business Name: ${businessName}
Description: ${description}
Brand Tone: ${tone}

Based on this business description, decide which sections the landing page needs to be highly effective and modern.
Return ONLY a raw JSON array of strings representing the section IDs in order. 
Do NOT include markdown formatting like \`\`\`json.
Example output: ["hero", "about", "services", "testimonials", "contact"]
`;

        try {
            console.log(`[Orchestrator Agent] Thinking...`);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            
            // Clean up the text just in case Gemini returns markdown
            let text = response.text().trim();
            
            // Extract JSON array using regex in case the model adds extra text
            const match = text.match(/\[([\s\S]*?)\]/);
            if (match) {
                text = match[0];
            } else {
                text = text.replace(/```json/g, '').replace(/```/g, '');
            }
            
            const sections = JSON.parse(text);
            console.log(`[Orchestrator Agent] Plan created successfully:`, sections);
            
            return {
                sections,
                status: 'success'
            };
        } catch (error) {
            console.error("[Orchestrator Agent] Error during planning:", error);
            // Fallback plan if API fails or returns invalid JSON
            return {
                sections: ['hero', 'about', 'services', 'contact'],
                status: 'fallback'
            };
        }
    }
}
