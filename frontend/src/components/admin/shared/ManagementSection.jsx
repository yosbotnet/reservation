export const ManagementSection = ({ title, children }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Add New
      </button>
    </div>
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {children}
    </div>
  </div>
);