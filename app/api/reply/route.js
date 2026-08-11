import { GoogleGenAI, Type } from "@google/genai";
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
export async function POST(request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "GEMINI_API_KEY is missing." },
        { status: 500 }
      );
    }
    const { message, tone = "Natural" } = await request.json();
    if (!message || !message.trim()) {
      return Response.json(
        { error: "Please enter a message." },
        { status: 400 }
      );
    }
    const prompt = `
You are a dating conversation assistant.
Create exactly 3 different reply options for the message below.
Tone: ${tone}
Incoming message:
"${message.trim()}"
Requirements:
- Sound natural and human.
- Match the energy of the incoming message.
- Keep replies reasonably short.
- Avoid cheesy pickup lines.
- Do not sound robotic.
- Do not be manipulative or deceptive.
- Do not pressure the other person.
- Do not be overly sexual.
- Make all 3 replies noticeably different.
`;
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        temperature: 0.9,
        maxOutputTokens: 500,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replies: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
          },
          required: ["replies"],
        },
      },
    });
    const text = response.text;
    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }
    const data = JSON.parse(text);
    if (!Array.isArray(data.replies)) {
      throw new Error("Invalid response format from Gemini.");
    }
    const replies = data.replies
      .filter((reply) => typeof reply === "string")
      .map((reply) => reply.trim())
      .filter(Boolean)
      .slice(0, 3);
    if (replies.length === 0) {
      throw new Error("Gemini did not generate any replies.");
    }
    return Response.json({
      success: true,
      replies,
    });
  } catch (error) {
    console.error("Dating Reply API Error:", error);
    return Response.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to generate replies.",
      },
      { status: 500 }
    );
  }
}