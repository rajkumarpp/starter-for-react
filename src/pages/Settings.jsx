import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function Settings() {
    const { logout, changePassword, deleteAccount } = useAuth();
    const navigate = useNavigate();

    // Modal States
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form States
    const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMsg({ type: "", text: "" });

        if (passwords.new !== passwords.confirm) {
            setMsg({ type: "error", text: "New passwords do not match" });
            return;
        }

        if (passwords.new.length < 8) {
            setMsg({ type: "error", text: "Password must be at least 8 characters" });
            return;
        }

        setLoading(true);
        const result = await changePassword(passwords.old, passwords.new);
        setLoading(false);

        if (result.success) {
            setMsg({ type: "success", text: "Password updated successfully" });
            setPasswords({ old: "", new: "", confirm: "" });
            setTimeout(() => setShowPasswordModal(false), 1500);
        } else {
            setMsg({ type: "error", text: result.error });
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("Are you ABSOLUTELY sure? This will delete all your data permanently!")) return;

        setLoading(true);
        const result = await deleteAccount();
        setLoading(false);

        if (result.success) {
            navigate("/login");
        } else {
            alert("Failed to delete account: " + result.error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                {/* Account Settings */}
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h2>
                    <div className="space-y-4 max-w-xl">
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-gray-700"
                        >
                            Change Password
                        </button>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition text-red-600"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Change Password</h3>

                        {msg.text && (
                            <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                {msg.text}
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={passwords.old}
                                    onChange={e => setPasswords({ ...passwords, old: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={passwords.new}
                                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                    required
                                    minLength={8}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwords.confirm}
                                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border-2 border-red-500">
                        <div className="text-red-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Account?</h3>
                        <p className="text-gray-500 text-center mb-6">
                            This action cannot be undone. This will permanently delete your account and all associated data including transactions, accounts, and categories.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={loading}
                                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                            >
                                {loading ? 'Deleting...' : 'Yes, Delete My Account'}
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;
