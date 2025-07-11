"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Send, Eye, FileText, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  type: 'order_confirmation' | 'password_reset' | 'admin_alert' | 'welcome';
  preview: {
    subject: string;
    html: string;
    text: string;
  };
}

interface EmailLog {
  id: string;
  type: string;
  recipient: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt: string;
  error?: string;
}

const emailTemplates: EmailTemplate[] = [
  {
    id: 'order_confirmation',
    name: 'Order Confirmation',
    description: 'Sent to customers when they place an order',
    type: 'order_confirmation',
    preview: {
      subject: 'Order Confirmation - {storeName}',
      html: '<h1>Order Confirmation</h1><p>Dear {customerName},</p><p>Thank you for your order!</p>',
      text: 'Order Confirmation\n\nDear {customerName},\n\nThank you for your order!',
    },
  },
  {
    id: 'password_reset',
    name: 'Password Reset',
    description: 'Sent when users request password reset',
    type: 'password_reset',
    preview: {
      subject: 'Password Reset Request',
      html: '<h1>Password Reset</h1><p>Dear {userName},</p><p>Click the link to reset your password.</p>',
      text: 'Password Reset\n\nDear {userName},\n\nClick the link to reset your password.',
    },
  },
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Sent to new users after signup',
    type: 'welcome',
    preview: {
      subject: 'Welcome to NexusCart!',
      html: '<h1>Welcome to NexusCart!</h1><p>Dear {userName},</p><p>Welcome to NexusCart!</p>',
      text: 'Welcome to NexusCart!\n\nDear {userName},\n\nWelcome to NexusCart!',
    },
  },
  {
    id: 'admin_alert',
    name: 'Admin Alert',
    description: 'Sent to admins for important events',
    type: 'admin_alert',
    preview: {
      subject: 'Admin Alert - {alertType}',
      html: '<h1>Admin Alert</h1><p>An important event has occurred.</p>',
      text: 'Admin Alert\n\nAn important event has occurred.',
    },
  },
];

const mockEmailLogs: EmailLog[] = [
  {
    id: '1',
    type: 'order_confirmation',
    recipient: 'customer@example.com',
    status: 'sent',
    sentAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'password_reset',
    recipient: 'user@example.com',
    status: 'failed',
    sentAt: new Date(Date.now() - 3600000).toISOString(),
    error: 'Invalid email address',
  },
  {
    id: '3',
    type: 'admin_alert',
    recipient: 'admin@example.com',
    status: 'pending',
    sentAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export function EmailManagement() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(mockEmailLogs);
  const { toast } = useToast();

  const handleSendTestEmail = async () => {
    if (!testEmail || !selectedTemplate) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'test',
          data: { to: testEmail },
        }),
      });

      if (response.ok) {
        toast({
          title: "Test email sent",
          description: `Test email sent to ${testEmail}`,
        });
        
        // Add to logs
        setEmailLogs(prev => [{
          id: Date.now().toString(),
          type: 'test',
          recipient: testEmail,
          status: 'sent',
          sentAt: new Date().toISOString(),
        }, ...prev]);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send test email');
      }
    } catch (error) {
      toast({
        title: "Failed to send test email",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
      
      // Add failed log
      setEmailLogs(prev => [{
        id: Date.now().toString(),
        type: 'test',
        recipient: testEmail,
        status: 'failed',
        sentAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }, ...prev]);
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (status: EmailLog['status']) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800">Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order_confirmation':
        return <FileText className="h-4 w-4" />;
      case 'password_reset':
        return <AlertTriangle className="h-4 w-4" />;
      case 'admin_alert':
        return <AlertTriangle className="h-4 w-4" />;
      case 'welcome':
        return <Mail className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Email Management</h1>
        <p className="text-muted-foreground">
          Manage email templates, send test emails, and view email logs.
        </p>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="test">Send Test Email</TabsTrigger>
          <TabsTrigger value="logs">Email Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {emailTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-center gap-2">
                      {getTypeIcon(template.type)}
                      <div className="flex-1">
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {selectedTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle>Template Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Subject</Label>
                    <p className="text-sm font-mono bg-muted p-2 rounded">
                      {selectedTemplate.preview.subject}
                    </p>
                  </div>
                  <div>
                    <Label>HTML Preview</Label>
                    <div className="text-sm bg-muted p-2 rounded max-h-40 overflow-y-auto">
                      <div dangerouslySetInnerHTML={{ __html: selectedTemplate.preview.html }} />
                    </div>
                  </div>
                  <div>
                    <Label>Text Version</Label>
                    <p className="text-sm font-mono bg-muted p-2 rounded whitespace-pre-wrap">
                      {selectedTemplate.preview.text}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Test Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-email">Email Address</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="Enter email address"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Template Type</Label>
                <Select
                  value={selectedTemplate?.id || ''}
                  onValueChange={(value) => {
                    const template = emailTemplates.find(t => t.id === value);
                    setSelectedTemplate(template || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template type" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSendTestEmail}
                disabled={!testEmail || !selectedTemplate || isSending}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <Send className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test Email
                  </>
                )}
              </Button>

              {selectedTemplate && (
                <Alert>
                  <Eye className="h-4 w-4" />
                  <AlertDescription>
                    This will send a test email using the "{selectedTemplate.name}" template.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {emailLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getTypeIcon(log.type)}
                      <div>
                        <p className="font-medium">{log.type.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">{log.recipient}</p>
                        {log.error && (
                          <p className="text-sm text-red-600">{log.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(log.status)}
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.sentAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 