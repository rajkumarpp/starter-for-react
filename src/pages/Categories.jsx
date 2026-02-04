import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Query } from "appwrite";
import db from "../lib/database";

function Categories() {
    const { user } = useAuth();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userDocId, setUserDocId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        type: "Expense" // Default to Expense
    });

    const [formErrors, setFormErrors] = useState({});
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        if (user) {
            loadUserAndCategories();
        }
    }, [user]);

    const loadUserAndCategories = async () => {
        setLoading(true);

        // Get user document ID
        const username = "greatppr"; // Using the same hardcoded user as Accounts for consistency until dynamic user handling is improved

        const userResult = await db.getUserDocumentId(username);

        if (userResult.success) {
            setUserDocId(userResult.documentId);
            await loadCategories(userResult.documentId);
        } else {
            console.error('Failed to get user document ID:', userResult.error);
        }

        setLoading(false);
    };

    const loadCategories = async (userId) => {
        const result = await db.listDocuments('categories', [
            Query.equal('user_id', userId)
        ]);

        if (result.success) {
            setCategories(result.documents);
        } else {
            console.error('Failed to load categories:', result.error);
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

        if (!formData.name.trim()) {
            errors.name = "Category name is required";
        }

        if (!formData.type) {
            errors.type = "Type is required";
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
            const categoryData = {
                name: formData.name,
                type: formData.type,
                user_id: userDocId
            };

            let result;

            if (editingCategory) {
                result = await db.updateDocument('categories', editingCategory.$id, categoryData);
            } else {
                result = await db.createDocument('categories', categoryData);
            }

            if (result.success) {
                await loadCategories(userDocId);
                handleCancel();
            } else {
                alert('Failed to save category: ' + result.error);
            }
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Error saving category');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            type: category.type
        });
        setShowForm(true);
    };

    const handleDelete = async (categoryId) => {
        if (!confirm('Are you sure you want to delete this category?')) {
            return;
        }

        const result = await db.deleteDocument('categories', categoryId);

        if (result.success) {
            await loadCategories(userDocId);
        } else {
            alert('Failed to delete category: ' + result.error);
        }
    };

    const handleCancel = () => {
        setFormData({ name: "", type: "Expense" });
        setFormErrors({});
        setShowForm(false);
        setEditingCategory(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-xl text-gray-600">Loading categories...</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories</h1>
                    <p className="text-gray-600">Manage your income and expense categories</p>
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
                            <span>Add Category</span>
                        </>
                    )}
                </button>
            </div>

            {/* Category Form */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {editingCategory ? "Edit Category" : "Add New Category"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Category Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., Groceries, Rent, Salary"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition ${formErrors.name ? "border-red-500" : "border-gray-300"
                                    }`}
                            />
                            {formErrors.name && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                                Type *
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition bg-white"
                            >
                                <option value="Expense">Expense</option>
                                <option value="Income">Income</option>
                            </select>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={submitLoading}
                                className="flex-1 px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitLoading ? "Saving..." : editingCategory ? "Update Category" : "Add Category"}
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

            {/* Categories List */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Your Categories</h2>
                    <p className="text-gray-600 text-sm mt-1">Total: {categories.length} categories</p>
                </div>

                {categories.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 text-lg">No categories yet</p>
                        <p className="text-gray-400 text-sm mt-2">Click "Add Category" to create your first category</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {categories.map((category) => (
                                    <tr key={category.$id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${category.type === 'Income'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {category.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="text-pink-600 hover:text-pink-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.$id)}
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
        </div>
    );
}

export default Categories;
