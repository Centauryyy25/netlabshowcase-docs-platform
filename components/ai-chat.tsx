'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  Wrench,
  Lightbulb,
  TrendingUp,
  Trash2,
  Download,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useChat } from 'ai/react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface AiChatProps {
  labId?: string;
  labTitle?: string;
  initialMessages?: Message[];
  className?: string;
  onMessageSent?: (message: string) => void;
}

const promptOptions = [
  {
    value: 'explain',
    label: 'Explain Topology',
    icon: BookOpen,
    description: 'Explain this network topology and configuration',
  },
  {
    value: 'summarize',
    label: 'Summarize Lab',
    icon: Sparkles,
    description: 'Summarize key concepts and learning objectives',
  },
  {
    value: 'troubleshoot',
    label: 'Troubleshoot',
    icon: Wrench,
    description: 'Help troubleshoot potential issues',
  },
  {
    value: 'improve',
    label: 'Suggest Improvements',
    icon: TrendingUp,
    description: 'Suggest improvements and best practices',
  },
];

export function AiChat({
  labId,
  labTitle,
  initialMessages = [],
  className,
  onMessageSent,
}: AiChatProps) {
  const [promptType, setPromptType] = useState<string>('general');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop,
  } = useChat({
    api: '/api/chat',
    initialMessages: initialMessages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
    })),
    body: {
      labId,
      promptType,
    },
    onFinish: () => {
      onMessageSent?.(input);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePromptSelect = (value: string) => {
    setPromptType(value);

    // Auto-send a prompt based on the selection
    const selectedPrompt = promptOptions.find(p => p.value === value);
    if (selectedPrompt) {
      const promptMessage = selectedPrompt.description;
      // Create a synthetic form submission
      const syntheticEvent = new Event('submit', { cancelable: true }) as any;
      syntheticEvent.preventDefault();

      // Set the input and submit
      const form = document.createElement('form');
      form.dispatchEvent(syntheticEvent);

      // Use the chat hook's submit function
      handleSubmit(syntheticEvent, {
        messages: [...messages, { id: Date.now().toString(), role: 'user', content: promptMessage }],
      });
    }
  };

  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      toast.success('Message copied to clipboard');
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  const handleExportChat = () => {
    const chatContent = messages
      .map(msg => `[${msg.role.toUpperCase()}] ${msg.content}`)
      .join('\n\n');

    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${labTitle || 'AI-Chat'}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Chat exported successfully');
  };

  const handleClearChat = () => {
    // This would require implementing a clear function in the useChat hook
    // For now, we'll just reload the page
    window.location.reload();
  };

  return (
    <TooltipProvider>
      <Card className={`flex flex-col h-[600px] ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Lab Assistant
              {labTitle && (
                <Badge variant="outline" className="text-xs">
                  {labTitle}
                </Badge>
              )}
            </CardTitle>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportChat}
                    disabled={messages.length === 0}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export chat</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearChat}
                    disabled={messages.length === 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear chat</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {labId && (
            <div className="flex gap-2">
              <Select value={promptType} onValueChange={setPromptType}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Choose a prompt type" />
                </SelectTrigger>
                <SelectContent>
                  {promptOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePromptSelect(promptType)}
                disabled={isLoading}
                className="text-xs"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Quick Prompt
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full px-4">
            <div className="space-y-4 py-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">AI Lab Assistant</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ask me anything about this network lab! I can help you understand the topology,
                    explain configurations, troubleshoot issues, and suggest improvements.
                  </p>

                  <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
                    {promptOptions.slice(0, 3).map((option) => (
                      <Button
                        key={option.value}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePromptSelect(option.value)}
                        disabled={isLoading}
                        className="justify-start text-xs h-auto py-2"
                      >
                        <option.icon className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="text-left">{option.description}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`flex gap-3 max-w-[80%] ${
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {message.role === 'user' ? (
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <Bot className="h-4 w-4" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div
                          className={`rounded-lg px-3 py-2 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyMessage(message.content, message.id)}
                                className="h-6 w-6 p-0"
                              >
                                {copiedMessageId === message.id ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy message</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                    <p className="text-sm text-destructive">
                      Sorry, I encountered an error. Please try again.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => reload()}
                      className="mt-2 h-6 text-xs"
                    >
                      Try again
                    </Button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="pt-3">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={
                labId
                  ? "Ask about this network lab..."
                  : "Ask me about networking concepts..."
              }
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
            {isLoading && (
              <Button type="button" variant="outline" size="sm" onClick={stop}>
                Stop
              </Button>
            )}
          </form>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}