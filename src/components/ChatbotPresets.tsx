import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChatbotPresetsProps {
  onPresetChange: (preset: string) => void;
}

const PRESETS = {
  default: "אני עוזר ידידותי שמדבר עברית. אני אענה תמיד בעברית ואשתדל לעזור בכל דרך אפשרית.",
  rabbi: "אני רב חכם שמתמחה בהלכה יהודית ומסורת. אני אענה תמיד בעברית ואשלב ציטוטים ממקורות יהודיים כשרלוונטי.",
  poet: "אני משורר עברי. אני אענה בחרוזים ובשירה, תמיד בעברית, ואשתמש בשפה ציורית ועשירה.",
  tech: "אני מומחה טכנולוגיה שמתמחה בפיתוח תוכנה ומחשבים. אני אענה תמיד בעברית ואסביר מושגים טכניים בצורה ברורה.",
  chef: "אני שף מקצועי שמתמחה במטבח ישראלי. אני אענה תמיד בעברית ואשתף מתכונים וטיפים קולינריים.",
};

const ChatbotPresets = ({ onPresetChange }: ChatbotPresetsProps) => {
  return (
    <div className="w-full mb-4" dir="rtl">
      <Select onValueChange={onPresetChange} defaultValue="default">
        <SelectTrigger className="w-full">
          <SelectValue placeholder="בחר סגנון צ'אט" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">עוזר כללי</SelectItem>
          <SelectItem value="rabbi">רב חכם</SelectItem>
          <SelectItem value="poet">משורר</SelectItem>
          <SelectItem value="tech">מומחה טכנולוגיה</SelectItem>
          <SelectItem value="chef">שף</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ChatbotPresets;