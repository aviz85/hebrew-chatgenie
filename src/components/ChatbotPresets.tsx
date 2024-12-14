import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChatbotPresetsProps {
  onPresetChange: (preset: string) => void;
}

const PRESETS = {
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

const ChatbotPresets = ({ onPresetChange }: ChatbotPresetsProps) => {
  return (
    <Select onValueChange={onPresetChange} defaultValue="default">
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="בחר אישיות" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(PRESETS).map(([key, label]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ChatbotPresets;