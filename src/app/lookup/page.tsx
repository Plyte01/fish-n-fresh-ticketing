// src/app/lookup/page.tsx
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Ticket, Event } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Link from 'next/link';
import { Download, Search, Mail, Phone, Ticket as TicketIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type FormInputs = {
  searchTerm: string;
  searchType: 'email' | 'phone' | 'ticketCode';
};

// Define a leaner type for the tickets we expect back from the API
type FoundTicket = Pick<Ticket, 'id' | 'ticketCode'> & {
  event: Pick<Event, 'name' | 'startDate'>;
};

export default function TicketLookupPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<FormInputs>({
    defaultValues: {
      searchType: 'email'
    }
  });
  const [foundTickets, setFoundTickets] = useState<FoundTicket[]>([]);
  const [searchAttempted, setSearchAttempted] = useState(false);
  
  const searchType = watch('searchType');

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setSearchAttempted(true);
    setFoundTickets([]);

    const { searchTerm, searchType } = data;
    
    const promise = fetch(`/api/tickets/lookup?${searchType}=${encodeURIComponent(searchTerm)}`);

    toast.promise(promise, {
      loading: 'Searching for your tickets...',
      success: async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          // This allows the "No tickets found" message to show below
          if (res.status === 404) {
            setFoundTickets([]);
            return errorData.error;
          }
          throw new Error(errorData.error || 'An unknown error occurred.');
        }
        const tickets: FoundTicket[] = await res.json();
        setFoundTickets(tickets);
        return `${tickets.length} ticket(s) found!`;
      },
      error: (err) => err.message, // This will display server errors in the toast
    });
  };

  const getPlaceholder = () => {
    switch (searchType) {
      case 'email':
        return 'you@example.com';
      case 'phone':
        return '254712345678';
      case 'ticketCode':
        return 'ABC123';
      default:
        return 'Enter search term';
    }
  };

  const getIcon = () => {
    switch (searchType) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'ticketCode':
        return <TicketIcon className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4 relative z-10">
      <Card className="w-full backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20">
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Find Your Tickets</CardTitle>
          <CardDescription>
            Choose how you want to search for your tickets and enter the required information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="searchType">Search by:</Label>
              <Select 
                value={searchType} 
                onValueChange={(value: 'email' | 'phone' | 'ticketCode') => setValue('searchType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select search method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </div>
                  </SelectItem>
                  <SelectItem value="phone">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </div>
                  </SelectItem>
                  <SelectItem value="ticketCode">
                    <div className="flex items-center gap-2">
                      <TicketIcon className="h-4 w-4" />
                      Ticket Code
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {searchType === 'ticketCode' && (
                <p className="text-sm text-muted-foreground">
                  Your ticket code was sent to you via SMS after purchase. It&apos;s a short alphanumeric code (e.g., ABC123).
                </p>
              )}
              {searchType === 'phone' && (
                <p className="text-sm text-muted-foreground">
                  Enter your phone number with country code (e.g., 254712345678).
                </p>
              )}
              {searchType === 'email' && (
                <p className="text-sm text-muted-foreground">
                  Enter the email address you used during ticket purchase.
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input
                  {...register("searchTerm", { required: "This field is required." })}
                  placeholder={getPlaceholder()}
                  disabled={isSubmitting}
                  className={errors.searchTerm ? 'border-red-500' : ''}
                />
                {errors.searchTerm && <p className="text-sm text-red-600 mt-1">{errors.searchTerm.message}</p>}
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0">
                {getIcon()}
                <span className="ml-2">{isSubmitting ? 'Searching...' : 'Search'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <div className="space-y-4">
        {searchAttempted && foundTickets.length === 0 && (
          <div className="text-center py-8">
            <p className="text-lg text-muted-foreground">No tickets found.</p>
            <p className="text-sm text-muted-foreground">Please check your details and try again.</p>
          </div>
        )}
        {foundTickets.map(ticket => (
          <Card key={ticket.id} className="flex flex-col sm:flex-row items-start sm:items-center p-4 gap-4 transition-all hover:shadow-xl backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 hover:scale-105">
            <div className="flex-grow">
              <h3 className="font-semibold text-lg">{ticket.event.name}</h3>
              <p className="text-sm text-muted-foreground">
                Date: {new Date(ticket.event.startDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
              </p>
              <p className="text-sm text-muted-foreground">
                Ticket Code: <span className="font-mono bg-gray-100 p-1 rounded">{ticket.ticketCode}</span>
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
              <Link href={`/api/tickets/download?code=${ticket.ticketCode}`} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" /> Download Ticket
              </Link>
            </Button>
          </Card>
        ))}
      </div>
      
      {/* Help Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Need Help Finding Your Tickets?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Search by Email</p>
                <p className="text-muted-foreground">Use the email address you provided during ticket purchase.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Search by Phone Number</p>
                <p className="text-muted-foreground">Enter your phone number with country code (e.g., 254712345678).</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TicketIcon className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Search by Ticket Code</p>
                <p className="text-muted-foreground">Use the unique ticket code that was sent to you via SMS after purchase.</p>
              </div>
            </div>
          </div>
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground">
            Still can&apos;t find your tickets? <Link href="/contact" className="text-primary hover:underline">Contact our support team</Link> for assistance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}