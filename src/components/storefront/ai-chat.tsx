
"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Bot, Send, Loader2, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAiChatResponse } from "@/app/actions";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function AIChat() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    startTransition(async () => {
      const result = await getAiChatResponse(undefined, input);
      if (result.error) {
        setMessages([...newMessages, { role: "assistant", content: t(result.error) }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: result.response }]);
      }
    });
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-4 right-4 h-16 w-16 rounded-full shadow-lg"
            size="icon"
          >
            <Bot className="h-8 w-8" />
            <span className="sr-only">{t('storefront.aiChat.openChat')}</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>{t('storefront.aiChat.title')}</SheetTitle>
            <SheetDescription>
              {t('storefront.aiChat.description')}
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-1 pr-4 -mr-6" ref={scrollAreaRef}>
            <div className="flex-grow space-y-4 p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="p-2 rounded-full bg-primary text-primary-foreground">
                        <Bot className="w-5 h-5" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "p-3 rounded-lg max-w-xs",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <div className="p-2 rounded-full bg-muted">
                        <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}
              {isPending && (
                <div className="flex items-start gap-3 justify-start">
                    <div className="p-2 rounded-full bg-primary text-primary-foreground">
                        <Bot className="w-5 h-5" />
                    </div>
                  <div className="p-3 rounded-lg bg-muted flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">{t('storefront.aiChat.thinking')}</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <SheetFooter>
            <form onSubmit={handleSubmit} className="w-full flex items-center space-x-2">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('storefront.aiChat.placeholder')}
                disabled={isPending}
              />
              <Button type="submit" disabled={isPending} size="icon">
                <Send className="h-4 w-4" />
                <span className="sr-only">{t('storefront.aiChat.send')}</span>
              </Button>
            </form>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
