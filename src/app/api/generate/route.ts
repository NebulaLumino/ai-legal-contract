import { NextRequest, NextResponse } from "next/server";

function getClient() {
  const OpenAI = require("openai");
  return new OpenAI({ baseURL: "https://api.deepseek.com/v1", apiKey: process.env.DEEPSEEK_API_KEY });
}

export async function POST(req: NextRequest) {
  try {
    const { input, contractType } = await req.json();
    if (!input?.trim()) return NextResponse.json({ error: "Input is required" }, { status: 400 });
    const client = getClient();
    const guides: Record<string, string> = {
      NDA: "Non-Disclosure Agreement: Include definition of confidential information, obligations, exclusions, term, and remedies.",
      MSA: "Master Service Agreement: Include scope of services, payment terms, IP, confidentiality, termination, and liability clauses.",
      SOW: "Statement of Work: Include deliverables, timeline, milestones, acceptance criteria, and change order process.",
      Employment: "Employment Agreement: Include role, compensation, benefits, at-will status, duties, confidentiality, non-compete, and termination.",
      Consulting: "Consulting Agreement: Include scope, deliverables, compensation, IP ownership, confidentiality, and termination.",
      Partnership: "Partnership Agreement: Include profit/loss sharing, roles, capital contributions, decision-making, and exit provisions.",
    };
    const guide = guides[contractType] || guides.NDA;
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: `You are an expert commercial lawyer. Generate a professional, complete ${contractType} contract. Key requirements:\n${guide}\n\nInclude proper legal heading, all standard clauses, clear enforceable language, boilerplate (force majeure, governing law, entire agreement, amendment), and signature blocks. Include a disclaimer that this is a DRAFT for legal counsel review.` },
        { role: "user", content: `Generate a ${contractType}:\n\n${input}` },
      ],
      temperature: 0.5, max_tokens: 3000,
    });
    return NextResponse.json({ result: response.choices[0]?.message?.content || "No result generated." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Generation failed" }, { status: 500 });
  }
}
