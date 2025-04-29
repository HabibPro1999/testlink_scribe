
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

export async function generateTestCases(
  userStory: string,
  additionalContext: string
): Promise<TestCase[]> {
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
        model: "qwen/qwen3-30b-a3b:free", // Using a reliable free model
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
      throw new Error('Échec de la génération des cas de test');
    }

    // Get the completion content
    const content = data.choices[0].message.content;
    console.log("AI response content:", content);

    // Declare variables outside the inner try block
    let jsonStartIndex = -1;
    let jsonEndIndex = 0;

    // Extract JSON from content - more robust approach to handle potential text before or after JSON
    try {
      // Look for array pattern
      // Assign values to the declared variables (remove const)
      jsonStartIndex = content.indexOf('[');
      jsonEndIndex = content.lastIndexOf(']') + 1;

      if (jsonStartIndex === -1 || jsonEndIndex === 0) {
        throw new Error('Aucun tableau JSON trouvé dans la réponse');
      }

      // Extract the potential JSON string
      let jsonString = content.substring(jsonStartIndex, jsonEndIndex);
      console.log("Extracted JSON string (before trim):", jsonString);

      // Trim whitespace before parsing
      jsonString = jsonString.trim();
      console.log("Extracted JSON string (after trim):", jsonString);

      const testCases: TestCase[] = JSON.parse(jsonString);
      return testCases;
    } catch (jsonError) {
      console.error("Erreur d'analyse JSON:", jsonError);
      // Log the problematic string for debugging - now variables are accessible
      // Check if indices were found before trying to substring
      if (jsonStartIndex !== -1 && jsonEndIndex !== 0) {
        console.error("Chaîne JSON ayant échoué au parsing:", content.substring(jsonStartIndex, jsonEndIndex));
      } else {
        console.error("Impossible d'extraire la chaîne JSON, indices non valides.");
      }
      throw new Error('Format de réponse invalide. Impossible de parser le JSON.');
    }
  } catch (error) {
    console.error("Erreur lors de la génération des cas de test:", error);
    throw error;
  }
}
