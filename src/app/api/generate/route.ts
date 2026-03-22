import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { input, contractType } = await req.json();
    if (!input?.trim()) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    const contractGuides: Record<string, string> = {
      NDA: "Non-Disclosure Agreement: Mutual or one-way confidentiality. Include definition of confidential information, obligations of receiving party, exclusions, term, and remedies.",
      MSA: "Master Service Agreement: Framework contract. Include scope of services, payment terms, intellectual property, confidentiality, termination, and liability clauses.",
      SOW: "Statement of Work: Project-specific scope under MSA. Include deliverables, timeline, milestones, acceptance criteria, and change order process.",
      Employment: "Employment Agreement: Include role, compensation, benefits, at-will status, duties, confidentiality, non-compete, and termination.",
      Consulting: "Consulting Agreement: Independent contractor terms. Include scope, deliverables, compensation, IP ownership, confidentiality, and termination.",
      Partnership: "Partnership Agreement: Include profit/loss sharing, roles, capital contributions, decision-making, and exit provisions.",
    };

    const guide = contractGuides[contractType] || contractGuides.NDA;

    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are an expert commercial lawyer. Generate a professional, complete ${contractType} contract from the provided details.\n\nKey requirements for ${contractType}:\n${guide}\n\nInclude:\n- Proper legal heading and parties section\n- All standard clauses relevant to this contract type\n- Clear, enforceable language\n- Appropriate boilerplate (force majeure, governing law, entire agreement, amendment)\n- Signature blocks\n\nIMPORTANT: This is a DRAFT for review. Include a disclaimer that it should be reviewed by qualified legal counsel before use.\n\nFormat with clear section numbers and headings.`,
        },
        { role: "user", content: `Generate a ${contractType}:\n\n${input}` },
      ],
      temperature: 0.5,
      max_tokens: 3000,
    });

    const result = response.choices[0]?.message?.content || "No result generated.";
    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Generation failed" }, { status: 500 });
  }
}
