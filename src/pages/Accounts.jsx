import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Query } from "appwrite";
import db from "../lib/database";
import "../App.css";

function Accounts() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userDocId, setUserDocId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    balance: 0
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      loadUserAndAccounts();
    }
  }, [user, navigate]);

  const loadUserAndAccounts = async () => {
    setLoading(true);
    
    // Get user document ID from users table
    // Assuming the logged-in user has a name or email we can match
    const username = "greatppr"; // You can also use user.$id or user.email
    
    const userResult = await db.getUserDocumentId(username);
    
    if (userResult.success) {
      setUserDocId(userResult.documentId);
      await loadAccounts(userResult.documentId);
    } else {
      console.error('Failed to get user document ID:', userResult.error);
    }
    
    setLoading(false);
  };

  const loadAccounts = async (userId) => {
    const result = await db.listDocuments('accounts', [
      Query.equal('user_id', userId)
    ]);
    
    if (result.success) {
      setAccounts(result.documents);
    } else {
      console.error('Failed to load accounts:', result.error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'balance' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Account name is required";
    }
    
    if (!formData.type.trim()) {
      errors.type = "Account type is required";
    }
    
    if (formData.balance < 0) {
      errors.balance = "Balance cannot be negative";
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
    
    // Prevent double submission
    if (submitLoading) {
      return;
    }
    
    setSubmitLoading(true);
    
    try {
      const accountData = {
        name: formData.name,
        type: formData.type,
        balance: formData.balance,
        user_id: userDocId
      };
      
      let result;
      
      if (editingAccount) {
        // Update existing account
        result = await db.updateDocument('accounts', editingAccount.$id, accountData);
      } else {
        // Create new account
        result = await db.createDocument('accounts', accountData);
      }
      
      if (result.success) {
        // Reload accounts
        await loadAccounts(userDocId);
        
        // Reset form
        setFormData({ name: "", type: "", balance: 0 });
        setShowForm(false);
        setEditingAccount(null);
      } else {
        alert('Failed to save account: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving account:', error);
      alert('Error saving account');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance
    });
    setShowForm(true);
  };

  const handleDelete = async (accountId) => {
    if (!confirm('Are you sure you want to delete this account?')) {
      return;
    }
    
    const result = await db.deleteDocument('accounts', accountId);
    
    if (result.success) {
      await loadAccounts(userDocId);
    } else {
      alert('Failed to delete account: ' + result.error);
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", type: "", balance: 0 });
    setFormErrors({});
    setShowForm(false);
    setEditingAccount(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src="/appwrite.svg" alt="Appwrite" className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900">
                The Royal Ledger
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/home")}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
              >
                Home
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Accounts</h1>
          <p className="text-gray-600">Manage your accounts and balances</p>
        </div>

        {/* Add Account Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition"
          >
            {showForm ? "Cancel" : "+ Add Account"}
          </button>
        </div>

        {/* Account Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingAccount ? "Edit Account" : "Add New Account"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Bank, Cash, Credit Card"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition ${
                    formErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              {/* Account Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type *
                </label>
                <input
                  type="text"
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  placeholder="e.g., Salary, Savings, Investment"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition ${
                    formErrors.type ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.type && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.type}</p>
                )}
              </div>

              {/* Balance */}
              <div>
                <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-2">
                  Balance (₹) *
                </label>
                <input
                  type="number"
                  id="balance"
                  name="balance"
                  value={formData.balance}
                  onChange={handleInputChange}
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition ${
                    formErrors.balance ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.balance && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.balance}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitLoading ? "Saving..." : editingAccount ? "Update Account" : "Add Account"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Accounts List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Your Accounts</h2>
            <p className="text-gray-600 text-sm mt-1">Total: {accounts.length} account(s)</p>
          </div>

          {accounts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">No accounts yet</p>
              <p className="text-gray-400 text-sm mt-2">Click "Add Account" to create your first account</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accounts.map((account) => (
                    <tr key={account.$id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{account.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          {account.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-semibold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{account.balance.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(account)}
                          className="text-pink-600 hover:text-pink-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(account.$id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Card */}
        {accounts.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Balance</h3>
            <p className="text-4xl font-bold">
              ₹{accounts.reduce((sum, account) => sum + account.balance, 0).toFixed(2)}
            </p>
            <p className="text-pink-100 text-sm mt-2">
              Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Accounts;
