export const ManagementSection = ({ title, children }) => (
  <div className="space-y-6">
    <div className="mb-4">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
    </div>
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {children}
    </div>
  </div>
);
