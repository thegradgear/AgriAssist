
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
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-2">
          <CostCalculatorForm onCalculated={setCalculatedResults} />
        </div>
        <div className="lg:col-span-3">
          <CostCalculatorResults results={calculatedResults} loading={isLoading} />
        </div>
      </div>
    </div>
  );
}

