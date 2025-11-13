import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
  email?: string;
  roles?: string[];
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles first
      const { data: profiles, error: profilesError } = await supabase
        .from("mo-profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Then fetch roles for each user
      const enrichedUsers = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: userRoles } = await supabase
            .from("mo-user_roles")
            .select("role")
            .eq("user_id", profile.user_id);

          return {
            ...profile,
            roles: userRoles?.map(ur => ur.role) || [],
            email: profile.display_name // This is typically the email from the trigger
          };
        })
      );

      setUsers(enrichedUsers);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      // First, remove existing role
      await supabase
        .from("mo-user_roles")
        .delete()
        .eq("user_id", userId);

      // Then add new role
      const { error } = await supabase
        .from("mo-user_roles")
        .insert([{ user_id: userId, role: newRole }]);

      if (error) throw error;

      // Refresh users list
      await fetchUsers();
      
      toast({
        title: "Role updated",
        description: "User role has been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user role.",
      });
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Note: This will only remove from profiles table
      // The actual auth user would need to be removed via Supabase Admin API
      const { error } = await supabase
        .from("mo-profiles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      setUsers(prev => prev.filter(user => user.user_id !== userId));
      
      toast({
        title: "User removed",
        description: "User has been removed from the system.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove user.",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    updateUserRole,
    deleteUser,
    refetch: fetchUsers,
  };
};