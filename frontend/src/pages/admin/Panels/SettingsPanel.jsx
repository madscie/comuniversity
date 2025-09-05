// src/components/admin/SettingsPanel.jsx
import { FiSave, FiRefreshCw } from "react-icons/fi";

import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";
import TextInput from "../../../components/UI/TextInput";

const SettingsPanel = () => {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600">Configure library system preferences</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            General Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Library Name
              </label>
              <TextInput defaultValue="Communityersity Digital Library" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <TextInput defaultValue="admin@communityersity.org" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Books per User
              </label>
              <TextInput type="number" defaultValue="5" />
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Appearance</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme Color
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Blue (Default)</option>
                <option>Green</option>
                <option>Purple</option>
                <option>Orange</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-0 shadow-sm mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          System Maintenance
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="primary">
            <FiSave className="mr-2 h-5 w-5" />
            Save Settings
          </Button>
          <Button variant="outline">
            <FiRefreshCw className="mr-2 h-5 w-5" />
            Clear Cache
          </Button>
          <Button
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Reset to Defaults
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPanel;
