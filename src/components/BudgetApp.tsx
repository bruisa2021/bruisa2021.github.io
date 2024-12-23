import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, TrendingUp, Calendar, Wallet } from 'lucide-react';

const BudgetApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const categories = [
    { id: 1, name: 'Monthly Bills', emoji: '📆', limit: 2000, spent: 1450 },
    { id: 2, name: 'Groceries & Pharmacy', emoji: '🛒', limit: 800, spent: 420 },
    { id: 3, name: 'Eating Out & Entertainment', emoji: '🍽️', limit: 400, spent: 280 },
    { id: 4, name: 'Household Items', emoji: '🧹', limit: 300, spent: 150 },
    { id: 5, name: 'Personal (Bruno)', emoji: '👤', limit: 500, spent: 320 },
    { id: 6, name: 'Personal (Isadora)', emoji: '👤', limit: 500, spent: 290 }
  ];

  const buyers = ['Bruno', 'Isadora', 'Joint'];

  return (
    <div className="w-full max-w-4xl">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Overview</TabsTrigger>
          <TabsTrigger value="entry">Add Expense</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Monthly Overview */}
                <Card className="bg-blue-50">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Available to Spend
                    </h3>
                    <div className="text-3xl font-bold text-blue-600">$1,890</div>
                    <div className="text-sm text-gray-600 mt-1">Until end of month</div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="bg-green-50">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Monthly Progress
                    </h3>
                    <div className="text-3xl font-bold text-green-600">67%</div>
                    <div className="text-sm text-gray-600 mt-1">Of monthly budget used</div>
                  </CardContent>
                </Card>
              </div>

              {/* Category Progress */}
              <div className="mt-4">
                <h3 className="text-lg font-bold mb-3">Category Budgets</h3>
                <div className="space-y-3">
                  {categories.map(category => {
                    const percentage = (category.spent / category.limit) * 100;
                    const colorClass = percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500';
                    
                    return (
                      <div key={category.id} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <span>{category.emoji}</span>
                            <span>{category.name}</span>
                          </span>
                          <span className="text-sm font-medium">
                            ${category.spent} / ${category.limit}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${colorClass} rounded-full h-2 transition-all`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Entry Tab */}
        <TabsContent value="entry">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Date</label>
                  <input type="date" className="w-full p-2 border rounded" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Amount</label>
                  <input type="number" className="w-full p-2 border rounded" placeholder="0.00" step="0.01" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Category</label>
                  <select className="w-full p-2 border rounded">
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.name} (${cat.limit - cat.spent} left)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Buyer</label>
                  <select className="w-full p-2 border rounded">
                    {buyers.map(buyer => (
                      <option key={buyer} value={buyer}>{buyer}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Notes</label>
                <input type="text" className="w-full p-2 border rounded" placeholder="Add notes..." />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-800">Available in selected category</div>
                  <div className="text-sm text-blue-600">$580 remaining of $800 monthly limit</div>
                </div>
              </div>

              <button className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Add Transaction
              </button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="space-x-2">
                  <select className="p-2 border rounded">
                    <option>All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                    ))}
                  </select>
                  <select className="p-2 border rounded">
                    <option>All Buyers</option>
                    {buyers.map(buyer => (
                      <option key={buyer} value={buyer}>{buyer}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="month"
                  className="p-2 border rounded"
                  defaultValue={new Date().toISOString().slice(0, 7)}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Category</th>
                      <th className="p-2 text-left">Amount</th>
                      <th className="p-2 text-left">Buyer</th>
                      <th className="p-2 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-2">2024-03-22</td>
                      <td className="p-2">🛒 Groceries</td>
                      <td className="p-2">$150.00</td>
                      <td className="p-2">Bruno</td>
                      <td className="p-2">Weekly shopping</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2">2024-03-21</td>
                      <td className="p-2">🍽️ Eating Out</td>
                      <td className="p-2">$45.00</td>
                      <td className="p-2">Isadora</td>
                      <td className="p-2">Lunch</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BudgetApp;