import { useState, useEffect } from "react";
import {
  FiCopy,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiUserCheck,
} from "react-icons/fi";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";

const ManageAffiliatesPage = () => {
  const [affiliates, setAffiliates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Mock data
    setAffiliates([
      {
        id: 1,
        name: "Sarah Johnson",
        email: "sarah@example.com",
        code: "SARAH25",
        joinDate: "2024-01-15",
        referrals: 12,
        earnings: 240,
        status: "Active",
      },
      {
        id: 2,
        name: "Mike Chen",
        email: "mike@example.com",
        code: "MIKE30",
        joinDate: "2024-02-01",
        referrals: 8,
        earnings: 160,
        status: "Active",
      },
      // Add more mock affiliates...
    ]);
  }, []);

  const filteredAffiliates = affiliates.filter(
    (affiliate) =>
      affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array(8)
      .fill("")
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join("");
  };

  const handleAddAffiliate = () => {
    const newAffiliate = {
      id: affiliates.length + 1,
      name: "New Affiliate",
      email: "new@example.com",
      code: generateCode(),
      joinDate: new Date().toISOString().split("T")[0],
      referrals: 0,
      earnings: 0,
      status: "Pending",
    };
    setAffiliates([...affiliates, newAffiliate]);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Copied code: ${code}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Affiliates
          </h1>
          <p className="text-gray-600">Track and manage affiliate partners</p>
        </div>
        <Button onClick={handleAddAffiliate}>
          <FiPlus className="mr-2" />
          Add Affiliate
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search affiliates by name, email, or code..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Affiliates Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Affiliate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referrals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAffiliates.map((affiliate) => (
                <tr key={affiliate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {affiliate.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {affiliate.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {affiliate.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(affiliate.code)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FiCopy className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {affiliate.joinDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {affiliate.referrals}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${affiliate.earnings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        affiliate.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {affiliate.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-red-600 hover:text-red-900">
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="p-6 text-center">
          <FiUserCheck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {affiliates.length}
          </div>
          <div className="text-sm text-gray-600">Total Affiliates</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {affiliates.reduce((sum, aff) => sum + aff.referrals, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Referrals</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-gray-900">
            ${affiliates.reduce((sum, aff) => sum + aff.earnings, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Earnings Paid</div>
        </Card>
      </div>
    </div>
  );
};

export default ManageAffiliatesPage;
