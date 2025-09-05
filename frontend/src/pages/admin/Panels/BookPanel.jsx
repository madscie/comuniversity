// src/components/admin/BooksPanel.jsx
import { FiPlus, FiSearch, FiEdit, FiTrash2 } from "react-icons/fi";
import Card from "../../../components/UI/Card";
import Button from "../../../components/UI/Button";
import TextInput from "../../../components/UI/TextInput";

const BooksPanel = () => {
  const books = [
    {
      id: 1,
      title: "Introduction to Computer Science",
      author: "John Smith",
      year: 2022,
      ddc: "004.5",
      status: "Available",
    },
    {
      id: 2,
      title: "Advanced Mathematics",
      author: "Dr. Emily Chen",
      year: 2021,
      ddc: "510.2",
      status: "Available",
    },
    {
      id: 3,
      title: "World History: Modern Era",
      author: "Prof. Robert Johnson",
      year: 2020,
      ddc: "909.8",
      status: "Checked Out",
    },
    {
      id: 4,
      title: "Organic Chemistry",
      author: "Dr. Sarah Williams",
      year: 2019,
      ddc: "547",
      status: "Available",
    },
  ];

  return (
    <div>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Books</h1>
          <p className="text-gray-600">
            Add, edit, or remove books from the collection
          </p>
        </div>
        <Button variant="primary">
          <FiPlus className="mr-2 h-5 w-5" />
          Add New Book
        </Button>
      </header>

      {/* Search and Filters */}
      <Card className="border-0 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <TextInput placeholder="Search books..." className="pl-10" />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>All Categories</option>
            <option>Available</option>
            <option>Checked Out</option>
          </select>
          <Button variant="outline">Apply Filters</Button>
        </div>
      </Card>

      {/* Books Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DDC
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
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {book.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {book.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {book.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {book.ddc}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        book.status === "Available"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {book.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <FiEdit className="h-4 w-4" />
                    </button>
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
    </div>
  );
};

export default BooksPanel;
