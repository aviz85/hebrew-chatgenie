import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from "@/lib/utils";
import { Loader2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ChatMessageProps {
  message: {
    role: "user" | "model";
    content: string;
  };
  isLoading?: boolean;
}

const ChatMessage = ({ message, isLoading }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === "user";

  // רנדור רגיל להודעות משתמש
  if (isUser) {
    return (
      <div className={cn("flex w-full justify-end")}>
        <div className="rounded-lg px-4 py-2 max-w-[80%] bg-primary text-primary-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  // רנדור עם markdown להודעות מודל
  return (
    <div className="group relative">
      <div className={cn("flex w-full justify-start")}>
        <div className={cn(
          "rounded-lg px-4 py-2 max-w-[80%] bg-muted",
          isLoading && !message.content && "min-h-[2.5rem]"
        )}>
          {isLoading && !message.content ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              className={cn(
                "prose prose-sm max-w-none",
                "prose-p:mb-4 last:prose-p:mb-0",
                "prose-headings:mt-6 prose-headings:mb-4",
                "prose-h1:text-xl prose-h2:text-lg prose-h3:text-base",
                "[&>*:first-child]:mt-0",
                "[&>*:last-child]:mb-0",
                "prose-ul:my-4 prose-ol:my-4",
                "prose-li:my-1",
                "prose-blockquote:my-4 prose-blockquote:border-primary",
                "prose-pre:my-4",
                "prose-table:my-4",
                "prose-p:text-inherit prose-headings:text-inherit prose-strong:text-inherit",
                "prose-ul:text-inherit prose-ol:text-inherit prose-blockquote:text-inherit",
                "prose-code:text-inherit prose-code:bg-black/10 dark:prose-code:bg-white/10",
                "dark:prose-invert",
                "[&>*+*]:mt-4"
              )}
              components={{
                pre: ({ node, ...props }: any) => (
                  <pre className="bg-black/10 dark:bg-white/10 p-2 rounded-lg overflow-auto" {...props} />
                ),
                code: ({ node, inline, ...props }: any) => (
                  inline ? 
                    <code className="bg-black/10 dark:bg-white/10 px-1 rounded" {...props} /> :
                    <code {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
      <button
        onClick={handleCopy}
        className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-background/80 backdrop-blur-sm rounded-md hover:bg-accent"
        title="העתק תוכן"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
    </div>
  );
};

export default ChatMessage;