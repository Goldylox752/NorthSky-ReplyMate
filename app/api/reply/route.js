import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export async function POST(request) {
  try {
    const { message, tone = "Natural" } = await request.json();
    if (!message || !message.trim()) {
      return Response.json(
        { error: "Please enter a message." },
        { status: 400 }
      );
    }
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "OPENAI_API_KEY is missing." },
        { status: 500 }
      );
    }
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content:
            "You are a helpful dating conversation assistant. Create natural, respectful replies that sound like a real person. The user will review and send the reply themselves.",
        },
        {
          role: "user",
          content: `
Create exactly 3 different reply options.
Tone: ${tone}
Incoming message:
${message}
Requirements:
- Natural and conversational
- Match the energy of the message
- Keep each reply reasonably short
- Avoid cheesy pickup lines
- Do not be overly sexual
- Do not manipulate or deceive
- Make all 3 options noticeably different
Return ONLY valid JSON:
{
  "replies": [
    "reply 1",
    "reply 2",
    "reply 3"
  ]
}
`,
        },
      ],
    });
    const text = response.output_text;
    if (!text) {
      throw new Error("No response was returned by the AI.");
    }
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      const cleaned = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      data = JSON.parse(cleaned);
    }
    if (!Array.isArray(data.replies)) {
      throw new Error("Invalid reply format returned by AI.");
    }
    return Response.json({
      replies: data.replies.slice(0, 3),
    });
  } catch (error) {
    console.error("Dating Reply API Error:", error);
    return Response.json(
      {
        error: error?.message || "Failed to generate replies.",
      },
      { status: 500 }
    );
  }
}