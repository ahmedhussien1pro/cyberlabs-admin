import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Copy, Shield, Check } from 'lucide-react';
import { toast } from 'sonner';

interface FlagAnswerFieldProps {
  flagAnswer: string;
}

export function FlagAnswerField({ flagAnswer }: FlagAnswerFieldProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(flagAnswer);
      setCopied(true);
      toast.success('Flag copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy flag');
    }
  };

  return (
    <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-400">
          <Shield className="h-5 w-5" />
          Flag Answer (Protected)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="default" className="border-amber-500/50">
          <Shield className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900 dark:text-amber-400">
            This is sensitive information. Never share the flag answer with users or expose it in
            client-side code.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={visible ? 'text' : 'password'}
              value={flagAnswer}
              readOnly
              className="pr-10 font-mono"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() => setVisible(!visible)}
            >
              {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleCopy}
            className="min-w-24"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
