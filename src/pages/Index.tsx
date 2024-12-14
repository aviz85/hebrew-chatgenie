import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";
import ApiKeyForm from "@/components/ApiKeyForm";

interface Message {
  role: "user" | "model";
  content: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem("GEMINI_API_KEY"));
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key first",
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
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(input);
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [...prev, { role: "model", content: text }]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from Gemini",
        variant: "destructive",
      });
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-3xl mx-auto">
        {!apiKey && <ApiKeyForm onApiKeySet={setApiKey} />}
        
        <Card className="mb-4 p-4">
          <div className="space-y-4 mb-4 max-h-[60vh] overflow-y-auto" dir="rtl">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2" dir="rtl">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="הקלד הודעה..."
              className="text-right"
              disabled={isLoading || !apiKey}
            />
            <Button type="submit" disabled={isLoading || !apiKey}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "שלח"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Index;