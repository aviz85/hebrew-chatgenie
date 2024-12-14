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
import SettingsDialog from "@/components/SettingsDialog";

interface Message {
  role: "user" | "model";
  content: string;
}

// You can replace this with your API key for testing
const HARDCODED_API_KEY = "AIzaSyCAUPJ55jlcwjGufOZACvEpVgdfVapRT_I"

const formatMessagesForAPI = (messages: Message[]) => {
  return messages.map(msg => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }]
  })).slice(-10);
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
    // Common rate limit indicators from Gemini API
    const isRateLimit = 
      error?.message?.toLowerCase?.().includes('quota') ||
      error?.message?.toLowerCase?.().includes('rate limit') ||
      error?.message?.toLowerCase?.().includes('429') ||
      error?.status === 429 || // HTTP 429 Too Many Requests
      error?.details?.some?.((d: any) => 
        d?.reason === 'RATE_LIMIT_EXCEEDED' || 
        d?.reason === 'QUOTA_EXCEEDED'
      );
                       
    toast({
      title: isRateLimit ? "מגבלת שימוש" : "שגיאה",
      description: isRateLimit 
        ? "הגעת למגבלת השימוש היומית. אנא הכנס מפתח API משלך"
        : `שגיאה: ${error?.message || 'לא הצלחנו לקבל תשובה מ-Gemini'}`,
      variant: "destructive",
      action: isRateLimit ? (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            setApiKey(null);
            localStorage.removeItem("GEMINI_API_KEY");
          }}
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
      
      // Configure the model with all settings
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
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE",
          },
        ],
      });

      const chat = model.startChat({
        history: formatMessagesForAPI(messages),
        // Move system instruction into chat config
        generationConfig: {
          maxOutputTokens: 1000,
        },
        safetySettings: model.safetySettings,
      });

      // Start with empty response
      let fullResponse = "";
      setMessages((prev) => [...prev, { role: "model", content: "" }]);

      // Stream the response
      const result = await chat.sendMessageStream([{ text: input }]);
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        
        // Update the last message with accumulated response
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "model", content: fullResponse }
        ]);
      }

      inputRef.current?.focus();
    } catch (error) {
      handleApiKeyError(error);
      console.error("Error:", error);
      // Remove the empty model message if there was an error
      setMessages((prev) => prev.slice(0, -1));
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
            <SettingsDialog 
              onApiKeySet={setApiKey} 
              currentApiKey={apiKey} 
            />
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