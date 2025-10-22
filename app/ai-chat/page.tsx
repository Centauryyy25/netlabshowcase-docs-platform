'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AiChat } from '@/components/ai-chat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Bot } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AiChatPage() {
  const searchParams = useSearchParams();
  const labId = searchParams.get('labId');
  const [labData, setLabData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (labId) {
      fetchLabData();
    }
  }, [labId]);

  const fetchLabData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/labs/${labId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch lab data');
      }
      const data = await response.json();
      setLabData(data.lab);
    } catch (error) {
      console.error('Error fetching lab data:', error);
      toast.error('Failed to load lab information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Labs
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8" />
            AI Lab Assistant
          </h1>
          <p className="text-muted-foreground">
            Get help understanding network configurations, topologies, and concepts
            {labData && ` for "${labData.title}"`}
          </p>
        </div>

        {labData && (
          <Button asChild>
            <Link href={`/labs/${labId}`}>
              <BookOpen className="h-4 w-4 mr-2" />
              View Lab
            </Link>
          </Button>
        )}
      </div>

      {/* Lab Context */}
      {labData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lab Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Title</h4>
                <p>{labData.title}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Category</h4>
                <p>{labData.category}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Difficulty</h4>
                <p>{labData.difficulty}</p>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
              <p className="text-sm">{labData.description}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Chat Interface */}
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <Card className="h-[600px] flex items-center justify-center">
            <CardContent>
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p>Loading lab information...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <AiChat
            labId={labId || undefined}
            labTitle={labData?.title}
            className="h-[600px]"
            onMessageSent={(message) => {
              console.log('Message sent:', message);
            }}
          />
        )}
      </div>

      {/* Help Section */}
      {!labData && (
        <Card>
          <CardHeader>
            <CardTitle>How to Use the AI Assistant</CardTitle>
            <CardDescription>
              Get the most out of your AI lab assistant with these tips
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">General Questions</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Explain networking concepts (OSI model, TCP/IP, etc.)</li>
                  <li>• Understand protocol behavior (OSPF, BGP, EIGRP)</li>
                  <li>• Learn about network devices and their roles</li>
                  <li>• Get help with command syntax and configuration</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Lab-Specific Help</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Access from a specific lab page for contextual help</li>
                  <li>• Use quick prompts for explanations and summaries</li>
                  <li>• Get troubleshooting assistance for configurations</li>
                  <li>• Receive suggestions for network improvements</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Pro tip:</strong> For the best experience, navigate to a specific lab page and use the AI Assistant there.
                The assistant will have full context about the lab topology, configurations, and learning objectives.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}