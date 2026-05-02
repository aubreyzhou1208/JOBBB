import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{
      role: "user",
      content: [
        {
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: base64 },
        },
        {
          type: "text",
          text: `从这份简历中提取所有信息，返回严格的 JSON，不要任何其他文字。

返回格式：
{
  "fullName": "姓名",
  "fullNameEn": "English name if present",
  "email": "邮箱",
  "phone": "电话",
  "wechat": "微信号，没有则null",
  "linkedin": "LinkedIn URL，没有则null",
  "github": "GitHub URL，没有则null",
  "hometown": "籍贯，没有则null",

  "education": [{
    "school": "学校名",
    "major": "专业",
    "degree": "本科/硕士/博士/MBA",
    "graduationYear": "毕业年份 YYYY",
    "gpa": "GPA数值，没有则null",
    "gpaTotal": "满分，如4.0，没有则null",
    "rank": "排名，如3/120，没有则null",
    "courses": "主要课程，没有则null"
  }],

  "toefl": "托福分数，没有则null",
  "ielts": "雅思分数，没有则null",
  "gre": "GRE分数，没有则null",
  "gmat": "GMAT分数，没有则null",
  "cet4": "四级分数，没有则null",
  "cet6": "六级分数，没有则null",

  "internships": [{
    "company": "公司名",
    "role": "职位",
    "startDate": "YYYY-MM",
    "endDate": "YYYY-MM 或 至今",
    "location": "城市，没有则null",
    "description": "工作内容，保留原文"
  }],

  "skills": ["技能1", "技能2"],

  "certifications": [{
    "name": "证书名，如CFA Level 1",
    "score": "分数，没有则null",
    "date": "获得时间，没有则null"
  }],

  "awards": [{
    "name": "奖项名称",
    "issuer": "颁发机构，没有则null",
    "date": "获奖时间，没有则null",
    "description": "描述，没有则null"
  }],

  "publications": [{
    "title": "论文题目",
    "journal": "期刊/会议，没有则null",
    "date": "发表时间，没有则null",
    "description": "摘要，没有则null"
  }],

  "activities": [{
    "organization": "组织名",
    "role": "职位",
    "startDate": "开始时间，没有则null",
    "endDate": "结束时间，没有则null",
    "description": "内容描述"
  }],

  "selfIntro": "如果有自我介绍段落则提取，没有则null",
  "hobbies": "兴趣爱好，没有则null"
}`
        }
      ]
    }]
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "{}";
  const jsonMatch = text.match(/\{[\s\S]+\}/);
  if (!jsonMatch) return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ ok: true, profile: parsed });
  } catch {
    return NextResponse.json({ error: "Invalid JSON from Claude" }, { status: 500 });
  }
}
