// pages/Admin/WebinarRegistrationsPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUsers,
  FiMail,
  FiCalendar,
  FiDownload,
  FiUser,
  FiBuilding,
  FiVideo,
  FiClock,
} from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import { webinarService } from "../../services/webinarService";

const WebinarRegistrationsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [webinar, setWebinar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, [id]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch webinar details
      const webinarResponse = await webinarService.getWebinarById(id);
      if (webinarResponse.success) {
        setWebinar(webinarResponse.data.webinar);
      } else {
        throw new Error("Failed to fetch webinar details");
      }
      
      // Fetch registrations
      const regResponse = await webinarService.getWebinarRegistrations(id);
      if (regResponse.success) {
        setRegistrations(regResponse.data.registrations || []);
      } else {
        throw new Error("Failed to fetch registrations");
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (registrations.length === 0) return;

    const headers = ["Name", "Email", "Company", "Registration Date"];
    const csvData = registrations.map(reg => [
      `"${reg.name}"`,
      `"${reg.email}"`,
      `"${reg.company || ''}"`,
      `"${new Date(reg.created_at).toLocaleString()}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webinar-registrations-${webinar?.title.replace(/[^a-z0-9]/gi, '_') || id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6 max-w-md mx-auto">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/admin/manage-webinars")}
        >
          <FiArrowLeft className="mr-2" /> Back to Webinars
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/manage-webinars")}
            className="mb-6"
          >
            <FiArrowLeft className="mr-2" /> Back to Webinars
          </Button>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Webinar Registrations
                </h1>
                {webinar && (
                  <div className="mt-2">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{webinar.title}</h2>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-600 dark:text-gray-400">
                      <span className="flex items-center">
                        <FiCalendar className="mr-2" />
                        {formatDate(webinar.date)}
                      </span>
                      <span className="flex items-center">
                        <FiClock className="mr-2" />
                        {webinar.duration} minutes
                      </span>
                      <span className="flex items-center">
                        <FiUser className="mr-2" />
                        {webinar.speaker}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button onClick={handleExportCSV} disabled={registrations.length === 0}>
                  <FiDownload className="mr-2" /> Export CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={fetchRegistrations}
                >
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center bg-white dark:bg-gray-800 border-0 shadow">
            <FiUsers className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {registrations.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Registrations</div>
          </Card>
          <Card className="p-6 text-center bg-white dark:bg-gray-800 border-0 shadow">
            <FiUser className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {registrations.filter(r => !r.company).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Individual Registrants</div>
          </Card>
          <Card className="p-6 text-center bg-white dark:bg-gray-800 border-0 shadow">
            <FiBuilding className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {new Set(registrations.filter(r => r.company).map(r => r.company)).size}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Companies</div>
          </Card>
          <Card className="p-6 text-center bg-white dark:bg-gray-800 border-0 shadow">
            <FiMail className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {webinar?.current_attendees || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Confirmed Attendees</div>
          </Card>
        </div>

        {/* Registrations Table */}
        <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Registration List ({registrations.length})
            </h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {new Date().toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            {registrations.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 p-6 rounded-2xl mb-6 w-24 h-24 flex items-center justify-center">
                  <FiUsers className="h-12 w-12 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No Registrations Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Registrations will appear here once people start signing up.
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {registrations.map((registration) => (
                    <tr key={registration.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {registration.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {registration.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-300">
                          {registration.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-300">
                          {registration.company || (
                            <span className="text-gray-400 italic">Not specified</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-300">
                          {new Date(registration.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <a
                            href={`mailto:${registration.email}`}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          >
                            <FiMail className="h-5 w-5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WebinarRegistrationsPage;