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
    
    הדמות צריכה לשקף את הכותרת "${label}" באופן עקבי.
    
    חשוב: זוהי דמות צ'אטבוט, ולכן:
    - הסגנון צריך להיות קצר, שיחתי וטבעי
    - יש לשלב אימוג'ים מתאימים לאופי הדמות
    - אפשר להשתמש בקיצורים וסלנג שנהוגים בצ'אטים
    - הטון צריך להיות ידידותי ונגיש
    
    התיאור צריך להיות בגוף ראשון, להסביר מי אני, איך אני מדבר, ומה מאפיין אותי.
    אורך התיאור: 2-3 משפטים.`;

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