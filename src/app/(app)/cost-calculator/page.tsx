
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { CostCalculatorForm, type CalculatedCosts } from '@/components/cost-calculator/CostCalculatorForm';
import { CostCalculatorResults } from '@/components/cost-calculator/CostCalculatorResults';
import type { CostCalculatorFormData } from '@/schemas/costCalculatorSchema';
import { useState } from 'react';

export default function CostCalculatorPage() {
  const [calculatedResults, setCalculatedResults] = useState<CalculatedCosts | null>(null);
  const [lastInputs, setLastInputs] = useState<CostCalculatorFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Farming Cost Calculator"
        description="Estimate your farming expenses, analyze potential profit, and plan for break-even points."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <CostCalculatorForm 
          onCalculated={setCalculatedResults} 
          onFormSubmit={setLastInputs}
          onLoading={setIsLoading}
        />
        <div className="lg:sticky lg:top-24">
          <CostCalculatorResults 
            results={calculatedResults} 
            inputs={lastInputs}
            loading={isLoading} 
          />
        </div>
      </div>
    </div>
  );
}
