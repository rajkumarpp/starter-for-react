function Help() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Help & Support</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="prose max-w-none text-gray-600">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Getting Started</h2>
                    <p className="mb-4">
                        Welcome to The Royal Ledger. Use the Navigation bar to access different sections of the application.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                        <li><strong className="text-gray-900">Home:</strong> View your dashboard and expense summaries.</li>
                        <li><strong className="text-gray-900">Configuration:</strong> Manage your accounts and financial setup.</li>
                        <li><strong className="text-gray-900">Settings:</strong> Update your profile and application preferences.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-gray-900 mb-4">Need Assistance?</h2>
                    <p>
                        If you encounter any issues or have questions, please contact our support team.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Help;
