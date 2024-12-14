import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2 } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";
import ApiKeyForm from "@/components/ApiKeyForm";
import ChatbotPresets from "@/components/ChatbotPresets";
import { PRESET_INSTRUCTIONS } from "@/components/ChatbotPresets";

interface Message {
  role: "user" | "model";
  content: string;
}

// You can replace this with your API key for testing
const HARDCODED_API_KEY = "AIzaSyCAUPJ55jlcwjGufOZACvEpVgdfVapRT_I"

const formatMessagesForAPI = (messages: Message[]) => {
  return messages.map(msg => ({
    role: msg.role === "user" ? "user" : "model",
    parts: msg.content
  })).slice(-10); // Keep last 10 messages for context window
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

  const handleApiKeyError = (error: any) => {
    // Check for rate limit error in the error message
    const isRateLimit = error?.message?.includes?.('quota') || 
                       error?.message?.includes?.('rate limit') ||
                       error?.message?.includes?.('429');
                       
    toast({
      title: "שגיאה",
      description: isRateLimit 
        ? "הגעת למגבלת השימוש. אנא הכנס מפתח API משלך"
        : "לא הצלחנו לקבל תשובה מ-Gemini",
      variant: "destructive",
      action: isRateLimit && !apiKey ? (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setApiKey(null)}
        >
          הכנס מפתח API
        </Button>
      ) : undefined
    });
  };

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
        model: "gemini-2.0-flash-exp",
        systemInstruction: PRESET_INSTRUCTIONS[currentPreset as keyof typeof PRESET_INSTRUCTIONS]
      });

      const chat = model.startChat({
        history: formatMessagesForAPI(messages),
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      const result = await chat.sendMessage(input);
      const text = result.response.text();

      setMessages((prev) => [...prev, { role: "model", content: text }]);
      inputRef.current?.focus();
    } catch (error) {
      handleApiKeyError(error);
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
            <Button 
              variant="destructive"
              type="button"
              onClick={handleClear}
              disabled={messages.length === 0}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
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