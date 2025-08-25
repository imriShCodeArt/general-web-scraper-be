import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

// Utility function for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date for display
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'Unknown date';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return format(dateObj, 'MMM dd, yyyy HH:mm');
  } catch (error) {
    console.warn('Failed to format date:', date, error);
    return 'Invalid date';
  }
}

// Format relative time
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return 'Unknown time';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid time';
    }
    
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.warn('Failed to format relative time:', date, error);
    return 'Invalid time';
  }
}

// Get status color for badges
export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'badge-success';
    case 'running':
      return 'badge-info';
    case 'pending':
      return 'badge-warning';
    case 'failed':
    case 'cancelled':
      return 'badge-error';
    default:
      return 'badge-info';
  }
}

// Get status icon
export function getStatusIcon(status: string): string {
  switch (status) {
    case 'completed':
      return '✓';
    case 'running':
      return '⟳';
    case 'pending':
      return '⏳';
    case 'failed':
      return '✗';
    case 'cancelled':
      return '⊘';
    default:
      return '?';
  }
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Validate URL
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

// Parse recipe selectors for display
export function parseSelectors(selectors: string | string[]): string[] {
  if (Array.isArray(selectors)) {
    return selectors;
  }
  return selectors.split(',').map(s => s.trim());
}

// Format selector for display
export function formatSelector(selector: string): string {
  return selector.replace(/[<>]/g, '&lt;').replace(/[>]/g, '&gt;');
}
