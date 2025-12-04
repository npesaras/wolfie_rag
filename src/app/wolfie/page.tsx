"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Message, MessageContent } from "@/app/wolfie/_components/message";
import type { PromptInputMessage } from "@/app/wolfie/_components/prompt-input";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/app/wolfie/_components/prompt-input";
import { Button } from "@/components/ui/button";

export type UIMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function WolfieChatPage() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text.trim()) return;

    // Add user message
    const userMessage: UIMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message.text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // TODO: Replace with your actual API call
      // For now, we'll simulate a response
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const assistantMessage: UIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Hello! I'm Wolfie, your AI assistant. I'm here to help you with information about our programs and answer any questions you might have. How can I assist you today?",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Hi! I am your friendly Wolfie
            </h1>
            <p className="text-sm text-muted-foreground">
              I am here to help you with program information
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      {/* Messages Container */}
      {messages.length === 0 ? (
        // Welcome state - centered without scroll
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="mb-4 text-4xl">🐺</div>
            <p className="mx-auto max-w-md text-center text-lg text-muted-foreground leading-relaxed">
              Start a conversation with Wolfie to learn more about our programs,
              admissions, and campus life.
            </p>
          </div>
        </div>
      ) : (
        // Messages state - scrollable
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl space-y-4">
            {messages.map((msg) => (
              <Message key={msg.id} from={msg.role}>
                <MessageContent>{msg.content}</MessageContent>
              </Message>
            ))}
            {isLoading && (
              <Message from="assistant">
                <MessageContent>
                  <div className="flex gap-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.2s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.4s]"></div>
                  </div>
                </MessageContent>
              </Message>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Input Container */}
      <div className="border-t border-border bg-card p-4">
        <div className="mx-auto max-w-4xl">
          <PromptInputProvider>
            <PromptInput
              onSubmit={handleSubmit}
              className="flex items-end gap-2 rounded-lg border border-border bg-background p-2"
            >
              <PromptInputBody className="flex-1">
                <PromptInputTextarea placeholder="Ask me anything about our programs..." />
              </PromptInputBody>
              <PromptInputFooter className="border-none p-0"></PromptInputFooter>
            </PromptInput>
          </PromptInputProvider>
        </div>
      </div>
    </div>
  );
}
