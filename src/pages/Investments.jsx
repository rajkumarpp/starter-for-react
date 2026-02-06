import { useState, useEffect } from "react";
import { databases } from "../lib/appwrite";
import { Query } from "appwrite";
import { useAuth } from "../contexts/AuthContext";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const INVESTMENTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_INVESTMENTS_COLLECTION_ID;

function Investments() {
    const { user } = useAuth();
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        quantity: "",
        purchasePrice: "",
        purchaseDate: "",
        currentValue: "",
        type: "Equity",
        closure_date: ""
    });

    const [formErrors, setFormErrors] = useState({});

    const investmentTypes = ["MutualFund", "Equity", "Bond", "Deposit"];

    useEffect(() => {
        if (user) {
            fetchInvestments();
        }
    }, [user]);

    const fetchInvestments = async () => {
        try {
            setLoading(true);
            const response = await databases.listDocuments(
                DATABASE_ID,
                INVESTMENTS_COLLECTION_ID,
                [Query.equal("user_id", user.$id), Query.orderDesc("$createdAt")]
            );
            setInvestments(response.documents);
        } catch (error) {
            console.error("Error fetching investments:", error);
            alert("Failed to load investments");
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = "Investment name is required";
        }

        if ((formData.type === 'Equity' || formData.type === 'MutualFund')) {
            if (!formData.quantity || formData.quantity <= 0) {
                errors.quantity = "Quantity/Units must be greater than 0";
            }
        }

        if (!formData.purchasePrice || formData.purchasePrice <= 0) {
            errors.purchasePrice = "Value must be greater than 0";
        }

        if (!formData.purchaseDate) {
            errors.purchaseDate = "Investment date is required";
        }

        if (!formData.currentValue || formData.currentValue < 0) {
            errors.currentValue = "Value must be 0 or greater";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitLoading(true);

        try {
            const isUnitBased = formData.type === 'Equity' || formData.type === 'MutualFund';
            const investmentData = {
                name: formData.name.trim(),
                quantity: isUnitBased ? parseFloat(formData.quantity) : 1,
                purchasePrice: parseFloat(formData.purchasePrice),
                purchaseDate: new Date(formData.purchaseDate).toISOString(),
                currentValue: parseFloat(formData.currentValue),
                type: formData.type,
                closure_date: formData.closure_date ? new Date(formData.closure_date).toISOString() : null,
                user_id: user.$id
            };

            if (editingInvestment) {
                await databases.updateDocument(
                    DATABASE_ID,
                    INVESTMENTS_COLLECTION_ID,
                    editingInvestment.$id,
                    investmentData
                );
            } else {
                await databases.createDocument(
                    DATABASE_ID,
                    INVESTMENTS_COLLECTION_ID,
                    "unique()",
                    investmentData
                );
            }

            await fetchInvestments();
            handleCancel();
        } catch (error) {
            console.error("Error saving investment:", error);
            alert("Failed to save investment: " + error.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEdit = (investment) => {
        setEditingInvestment(investment);
        setFormData({
            name: investment.name,
            quantity: investment.quantity.toString(),
            purchasePrice: investment.purchasePrice.toString(),
            purchaseDate: investment.purchaseDate.split('T')[0],
            currentValue: investment.currentValue.toString(),
            type: investment.type,
            closure_date: investment.closure_date ? investment.closure_date.split('T')[0] : ""
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this investment?")) {
            return;
        }

        try {
            await databases.deleteDocument(DATABASE_ID, INVESTMENTS_COLLECTION_ID, id);
            await fetchInvestments();
        } catch (error) {
            console.error("Error deleting investment:", error);
            alert("Failed to delete investment");
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingInvestment(null);
        setFormData({
            name: "",
            quantity: "",
            purchasePrice: "",
            purchaseDate: "",
            currentValue: "",
            type: "Equity",
            closure_date: ""
        });
        setFormErrors({});
    };

    const calculateTotalInvestment = () => {
        return investments.reduce((sum, inv) => sum + (inv.quantity * inv.purchasePrice), 0);
    };

    const calculateCurrentValue = () => {
        return investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    };

    const calculateProfitLoss = () => {
        return calculateCurrentValue() - calculateTotalInvestment();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-xl text-gray-600">Loading investments...</div>
            </div>
        );
    }

    const profitLoss = calculateProfitLoss();

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Investments</h1>
                    <p className="text-gray-600">Track and manage your investment portfolio</p>
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
                            <span>Add Investment</span>
                        </>
                    )}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-600 text-sm font-medium">Total Invested</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">{formatCurrency(calculateTotalInvestment())}</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-600 text-sm font-medium">Current Value</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">{formatCurrency(calculateCurrentValue())}</div>
                </div>

                <div className={`bg-gradient-to-br ${profitLoss >= 0 ? 'from-green-50 to-green-100 border-green-200' : 'from-red-50 to-red-100 border-red-200'} rounded-xl p-6 border`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'} text-sm font-medium`}>Profit/Loss</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={profitLoss >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                        </svg>
                    </div>
                    <div className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                        {formatCurrency(Math.abs(profitLoss))}
                        <span className="text-sm ml-2">
                            ({profitLoss >= 0 ? '+' : '-'}{calculateTotalInvestment() > 0 ? ((Math.abs(profitLoss) / calculateTotalInvestment()) * 100).toFixed(2) : 0}%)
                        </span>
                    </div>
                </div>
            </div>

            {/* Investment Form */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {editingInvestment ? "Edit Investment" : "Add New Investment"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                                Investment Type *
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition bg-white"
                            >
                                <option value="Equity">Equity (Stocks)</option>
                                <option value="MutualFund">Mutual Fund</option>
                                <option value="Bond">Bond</option>
                                <option value="Deposit">Deposit (FD/RD)</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    {(formData.type === 'Equity' || formData.type === 'MutualFund') ? 'Investment Name / Ticker *' : 'Bank / Institution Name *'}
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder={formData.type === 'Equity' ? 'e.g., RELIANCE, AAPL' : 'e.g., HDFC Bank, SBI'}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition ${formErrors.name ? "border-red-500" : "border-gray-300"}`}
                                />
                                {formErrors.name && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                                )}
                            </div>

                            {(formData.type === 'Equity' || formData.type === 'MutualFund') ? (
                                <>
                                    <div>
                                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                                            {formData.type === 'MutualFund' ? 'Units *' : 'Quantity *'}
                                        </label>
                                        <input
                                            type="number"
                                            id="quantity"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            step="0.001"
                                            min="0"
                                            placeholder="e.g., 10.5"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition ${formErrors.quantity ? "border-red-500" : "border-gray-300"}`}
                                        />
                                        {formErrors.quantity && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 mb-2">
                                            {formData.type === 'MutualFund' ? 'Purchase NAV *' : 'Purchase Price (per unit) *'}
                                        </label>
                                        <input
                                            type="number"
                                            id="purchasePrice"
                                            name="purchasePrice"
                                            value={formData.purchasePrice}
                                            onChange={handleInputChange}
                                            step="0.01"
                                            min="0"
                                            placeholder="e.g., 1500.25"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition ${formErrors.purchasePrice ? "border-red-500" : "border-gray-300"}`}
                                        />
                                        {formErrors.purchasePrice && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.purchasePrice}</p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 mb-2">
                                        Principal Amount Invested *
                                    </label>
                                    <input
                                        type="number"
                                        id="purchasePrice"
                                        name="purchasePrice"
                                        value={formData.purchasePrice}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        placeholder="e.g., 100000"
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition ${formErrors.purchasePrice ? "border-red-500" : "border-gray-300"}`}
                                    />
                                    {formErrors.purchasePrice && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.purchasePrice}</p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label htmlFor="currentValue" className="block text-sm font-medium text-gray-700 mb-2">
                                    {(formData.type === 'Equity' || formData.type === 'MutualFund') ? 'Total Current Value *' : 'Current / Expected Maturity Value *'}
                                </label>
                                <input
                                    type="number"
                                    id="currentValue"
                                    name="currentValue"
                                    value={formData.currentValue}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    min="0"
                                    placeholder="e.g., 120000"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition ${formErrors.currentValue ? "border-red-500" : "border-gray-300"}`}
                                />
                                {formErrors.currentValue && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.currentValue}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-2">
                                    Investment Date *
                                </label>
                                <input
                                    type="date"
                                    id="purchaseDate"
                                    name="purchaseDate"
                                    value={formData.purchaseDate}
                                    onChange={handleInputChange}
                                    max={new Date().toISOString().split('T')[0]}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition ${formErrors.purchaseDate ? "border-red-500" : "border-gray-300"}`}
                                />
                                {formErrors.purchaseDate && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.purchaseDate}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="closure_date" className="block text-sm font-medium text-gray-700 mb-2">
                                    {formData.type === 'Deposit' ? 'Maturity Date' : 'Closure Date'} (Optional)
                                </label>
                                <input
                                    type="date"
                                    id="closure_date"
                                    name="closure_date"
                                    value={formData.closure_date}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>

                        {/* Calculation Helper */}
                        {formData.purchasePrice && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-900">
                                    <strong>Total Invested:</strong> {
                                        (formData.type === 'Equity' || formData.type === 'MutualFund')
                                            ? formatCurrency(parseFloat(formData.quantity || 0) * parseFloat(formData.purchasePrice || 0))
                                            : formatCurrency(parseFloat(formData.purchasePrice || 0))
                                    }
                                </p>
                                {formData.currentValue && (
                                    <p className="text-sm text-blue-900 mt-1">
                                        <strong>Gain/Loss:</strong> {
                                            (formData.type === 'Equity' || formData.type === 'MutualFund')
                                                ? formatCurrency(parseFloat(formData.currentValue || 0) - (parseFloat(formData.quantity || 0) * parseFloat(formData.purchasePrice || 0)))
                                                : formatCurrency(parseFloat(formData.currentValue || 0) - parseFloat(formData.purchasePrice || 0))
                                        }
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={submitLoading}
                                className="flex-1 px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitLoading ? "Saving..." : editingInvestment ? "Update Investment" : "Add Investment"}
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

            {/* Investments List */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Your Investments</h2>
                    <p className="text-gray-600 text-sm mt-1">Total: {investments.length} investments</p>
                </div>

                {investments.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 text-lg">No investments yet</p>
                        <p className="text-gray-400 text-sm mt-2">Click "Add Investment" to track your first investment</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Invested</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit/Loss</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {investments.map((investment) => {
                                    const isUnitBased = investment.type === 'Equity' || investment.type === 'MutualFund';
                                    const totalInvested = isUnitBased ? (investment.quantity * investment.purchasePrice) : investment.purchasePrice;
                                    const gainLoss = investment.currentValue - totalInvested;
                                    const gainLossPercent = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;

                                    return (
                                        <tr key={investment.$id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{investment.name}</div>
                                                {investment.closure_date && (
                                                    <div className="text-xs text-gray-500">
                                                        {investment.type === 'Deposit' ? 'Maturity: ' : 'Closed: '}
                                                        {formatDate(investment.closure_date)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${investment.type === 'Equity' ? 'bg-green-100 text-green-800' :
                                                    investment.type === 'MutualFund' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-purple-100 text-purple-800'
                                                    }`}>
                                                    {investment.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {isUnitBased ? investment.quantity : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {isUnitBased ? formatCurrency(investment.purchasePrice) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatCurrency(totalInvested)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatCurrency(investment.currentValue)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm font-semibold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                                                    <div className="text-xs">
                                                        ({gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {formatDate(investment.purchaseDate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(investment)}
                                                    className="text-pink-600 hover:text-pink-900 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(investment.$id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
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
        </div>
    );
}

export default Investments;
