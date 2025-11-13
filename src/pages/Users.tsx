import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Users, Shield, Crown, UserCheck, Plus } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { AddUserDialog } from "@/components/users/AddUserDialog";

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin':
      return <Crown className="w-4 h-4" />;
    case 'moderator':
      return <Shield className="w-4 h-4" />;
    default:
      return <UserCheck className="w-4 h-4" />;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'destructive';
    case 'moderator':
      return 'secondary';
    default:
      return 'outline';
  }
};

const UsersPage = () => {
  const { users, loading, updateUserRole, deleteUser, refetch } = useUsers();
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    await updateUserRole(userId, newRole);
  };

  const handleDeleteUser = async () => {
    if (deleteUserId) {
      await deleteUser(deleteUserId);
      setDeleteUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">{users.length} users</span>
          </div>
          <Button onClick={() => setAddUserDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email/Display Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Member Since</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.email || user.display_name || 'No email'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.roles?.map((role) => (
                        <Badge
                          key={role}
                          variant={getRoleColor(role) as any}
                          className="flex items-center gap-1"
                        >
                          {getRoleIcon(role)}
                          {role}
                        </Badge>
                      ))}
                      {(!user.roles || user.roles.length === 0) && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <UserCheck className="w-4 h-4" />
                          user
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        value={user.roles?.[0] || 'user'}
                        onValueChange={(value) => 
                          handleRoleChange(user.user_id, value as 'admin' | 'user')
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteUserId(user.user_id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this user? This will remove their profile but not delete their authentication account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              Remove User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddUserDialog
        open={addUserDialogOpen}
        onOpenChange={setAddUserDialogOpen}
        onUserAdded={refetch}
      />
    </div>
  );
};

export default UsersPage;