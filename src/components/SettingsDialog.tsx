import { useState, useEffect } from "react";
import { Settings, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePresetsStore, type CustomPreset } from "@/store/presets";
import { cn } from "@/lib/utils";

interface SettingsDialogProps {
  onApiKeySet: (key: string) => void;
  currentApiKey: string | null;
}

const SettingsDialog = ({ onApiKeySet, currentApiKey }: SettingsDialogProps) => {
  const [apiKey, setApiKey] = useState(currentApiKey || "");
  const [open, setOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<CustomPreset | null>(null);
  const [newPresetLabel, setNewPresetLabel] = useState("");
  const [newPresetInstruction, setNewPresetInstruction] = useState("");

  const { presets, loadPresets, addPreset, updatePreset, deletePreset } = usePresetsStore();

  useEffect(() => {
    if (open) {
      loadPresets();
    }
  }, [open, loadPresets]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem("GEMINI_API_KEY", apiKey);
      onApiKeySet(apiKey);
      setOpen(false);
    }
  };

  const handleAddPreset = async () => {
    if (!newPresetLabel || !newPresetInstruction) return;

    const newPreset: CustomPreset = {
      id: editingPreset?.id || `custom_${Date.now()}`,
      label: newPresetLabel,
      instruction: newPresetInstruction,
    };

    if (editingPreset) {
      await updatePreset(newPreset);
    } else {
      await addPreset(newPreset);
    }

    setNewPresetLabel("");
    setNewPresetInstruction("");
    setEditingPreset(null);
  };

  const handleEditPreset = (preset: CustomPreset) => {
    setEditingPreset(preset);
    setNewPresetLabel(preset.label);
    setNewPresetInstruction(preset.instruction);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">הגדרות</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="api" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="api">מפתח API</TabsTrigger>
            <TabsTrigger value="mentors">מנטורים מותאמים אישית</TabsTrigger>
          </TabsList>

          {/* API Key Tab */}
          <TabsContent value="api" className="mt-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="apiKey">מפתח API של Gemini</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="הכנס מפתח API..."
                  className="mt-1.5"
                />
              </div>
              <Button onClick={handleSave} disabled={!apiKey.trim()} className="w-full">
                שמור
              </Button>
            </div>
          </TabsContent>

          {/* Mentors Tab */}
          <TabsContent value="mentors" className="mt-4">
            <div className="grid grid-cols-[280px,1fr] gap-6">
              {/* Mentors List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>המנטורים שלי</Label>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setEditingPreset(null);
                      setNewPresetLabel("");
                      setNewPresetInstruction("");
                    }}
                    disabled={!editingPreset}
                  >
                    + חדש
                  </Button>
                </div>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-2">
                    {presets.map((preset) => (
                      <div 
                        key={preset.id} 
                        className={cn(
                          "group flex items-center justify-between p-2 rounded-md cursor-pointer",
                          "hover:bg-accent/50 transition-colors",
                          editingPreset?.id === preset.id && "bg-accent"
                        )}
                        onClick={() => handleEditPreset(preset)}
                      >
                        <span className="font-medium truncate">{preset.label}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePreset(preset.id);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Edit Form */}
              <div className="space-y-4">
                <div>
                  <Label>שם המנטור</Label>
                  <Input
                    value={newPresetLabel}
                    onChange={(e) => setNewPresetLabel(e.target.value)}
                    placeholder="תן שם למנטור..."
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>הנחיות למנטור</Label>
                  <Textarea
                    value={newPresetInstruction}
                    onChange={(e) => setNewPresetInstruction(e.target.value)}
                    placeholder="כתוב כאן את ההנחיות למנטור - איך הוא צריך להתנהג ולדבר..."
                    className="mt-1.5 h-[280px] resize-none"
                  />
                </div>
                <Button 
                  onClick={handleAddPreset} 
                  disabled={!newPresetLabel || !newPresetInstruction}
                  className="w-full"
                >
                  {editingPreset ? "שמור שינויים" : "צור מנטור"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog; 