interface TaskStatsProps {
  stats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    categories: string[];
  };
}

export function TaskStats({ stats }: TaskStatsProps) {
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow-md p-4 text-center">
        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
        <div className="text-sm text-gray-600">Total Tasks</div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 text-center">
        <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
        <div className="text-sm text-gray-600">Completed</div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 text-center">
        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        <div className="text-sm text-gray-600">Pending</div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 text-center">
        <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
        <div className="text-sm text-gray-600">Overdue</div>
      </div>
      
      {stats.total > 0 && (
        <div className="col-span-2 md:col-span-4 bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
