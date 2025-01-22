import { Tab } from '@headlessui/react';

export const TabNavigation = ({ activeTab, onTabChange, tabs }) => (
  <Tab.Group selectedIndex={tabs.findIndex(t => t.id === activeTab)} onChange={index => onTabChange(tabs[index].id)}>
    <Tab.List className="flex space-x-2 border-b border-gray-200 mb-6">
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          className={({ selected }) => `px-4 py-2 text-sm font-medium rounded-t-lg focus:outline-none ${
            selected ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {tab.label}
        </Tab>
      ))}
    </Tab.List>
  </Tab.Group>
);