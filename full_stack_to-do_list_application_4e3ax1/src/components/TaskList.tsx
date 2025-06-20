import { TaskItem } from "./TaskItem";
import { Doc } from "../../convex/_generated/dataModel";

interface TaskListProps {
  tasks: Doc<"tasks">[];
  categories: string[];
}

export function TaskList({ tasks, categories }: TaskListProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem 
          key={task._id} 
          task={task} 
          categories={categories}
        />
      ))}
    </div>
  );
}
