import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2, Settings, Download } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";
import ApiKeyForm from "@/components/ApiKeyForm";
import ChatbotPresets from "@/components/ChatbotPresets";
import { PRESET_INSTRUCTIONS } from "@/components/ChatbotPresets";
import SettingsDialog from "@/components/SettingsDialog";

interface Message {
  role: "user" | "model";
  content: string;
  parts: { text: string }[];
}

// You can replace this with your API key for testing
const HARDCODED_API_KEY = "AIzaSyCAUPJ55jlcwjGufOZACvEpVgdfVapRT_I"

const formatMessagesForAPI = (messages: Message[]) => {
  return messages.map(msg => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }]
  }));
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

  // Add useEffect to focus input when preset changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentPreset]); // Focus when preset changes

  // Add useEffect for preset changes
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [currentPreset]);

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

    const userMessage: Message = { 
      role: "user",
      content: input,
      parts: [{ text: input }]
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(effectiveApiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        systemInstruction: PRESET_INSTRUCTIONS[currentPreset as keyof typeof PRESET_INSTRUCTIONS],
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
        history: messages.slice(-10).map(msg => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      let fullResponse = "";
      const emptyMessage: Message = { 
        role: "model", 
        content: "",
        parts: [{ text: "" }]
      };
      setMessages((prev) => [...prev, emptyMessage]);

      const result = await chat.sendMessageStream([{ text: input }]);
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          fullResponse += chunkText;
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: "model",
              content: fullResponse,
              parts: [{ text: fullResponse }]
            };
            return newMessages;
          });
        }
      }

      inputRef.current?.focus();
    } catch (error) {
      handleApiKeyError(error);
      console.error("Error:", error);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  const handlePresetChange = (preset: string) => {
    setCurrentPreset(preset);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleExport = () => {
    const conversation = messages.map(msg => {
      const role = msg.role === "user" ? "שאלה" : "תשובה";
      return `${role}:\n${msg.content}\n\n`;
    }).join('');
    
    const blob = new Blob([conversation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conversation.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-3xl mx-auto">
        {!HARDCODED_API_KEY && !apiKey && <ApiKeyForm onApiKeySet={setApiKey} />}
        
        <Card className="mb-4 p-4 h-[calc(100vh-2rem)]">
          <div className="flex justify-between items-center mb-4">
            <ChatbotPresets onPresetChange={handlePresetChange} />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleExport}
                title="ייצא שיחה"
                disabled={messages.length === 0}
              >
                <Download className="h-4 w-4" />
              </Button>
              <SettingsDialog 
                onApiKeySet={setApiKey} 
                currentApiKey={apiKey} 
              />
            </div>
          </div>
          <div className="space-y-4 mb-4 h-[calc(100vh-12rem)] overflow-y-auto" dir="rtl">
            {messages.map((message, index) => (
              <ChatMessage 
                key={index} 
                message={message} 
                isLoading={isLoading && index === messages.length - 1}
              />
            ))}
            <div ref={messagesEndRef} />
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