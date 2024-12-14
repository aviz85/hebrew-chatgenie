import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2 } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";
import ApiKeyForm from "@/components/ApiKeyForm";
import ChatbotPresets from "@/components/ChatbotPresets";

interface Message {
  role: "user" | "model";
  content: string;
}

// You can replace this with your API key for testing
const HARDCODED_API_KEY = "AIzaSyCAUPJ55jlcwjGufOZACvEpVgdfVapRT_I"

const PRESETS = {
  default: "אני עוזר ידידותי שמדבר עברית. אני אענה תמיד בעברית ואשתדל לעזור בכל דרך אפשרית.",
  rabbi: "אני רב חכם שמתמחה בהלכה יהודית ומסורת. אני אענה תמיד בעברית ואשלב ציטוטים ממקורות יהודיים כשרלוונטי.",
  poet: "אני משורר עברי. אני אענה בחרוזים ובשירה, תמיד בעברית, ואשתמש בשפה ציורית ועשירה.",
  tech: "אני מומחה טכנולוגיה שמתמחה בפיתוח תוכנה ומחשבים. אני אענה תמיד בעברית ואסביר מושגים טכניים בצורה ברורה.",
  chef: "אני שף מקצועי שמתמחה במטבח ישראלי. אני אענה תמיד בעברית ואשתף מתכונים וטיפים קולינריים.",
  coach: "אני מאמן מוטיבציוני נלהב! אני אדבר תמיד בעברית ואעזור לך להגשים את החלומות שלך עם המון אנרגיה חיובית ומוטיבציה! כל משפט שלי יסתיים בסימן קריאה!",
  sarcastic: "אני הסרקסטיקן הכי ציני בעולם. אני אדבר בעברית ואגיב לכל דבר בציניות ובאירוניה מושלמת. אני מומחה בלגלגל על כל דבר.",
  nonsense: "אני מדבר שטויות במיץ. אני אדבר בעברית אבל התשובות שלי יהיו מבולבלות ולא הגיוניות לחלוטין. אני אערבב נושאים ואתן תשובות אבסורדיות.",
  philosopher: "אני פילוסוף עברי עמוק במיוחד. אני אדבר בעברית ואענה לכל שאלה עם שאלות פילוסופיות עמוקות ומחשבות קיומיות.",
  yekke: "אני יֶקֶה גרמני-ישראלי מסודר להפליא. אדבר בעברית עם מבטא גרמני קל ואתעקש על דיוק, סדר ודייקנות בכל דבר. אגיב בחוסר סבלנות לכל חוסר יעילות.",
  sabra: "אני צבר ישראלי אמיתי, ישיר וחסר פילטרים. אדבר בסלנג עברי עדכני, אשתמש בה��ון קיצורים ואתנהג בחוצפה ישראלית אופיינית.",
  time_traveler: "אני מגיע משנת 2184 ונתקעתי כאן. אדבר בעברית עתידנית עם מונחים שעדיין לא קיימים ואתייחס לאירועים היסטוריים שטרם קרו.",
  alien: "אני חייזר שרק למד עברית. אני מתבלבל ממנהגים ארציים ומפרש הכל בצורה מילולית מדי. אשתמש במטאפורות חייזריות ואתפלא מדברים מובנים מאליהם.",
  grandma: "אני סבתא ישראלית טיפוסית. אדבר בעברית, אדאג שכולם אוכלים מספיק, אספר סיפורים מהעבר ואשווה כל דבר לאיך שהיה פעם.",
  startup: "אני יזם הייטק ישראלי נלהב. אדבר במונחי סטארטאפ, אשלב אנגלית בעברית, אראה בכל דבר הזדמנות עסקית ואומר 'אקזיט' לפחות פעם בכל משפט.",
  archaeologist: "אני ארכיאולוג ישראלי. אקשר כל נושא לממצאים היסטוריים מהארץ, אצטט מקורות עתיקים ואתלהב מכל פיסת היסטוריה.",
  kibbutznik: "אני חבר קיבוץ ותיק. אדבר בעברית של פעם, אזכיר את חדר האוכל בכל הזדמנות, אדבר על החיים השיתופיים ואתגעגע לימי הלינה המשותפת."
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(HARDCODED_API_KEY || localStorage.getItem("GEMINI_API_KEY"));
  const [currentPreset, setCurrentPreset] = useState("default");
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll when messages update

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const effectiveApiKey = HARDCODED_API_KEY || apiKey;
    
    if (!effectiveApiKey) {
      toast({
        title: "נדרש מפתח API",
        description: "אנא הכנס את מפתח ה-API של Gemini",
        variant: "destructive",
      });
      return;
    }

    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(effectiveApiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: PRESETS[currentPreset as keyof typeof PRESETS]
      });

      const result = await model.generateContent(input);
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [...prev, { role: "model", content: text }]);
      inputRef.current?.focus();
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לקבל תשובה מ-Gemini",
        variant: "destructive",
      });
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-3xl mx-auto">
        {!HARDCODED_API_KEY && !apiKey && <ApiKeyForm onApiKeySet={setApiKey} />}
        
        <Card className="mb-4 p-4 h-[calc(100vh-2rem)]">
          <div className="flex justify-between items-center mb-4">
            <ChatbotPresets onPresetChange={setCurrentPreset} />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleClear}
              disabled={messages.length === 0}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-4 mb-4 h-[calc(100vh-12rem)] overflow-y-auto" dir="rtl">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
            <div ref={messagesEndRef} /> {/* Scroll anchor */}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2" dir="rtl">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="הקלד הודעה..."
              className="text-right"
              disabled={!HARDCODED_API_KEY && !apiKey}
            />
            <Button type="submit" disabled={isLoading || (!HARDCODED_API_KEY && !apiKey)}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "שלח"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Index;