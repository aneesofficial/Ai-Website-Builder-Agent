import { GoogleGenerativeAI } from '@google/generative-ai';

export class AssetAgent {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || '';
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async getAssetsForBusiness(businessName: string, description: string) {
        console.log(`\n[Asset Agent] Finding high-quality image assets for: ${businessName}`);
        
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
            const prompt = `
You are an Asset Manager for a website builder. 
Based on this business description: "${description}"
Extract exactly 3 single-word English keywords that best represent the visual aesthetic of this business (e.g. cafe, coffee, pastry).
Return ONLY a comma-separated list of these 3 keywords in lowercase, no other text or punctuation.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            const keywords = text.split(',').map(k => k.trim().replace(/[^a-z]/g, ''));
            
            console.log(`[Asset Agent] Keywords identified by AI: ${keywords.join(', ')}`);
            
            // Generate real working dynamic image URLs using picsum.photos (more reliable)
            const assets = {
                heroImage: `https://picsum.photos/seed/${keywords[0] || 'hero'}/1200/800`,
                aboutImage: `https://picsum.photos/seed/${keywords[1] || 'about'}/800/800`,
                featureImage: `https://picsum.photos/seed/${keywords[2] || 'feature'}/800/600`
            };
            
            console.log(`[Asset Agent] Assets generated successfully!`);
            return assets;
        } catch (error) {
            console.error("[Asset Agent] Error extracting keywords (Quota?), using fallback keywords:", error);
            // Fallback assets
            return {
                heroImage: `https://picsum.photos/seed/${businessName.replace(/\s+/g, '')}1/1200/800`,
                aboutImage: `https://picsum.photos/seed/${businessName.replace(/\s+/g, '')}2/800/800`,
                featureImage: `https://picsum.photos/seed/${businessName.replace(/\s+/g, '')}3/800/600`
            };
        }
    }
}
