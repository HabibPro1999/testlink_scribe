
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserStoryInput } from "@/lib/types";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  onSubmit: (data: UserStoryInput) => void;
  isLoading: boolean;
  error: string | null;
}

const UserStoryForm: React.FC<Props> = ({ onSubmit, isLoading, error }) => {
  const [userStory, setUserStory] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [apiKey, setApiKey] = useState(localStorage.getItem("openRouterApiKey") || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save API key to local storage
    if (apiKey) {
      localStorage.setItem("openRouterApiKey", apiKey);
    }
    
    onSubmit({
      userStory,
      additionalContext
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>
            Saisie de l'User Story
          </CardTitle>
          <CardDescription>
            Entrez une user story pour générer des cas de test pour TestLink
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userStory">
              User Story
            </Label>
            <Textarea
              id="userStory"
              placeholder="En tant que [rôle], je veux [action], afin de [bénéfice]"
              value={userStory}
              onChange={(e) => setUserStory(e.target.value)}
              rows={5}
              required
              className="resize-y"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="context">
              Contexte Additionnel (optionnel)
            </Label>
            <Textarea
              id="context"
              placeholder="Entrez toute information supplémentaire qui pourrait aider à générer de meilleurs cas de test..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={3}
              className="resize-y"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">
              Clé API OpenRouter
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Entrez votre clé API OpenRouter"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Obtenez votre clé API gratuite sur{" "}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                openrouter.ai/keys
              </a>
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading 
              ? "Génération des cas de test..." 
              : "Générer des cas de test"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default UserStoryForm;
