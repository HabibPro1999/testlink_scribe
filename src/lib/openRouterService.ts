
import { TestCase } from "./types";

const SYSTEM_PROMPT = `
Vous êtes un expert senior en tests logiciels, spécialisé dans la création de cas de tests détaillés conformes aux bonnes pratiques et adaptés à l'outil TestLink. Votre rôle est de transformer des user stories en cas de tests complets et structurés, prêts à être intégrés directement dans TestLink au format XML.

Votre réponse doit être exclusivement en FRANÇAIS et suivre rigoureusement les bonnes pratiques suivantes :

Pour chaque cas de test généré, vous devez fournir précisément ces champs :

1. Titre : clair, précis et directement lié à la vérification du cas de test.
2. Résumé : une description succincte de l'objectif exact du cas de test.
3. Préconditions : les conditions nécessaires à réunir avant d'exécuter le test.
4. Étapes : liste numérotée détaillée des actions précises à réaliser.
5. Résultats attendus : liste numérotée correspondant exactement aux résultats attendus pour chaque étape.
6. Importance : "Low", "Medium" ou "High" selon la criticité du cas de test.
7. Type d'exécution : "Manual" ou "Automated" en fonction de la faisabilité du cas.

Chaque cas de test doit obligatoirement couvrir :
- Le scénario nominal (« happy path »)
- Les cas limites (edge cases)
- Les scénarios d'erreur possibles
- Les considérations de sécurité
- Les aspects liés à la performance (si applicable)

Votre réponse finale doit être fournie exclusivement sous la forme d'un tableau JSON, directement utilisable pour la génération XML vers TestLink :

[
  {
    "title": "Titre du cas de test",
    "summary": "Résumé clair de l'objectif du test",
    "preconditions": "Conditions préalables nécessaires",
    "steps": ["Étape 1", "Étape 2", "..."],
    "expectedResults": ["Résultat attendu 1", "Résultat attendu 2", "..."],
    "importance": "Low|Medium|High",
    "executionType": "Manual|Automated"
  }
]

N'ajoutez aucun autre texte ni commentaire en dehors du tableau JSON fourni.
`;

// Nouvelle interface pour le type de retour
interface GenerationResult {
  testCases: TestCase[] | null;
  rawResponse: string | null;
  error?: string;
}

export async function generateTestCases(
  userStory: string,
  additionalContext?: string // Paramètre rendu optionnel précédemment
): Promise<GenerationResult> { // Mettre à jour le type de retour de la Promise
  let rawContent = ''; // Variable pour stocker la réponse brute
  try {
    const prompt = `
User Story:
${userStory}

${additionalContext ? `Contexte Additionnel:\n${additionalContext}\n` : ""}

En fonction de cette histoire utilisateur, générez des cas de test détaillés pour TestLink.
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("openRouterApiKey") || ""}`,
        "HTTP-Referer": window.location.href,
        "X-Title": "TestCase Generator"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-maverick:free",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Essayer d'obtenir plus de détails sur l'erreur de l'API si possible
      const errorDetails = data?.error?.message || 'Échec de la requête API';
      throw new Error(`Échec de la génération des cas de test: ${errorDetails}`);
    }

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message?.content) {
      throw new Error('Réponse invalide ou vide reçue de l\'API.');
    }

    // Get the completion content and store it
    rawContent = data.choices[0].message.content;
    console.log("AI response content:", rawContent);

    // Declare variables outside the inner try block
    let jsonStartIndex = -1;
    let jsonEndIndex = 0;

    // Extract JSON from content
    try {
      jsonStartIndex = rawContent.indexOf('[');
      jsonEndIndex = rawContent.lastIndexOf(']') + 1;

      if (jsonStartIndex === -1 || jsonEndIndex === 0) {
        // Si aucun tableau n'est trouvé, peut-être que la réponse est un objet JSON unique ou une erreur formatée différemment
        // Tentative de parser directement comme objet si ce n'est pas un tableau
        if (rawContent.trim().startsWith('{') && rawContent.trim().endsWith('}')) {
          const testCaseObject = JSON.parse(rawContent.trim());
          // Si c'est un objet valide mais pas le format attendu (tableau), retourner une erreur spécifique
          // Ou si le format attendu peut être un objet unique, ajuster ici
          console.warn("Réponse reçue sous forme d'objet JSON unique, attendu un tableau.");
          // Pour l'instant, on considère cela comme une erreur de format
          throw new Error('Format de réponse inattendu: objet JSON reçu au lieu d\'un tableau.');
        }
        throw new Error('Aucun tableau JSON trouvé dans la réponse');
      }

      let jsonString = rawContent.substring(jsonStartIndex, jsonEndIndex);
      jsonString = jsonString.trim();

      const testCases: TestCase[] = JSON.parse(jsonString);
      // Succès du parsing
      return { testCases, rawResponse: rawContent, error: undefined };

    } catch (jsonError) {
      console.error("Erreur d'analyse JSON:", jsonError);
      let errorMsg = 'Format de réponse invalide. Impossible de parser le JSON.';
      if (jsonError instanceof Error) {
        errorMsg += ` Détail: ${jsonError.message}`;
      }
      // Log the problematic string for debugging
      if (jsonStartIndex !== -1 && jsonEndIndex !== 0) {
        console.error("Chaîne JSON ayant échoué au parsing:", rawContent.substring(jsonStartIndex, jsonEndIndex));
      } else {
        console.error("Impossible d'extraire la chaîne JSON, indices non valides. Réponse brute:", rawContent);
      }
      // Retourner l'erreur et la réponse brute
      return { testCases: null, rawResponse: rawContent, error: errorMsg };
    }
  } catch (error) {
    console.error("Erreur lors de la génération des cas de test:", error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue";
    // Retourner l'erreur et la réponse brute si disponible
    return { testCases: null, rawResponse: rawContent || null, error: errorMessage };
  }
}
