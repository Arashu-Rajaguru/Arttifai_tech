interface TaskFiltersProps {
  filter: "all" | "completed" | "pending";
  onFilterChange: (filter: "all" | "completed" | "pending") => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export function TaskFilters({ 
  filter, 
  onFilterChange, 
  selectedCategory, 
  onCategoryChange, 
  categories 
}: TaskFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onFilterChange("all")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => onFilterChange("pending")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => onFilterChange("completed")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "completed"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  📁 {category}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
