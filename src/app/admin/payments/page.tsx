// src/app/admin/payments/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Payment, Event } from '@prisma/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from 'use-debounce';

type PaymentWithEvent = Payment & { event: Pick<Event, 'name'> };
type PaginationState = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentWithEvent[]>([]);
  const [pagination, setPagination] = useState<PaginationState | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Debounce the search query to avoid excessive API calls while typing
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  const fetchPayments = async (page: number, search: string) => {
    setIsLoading(true);
    try {
      // Construct URL with search and pagination params
      const url = new URL('/api/admin/payments', window.location.origin);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('limit', '10');
      if (search) {
        url.searchParams.set('search', search);
      }
      
      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments);
        setPagination(data.pagination);
      } else {
        console.error("Failed to fetch payments");
        setPayments([]);
        setPagination(null);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when the page or debounced search query changes
  useEffect(() => {
    fetchPayments(currentPage, debouncedSearchQuery);
  }, [currentPage, debouncedSearchQuery]);

  // Reset to page 1 whenever a new search is performed
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const renderPaginationButtons = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} payments
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm whitespace-nowrap">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
            disabled={currentPage === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Payment Transactions</h1>
      
      <div className="w-full">
        <Input
          placeholder="Search by email, reference, or event name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-full sm:max-w-sm"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Reference</TableHead>
                <TableHead className="min-w-[150px]">Event</TableHead>
                <TableHead className="min-w-[180px]">Email</TableHead>
                <TableHead className="min-w-[100px]">Amount (KES)</TableHead>
                <TableHead className="min-w-[80px]">Status</TableHead>
                <TableHead className="min-w-[140px]">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center h-24">Loading payments...</TableCell></TableRow>
              ) : payments.length > 0 ? (
                payments.map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs">
                      <div className="max-w-[120px] truncate" title={payment.reference}>
                        {payment.reference}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate" title={payment.event.name}>
                        {payment.event.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[180px] truncate" title={payment.email ?? undefined}>
                        {payment.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{payment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'SUCCESS' ? 'default' : 'destructive'} className="text-xs">
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <div className="max-w-[140px]">
                        {new Date(payment.createdAt).toLocaleDateString()}
                        <br />
                        <span className="text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={6} className="text-center h-24">No payments found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {renderPaginationButtons()}
    </div>
  );
}