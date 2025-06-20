import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface TaskItemProps {
  task: Doc<"tasks">;
  categories: string[];
}

export function TaskItem({ task, categories }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editDueDate, setEditDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ""
  );
  const [editCategory, setEditCategory] = useState(task.category || "");
  const [newCategory, setNewCategory] = useState("");

  const toggleCompletion = useMutation(api.tasks.toggleTaskCompletion);
  const updateTask = useMutation(api.tasks.updateTask);
  const deleteTask = useMutation(api.tasks.deleteTask);

  const handleToggleCompletion = async () => {
    try {
      await toggleCompletion({ id: task._id });
      toast.success(task.completed ? "Task marked as pending" : "Task completed!");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleUpdate = async () => {
    if (!editTitle.trim()) {
      toast.error("Task title cannot be empty");
      return;
    }

    try {
      const finalCategory = newCategory.trim() || editCategory || undefined;
      const finalDueDate = editDueDate ? new Date(editDueDate).getTime() : undefined;

      await updateTask({
        id: task._id,
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        priority: editPriority,
        dueDate: finalDueDate,
        category: finalCategory,
      });

      setIsEditing(false);
      toast.success("Task updated successfully!");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask({ id: task._id });
        toast.success("Task deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete task");
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "low": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return "🔴";
      case "medium": return "🟡";
      case "low": return "🟢";
      default: return "⚪";
    }
  };

  const isOverdue = task.dueDate && task.dueDate < Date.now() && !task.completed;
  const today = new Date().toISOString().split('T')[0];

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Task title..."
          />
          
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Task description..."
            rows={2}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as "low" | "medium" | "high")}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>

            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              min={today}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            {categories.length > 0 && (
              <select
                value={editCategory}
                onChange={(e) => {
                  setEditCategory(e.target.value);
                  if (e.target.value) setNewCategory("");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
            <input
              type="text"
              value={newCategory}
              onChange={(e) => {
                setNewCategory(e.target.value);
                if (e.target.value) setEditCategory("");
              }}
              placeholder="Or create new category..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 transition-all hover:shadow-lg ${
      task.completed 
        ? "border-green-500 opacity-75" 
        : isOverdue 
          ? "border-red-500" 
          : "border-gray-300"
    }`}>
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggleCompletion}
          className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 hover:border-green-500"
          }`}
        >
          {task.completed && "✓"}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-medium text-gray-900 ${
              task.completed ? "line-through text-gray-500" : ""
            }`}>
              {task.title}
            </h3>
            
            <div className="flex items-center gap-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {getPriorityIcon(task.priority)} {task.priority}
              </span>
            </div>
          </div>

          {task.description && (
            <p className={`mt-1 text-sm text-gray-600 ${
              task.completed ? "line-through" : ""
            }`}>
              {task.description}
            </p>
          )}

          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
            {task.category && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                📁 {task.category}
              </span>
            )}
            
            {task.dueDate && (
              <span className={`${isOverdue ? "text-red-600 font-medium" : ""}`}>
                📅 Due: {new Date(task.dueDate).toLocaleDateString()}
                {isOverdue && " (Overdue)"}
              </span>
            )}
            
            <span>
              Created: {new Date(task._creationTime).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit task"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
