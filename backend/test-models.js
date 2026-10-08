const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const modelsToTest = ["gemini-3.8-flash", "gemini-3.8-flash-lite"];
  const prompt = "Write a React component for a cafe landing page.";
  
  for (const m of modelsToTest) {
      console.log(`\nTesting ${m}...`);
      try {
        const model = genAI.getGenerativeModel({ 
            model: m,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ]
        });
        const result = await model.generateContent(prompt);
        console.log(`Success with ${m}! Output length: ${result.response.text().length}`);
        return; // Stop on first success
      } catch (error) {
        console.error(`Error with ${m}:`, error.message);
      }
  }
}

run();
