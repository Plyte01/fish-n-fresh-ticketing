'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Admin } from '@prisma/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

type AdminActionsProps = {
  admin: Admin;
  currentAdminId?: string; // Add current admin ID to prevent self-deletion
  onEdit: () => void;
  onDelete: () => void;
};

export function AdminActions({ admin, currentAdminId, onEdit, onDelete }: AdminActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const isSelf = currentAdminId === admin.id;

  const handleDelete = async () => {
    if (isSelf) {
      toast.error('You cannot delete your own account.');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete admin ${admin.email}? This action cannot be undone.`)) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete admin.');
      }
      toast.success('Admin deleted successfully.');
      onDelete();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleDelete} 
          disabled={isDeleting || isSelf}
          className={isSelf ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {isSelf ? 'Cannot Delete Self' : isDeleting ? 'Deleting...' : 'Delete'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
