'use client';

import { useEffect, useState } from 'react';
import { Admin, Permission } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AdminForm } from '@/components/admin/AdminForm';
import { AdminActions } from '@/components/admin/AdminActions';
import { toast } from 'sonner';

type AdminWithPermissions = Admin & {
  permissions: { permission: Permission }[];
};

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState<AdminWithPermissions[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminWithPermissions | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [adminsRes, permissionsRes, currentAdminRes] = await Promise.all([
        fetch('/api/admin/admins'),
        fetch('/api/admin/permissions'),
        fetch('/api/admin/current'), // Assuming we'll create this endpoint
      ]);

      if (!adminsRes.ok || !permissionsRes.ok) throw new Error('Failed to fetch data');

      const adminsData = await adminsRes.json();
      const permissionsData = await permissionsRes.json();
      
      // If current admin endpoint fails, continue without it
      if (currentAdminRes.ok) {
        const currentAdminData = await currentAdminRes.json();
        setCurrentAdminId(currentAdminData.adminId);
      }

      setAdmins(adminsData);
      setAllPermissions(permissionsData);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || 'Error loading data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingAdmin(null);
    fetchData();
  };

  const handleEditClick = (admin: AdminWithPermissions) => {
    setEditingAdmin(admin);
    setIsDialogOpen(true);
  };

  const handleCreateClick = () => {
    setEditingAdmin(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Manage Admins</h1>
        <Button onClick={handleCreateClick} className="w-full sm:w-auto">
          <span className="sm:hidden">New Admin</span>
          <span className="hidden sm:inline">Create New Admin</span>
        </Button>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingAdmin(null);
        }}
      >
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAdmin ? 'Edit Admin' : 'Create New Admin'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <AdminForm
              key={editingAdmin?.id || 'create'}
              onSuccess={handleSuccess}
              initialData={editingAdmin}
              allPermissions={allPermissions} // ✅ Ensure permissions are passed into the form
            />
          </div>
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Full Name</TableHead>
                <TableHead className="min-w-[200px]">Email</TableHead>
                <TableHead className="min-w-[200px]">Permissions</TableHead>
                <TableHead className="min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    No admins found.
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="max-w-[150px] truncate" title={admin.fullName}>
                        {admin.fullName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={admin.email}>
                        {admin.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {admin.permissions.map((p) => (
                          <Badge key={p.permission.id} variant="secondary" className="text-xs">
                            {p.permission.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <AdminActions
                        admin={admin}
                        currentAdminId={currentAdminId || undefined}
                        onDelete={fetchData}
                        onEdit={() => handleEditClick(admin)} // Pass edit handler as prop
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
