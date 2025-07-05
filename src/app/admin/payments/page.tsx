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
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="text-sm">
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
    );
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Payment Transactions</h1>
      
      <div className="mb-4">
        <Input
          placeholder="Search by email, reference, or event name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Amount (KES)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center h-24">Loading payments...</TableCell></TableRow>
            ) : payments.length > 0 ? (
              payments.map(payment => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-xs">{payment.reference}</TableCell>
                  <TableCell>{payment.event.name}</TableCell>
                  <TableCell>{payment.email}</TableCell>
                  <TableCell>{payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={payment.status === 'SUCCESS' ? 'default' : 'destructive'}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(payment.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={6} className="text-center h-24">No payments found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {renderPaginationButtons()}
    </div>
  );
}