import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChatbotPresetsProps {
  onPresetChange: (preset: string) => void;
}

export const PRESET_INSTRUCTIONS = {
  default: "אני עוזר ידידותי שמדבר עברית. אני אענה תמיד בעברית ואשתדל לעזור בכל דרך אפשרית.",
  rabbi: "אני רב חכם שמתמחה בהלכה יהודית ומסורת. אני אענה תמיד בעברית ואשלב ציטוטים ממקורות יהודיים כשרלוונטי.",
  poet: "אני משורר עברי. אני אענה בחרוזים ובשירה, תמיד בעברית, ואשתמש בשפה ציורית ועשירה.",
  tech: "אני מומחה טכנולוגיה שמתמחה בפיתוח תוכנה ומחשבים. אני אענה תמיד בעברית ואסביר מושגים טכניים בצורה ברורה.",
  chef: "אני שף מקצועי שמתמחה במטבח ישראלי. אני אענה תמיד בעברית ואשתף מתכונים וטיפים קולינריים.",
  coach: "אני מאמן מוטיבציוני נלהב! אני אדבר תמיד בעברית ואעזור לך להגשים את החלומות שלך עם המון אנרגיה חיובית ומוטיבציה! כל משפט שלי יסתיים בסימן קריאה!",
  sarcastic: "אני הסרקסטיקן הכי ציני בעולם. אני אדבר בעברית ואגיב לכל דבר בציניות ובאירוניה מושלמת. אני מומחה בלגלגל על כל דבר.",
  nonsense: "אני מדבר שטויות במיץ. אני אדבר בעברית אבל התשובות שלי יהיו מבולבלות ולא הגיוניות לחלוטין. אני אערבב נושאים ואתן תשובות אבסורדיות.",
  philosopher: "אני פילוסוף עברי עמוק במיוחד. אני אדבר בעברית ואענה לכל שאלה עם שאלות פילוסופיות עמוקות ומחשבות קיומיות.",
  yekke: "אני יקה גרמני-ישראלי מסודר להפליא. אדבר בעברית עם מבטא גרמני קל ואתעקש על דיוק, סדר ודייקנות בכל דבר. אגיב בחוסר סבלנות לכל חוסר יעילות.",
  sabra: "אני צבר ישראלי אמיתי, ישיר וחסר פילטרים. אדבר בסלנג עברי עדכני, אשתמש בהמון קיצורים ואתנהג בחוצפה ישראלית אופיינית.",
  time_traveler: "אני מגיע משנת 2184 ונתקעתי כאן. אדבר בעברית עתידנית עם מונחים שעדיין לא קיימים ואתייחס לאירועים היסטוריים שטרם קרו.",
  alien: "אני חייזר שרק למד עברית. אני מתבלבל ממנהגים ארציים ומפרש הכל בצורה מילולית מדי. אשתמש במטאפורות חייזריות ואתפלא מדברים מובנים מאליהם.",
  grandma: "אני סבתא ישראלית טיפוסית. אדבר בעברית, אדאג שכולם אוכלים מספיק, אספר סיפורים מהעבר ואשווה כל דבר לאיך שהיה פעם.",
  startup: "אני יזם הייטק ישראלי נלהב. אדבר במונחי סטארטאפ, אשלב אנגלית בעברית, אראה בכל דבר הזדמנות עסקית ואומר 'אקזיט' לפחות פעם בכל משפט.",
  archaeologist: "אני ארכיאולוג ישראלי. אקשר כל נושא לממצאים היסטוריים מהארץ, אצטט מקורות עתיקים ואתלהב מכל פיסת היסטוריה.",
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

// Static variable to store custom presets
export let customPresets: CustomPreset[] = [];

interface CustomPreset {
  id: string;
  label: string;
  instruction: string;
}

// Add function to handle IndexedDB
export const getCustomPresets = async (): Promise<CustomPreset[]> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("chatbot", 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("presets", "readonly");
      const store = transaction.objectStore("presets");
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        customPresets = getAllRequest.result; // Update static variable
        resolve(getAllRequest.result);
      };
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("presets")) {
        db.createObjectStore("presets", { keyPath: "id" });
      }
    };
  });
};

export const saveCustomPreset = async (preset: CustomPreset): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("chatbot", 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("presets", "readwrite");
      const store = transaction.objectStore("presets");
      const addRequest = store.put(preset);
      
      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(addRequest.error);
    };
  });
};

// Add delete function for IndexedDB
export const deleteCustomPreset = async (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("chatbot", 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("presets", "readwrite");
      const store = transaction.objectStore("presets");
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
};

const ChatbotPresets = ({ onPresetChange }: ChatbotPresetsProps) => {
  const [newPresetLabel, setNewPresetLabel] = useState("");
  const [newPresetInstruction, setNewPresetInstruction] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Add state for custom presets
  const [localPresets, setLocalPresets] = useState<CustomPreset[]>([]);

  // Load custom presets on mount
  useEffect(() => {
    getCustomPresets()
      .then(presets => setLocalPresets(presets))
      .catch(error => {
        console.error('Failed to load custom presets:', error);
      });
  }, []);

  useEffect(() => {
    // עדכון הרשימה המקומית כשיש שינוי במשתנה הגלובלי
    setLocalPresets(customPresets);
  }, [customPresets]);

  const handleAddPreset = async () => {
    if (!newPresetLabel || !newPresetInstruction) return;

    const newPreset: CustomPreset = {
      id: `custom_${Date.now()}`,
      label: newPresetLabel,
      instruction: newPresetInstruction,
    };

    await saveCustomPreset(newPreset);
    customPresets = [...customPresets, newPreset];
    setNewPresetLabel("");
    setNewPresetInstruction("");
    setIsDialogOpen(false);
  };

  const handleDeletePreset = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteCustomPreset(id);
      // Update both global and local state
      customPresets = customPresets.filter(preset => preset.id !== id);
      setLocalPresets(prev => prev.filter(preset => preset.id !== id));
      
      // If currently selected preset is deleted, switch to default
      if (id === currentPreset) {
        onPresetChange('default');
      }

      // Verify deletion from IndexedDB
      const db = (await indexedDB.open("chatbot", 1)).result;
      const transaction = db.transaction("presets", "readonly");
      const store = transaction.objectStore("presets");
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        if (getRequest.result) {
          console.error('Failed to delete from IndexedDB');
        } else {
          console.log('Successfully deleted from IndexedDB');
        }
      };

    } catch (error) {
      console.error('Failed to delete preset:', error);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <Select onValueChange={onPresetChange} defaultValue="default">
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="בחר אישיות" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(PRESET_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
          {/* Custom presets with delete button */}
          {localPresets.map((preset) => (
            <SelectItem 
              key={preset.id} 
              value={preset.id}
            >
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
            <DialogTitle>הוספת אופי חדש</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">שם האופי</Label>
              <Input
                id="name"
                value={newPresetLabel}
                onChange={(e) => setNewPresetLabel(e.target.value)}
                placeholder="לדוגמה: מורה להיסטוריה"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instruction">הנחיות לצ'אטבוט</Label>
              <Textarea
                id="instruction"
                value={newPresetInstruction}
                onChange={(e) => setNewPresetInstruction(e.target.value)}
                placeholder="תאר את האופי והסגנון הרצוי..."
                className="h-32"
              />
            </div>
            <Button onClick={handleAddPreset} disabled={!newPresetLabel || !newPresetInstruction}>
              הוסף
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatbotPresets;