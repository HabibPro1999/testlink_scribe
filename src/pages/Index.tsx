
import React, { useState } from 'react';
import { generateTestCases } from '@/lib/openRouterService';
import { TestCase, UserStoryInput } from '@/lib/types';
import UserStoryForm from '@/components/UserStoryForm';
import TestCaseResults from '@/components/TestCaseResults';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea'; // Assurez-vous d'importer Textarea

const Index = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null); // Nouvel état

  const handleSubmit = async (data: UserStoryInput) => {
    setError(null);
    setRawResponse(null); // Réinitialiser la réponse brute
    setLoading(true);
    setTestCases([]); // Réinitialiser les cas de test précédents

    try {
      // Appeler la fonction mise à jour
      const result = await generateTestCases(data.userStory);

      if (result.error) {
        // Si une erreur est retournée (y compris erreur de parsing)
        setError(result.error);
        setRawResponse(result.rawResponse); // Stocker la réponse brute
        toast.error(result.error || "Échec de la génération des cas de test");
      } else if (result.testCases) {
        // Si succès
        setTestCases(result.testCases);
        toast.success("Cas de test générés avec succès!");
      } else {
        // Cas improbable où ni erreur ni testCases ne sont présents
        throw new Error("Réponse inattendue du service de génération.");
      }

    } catch (err) {
      // Gérer les erreurs inattendues (ex: problème réseau non intercepté dans le service)
      console.error("Erreur lors de la soumission:", err);
      const errorMessage = err instanceof Error ? err.message : "Une erreur inconnue est survenue lors de la communication avec le service.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTestCases([]);
    setError(null);
    setRawResponse(null); // Réinitialiser aussi la réponse brute
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
                error={error} // Passer l'erreur au formulaire si nécessaire
              />

              {/* Afficher la zone de texte avec la réponse brute si elle existe */}
              {rawResponse && (
                <div className="mt-6 w-full">
                  <h3 className="text-lg font-semibold mb-2 text-red-600">
                    Réponse Brute du Modèle (pour débogage) :
                  </h3>
                  <Textarea
                    readOnly
                    value={rawResponse}
                    className="w-full h-64 font-mono text-sm bg-gray-100"
                    placeholder="Réponse brute de l'API..."
                  />
                </div>
              )}

              {/* Afficher le message d'erreur général s'il y en a un et qu'il n'y a pas de réponse brute (ou en complément) */}
              {error && !rawResponse && (
                <div className="mt-4 text-red-600 text-center">
                  Erreur: {error}
                </div>
              )}

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
