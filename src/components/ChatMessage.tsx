import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: {
    role: "user" | "model";
    content: string;
  };
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex animate-in fade-in slide-in-from-bottom-3",
        isUser ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%] text-right",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {message.content}
      </div>
    </div>
  );
};

export default ChatMessage;