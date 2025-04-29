
import React, { useState } from 'react';
import { TestCase } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  testCase: TestCase;
  index: number;
}

const TestCaseCard: React.FC<Props> = ({ testCase, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  const importanceBadgeColor = {
    Low: "bg-blue-100 text-blue-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-red-100 text-red-800"
  }[testCase.importance] || "bg-gray-100";

  const executionTypeBadgeColor = 
    testCase.executionType === "Automated" 
      ? "bg-purple-100 text-purple-800" 
      : "bg-green-100 text-green-800";

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            {index + 1}. {testCase.title}
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={importanceBadgeColor}>{testCase.importance}</Badge>
            <Badge className={executionTypeBadgeColor}>{testCase.executionType}</Badge>
          </div>
        </div>
      </CardHeader>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardContent className="pb-2">
          <div className="mb-3">
            <h4 className="font-medium text-sm text-gray-500">Résumé</h4>
            <p>{testCase.summary}</p>
          </div>
        </CardContent>
        
        <CollapsibleTrigger className="flex justify-center w-full py-2 text-sm text-muted-foreground hover:bg-muted/50">
          {isOpen ? (
            <div className="flex items-center">
              <span>Afficher moins</span>
              <ChevronUp className="ml-1 h-4 w-4" />
            </div>
          ) : (
            <div className="flex items-center">
              <span>Afficher les détails</span>
              <ChevronDown className="ml-1 h-4 w-4" />
            </div>
          )}
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-2">
            <div className="mb-3">
              <h4 className="font-medium text-sm text-gray-500">Préconditions</h4>
              <p>{testCase.preconditions}</p>
            </div>
            
            <div className="mb-3">
              <h4 className="font-medium text-sm text-gray-500">Étapes de Test & Résultats Attendus</h4>
              <div className="border rounded-md divide-y">
                {testCase.steps.map((step, i) => (
                  <div key={i} className="p-3 flex flex-col md:flex-row">
                    <div className="md:w-1/2 pr-2">
                      <span className="font-medium text-xs text-gray-500">Étape {i + 1}</span>
                      <p className="mt-1">{step}</p>
                    </div>
                    <div className="md:w-1/2 md:border-l pl-2 mt-2 md:mt-0">
                      <span className="font-medium text-xs text-gray-500">Résultat Attendu</span>
                      <p className="mt-1">{testCase.expectedResults[i]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default TestCaseCard;
