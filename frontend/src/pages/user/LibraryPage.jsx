// import React, { useState, useEffect } from 'react';
// import { useAuthStore } from '../../store/authStore';
// import {
//   FiSearch,
//   FiFilter,
//   FiGrid,
//   FiList,
//   FiHeart,
//   FiBook,
//   FiClock,
//   FiStar,
//   FiEye,
//   FiDownload,
//   FiShare2,
//   FiBookOpen,
//   FiTrendingUp,
//   FiCalendar,
//   FiUser,
//   FiChevronDown,
//   FiChevronRight,
//   FiBookmark,
//   FiAward
// } from 'react-icons/fi';

// const LibraryPage = () => {
//   const { user } = useAuthStore();
//   const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [selectedStatus, setSelectedStatus] = useState('all');
//   const [sortBy, setSortBy] = useState('recent');
//   const [expandedBook, setExpandedBook] = useState(null);

//   // Mock library data - replace with actual API calls
//   const libraryData = {
//     stats: {
//       totalBooks: 1247,
//       availableBooks: 892,
//       borrowedBooks: 12,
//       reservedBooks: 5,
//       newArrivals: 47
//     },
//     categories: [
//       'All Categories',
//       'Science Fiction',
//       'Mystery & Thriller',
//       'Romance',
//       'Biography',
//       'Science & Technology',
//       'History',
//       'Business',
//       'Self-Help',
//       'Fantasy',
//       'Young Adult'
//     ],
//     books: [
//       {
//         id: 1,
//         title: 'Project Hail Mary',
//         author: 'Andy Weir',
//         category: 'Science Fiction',
//         status: 'available',
//         cover: '/api/placeholder/200/300',
//         rating: 4.8,
//         reviews: 1247,
//         description: 'A lone astronaut must save the earth from disaster in this high-stakes sci-fi thriller.',
//         pages: 476,
//         published: 2021,
//         isFeatured: true,
//         isNew: false,
//         tags: ['space', 'science', 'adventure']
//       },
//       {
//         id: 2,
//         title: 'The Midnight Library',
//         author: 'Matt Haig',
//         category: 'Fantasy',
//         status: 'borrowed',
//         cover: '/api/placeholder/200/300',
//         rating: 4.5,
//         reviews: 892,
//         description: 'Between life and death there is a library, and within that library, the shelves go on forever.',
//         pages: 304,
//         published: 2020,
//         isFeatured: true,
//         isNew: true,
//         tags: ['philosophy', 'life', 'choices']
//       },
//       {
//         id: 3,
//         title: 'Atomic Habits',
//         author: 'James Clear',
//         category: 'Self-Help',
//         status: 'available',
//         cover: '/api/placeholder/200/300',
//         rating: 4.9,
//         reviews: 2156,
//         description: 'Tiny Changes, Remarkable Results: An Easy & Proven Way to Build Good Habits & Break Bad Ones',
//         pages: 320,
//         published: 2018,
//         isFeatured: false,
//         isNew: false,
//         tags: ['productivity', 'psychology', 'personal-growth']
//       },
//       {
//         id: 4,
//         title: 'Dune',
//         author: 'Frank Herbert',
//         category: 'Science Fiction',
//         status: 'reserved',
//         cover: '/api/placeholder/200/300',
//         rating: 4.7,
//         reviews: 1876,
//         description: 'Set in the distant future amidst a feudal interstellar society in which various noble houses control planetary fiefs.',
//         pages: 412,
//         published: 1965,
//         isFeatured: true,
//         isNew: false,
//         tags: ['classic', 'space-opera', 'politics']
//       },
//       {
//         id: 5,
//         title: 'The Psychology of Money',
//         author: 'Morgan Housel',
//         category: 'Business',
//         status: 'available',
//         cover: '/api/placeholder/200/300',
//         rating: 4.6,
//         reviews: 943,
//         description: 'Timeless lessons on wealth, greed, and happiness doing well with money isn\'t necessarily about what you know.',
//         pages: 256,
//         published: 2020,
//         isFeatured: false,
//         isNew: true,
//         tags: ['finance', 'psychology', 'investing']
//       },
//       {
//         id: 6,
//         title: 'Where the Crawdads Sing',
//         author: 'Delia Owens',
//         category: 'Mystery & Thriller',
//         status: 'available',
//         cover: '/api/placeholder/200/300',
//         rating: 4.8,
//         reviews: 1678,
//         description: 'For years, rumors of the "Marsh Girl" have haunted Barkley Cove, a quiet town on the North Carolina coast.',
//         pages: 384,
//         published: 2018,
//         isFeatured: true,
//         isNew: false,
//         tags: ['mystery', 'coming-of-age', 'nature']
//       }
//     ]
//   };

//   const [books, setBooks] = useState(libraryData.books);
//   const [filteredBooks, setFilteredBooks] = useState(libraryData.books);

//   // Filter and search books
//   useEffect(() => {
//     let filtered = libraryData.books;

//     // Search filter
//     if (searchQuery) {
//       filtered = filtered.filter(book => 
//         book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         book.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
//       );
//     }

//     // Category filter
//     if (selectedCategory !== 'all') {
//       filtered = filtered.filter(book => book.category === selectedCategory);
//     }

//     // Status filter
//     if (selectedStatus !== 'all') {
//       filtered = filtered.filter(book => book.status === selectedStatus);
//     }

//     // Sort books
//     filtered = [...filtered].sort((a, b) => {
//       switch (sortBy) {
//         case 'rating':
//           return b.rating - a.rating;
//         case 'title':
//           return a.title.localeCompare(b.title);
//         case 'author':
//           return a.author.localeCompare(b.author);
//         case 'recent':
//         default:
//           return b.published - a.published;
//       }
//     });

//     setFilteredBooks(filtered);
//   }, [searchQuery, selectedCategory, selectedStatus, sortBy]);

//   const handleBorrowBook = (bookId) => {
//     console.log('Borrowing book:', bookId);
//     // Add your borrow logic here
//   };

//   const handleReserveBook = (bookId) => {
//     console.log('Reserving book:', bookId);
//     // Add your reserve logic here
//   };

//   const handleAddToFavorites = (bookId) => {
//     console.log('Adding to favorites:', bookId);
//     // Add to favorites logic
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       available: 'bg-green-100 text-green-800',
//       borrowed: 'bg-yellow-100 text-yellow-800',
//       reserved: 'bg-blue-100 text-blue-800'
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800';
//   };

//   const getStatusText = (status) => {
//     const texts = {
//       available: 'Available',
//       borrowed: 'Borrowed',
//       reserved: 'Reserved'
//     };
//     return texts[status] || status;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
//         {/* Header Section */}
//         <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
//           <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
//             <div>
//               <h1 className="text-4xl font-bold text-gray-900 mb-2">Digital Library</h1>
//               <p className="text-xl text-gray-600 mb-6">
//                 Explore {libraryData.stats.totalBooks.toLocaleString()}+ books and resources
//               </p>
              
//               {/* Quick Stats */}
//               <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//                 <div className="bg-blue-50 rounded-xl p-4 text-center">
//                   <FiBook className="h-8 w-8 text-blue-600 mx-auto mb-2" />
//                   <div className="text-2xl font-bold text-gray-900">{libraryData.stats.totalBooks}</div>
//                   <div className="text-sm text-gray-600">Total Books</div>
//                 </div>
//                 <div className="bg-green-50 rounded-xl p-4 text-center">
//                   <FiBookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
//                   <div className="text-2xl font-bold text-gray-900">{libraryData.stats.availableBooks}</div>
//                   <div className="text-sm text-gray-600">Available</div>
//                 </div>
//                 <div className="bg-yellow-50 rounded-xl p-4 text-center">
//                   <FiClock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
//                   <div className="text-2xl font-bold text-gray-900">{libraryData.stats.borrowedBooks}</div>
//                   <div className="text-sm text-gray-600">Borrowed</div>
//                 </div>
//                 <div className="bg-purple-50 rounded-xl p-4 text-center">
//                   <FiBookmark className="h-8 w-8 text-purple-600 mx-auto mb-2" />
//                   <div className="text-2xl font-bold text-gray-900">{libraryData.stats.reservedBooks}</div>
//                   <div className="text-sm text-gray-600">Reserved</div>
//                 </div>
//                 <div className="bg-red-50 rounded-xl p-4 text-center">
//                   <FiAward className="h-8 w-8 text-red-600 mx-auto mb-2" />
//                   <div className="text-2xl font-bold text-gray-900">{libraryData.stats.newArrivals}</div>
//                   <div className="text-sm text-gray-600">New Arrivals</div>
//                 </div>
//               </div>
//             </div>
            
//             {/* User Reading Stats */}
//             <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mt-6 lg:mt-0">
//               <div className="flex items-center space-x-3 mb-3">
//                 <FiUser className="h-6 w-6" />
//                 <div>
//                   <div className="font-semibold">Your Reading</div>
//                   <div className="text-sm opacity-90">12 books this month</div>
//                 </div>
//               </div>
//               <div className="w-full bg-blue-400 rounded-full h-2">
//                 <div className="bg-white rounded-full h-2" style={{ width: '75%' }}></div>
//               </div>
//               <div className="text-xs mt-2 opacity-90">75% of monthly goal</div>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
//           {/* Sidebar Filters */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              
//               {/* Search Box */}
//               <div className="mb-6">
//                 <div className="relative">
//                   <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//                   <input
//                     type="text"
//                     placeholder="Search books, authors, tags..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>
//               </div>

//               {/* Categories */}
//               <div className="mb-6">
//                 <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
//                   <FiFilter className="h-4 w-4 mr-2" />
//                   Categories
//                 </h3>
//                 <div className="space-y-2 max-h-60 overflow-y-auto">
//                   {libraryData.categories.map((category) => (
//                     <button
//                       key={category}
//                       onClick={() => setSelectedCategory(category === 'All Categories' ? 'all' : category)}
//                       className={`w-full text-left px-3 py-2 rounded-lg transition ${
//                         selectedCategory === (category === 'All Categories' ? 'all' : category)
//                           ? 'bg-blue-100 text-blue-700 font-medium'
//                           : 'text-gray-600 hover:bg-gray-50'
//                       }`}
//                     >
//                       {category}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Status Filter */}
//               <div className="mb-6">
//                 <h3 className="font-semibold text-gray-900 mb-3">Availability</h3>
//                 <div className="space-y-2">
//                   {['all', 'available', 'borrowed', 'reserved'].map((status) => (
//                     <button
//                       key={status}
//                       onClick={() => setSelectedStatus(status)}
//                       className={`w-full text-left px-3 py-2 rounded-lg transition ${
//                         selectedStatus === status
//                           ? 'bg-blue-100 text-blue-700 font-medium'
//                           : 'text-gray-600 hover:bg-gray-50'
//                       }`}
//                     >
//                       {status === 'all' ? 'All Status' : getStatusText(status)}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Sort Options */}
//               <div>
//                 <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
//                 <select
//                   value={sortBy}
//                   onChange={(e) => setSortBy(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <option value="recent">Most Recent</option>
//                   <option value="rating">Highest Rated</option>
//                   <option value="title">Title A-Z</option>
//                   <option value="author">Author A-Z</option>
//                 </select>
//               </div>
//             </div>

//             {/* Quick Actions */}
//             <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
//               <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
//               <div className="space-y-3">
//                 <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
//                   <FiTrendingUp className="h-5 w-5 text-blue-600" />
//                   <span className="text-sm font-medium">Popular This Week</span>
//                 </button>
//                 <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
//                   <FiAward className="h-5 w-5 text-green-600" />
//                   <span className="text-sm font-medium">New Arrivals</span>
//                 </button>
//                 <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
//                   <FiBookmark className="h-5 w-5 text-purple-600" />
//                   <span className="text-sm font-medium">My Favorites</span>
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="lg:col-span-3">
            
//             {/* Toolbar */}
//             <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
//               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
//                 <div className="text-sm text-gray-600">
//                   Showing <span className="font-semibold text-gray-900">{filteredBooks.length}</span> books
//                   {searchQuery && (
//                     <span> for "<span className="font-semibold">{searchQuery}</span>"</span>
//                   )}
//                 </div>
                
//                 <div className="flex items-center space-x-4">
//                   {/* View Mode Toggle */}
//                   <div className="flex bg-gray-100 rounded-lg p-1">
//                     <button
//                       onClick={() => setViewMode('grid')}
//                       className={`p-2 rounded-md transition ${
//                         viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'
//                       }`}
//                     >
//                       <FiGrid className="h-4 w-4" />
//                     </button>
//                     <button
//                       onClick={() => setViewMode('list')}
//                       className={`p-2 rounded-md transition ${
//                         viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'
//                       }`}
//                     >
//                       <FiList className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Books Grid/List */}
//             {viewMode === 'grid' ? (
//               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//                 {filteredBooks.map((book) => (
//                   <div key={book.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
//                     <div className="relative">
//                       {/* Book Cover */}
//                       <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
//                         <FiBook className="h-16 w-16 text-gray-400" />
//                       </div>
                      
//                       {/* Status Badge */}
//                       <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
//                         {getStatusText(book.status)}
//                       </div>
                      
//                       {/* Featured Badge */}
//                       {book.isFeatured && (
//                         <div className="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
//                           Featured
//                         </div>
//                       )}
                      
//                       {/* Action Buttons */}
//                       <div className="absolute top-4 right-4 flex space-x-2">
//                         <button 
//                           onClick={() => handleAddToFavorites(book.id)}
//                           className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition"
//                         >
//                           <FiHeart className="h-4 w-4 text-gray-600" />
//                         </button>
//                       </div>
//                     </div>

//                     <div className="p-6">
//                       <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{book.title}</h3>
//                       <p className="text-gray-600 mb-3">by {book.author}</p>
                      
//                       <div className="flex items-center justify-between mb-4">
//                         <div className="flex items-center space-x-1">
//                           <FiStar className="h-4 w-4 text-yellow-400 fill-current" />
//                           <span className="text-sm font-medium text-gray-900">{book.rating}</span>
//                           <span className="text-sm text-gray-500">({book.reviews.toLocaleString()})</span>
//                         </div>
//                         <span className="text-sm text-gray-500">{book.pages} pages</span>
//                       </div>

//                       <p className="text-sm text-gray-600 mb-4 line-clamp-2">{book.description}</p>

//                       <div className="flex flex-wrap gap-2 mb-4">
//                         {book.tags.slice(0, 2).map((tag, index) => (
//                           <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
//                             {tag}
//                           </span>
//                         ))}
//                       </div>

//                       <div className="flex space-x-3">
//                         {book.status === 'available' ? (
//                           <button
//                             onClick={() => handleBorrowBook(book.id)}
//                             className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition text-sm"
//                           >
//                             Borrow Now
//                           </button>
//                         ) : (
//                           <button
//                             onClick={() => handleReserveBook(book.id)}
//                             className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition text-sm"
//                           >
//                             Reserve
//                           </button>
//                         )}
//                         <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
//                           <FiEye className="h-4 w-4 text-gray-600" />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               /* List View */
//               <div className="space-y-4">
//                 {filteredBooks.map((book) => (
//                   <div key={book.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
//                     <div className="flex items-start space-x-6">
//                       {/* Book Cover */}
//                       <div className="w-24 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
//                         <FiBook className="h-8 w-8 text-gray-400" />
//                       </div>

//                       {/* Book Details */}
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-start justify-between mb-2">
//                           <div>
//                             <h3 className="font-bold text-xl text-gray-900 mb-1">{book.title}</h3>
//                             <p className="text-gray-600 mb-2">by {book.author}</p>
//                           </div>
//                           <div className="flex items-center space-x-3">
//                             <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(book.status)}`}>
//                               {getStatusText(book.status)}
//                             </span>
//                             <button 
//                               onClick={() => handleAddToFavorites(book.id)}
//                               className="p-2 hover:bg-gray-100 rounded-lg transition"
//                             >
//                               <FiHeart className="h-4 w-4 text-gray-600" />
//                             </button>
//                           </div>
//                         </div>

//                         <div className="flex items-center space-x-6 mb-3 text-sm text-gray-600">
//                           <div className="flex items-center space-x-1">
//                             <FiStar className="h-4 w-4 text-yellow-400 fill-current" />
//                             <span className="font-medium text-gray-900">{book.rating}</span>
//                             <span>({book.reviews.toLocaleString()} reviews)</span>
//                           </div>
//                           <div>{book.pages} pages</div>
//                           <div>{book.published}</div>
//                           <div>{book.category}</div>
//                         </div>

//                         <p className="text-gray-600 mb-4">{book.description}</p>

//                         <div className="flex items-center justify-between">
//                           <div className="flex space-x-2">
//                             {book.tags.map((tag, index) => (
//                               <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
//                                 {tag}
//                               </span>
//                             ))}
//                           </div>
                          
//                           <div className="flex space-x-3">
//                             {book.status === 'available' ? (
//                               <button
//                                 onClick={() => handleBorrowBook(book.id)}
//                                 className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold transition text-sm"
//                               >
//                                 Borrow Now
//                               </button>
//                             ) : (
//                               <button
//                                 onClick={() => handleReserveBook(book.id)}
//                                 className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg font-semibold transition text-sm"
//                               >
//                                 Reserve
//                               </button>
//                             )}
//                             <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
//                               <FiEye className="h-4 w-4 text-gray-600" />
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Empty State */}
//             {filteredBooks.length === 0 && (
//               <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
//                 <FiBook className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold text-gray-900 mb-2">No books found</h3>
//                 <p className="text-gray-600 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
//                 <button
//                   onClick={() => {
//                     setSearchQuery('');
//                     setSelectedCategory('all');
//                     setSelectedStatus('all');
//                   }}
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
//                 >
//                   Clear Filters
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LibraryPage;