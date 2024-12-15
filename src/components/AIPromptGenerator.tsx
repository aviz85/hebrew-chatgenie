import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { cn } from "@/lib/utils";
import { generateCharacterDescription } from "@/lib/ai";

interface AIPromptGeneratorProps {
  label: string;
  currentText: string;
  onGenerated: (text: string) => void;
  apiKey: string;
  className?: string;
}

export function AIPromptGenerator({ label, currentText, onGenerated, apiKey, className }: AIPromptGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Debug: Log props changes
  useEffect(() => {
    console.log('AIPromptGenerator props changed:', {
      label,
      apiKey: apiKey ? `${apiKey.slice(0, 5)}...${apiKey.slice(-5)}` : 'none',
      apiKeyLength: apiKey?.length,
      hasApiKey: Boolean(apiKey),
      isGenerating,
      isDisabled: !apiKey || !label || isGenerating
    });
  }, [label, apiKey, isGenerating]);

  const handleGenerate = async () => {
    console.log("API Key in AIPromptGenerator:", apiKey);
    if (!apiKey) {
      console.error("No API key provided");
      return;
    }

    try {
      const description = await generateCharacterDescription(label, apiKey);
      if (description) {
        onGenerated(description);
      }
    } catch (error) {
      console.error("Error generating description:", error);
    }
  };

  // Debug: Log whenever isDisabled changes
  const isDisabled = !apiKey || !label || isGenerating;
  useEffect(() => {
    console.log('Button disabled state changed:', {
      isDisabled,
      noApiKey: !apiKey,
      apiKeyEmpty: apiKey === '',
      apiKeyUndefined: apiKey === undefined,
      apiKeyNull: apiKey === null,
      apiKeyLength: apiKey?.length,
      noLabel: !label,
      isGenerating
    });
  }, [isDisabled, apiKey, label, isGenerating]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "hover:bg-accent/50 transition-colors h-8 w-8",
        isDisabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={handleGenerate}
      disabled={isDisabled}
    >
      <Sparkles className="h-4 w-4" />
    </Button>
  );
} 