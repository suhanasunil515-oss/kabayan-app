export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'Pending': '#F59E0B',
    'Processing': '#3B82F6',
    'Completed': '#10B981',
    'Failed': '#DC2626',
    'Refused To Pay': '#EF4444',
    'Cancelled': '#6B7280',
  };
  return statusColors[status] || '#6B7280';
}

export function getStatusBadgeClass(status: string): string {
  const statusClasses: Record<string, string> = {
    'Pending': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    'Processing': 'bg-blue-100 text-blue-800 border border-blue-200',
    'Completed': 'bg-green-100 text-green-800 border border-green-200',
    'Failed': 'bg-red-100 text-red-800 border border-red-200',
    'Refused To Pay': 'bg-red-100 text-red-800 border border-red-200',
    'Cancelled': 'bg-gray-100 text-gray-800 border border-gray-200',
  };
  return statusClasses[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
}
