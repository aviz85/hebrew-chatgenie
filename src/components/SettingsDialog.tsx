import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface SettingsDialogProps {
  onApiKeySet: (key: string) => void;
  currentApiKey: string | null;
}

const SettingsDialog = ({ onApiKeySet, currentApiKey }: SettingsDialogProps) => {
  const [apiKey, setApiKey] = useState(currentApiKey || "");
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem("GEMINI_API_KEY", apiKey);
      onApiKeySet(apiKey);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>הגדרות</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="apiKey">מפתח API של Gemini</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="הכנס מפתח API..."
              className="text-right"
            />
          </div>
          <Button onClick={handleSave} disabled={!apiKey.trim()}>
            שמור
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog; 