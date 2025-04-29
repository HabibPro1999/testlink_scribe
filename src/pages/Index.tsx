
import React, { useState } from 'react';
import { generateTestCases } from '@/lib/openRouterService';
import { TestCase, UserStoryInput } from '@/lib/types';
import UserStoryForm from '@/components/UserStoryForm';
import TestCaseResults from '@/components/TestCaseResults';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const Index = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: UserStoryInput) => {
    setError(null);
    setLoading(true);

    try {
      const generatedTestCases = await generateTestCases(data.userStory, data.additionalContext);
      setTestCases(generatedTestCases);
      
      toast.success("Cas de test générés avec succès!");
    } catch (err) {
      console.error("Erreur lors de la génération des cas de test:", err);
      
      const errorMessage = "Échec de la génération des cas de test. Veuillez vérifier votre clé API et réessayer.";
        
      setError(err instanceof Error ? err.message : errorMessage);
      toast.error("Échec de la génération des cas de test");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTestCases([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold text-center">TestLink AI Scribe</h1>
          <p className="text-center text-gray-600 mt-2">
            Générez des cas de test compatibles avec TestLink à partir d'user stories grâce à l'IA
          </p>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {testCases.length === 0 ? (
          <div className="flex flex-col items-center">
            <div className="max-w-3xl w-full">
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">
                  Comment ça marche
                </h2>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Entrez votre user story dans le formulaire ci-dessous</li>
                  <li>Ajoutez tout contexte supplémentaire qui pourrait être utile</li>
                  <li>Entrez votre clé API OpenRouter</li>
                  <li>Générez des cas de test détaillés à l'aide de l'IA</li>
                  <li>Téléchargez le fichier XML pour l'importation dans TestLink</li>
                </ol>
              </div>
              
              <UserStoryForm 
                onSubmit={handleSubmit} 
                isLoading={loading} 
                error={error}
              />
            </div>
          </div>
        ) : (
          <TestCaseResults testCases={testCases} onReset={handleReset} />
        )}
      </main>

      <footer className="border-t mt-auto">
        <div className="container mx-auto py-6 px-4">
          <p className="text-center text-gray-500 text-sm">
            TestLink AI Scribe &copy; {new Date().getFullYear()} - Utilisant les modèles IA d'OpenRouter
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
