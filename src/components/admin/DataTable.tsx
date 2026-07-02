'use client';

import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
}

export default function DataTable<T extends { _id: string }>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  onSearch,
  isLoading,
  onRowClick,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <div className="bg-surface-light border border-primary/20 rounded-xl overflow-hidden shadow-glow-subtle flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b border-primary/20 flex items-center justify-between bg-surface-elevated/30">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder={searchPlaceholder}
            className="w-full bg-surface border border-primary/20 rounded-lg py-2 pl-9 pr-4 text-sm text-contrast focus:outline-none focus:border-secondary/50 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-primary/20 bg-surface/50 text-muted text-xs uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className="p-4 font-semibold">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-muted">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-muted text-sm">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr
                  key={item._id}
                  onClick={() => onRowClick?.(item)}
                  className={`border-b border-primary/10 hover:bg-primary/5 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${rowIndex === data.length - 1 ? 'border-b-0' : ''}`}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="p-4 text-sm text-contrast/90 whitespace-nowrap">
                      {col.cell ? col.cell(item) : String(item[col.accessorKey as keyof T] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Simple Footer (Placeholder for Pagination) */}
      {!isLoading && data.length > 0 && (
        <div className="p-4 border-t border-primary/20 flex items-center justify-between text-xs text-muted bg-surface-elevated/30">
          <span>Showing {data.length} records</span>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded hover:bg-surface border border-transparent hover:border-primary/20 disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 rounded hover:bg-surface border border-transparent hover:border-primary/20 disabled:opacity-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
