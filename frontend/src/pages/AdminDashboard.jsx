import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import {
  TabNavigation,
  TabContent,
  ManagementSection,
  StatisticsSection,
  UserManagementTable,
  OperatingRoomTable,
  EquipmentTable,
  SurgeryTypeTable
} from '../components/admin';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('statistics');

  const tabs = [
    { id: 'statistics', label: 'Statistics Dashboard' },
    { id: 'users', label: 'User Management' },
    { id: 'rooms', label: 'Operating Rooms' },
    { id: 'equipment', label: 'Equipment' },
    { id: 'procedures', label: 'Surgery Types' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Dashboard {user?.nome && `- Welcome ${user.nome}`}
        </h1>
      </div>

      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
      />

      <TabContent>
        {activeTab === 'statistics' && <StatisticsSection />}
        {activeTab === 'users' && (
          <ManagementSection title="User Management">
            <UserManagementTable />
          </ManagementSection>
        )}
        {activeTab === 'rooms' && (
          <ManagementSection title="Operating Room Management">
            <OperatingRoomTable />
          </ManagementSection>
        )}
        {activeTab === 'equipment' && (
          <ManagementSection title="Equipment Management">
            <EquipmentTable />
          </ManagementSection>
        )}
        {activeTab === 'procedures' && (
          <ManagementSection title="Surgery Type Management">
            <SurgeryTypeTable />
          </ManagementSection>
        )}
      </TabContent>
    </div>
  );
};