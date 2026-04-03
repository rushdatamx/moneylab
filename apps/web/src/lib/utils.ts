import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatTime(date: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDateTime(date: string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    scheduled: 'Programado',
    live: 'En vivo',
    halftime: 'Medio tiempo',
    finished: 'Finalizado',
    postponed: 'Pospuesto',
    cancelled: 'Cancelado',
  };
  return labels[status] || status;
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    scheduled: 'text-muted-foreground',
    live: 'text-green-500',
    halftime: 'text-yellow-500',
    finished: 'text-muted-foreground',
    postponed: 'text-orange-500',
    cancelled: 'text-red-500',
  };
  return colors[status] || '';
}
