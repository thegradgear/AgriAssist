
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { CostCalculatorForm, type CalculatedCosts } from '@/components/cost-calculator/CostCalculatorForm';
import { CostCalculatorResults } from '@/components/cost-calculator/CostCalculatorResults';
import { useState } from 'react';

export default function CostCalculatorPage() {
  const [calculatedResults, setCalculatedResults] = useState<CalculatedCosts | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Can be used if calculations become async

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Farming Cost Calculator"
        description="Estimate your farming expenses and analyze potential profit margins."
      />
      <div className="space-y-8"> {/* Use space-y for vertical spacing */}
        <div>
          <CostCalculatorForm onCalculated={setCalculatedResults} />
        </div>
        <div>
          <CostCalculatorResults results={calculatedResults} loading={isLoading} />
        </div>
      </div>
    </div>
  );
}
