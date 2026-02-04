import Accounts from "./Accounts";
import Categories from "./Categories";

function Configuration() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuration</h1>
                <p className="text-gray-600">Manage your financial data sources</p>
            </div>

            {/* Accounts Section */}
            <div className="mb-12">
                <Accounts />
            </div>

            {/* Categories Section */}
            <div className="mb-12">
                <Categories />
            </div>

            {/* Placeholders for future sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50 pointer-events-none">
                <div className="bg-white p-6 rounded-2xl border border-gray-100">
                    <h3 className="font-semibold text-gray-900">Payment Methods (Coming Soon)</h3>
                </div>
            </div>
        </div>
    );
}

export default Configuration;
