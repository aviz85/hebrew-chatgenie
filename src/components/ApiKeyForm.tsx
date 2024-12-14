import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface ApiKeyFormProps {
  onApiKeySet: (key: string) => void;
}

const ApiKeyForm = ({ onApiKeySet }: ApiKeyFormProps) => {
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem("GEMINI_API_KEY", apiKey);
      onApiKeySet(apiKey);
    }
  };

  return (
    <Card className="p-6 mb-4">
      <h2 className="text-xl font-semibold mb-4 text-right">הגדרת מפתח API</h2>
      <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
        <div>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="הזן את מפתח ה-API של Gemini שלך"
            className="text-right"
          />
        </div>
        <Button type="submit" className="w-full">
          שמור מפתח
        </Button>
      </form>
    </Card>
  );
};

export default ApiKeyForm;