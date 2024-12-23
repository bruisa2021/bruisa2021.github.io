import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Edit2, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';

type Category = {
  id: number;
  name: string;
  emoji: string;
  limit: number;
};

type Transaction = {
  id: string;
  date: string;
  amount: number;
  categoryId: number;
  buyer: string;
  location: string;
  description: string;
};

type BalanceInfo = {
  brunoSpent: number;
  isadoraSpent: number;
  jointSpent: number;
  whoOwes: 'Bruno' | 'Isadora' | 'None';
  amount: number;
};

const BudgetApp = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories] = useState<Category[]>([
    { id: 1, name: 'Monthly Bills', emoji: '📆', limit: 2000 },
    { id: 2, name: 'Groceries & Pharmacy', emoji: '🛒', limit: 800 },
    { id: 3, name: 'Eating Out & Entertainment', emoji: '🍽️', limit: 400 },
    { id: 4, name: 'Household Items', emoji: '🧹', limit: 300 },
    { id: 5, name: 'Personal (Bruno)', emoji: '😚', limit: 500 },
    { id: 6, name: 'Personal (Isadora)', emoji: '🐨', limit: 500 }
  ]);

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    categoryId: '1',
    buyer: 'Joint',
    location: '',
    description: ''
  });

  const [filterMonth, setFilterMonth] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterBuyer, setFilterBuyer] = useState('all');
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Transaction | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const buyers = ['Bruno', 'Isadora', 'Joint'];

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const getAvailableMonths = () => {
    const months = new Set(transactions.map(t => t.date.slice(0, 7)));
    const currentMonth = new Date().toISOString().slice(0, 7);
    months.add(currentMonth);
    return Array.from(months).sort();
  };

  const getCurrentMonthIndex = () => {
    const months = getAvailableMonths();
    return months.indexOf(selectedMonth);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const months = getAvailableMonths();
    const currentIndex = getCurrentMonthIndex();
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < months.length) {
      setSelectedMonth(months[newIndex]);
    }
  };

  const formatMonthYear = (dateString: string) => {
    const [year, month] = dateString.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getVisibleMonths = () => {
    const months = getAvailableMonths();
    const currentIndex = getCurrentMonthIndex();
    const start = Math.max(0, currentIndex - 2);
    const end = Math.min(months.length, currentIndex + 2);
    return months.slice(start, end);
  };

  const getCurrentSpending = () => {
    const monthlyTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
    
    return categories.map(category => {
      const spent = monthlyTransactions
        .filter(t => t.categoryId === category.id)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return { ...category, spent };
    });
  };

  const calculateAvailableBudget = () => {
    const totalBudget = categories.reduce((sum, cat) => sum + cat.limit, 0);
    const currentSpending = getCurrentSpending().reduce((sum, cat) => sum + cat.spent, 0);
    return totalBudget - currentSpending;
  };

  // Owing
  const calculateMonthlyBalance = (): BalanceInfo => {
    const monthlyTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
    
    // Calculate individual spending
    const brunoSpent = monthlyTransactions
      .filter(t => t.buyer === 'Bruno')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const isadoraSpent = monthlyTransactions
      .filter(t => t.buyer === 'Isadora')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const jointSpent = monthlyTransactions
      .filter(t => t.buyer === 'Joint')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate shared expenses (joint + personal expenses that should be split)
    const sharedCategories = new Set([1, 2, 3, 4]); // IDs for shared expense categories
    const sharedExpenses = monthlyTransactions
      .filter(t => sharedCategories.has(t.categoryId))
      .reduce((sum, t) => sum + t.amount, 0);

    const perPersonShare = sharedExpenses / 2;
    const brunoBalance = brunoSpent - perPersonShare;
    const isadoraBalance = isadoraSpent - perPersonShare;

    const difference = Math.abs(brunoBalance - isadoraBalance);
    let whoOwes: 'Bruno' | 'Isadora' | 'None' = 'None';
    
    if (difference > 1) { // Threshold to avoid tiny balances
      whoOwes = brunoBalance > isadoraBalance ? 'Isadora' : 'Bruno';
    }

    return {
      brunoSpent,
      isadoraSpent,
      jointSpent,
      whoOwes,
      amount: difference / 2
    };
  };
  
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrans: Transaction = {
      id: Date.now().toString(),
      date: newTransaction.date,
      amount: parseFloat(newTransaction.amount),
      categoryId: parseInt(newTransaction.categoryId),
      buyer: newTransaction.buyer,
      location: newTransaction.location,
      description: newTransaction.description
    };

    setTransactions(prev => [...prev, newTrans]);
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      categoryId: '1',
      buyer: 'Joint',
      location: '',
      description: ''
    });

    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleStartEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction.id);
    setEditForm(transaction);
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setEditForm(null);
  };

  const handleSaveEdit = (id: string) => {
    if (!editForm) return;
    
    setTransactions(prev => 
      prev.map(t => t.id === id ? editForm : t)
    );
    setEditingTransaction(null);
    setEditForm(null);
  };

  const renderTableRow = (transaction: Transaction) => {
    const category = categories.find(c => c.id === transaction.categoryId);
    const isEditing = editingTransaction === transaction.id;

    if (isEditing && editForm) {
      return (
        <tr key={transaction.id} className="border-b bg-blue-50">
          <td className="p-2">
            <input
              type="date"
              className="w-full p-1 border rounded"
              value={editForm.date}
              onChange={e => setEditForm(prev => prev ? {...prev, date: e.target.value} : prev)}
            />
          </td>
          <td className="p-2">
            <select
              className="w-full p-1 border rounded"
              value={editForm.categoryId}
              onChange={e => setEditForm(prev => prev ? {...prev, categoryId: parseInt(e.target.value)} : prev)}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </td>
          <td className="p-2">
            <input
              type="number"
              className="w-full p-1 border rounded"
              value={editForm.amount}
              onChange={e => setEditForm(prev => prev ? {...prev, amount: parseFloat(e.target.value)} : prev)}
              step="0.01"
            />
          </td>
          <td className="p-2">
            <select
              className="w-full p-1 border rounded"
              value={editForm.buyer}
              onChange={e => setEditForm(prev => prev ? {...prev, buyer: e.target.value} : prev)}
            >
              {buyers.map(buyer => (
                <option key={buyer} value={buyer}>{buyer}</option>
              ))}
            </select>
          </td>
          <td className="p-2">
            <input
              type="text"
              className="w-full p-1 border rounded"
              value={editForm.location}
              onChange={e => setEditForm(prev => prev ? {...prev, location: e.target.value} : prev)}
            />
          </td>
          <td className="p-2">
            <input
              type="text"
              className="w-full p-1 border rounded"
              value={editForm.description}
              onChange={e => setEditForm(prev => prev ? {...prev, description: e.target.value} : prev)}
            />
          </td>
          <td className="p-2">
            <div className="flex gap-2">
              <button
                onClick={() => handleSaveEdit(transaction.id)}
                className="text-green-600 hover:text-green-800"
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>
      );
    }

    return (
      <tr key={transaction.id} className="border-b hover:bg-gray-50">
        <td className="p-2">{transaction.date}</td>
        <td className="p-2">
          {category?.emoji} {category?.name}
        </td>
        <td className="p-2">${transaction.amount.toFixed(2)}</td>
        <td className="p-2">{transaction.buyer}</td>
        <td className="p-2">{transaction.location}</td>
        <td className="p-2">{transaction.description}</td>
        <td className="p-2">
          <div className="flex gap-2">
            <button
              onClick={() => handleStartEdit(transaction)}
              className="text-blue-600 hover:text-blue-800"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this transaction?')) {
                  setTransactions(prev => prev.filter(t => t.id !== transaction.id));
                }
              }}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const categorySpending = getCurrentSpending();
  const availableBudget = calculateAvailableBudget();

  const renderBalanceCard = () => {
    const balance = calculateMonthlyBalance();
    const formattedAmount = balance.amount.toFixed(2);
    
    return (
      <div className="bg-purple-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2 text-purple-900">
          Monthly Balance
        </h3>
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2 text-sm mb-4">
            <div>
              <div className="font-medium text-purple-700">Bruno</div>
              <div>${balance.brunoSpent.toFixed(2)}</div>
            </div>
            <div>
              <div className="font-medium text-purple-700">Isadora</div>
              <div>${balance.isadoraSpent.toFixed(2)}</div>
            </div>
            <div>
              <div className="font-medium text-purple-700">Joint</div>
              <div>${balance.jointSpent.toFixed(2)}</div>
            </div>
          </div>
          {balance.whoOwes !== 'None' ? (
            <div className="text-lg font-semibold text-purple-800">
              {balance.whoOwes} owes ${formattedAmount}
            </div>
          ) : (
            <div className="text-lg font-semibold text-green-600">
              All balanced! 🎉
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-500 text-green-700 px-4 py-2 rounded shadow-lg">
          Transaction added successfully!
        </div>
      )}
      
      <Tabs defaultValue="dashboard" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="dashboard">Overview</TabsTrigger>
          <TabsTrigger value="entry">Add Expense</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Card>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-full hover:bg-gray-100"
                  disabled={getCurrentMonthIndex() === 0}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <div className="flex gap-2 items-center">
                  {getVisibleMonths().map(month => (
                    <button
                      key={month}
                      onClick={() => setSelectedMonth(month)}
                      className={`px-3 py-1 rounded ${
                        selectedMonth === month
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {formatMonthYear(month)}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-full hover:bg-gray-100"
                  disabled={getCurrentMonthIndex() === getAvailableMonths().length - 1}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 text-blue-900">
                    Available to Spend
                  </h3>
                  <div className="text-3xl font-bold text-blue-600">
                    ${availableBudget.toFixed(2)}
                  </div>
                  <div className="text-sm text-blue-700">Until end of month</div>
                </div>
                {renderBalanceCard()}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Category Budgets</h3>
                <div className="space-y-3">
                  {categorySpending.map(category => {
                    const percentage = (category.spent / category.limit) * 100;
                    const colorClass = percentage > 90 ? 'bg-red-500' : 
                                    percentage > 70 ? 'bg-yellow-500' : 
                                    'bg-green-500';
                    
                    return (
                      <div key={category.id} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2">
                            <span>{category.emoji}</span>
                            <span>{category.name}</span>
                          </span>
                          <span className="text-sm font-medium">
                            ${category.spent.toFixed(2)} / ${category.limit}
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

        <TabsContent value="entry">
          <Card>
            <CardContent>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Date</label>
                    <input
                      type="date"
                      className="w-full p-2 border rounded"
                      value={newTransaction.date}
                      onChange={e => setNewTransaction(prev => ({
                        ...prev,
                        date: e.target.value
                      }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Amount</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      placeholder="0.00"
                      step="0.01"
                      value={newTransaction.amount}
                      onChange={e => setNewTransaction(prev => ({
                        ...prev,
                        amount: e.target.value
                      }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Category</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={newTransaction.categoryId}
                      onChange={e => setNewTransaction(prev => ({
                        ...prev,
                        categoryId: e.target.value
                      }))}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.emoji} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Buyer</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={newTransaction.buyer}
                      onChange={e => setNewTransaction(prev => ({
                        ...prev,
                        buyer: e.target.value
                      }))}
                      required
                    >
                      {buyers.map(buyer => (
                        <option key={buyer} value={buyer}>{buyer}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Location/Establishment</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="Where was this purchased?"
                    value={newTransaction.location}
                    onChange={e => setNewTransaction(prev => ({
                      ...prev,
                      location: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Description</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="Additional details..."
                    value={newTransaction.description}
                    onChange={e => setNewTransaction(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Transaction
                </button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <button
                  onClick={() => setFilterMonth('')}
                  className={`px-3 py-1 rounded ${
                    !filterMonth ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  All Time
                </button>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    className="p-2 border rounded"
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="p-2 border rounded"
                    value={filterBuyer}
                    onChange={e => setFilterBuyer(e.target.value)}
                  >
                    <option value="all">All Buyers</option>
                    {buyers.map(buyer => (
                      <option key={buyer} value={buyer}>{buyer}</option>
                    ))}
                  </select>
                  <input
                    type="month"
                    className="p-2 border rounded"
                    value={filterMonth}
                    onChange={e => setFilterMonth(e.target.value)}
                    placeholder="Select month"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Category</th>
                      <th className="p-2 text-left">Amount</th>
                      <th className="p-2 text-left">Buyer</th>
                      <th className="p-2 text-left">Location</th>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions
                      .filter(t => !filterMonth || t.date.startsWith(filterMonth))
                      .filter(t => filterCategory === 'all' || t.categoryId === parseInt(filterCategory))
                      .filter(t => filterBuyer === 'all' || t.buyer === filterBuyer)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(renderTableRow)}
                  </tbody>
                </table>
                {transactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No transactions found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BudgetApp;