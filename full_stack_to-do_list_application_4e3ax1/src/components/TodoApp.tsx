import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TaskForm } from "./TaskForm";
import { TaskList } from "./TaskList";
import { TaskStats } from "./TaskStats";
import { TaskFilters } from "./TaskFilters";

export function TodoApp() {
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showForm, setShowForm] = useState(false);

  const tasks = useQuery(api.tasks.getTasks, { 
    filter, 
    category: selectedCategory || undefined 
  });
  const stats = useQuery(api.tasks.getTaskStats);

  if (tasks === undefined || stats === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Task Statistics */}
      <TaskStats stats={stats} />

      {/* Add Task Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Your Tasks</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          {showForm ? "Cancel" : "Add Task"}
        </button>
      </div>

      {/* Task Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border">
          <TaskForm 
            onSuccess={() => setShowForm(false)}
            categories={stats.categories}
          />
        </div>
      )}

      {/* Filters */}
      <TaskFilters
        filter={filter}
        onFilterChange={setFilter}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={stats.categories}
      />

      {/* Task List */}
      <TaskList 
        tasks={tasks} 
        categories={stats.categories}
      />

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            {filter === "all" ? "No tasks yet" : 
             filter === "completed" ? "No completed tasks" : "No pending tasks"}
          </h3>
          <p className="text-gray-500">
            {filter === "all" ? "Create your first task to get started!" : 
             `Switch to "All" to see your other tasks.`}
          </p>
        </div>
      )}
    </div>
  );
}
