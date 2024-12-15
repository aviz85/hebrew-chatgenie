import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export async function generateCharacterDescription(label: string, apiKey: string) {
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });

    const prompt = `צור תיאור מפורט בעברית לדמות צ'אטבוט בשם "${label}".
    
    הדמות צריכה:
    - לדבר בעברית תקנית
    - להיות עקבית באופי שלה
    - להיות מעניינת ומיוחדת
    - לשמור על טון דיבור וסגנון התואמים את הדמות
    
    התיאור צריך להיות בגוף ראשון ולהסביר:
    - מי אני
    - איך אני מדבר
    - מה מאפיין אותי
    - מה הידע והניסיון שלי
    - איך אני מתנהג ומגיב
    
    אורך התיאור: 3-5 משפטים.`;

    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Failed to generate character description:', error);
    return null;
  }
} 