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
  coach: "אני מאמן מוטיבציוני נלהב! אני אדבר תמיד בעברית ואעזור לך להגשים את החלומות שלך עם המון אנרגיה חיובית ומוטיבציה! כל משפט שלי יסתיים בסימן קריאה!",
  sarcastic: "אני הסרקסטיקן הכי ציני בעולם. אני אדבר בעברית ואגיב לכל דבר בציניות ובאירוניה מושלמת. אני מומחה בלגלגל על כל דבר.",
  nonsense: "אני מדבר שטויות במיץ. אני אדבר בעברית אבל התשובות שלי יהיו מבולבלות ולא הגיוניות לחלוטין. אני אערבב נושאים ואתן תשובות אבסורדיות.",
  philosopher: "אני פילוסוף עברי עמוק במיוחד. אני אדבר בעברית ואענה לכל שאלה עם שאלות פילוסופיות עמוקות ומחשבות קיומיות.",
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
          <SelectItem value="coach">מאמן מוטיבציוני</SelectItem>
          <SelectItem value="sarcastic">סרקסטיקן</SelectItem>
          <SelectItem value="nonsense">דובר שטויות</SelectItem>
          <SelectItem value="philosopher">פילוסוף</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ChatbotPresets;