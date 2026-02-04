import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Query } from "appwrite";
import db from "../lib/database";

function Transactions() {
    const { user } = useAuth();

    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [userDocId, setUserDocId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        amount: "",
        transactionDate: new Date().toISOString().slice(0, 16), // Format for datetime-local
        description: "",
        categoryId: "",
        accountId: ""
    });

    const [formErrors, setFormErrors] = useState({});
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        setLoading(true);

        // 1. Get User Doc ID
        // Using hardcoded username for consistency with previous components
        // In a real scenario, this would come from the auth context or a user hook
        const username = "greatppr";

        const userResult = await db.getUserDocumentId(username);

        if (!userResult.success) {
            console.error('Failed to get user document ID:', userResult.error);
            setLoading(false);
            return;
        }

        const userId = userResult.documentId;
        setUserDocId(userId);

        // 2. Fetch Accounts
        const accountsResult = await db.listDocuments('accounts', [
            Query.equal('user_id', userId)
        ]);

        if (accountsResult.success) {
            setAccounts(accountsResult.documents);
        }

        // 3. Fetch Categories
        const categoriesResult = await db.listDocuments('categories', [
            Query.equal('user_id', userId)
        ]);

        if (categoriesResult.success) {
            setCategories(categoriesResult.documents);
        }

        // 4. Fetch Transactions
        await loadTransactions(userId);

        setLoading(false);
    };

    const loadTransactions = async (userId) => {
        const result = await db.listDocuments('transactions', [
            Query.equal('users', userId),
            Query.orderDesc('transactionDate'),
            Query.limit(100) // Limit to last 100 for now
        ]);

        if (result.success) {
            setTransactions(result.documents);
        } else {
            console.error('Failed to load transactions:', result.error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            errors.amount = "Valid amount is required";
        }

        if (!formData.transactionDate) {
            errors.transactionDate = "Date is required";
        }

        if (!formData.categoryId) {
            errors.categoryId = "Category is required";
        }

        if (!formData.accountId) {
            errors.accountId = "Account is required";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!userDocId) {
            alert('User document ID not found');
            return;
        }

        if (submitLoading) return;

        setSubmitLoading(true);

        try {
            // Get category and account details first
            const category = categories.find(c => c.$id === formData.categoryId);
            const account = accounts.find(a => a.$id === formData.accountId);

            if (!category || !account) {
                alert('Invalid category or account');
                setSubmitLoading(false);
                return;
            }

            const isExpense = category.type === 'Expense';
            const amount = parseFloat(formData.amount);

            // Check sufficient balance for expenses
            // Don't allow if balance < amount
            if (isExpense && account.balance < amount) {
                alert(`Insufficient balance! Available: ₹${account.balance.toFixed(2)}`);
                setSubmitLoading(false);
                return;
            }

            const transactionData = {
                amount: amount,
                transactionDate: new Date(formData.transactionDate).toISOString(),
                description: formData.description,
                categories: formData.categoryId,
                accounts: formData.accountId,
                users: userDocId
            };

            // Using createDocument
            const result = await db.createDocument('transactions', transactionData);

            if (result.success) {
                // Update Account Balance
                const newBalance = isExpense
                    ? account.balance - amount
                    : account.balance + amount;

                await db.updateDocument('accounts', account.$id, {
                    balance: newBalance
                });

                // Refresh accounts locally to reflect balance change
                const updatedAccounts = accounts.map(a =>
                    a.$id === account.$id ? { ...a, balance: newBalance } : a
                );
                setAccounts(updatedAccounts);

                await loadTransactions(userDocId);

                // Reset form
                setFormData({
                    amount: "",
                    transactionDate: new Date().toISOString().slice(0, 16),
                    description: "",
                    categoryId: "",
                    accountId: ""
                });
                setShowForm(false);
            } else {
                alert('Failed to save transaction: ' + result.error);
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Error saving transaction');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (transaction) => {
        if (!confirm('Are you sure you want to delete this transaction?')) {
            return;
        }

        const result = await db.deleteDocument('transactions', transaction.$id);

        if (result.success) {
            // Revert Account Balance
            // Note: Simplistic revert logic
            const category = categories.find(c => c.$id === transaction.categories?.$id);
            const isExpense = category?.type === 'Expense';
            const account = accounts.find(a => a.$id === transaction.accounts?.$id);

            if (account) {
                const newBalance = isExpense
                    ? account.balance + transaction.amount
                    : account.balance - transaction.amount;

                await db.updateDocument('accounts', account.$id, {
                    balance: newBalance
                });

                // Refresh accounts locally
                const updatedAccounts = accounts.map(a =>
                    a.$id === account.$id ? { ...a, balance: newBalance } : a
                );
                setAccounts(updatedAccounts);
            }

            await loadTransactions(userDocId);
        } else {
            alert('Failed to delete transaction: ' + result.error);
        }
    };

    // Helper to get name safely from relationship object or ID
    const getName = (item, list) => {
        if (!item) return 'Unknown';
        if (typeof item === 'object' && item.name) return item.name;
        const found = list.find(i => i.$id === item);
        return found ? found.name : 'Unknown';
    };

    // Calculate Monthly Totals
    const getMonthlyTotals = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let income = 0;
        let expense = 0;

        transactions.forEach(t => {
            const tDate = new Date(t.transactionDate);
            if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
                // Find category type
                // t.categories might be an object or ID depending on fetch depth, handle both
                const catId = typeof t.categories === 'object' ? t.categories.$id : t.categories;
                const category = categories.find(c => c.$id === catId);

                if (category) {
                    if (category.type === 'Income') {
                        income += t.amount;
                    } else if (category.type === 'Expense') {
                        expense += t.amount;
                    }
                }
            }
        });

        return { income, expense };
    };

    const { income: monthlyIncome, expense: monthlyExpense } = getMonthlyTotals();

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-xl text-gray-600">Loading transactions...</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                    <p className="text-gray-600 text-sm">Overview for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-600 rounded-lg font-medium hover:bg-pink-100 transition"
                >
                    {showForm ? (
                        <span>Cancel</span>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            <span>Add Transaction</span>
                        </>
                    )}
                </button>
            </div>

            {/* Monthly Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Income */}
                <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 font-medium">Total Income</h3>
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 15.293 6.293A1 1 0 0115.657 6l-1.414 1z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-green-700">₹{monthlyIncome.toFixed(2)}</p>
                </div>

                {/* Expense */}
                <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 font-medium">Total Expense</h3>
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1v-5a1 1 0 112 0v2.586l4.293-4.293a1 1 0 011.414 0L16 9.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0L13 9.414l-4.293 4.293A1 1 0 018.414 13L12 13z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-red-700">₹{monthlyExpense.toFixed(2)}</p>
                </div>

                {/* Investment */}
                <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 font-medium">Total Investment</h3>
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-purple-700">₹0.00</p>
                </div>
            </div>

            {/* Add Transaction Form */}
            {showForm && (
                <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">New Transaction</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Date */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
                            <input
                                type="datetime-local"
                                name="transactionDate"
                                value={formData.transactionDate}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none ${formErrors.transactionDate ? "border-red-500" : "border-gray-300"}`}
                            />
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Amount (₹) *</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                step="0.01"
                                placeholder="0.00"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none ${formErrors.amount ? "border-red-500" : "border-gray-300"}`}
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none bg-white ${formErrors.categoryId ? "border-red-500" : "border-gray-300"}`}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.$id} value={cat.$id}>
                                        {cat.name} ({cat.type})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Account */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Account *</label>
                            <select
                                name="accountId"
                                value={formData.accountId}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none bg-white ${formErrors.accountId ? "border-red-500" : "border-gray-300"}`}
                            >
                                <option value="">Select Account</option>
                                {accounts.map(acc => (
                                    <option key={acc.$id} value={acc.$id}>
                                        {acc.name} (₹{acc.balance})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="e.g., Grocery shopping at Walmart"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                            />
                        </div>

                        {/* Submit */}
                        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitLoading}
                                className="px-6 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition text-sm disabled:opacity-50"
                            >
                                {submitLoading ? "Saving..." : "Save Transaction"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Transactions List */}
            {transactions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500">No transactions found</p>
                    <p className="text-xs text-gray-400 mt-1">Add your first expense to get started</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.map((t) => {
                                // Resolve Names
                                const categoryName = getName(t.categories, categories);
                                const accountName = getName(t.accounts, accounts);

                                // Determine color based on Category Type (need to find category object)
                                // If mapped fully, t.categories.type might exist. 
                                // If not, search in categories list using ID.
                                const categoryId = typeof t.categories === 'object' ? t.categories.$id : t.categories;
                                const category = categories.find(c => c.$id === categoryId);
                                const isExpense = category?.type === 'Expense';

                                return (
                                    <tr key={t.$id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(t.transactionDate).toLocaleDateString()}
                                            <span className="text-xs text-gray-400 block">
                                                {new Date(t.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                            {t.description || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                {categoryName}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {accountName}
                                        </td>
                                        <td className={`px-4 py-3 text-sm font-bold text-right ${isExpense ? 'text-red-500' : 'text-green-600'}`}>
                                            {isExpense ? '-' : '+'} ₹{t.amount.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleDelete(t)}
                                                className="text-gray-400 hover:text-red-500 transition"
                                                title="Delete"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Transactions;
