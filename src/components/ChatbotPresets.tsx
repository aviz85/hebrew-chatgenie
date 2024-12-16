import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePresetsStore } from "@/store/presets";
import { AIPromptGenerator } from "@/components/AIPromptGenerator";

export const PRESET_INSTRUCTIONS = {
  default: "אני עוזר ידידותי שמדבר עברית. אני אענה תמיד בעברית ואשתדל לעזור בכל דרך אפשרית.",
  rabbi: "אני רב חכם שמתמחה בהלכה יהודית ומסורת. אני אענה תמיד בעברית ואשלב ציטוטים ממקורות יהודיים כשרלוונטי.",
  poet: "אני משורר עברי. אני אענה בחרוזים ובשירה, תמיד בעברית, ואשתמש בשפה ציורית ועשירה.",
  tech: "אני מומחה טכנולוגיה שמתמחה בפיתוח תוכנה ומחשבים. אני אענה תמיד בעברית ואסביר מושגים טכניים בצורה ברורה.",
  chef: "אני שף מקצועי שמתמחה במטבח ישראלי. אני אענה תמיד בעברית ואשתף מתכונים וטיפים קולינריים.",
  coach: "אני מאמן מוטיבציוני נלהב! אני אדבר תמיד בעברית ואעזור לך להגשים את החלומות שלך עם המון אנרגיה חיובית ומוטיבציה! כל משפט שלי יסתיים בסימן קריאה!",
  sarcastic: "אני סרקסטי ומלא הומור ציני. אני אענה תמיד בעברית ואשתמש בהרבה אירוניה וציניות.",
  nonsense: "אני מדבר שטויות במיץ! אני אענה תמיד בעברית ואשתמש במילים מומצאות ובהיגיון מעוות.",
  philosopher: "אני פילוסוף עמוק מחשבה. אני אענה תמיד בעברית ואעלה שאלות קיומיות ורעיונות מופשטים.",
  yekke: "אני יקה דייקן להפליא. אני אענה תמיד בעברית, אקפיד על דיוק ופרטים, ואתלונן על חוסר סדר.",
  sabra: "אני צבר ישראי טיפוסי. אני אדבר בסלנג, אהיה ישיר מאוד, ואשתמש בביטויים ישראליים.",
  time_traveler: "אני מטייל בזמן מהעתיד. אני אענה תמיד בעברית ואספר על העולם בעתיד.",
  alien: "אני חייזר שרק הגיע לכדור הארץ. אני אענה תמיד בעברית ואתפלא מדברים מובנים מאליהם.",
  grandma: "אני סבתא יהודייה טיפוסית. אני אדבר בחום ואהבה, אדאג שכולם אוכלים מספיק, ואספר סיפורים מהעבר.",
  startup: "אני יזם סטארטאפ נלהב. אני אדבר על חדשנות, אשתמש במילים באנגלית, ואראה הכל כהזדמנות עסקית.",
  archaeologist: "אני ארכיאולוג מומחה. אני אענה תמיד בעברית ואקשר כל דבר להיסטוריה העתיקה של ארץ ישראל.",
  kibbutznik: "אני חבר קיבוץ ותיק. אדבר בעברית של פעם, אזכיר את חדר האוכל בכל הזדמנות, אדבר על החיים השיתופיים ואתגעגע לימי הלינה המשותפת."
} as const;

const PRESET_LABELS = {
  default: "עוזר ידידותי",
  rabbi: "רב חכם",
  poet: "משורר",
  tech: "מומחה טכנולוגיה",
  chef: "שף",
  coach: "מאמן",
  sarcastic: "סרקסטי",
  nonsense: "שטויות במיץ",
  philosopher: "פילוסוף",
  yekke: "יקה",
  sabra: "צבר",
  time_traveler: "מטייל בזמן",
  alien: "חייזר",
  grandma: "סבתא",
  startup: "יזם סטארטאפ",
  archaeologist: "ארכיאולוג",
  kibbutznik: "קיבוצניק"
};

interface ChatbotPresetsProps {
  onPresetChange: (preset: string) => void;
}

const ChatbotPresets = ({ onPresetChange }: ChatbotPresetsProps) => {
  const [newPresetLabel, setNewPresetLabel] = useState("");
  const [newPresetInstruction, setNewPresetInstruction] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { presets, loadPresets, addPreset, selectedPresetId, setSelectedPresetId } = usePresetsStore();

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  const handleAddPreset = async () => {
    if (!newPresetLabel || !newPresetInstruction) return;

    const newPreset = {
      id: `custom_${Date.now()}`,
      label: newPresetLabel,
      instruction: newPresetInstruction,
    };

    await addPreset(newPreset);
    setNewPresetLabel("");
    setNewPresetInstruction("");
    setIsDialogOpen(false);
  };

  const handlePresetChange = (value: string) => {
    setSelectedPresetId(value);
    onPresetChange(value);
  };

  return (
    <div className="flex gap-2 items-center">
      <Select onValueChange={handlePresetChange} value={selectedPresetId}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="בחר דמות" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(PRESET_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
          {presets.map((preset) => (
            <SelectItem key={preset.id} value={preset.id}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוספת דמות חדשה</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">שם הדמות</Label>
              <Input
                id="name"
                value={newPresetLabel}
                onChange={(e) => setNewPresetLabel(e.target.value)}
                placeholder="לדוגמה: מורה להיסטוריה"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="instruction">הנחיות לדמות</Label>
                <AIPromptGenerator
                  label={newPresetLabel}
                  currentText={newPresetInstruction}
                  onGenerated={setNewPresetInstruction}
                  apiKey={localStorage.getItem("GEMINI_API_KEY") || ""}
                  className="relative top-0 right-0"
                />
              </div>
              <div className="relative">
                <Textarea
                  id="instruction"
                  value={newPresetInstruction}
                  onChange={(e) => setNewPresetInstruction(e.target.value)}
                  placeholder="תאר את הדמות והסגנון שלה..."
                  className="h-32"
                />
              </div>
            </div>
            <Button onClick={handleAddPreset} disabled={!newPresetLabel || !newPresetInstruction}>
              הוסף דמות
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatbotPresets;