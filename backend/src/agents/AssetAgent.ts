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
            
            // Generate hyper-realistic images using Pollinations AI
            const getImageUrl = (keyword: string, w: number, h: number) => {
                const prompt = `photorealistic real life high quality stock photo of ${keyword}, 8k dslr`;
                return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
            };

            const logoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(businessName)}&background=random&color=fff&rounded=true&bold=true&size=128`;

            const assets = {
                logo: logoUrl,
                heroImage: getImageUrl(`${keywords[0] || 'business'} corporate`, 1200, 800),
                aboutImage: getImageUrl(`${keywords[1] || 'modern'} professional`, 800, 800),
                featureImage: getImageUrl(`${keywords[2] || 'tech'} abstract`, 800, 600)
            };
            
            console.log(`[Asset Agent] Real stock photos and Logo fetched successfully from internet!`);
            return assets;
        } catch (error) {
            console.error("[Asset Agent] Error extracting keywords, using fallback real images:", error);
            
            const getImageUrl = (keyword: string, w: number, h: number) => {
                const prompt = `photorealistic real life high quality stock photo of ${keyword}, 8k dslr`;
                return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
            };
            const logoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(businessName)}&background=random&color=fff&rounded=true&bold=true&size=128`;

            // Fallback assets
            return {
                logo: logoUrl,
                heroImage: getImageUrl(`business headquarters`, 1200, 800),
                aboutImage: getImageUrl(`team professional`, 800, 800),
                featureImage: getImageUrl(`abstract tech`, 800, 600)
            };
        }
    }
}
