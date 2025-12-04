"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Message, MessageContent, MessageResponse } from "@/app/wolfie/_components/message";
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
import {
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuItem,
  PromptInputActionMenuTrigger,
  usePromptInputAttachments,
} from "@/app/wolfie/_components/prompt-input";
import { Paperclip } from "lucide-react";
import dynamic from "next/dynamic";

const AILoadingState = dynamic(() => import("@/app/wolfie/_components/ai-loading-state").then(mod => mod.AILoadingState));

const FileUploadMenu = () => {
  const attachments = usePromptInputAttachments();

  return (
    <PromptInputActionMenu>
      <PromptInputActionMenuTrigger>
        <Paperclip className="size-4" />
      </PromptInputActionMenuTrigger>
      <PromptInputActionMenuContent>
        <PromptInputActionMenuItem onClick={attachments.openFileDialog}>
          Upload Files
        </PromptInputActionMenuItem>
      </PromptInputActionMenuContent>
    </PromptInputActionMenu>
  );
};

export type UIMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function WolfieChatPage() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text.trim() && message.files.length === 0) return;

    // Add user message
    const userMessage: UIMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message.text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // If there are attachments, ingest them first
      if (message.files.length > 0) {
        setProcessingSteps([
          "Uploading documents...",
          "Processing documents...",
          "Generating embeddings...",
          "Indexing content..."
        ]);
        setCurrentStep(0);

        for (let i = 0; i < message.files.length; i++) {
          const attachment = message.files[i];
          setCurrentStep(0); // Uploading

          // Get the file from blob URL
          const response = await fetch(attachment.url);
          const blob = await response.blob();
          const file = new File([blob], attachment.filename || 'uploaded-file', { type: attachment.mediaType });

          const formData = new FormData();
          formData.append('doc_id', `doc_${Date.now()}_${i}`);
          formData.append('file', file);

          const ingestResponse = await fetch('http://localhost:8001/api/v1/ingest', {
            method: 'POST',
            body: formData,
          });

          if (!ingestResponse.ok) {
            throw new Error(`Failed to ingest document: ${ingestResponse.statusText}`);
          }

          setCurrentStep(1); // Processing
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time
          setCurrentStep(2); // Generating embeddings
          await new Promise(resolve => setTimeout(resolve, 500));
          setCurrentStep(3); // Indexing
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        setProcessingSteps([]);
        setCurrentStep(0);
      }

      // Now query the RAG system with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      try {
        const queryResponse = await fetch('http://localhost:8001/api/v1/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: message.text,
            top_k: 5,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!queryResponse.ok) {
          const errorData = await queryResponse.json().catch(() => ({}));
          throw new Error(errorData.detail || `Failed to query: ${queryResponse.statusText}`);
        }

        const data = await queryResponse.json();

        const assistantMessage: UIMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.answer,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. Wolfie took too long to respond. Please try asking a simpler question.');
        }
        throw fetchError;
      }
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage: UIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error.message || "Sorry, I encountered an error processing your request. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setProcessingSteps([]);
      setCurrentStep(0);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Compact Header */}
      <div className="flex-shrink-0 border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Hi! I am your friendly Wolfie
            </h1>
            <p className="text-xs text-muted-foreground">
              I am here to help you with program information
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="mr-2 h-3 w-3" />
            Clear
          </Button>
        </div>
      </div>

      {/* Messages Container - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4">
          {messages.length === 0 ? (
            // Welcome state - centered
            <div className="flex h-full items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-3 text-4xl">🐺</div>
                <p className="mx-auto max-w-md text-center text-sm text-muted-foreground">
                  Start a conversation with Wolfie to learn more about our programs,
                  admissions, and campus life.
                </p>
              </div>
            </div>
          ) : (
            // Messages list
            <div className="space-y-4 py-6">
              {messages.map((msg) => (
                <Message key={msg.id} from={msg.role}>
                  <MessageContent>
                    {msg.role === "assistant" ? (
                      <MessageResponse>{msg.content}</MessageResponse>
                    ) : (
                      msg.content
                    )}
                  </MessageContent>
                </Message>
              ))}
              {isLoading && processingSteps.length > 0 && (
                <Message from="assistant">
                  <AILoadingState
                    isLoading={true}
                    loadingMessage="Processing your documents..."
                    processingSteps={processingSteps}
                    currentStep={currentStep}
                  />
                </Message>
              )}
              {isLoading && processingSteps.length === 0 && (
                <Message from="assistant">
                  <MessageContent>
                    <div className="flex items-center gap-2 py-2">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0.2s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0.4s]"></div>
                      <span className="ml-2 text-xs text-muted-foreground">Wolfie is thinking...</span>
                    </div>
                  </MessageContent>
                </Message>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Container - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-border bg-background px-4 py-3">
        <div className="mx-auto max-w-4xl">
          <PromptInputProvider>
            <PromptInput
              onSubmit={handleSubmit}
              className="flex items-end gap-2 rounded-lg border border-border bg-card p-2"
            >
              <PromptInputBody className="flex-1">
                <PromptInputTextarea
                  placeholder="Ask me anything about our programs..."
                  className="min-h-[40px] max-h-[120px]"
                />
              </PromptInputBody>
              <PromptInputFooter className="border-none p-0">
                <FileUploadMenu />
                <PromptInputSubmit disabled={isLoading} />
              </PromptInputFooter>
            </PromptInput>
          </PromptInputProvider>
        </div>
      </div>
    </div>
  );
}
