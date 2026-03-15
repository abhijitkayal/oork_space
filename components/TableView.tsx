'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { MoreHorizontal, ChevronDown, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { useYjsTable } from '@/components/YjsProvider';

// --- Type Definitions ---
interface TableTask {
  id: string;
  title: string;
  status: 'Done' | 'In Progress' | 'Todo' | 'Backlog';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  assignee: string;
  assigneeAvatar: string;
}

// Helper function to convert Yjs array values to task object
const valuesToTask = (id: string, values: any[]): TableTask => ({
  id,
  title: values[0] || '',
  status: values[1] || 'Todo',
  priority: values[2] || 'Medium',
  dueDate: values[3] || '',
  assignee: values[4] || '',
  assigneeAvatar: values[5] || 'bg-gray-500'
});

export default function TableView() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const { yjsInitialized, properties, rows, addRow, updateRow, deleteRow } = useYjsTable('table-room');

  // Convert Yjs rows to task objects
  const tasks: TableTask[] = rows.map((row, index) => {
    const id = row.id || `${index + 1}`;
    return valuesToTask(id, row.values || []);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700';
      case 'In Progress': return isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'Todo': return isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
      case 'Backlog': return isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return isDark ? 'text-red-400' : 'text-red-600';
      case 'Medium': return isDark ? 'text-yellow-400' : 'text-yellow-600';
      case 'Low': return isDark ? 'text-blue-400' : 'text-blue-600';
      default: return 'text-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High': return <AlertCircle size={14} />;
      case 'Medium': return <Circle size={14} className="fill-current" />;
      case 'Low': return <ChevronDown size={14} />;
      default: return null;
    }
  };

  // Handler for adding a new row
  const handleAddRow = () => {
    const newId = (tasks.length + 1).toString();
    addRow({
      id: newId,
      values: ['New Task', 'Todo', '', 'Medium', 'Unassigned', 'bg-gray-500']
    });
  };

  // Handler for updating a row
  const handleUpdateRow = (index: number, updates: Partial<TableTask>) => {
    const currentTask = tasks[index];
    const updatedTask = { ...currentTask, ...updates };
    updateRow(index, {
      id: updatedTask.id,
      values: [
        updatedTask.title,
        updatedTask.status,
        updatedTask.priority,
        updatedTask.dueDate,
        updatedTask.assignee,
        updatedTask.assigneeAvatar
      ]
    });
  };

  // Handler for deleting a row
  const handleDeleteRow = (index: number) => {
    deleteRow(index);
  };

  if (!yjsInitialized) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-500">Loading collaborative table...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col h-full p-6">
      <div className={`rounded-2xl border overflow-hidden flex-1 flex flex-col ${isDark ? 'bg-[#1F2125] border-gray-800' : 'bg-white border-rose-100'}`}>
        {/* Table Header */}
        <div className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_50px] gap-4 px-6 py-3 border-b text-xs font-medium ${isDark ? 'bg-[#2C2E33] border-gray-800 text-gray-400' : 'bg-rose-50/50 border-rose-100 text-gray-500'}`}>
          <div>Task Name</div>
          <div>Status</div>
          <div>Due Date</div>
          <div>Priority</div>
          <div>Assignee</div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleAddRow}
              className={`p-1.5 rounded-lg transition-colors hover:bg-blue-500/10 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-y-auto flex-1">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_50px] gap-4 px-6 py-4 border-b last:border-b-0 items-center text-sm transition-colors hover:bg-opacity-50
                ${isDark ? 'border-gray-800 hover:bg-gray-800/30' : 'border-rose-50 hover:bg-rose-50/30'}
              `}
            >
              <div className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{task.title}</div>

              <div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${getStatusColor(task.status)}`}>
                  {task.status === 'Done' && <CheckCircle2 size={12} />}
                  {task.status === 'In Progress' && <Circle size={12} className="fill-current opacity-50" />}
                  {task.status === 'Todo' && <Circle size={12} />}
                  {task.status === 'Backlog' && <Circle size={12} className="border-dashed" />}
                  {task.status}
                </span>
              </div>

              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{task.dueDate}</div>

              <div className={`flex items-center gap-1.5 ${getPriorityColor(task.priority)}`}>
                {getPriorityIcon(task.priority)}
                <span>{task.priority}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] text-white ${task.assigneeAvatar} ${isDark ? 'border-[#1F2125]' : 'border-white'}`}>
                  {task.assignee.charAt(0)}
                </div>
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{task.assignee}</span>
              </div>

              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => handleUpdateRow(index, { status: task.status === 'Done' ? 'Todo' : 'Done' })}
                  className={`p-1 rounded-lg transition-colors hover:bg-blue-500/10 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button 
                  onClick={() => handleDeleteRow(index)}
                  className={`p-1 rounded-lg transition-colors hover:bg-red-500/10 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button 
                  onClick={() => {
                    // Open assignee picker (simplified)
                    alert('Assignee picker would open here');
                  }}
                  className={`p-1 rounded-lg transition-colors hover:bg-blue-500/10 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
