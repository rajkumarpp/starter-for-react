function Settings() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h2>
                    <div className="space-y-4 max-w-xl">
                        <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-gray-700">
                            Change Password
                        </button>
                        <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-gray-700">
                            Update Email Address
                        </button>
                        <button className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition text-red-600">
                            Delete Account
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
                    <div className="flex items-center justify-between py-2">
                        <span className="text-gray-700">Dark Mode</span>
                        <button className="w-12 h-6 bg-gray-200 rounded-full relative transition-colors duration-200 ease-in-out">
                            <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out transform"></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
