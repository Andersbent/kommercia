import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Helper function to generate leads via GPT
export async function generateLeads(prompt: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message?.content || "";
}

export default openai;
