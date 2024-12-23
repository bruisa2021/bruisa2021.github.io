import React from 'react';
import BudgetApp from './components/BudgetApp';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Budget App</h1>
        </div>
        <BudgetApp />
      </div>
    </div>
  );
}

export default App;