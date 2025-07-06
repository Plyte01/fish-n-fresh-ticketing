'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { EventForm } from "@/components/admin/EventForm";
import { EventActions } from "@/components/admin/EventActions";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@prisma/client";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        console.error("Failed to fetch events");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSuccess = () => {
    setDialogOpen(false);
    setEditingEvent(null);
    fetchEvents();
  };

  const handleCreate = () => {
    setEditingEvent(null);
    setDialogOpen(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Manage Events</h1>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <span className="sm:hidden">New Event</span>
          <span className="hidden sm:inline">Create New Event</span>
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) setEditingEvent(null);
      }}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <EventForm
              key={editingEvent?.id || "create"}
              initialData={editingEvent}
              onSuccess={handleSuccess}
            />
          </div>
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Event Name</TableHead>
                <TableHead className="min-w-[120px]">Venue</TableHead>
                <TableHead className="min-w-[100px]">Start Date</TableHead>
                <TableHead className="min-w-[100px]">End Date</TableHead>
                <TableHead className="min-w-[100px]">Price (KES)</TableHead>
                <TableHead className="min-w-[80px]">Status</TableHead>
                <TableHead className="text-right min-w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">Loading events...</TableCell>
                </TableRow>
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">No events found.</TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      <div className="max-w-[200px] truncate" title={event.name}>
                        {event.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate" title={event.venue}>
                        {event.venue}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(event.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(event.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm">{event.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={event.status === 'UPCOMING' ? 'default' : 'secondary'} className="text-xs">
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <EventActions 
                        event={event} 
                        onEdit={() => handleEdit(event)} 
                        onSuccess={fetchEvents} 
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
