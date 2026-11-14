"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  UserCheck,
  UserCog,
  Crown,
  ShieldCheck,
  Search,
  Edit,
  Trash2,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle,
  Calendar,
  Ban,
  Unlock,
} from "lucide-react";
import { adminFetch, getAdminUser, AdminUser, formatDate } from "@/app/lib/admin-api";
import { API_ENDPOINTS } from "@/constants/endpoints";
import DeleteModal from "@/components/admin/DeleteModal";
import ProfileModal from "@/components/admin/ProfileModal";

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
  blocked?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export default function UsersManagementPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "SUPER_ADMIN" | "ADMIN" | "BLOCKED">("ALL");

  // Create / Edit modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN" as "SUPER_ADMIN" | "ADMIN",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<SystemUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Block / Unblock modal state
  const [blockTarget, setBlockTarget] = useState<SystemUser | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);

  // Profile modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    const user = getAdminUser();
    setCurrentUser(user);

    if (user && user.role !== "SUPER_ADMIN") {
      router.push("/admin");
    }

    const handleUserUpdate = () => {
      setCurrentUser(getAdminUser());
      fetchUsers();
    };
    window.addEventListener("admin_user_updated", handleUserUpdate);
    return () => window.removeEventListener("admin_user_updated", handleUserUpdate);
  }, [router]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch<SystemUser[]>(API_ENDPOINTS.USERS);
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        // Fallback: check if data is in response or res has data
        const rawUsers = (res as any)?.data || [];
        if (Array.isArray(rawUsers)) {
          setUsers(rawUsers);
        }
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Prevent scroll when modal open
  useEffect(() => {
    if (isFormOpen || deleteTarget || blockTarget) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFormOpen, deleteTarget, blockTarget]);

  // Open Create modal
  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "ADMIN",
    });
    setShowPassword(false);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (user: SystemUser) => {
    if (user.id === currentUser?.id) {
      setProfileModalOpen(true);
      return;
    }

    if (user.role === "SUPER_ADMIN") {
      showToast("Super Admins cannot edit other Super Admins. View only.");
      return;
    }

    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // empty for edit, only update if filled
      role: user.role,
    });
    setShowPassword(false);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Submit Form (Create or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Full name is required.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setFormError("A valid email address is required.");
      return;
    }

    if (!editingUser && (!formData.password || formData.password.length < 6)) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    if (editingUser && formData.password && formData.password.length < 6) {
      setFormError("New password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingUser) {
        // Update user
        const payload: any = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
        };
        if (formData.password.trim()) {
          payload.password = formData.password.trim();
        }

        const res = await adminFetch(`${API_ENDPOINTS.USERS}/${editingUser.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        if (!res.success) {
          setFormError(res.message || "Failed to update user.");
          setIsSubmitting(false);
          return;
        }

        showToast(`User "${formData.name}" updated successfully.`);
      } else {
        // Create user
        const res = await adminFetch(API_ENDPOINTS.USERS, {
          method: "POST",
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password.trim(),
            role: formData.role,
          }),
        });

        if (!res.success) {
          setFormError(res.message || "Failed to create user.");
          setIsSubmitting(false);
          return;
        }

        showToast(`User "${formData.name}" created successfully.`);
      }

      setIsFormOpen(false);
      fetchUsers();
    } catch (err: any) {
      console.error("Save user error:", err);
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete User
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.id === currentUser?.id) {
      showToast("You cannot delete your own account.");
      setDeleteTarget(null);
      return;
    }

    if (deleteTarget.role === "SUPER_ADMIN") {
      showToast("Super Admins cannot delete other Super Admins. View only.");
      setDeleteTarget(null);
      return;
    }

    setIsDeleting(true);
    try {
      const res = await adminFetch(`${API_ENDPOINTS.USERS}/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.success) {
        showToast(res.message || "Failed to delete user.");
        setIsDeleting(false);
        setDeleteTarget(null);
        return;
      }

      showToast(`User "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      console.error("Delete user error:", err);
      showToast("An unexpected error occurred while deleting user.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle Block / Recover User
  const handleToggleBlockConfirm = async () => {
    if (!blockTarget) return;

    if (blockTarget.id === currentUser?.id) {
      showToast("You cannot block your own account.");
      setBlockTarget(null);
      return;
    }

    if (blockTarget.role === "SUPER_ADMIN") {
      showToast("Super Admins cannot block other Super Admins.");
      setBlockTarget(null);
      return;
    }

    setIsBlocking(true);
    try {
      const nextBlocked = !blockTarget.blocked;
      const res = await adminFetch(`${API_ENDPOINTS.USERS}/${blockTarget.id}`, {
        method: "PATCH",
        body: JSON.stringify({ blocked: nextBlocked }),
      });

      if (!res.success) {
        showToast(res.message || "Failed to update user block status.");
        setIsBlocking(false);
        setBlockTarget(null);
        return;
      }

      showToast(
        nextBlocked
          ? `User "${blockTarget.name}" blocked. Notification email sent.`
          : `User "${blockTarget.name}" unblocked & recovered. Notification email sent.`
      );
      setBlockTarget(null);
      fetchUsers();
    } catch (err) {
      console.error("Block toggle error:", err);
      showToast("An unexpected error occurred while updating status.");
    } finally {
      setIsBlocking(false);
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole =
        roleFilter === "ALL"
          ? true
          : roleFilter === "BLOCKED"
          ? Boolean(user.blocked)
          : user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const superAdminCount = users.filter((u) => u.role === "SUPER_ADMIN").length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const blockedCount = users.filter((u) => u.blocked).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-neutral-900 border border-white/10 text-white text-xs font-semibold shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer ml-2"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header Cards & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Total Users
            </p>
            <p className="text-2xl font-black text-white mt-1">{users.length}</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-300">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Super Admins */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Super Admins
            </p>
            <p className="text-2xl font-black text-white mt-1">{superAdminCount}</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-center text-[#D32F2F]">
            <Crown className="h-5 w-5" />
          </div>
        </div>

        {/* Regular Admins */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Admins
            </p>
            <p className="text-2xl font-black text-white mt-1">{adminCount}</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        {/* Blocked Accounts */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Blocked Users
            </p>
            <p className={`text-2xl font-black mt-1 ${blockedCount > 0 ? "text-amber-400" : "text-white"}`}>
              {blockedCount}
            </p>
          </div>
          <div
            className={`h-11 w-11 rounded-xl border flex items-center justify-center ${
              blockedCount > 0
                ? "bg-amber-950/40 border-amber-500/30 text-amber-400"
                : "bg-white/[0.04] border-white/10 text-neutral-500"
            }`}
          >
            <Ban className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Search, Filter & Actions Toolbar */}
      <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-[#D32F2F] transition-all"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10 w-full sm:w-auto overflow-x-auto">
            {(["ALL", "SUPER_ADMIN", "ADMIN", "BLOCKED"] as const).map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  roleFilter === role
                    ? role === "BLOCKED"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-[#D32F2F] text-white shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {role === "ALL"
                  ? "All Roles"
                  : role === "SUPER_ADMIN"
                  ? "Super Admin"
                  : role === "ADMIN"
                  ? "Admin"
                  : `Blocked (${blockedCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            title="Refresh users list"
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D32F2F] hover:bg-[#b71c1c] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl bg-[#141414] border border-white/10 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/[0.02] text-neutral-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Created Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#D32F2F] mb-2" />
                    <span>Loading administrators...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400">
                    <Users className="h-8 w-8 mx-auto text-neutral-600 mb-2" />
                    <p className="font-semibold text-white">No administrators found</p>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {searchQuery
                        ? "Try clearing your search query or filters."
                        : "Click 'Add User' above to invite or create a new administrator."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrent = user.id === currentUser?.id;
                  const isSuper = user.role === "SUPER_ADMIN";
                  const isOtherSuper = isSuper && !isCurrent;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* User Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 text-white ${
                              isSuper
                                ? "bg-gradient-to-br from-[#D32F2F] to-[#7f1d1d] border border-red-500/40 shadow-sm"
                                : "bg-neutral-800 border border-white/10 text-neutral-300"
                            }`}
                          >
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-white truncate text-sm">
                                {user.name}
                              </p>
                              {isCurrent && (
                                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/30 text-emerald-400">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-neutral-400 text-xs truncate mt-0.5">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-6">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-[11px] font-bold text-red-300 uppercase tracking-wider">
                            <Crown className="h-3.5 w-3.5 text-red-400" />
                            SUPER ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                            <ShieldCheck className="h-3.5 w-3.5 text-neutral-400" />
                            ADMIN
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-6">
                        {user.blocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-950/60 border border-red-500/40 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                            <Ban className="h-3 w-3" />
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-6 text-neutral-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit button */}
                          <button
                            onClick={() => !isCurrent && !isOtherSuper && handleOpenEdit(user)}
                            disabled={isCurrent || isOtherSuper}
                            title={
                              isCurrent
                                ? "Manage your details in Profile settings"
                                : isOtherSuper
                                ? "Cannot edit other Super Admins"
                                : "Edit Administrator"
                            }
                            className={`p-2 rounded-lg transition-colors ${
                              isCurrent || isOtherSuper
                                ? "text-neutral-600 cursor-not-allowed opacity-30 hover:bg-transparent"
                                : "text-neutral-400 hover:text-white hover:bg-white/10 cursor-pointer"
                            }`}
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          {/* Block / Recover button */}
                          <button
                            onClick={() => !isCurrent && !isOtherSuper && setBlockTarget(user)}
                            disabled={isCurrent || isOtherSuper}
                            title={
                              isCurrent
                                ? "You cannot block yourself"
                                : isOtherSuper
                                ? "Super Admins cannot block other Super Admins"
                                : user.blocked
                                ? "Recover / Unblock Administrator"
                                : "Block Administrator"
                            }
                            className={`p-2 rounded-lg transition-colors ${
                              isCurrent || isOtherSuper
                                ? "text-neutral-600 cursor-not-allowed opacity-30 hover:bg-transparent"
                                : user.blocked
                                ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30 cursor-pointer"
                                : "text-neutral-400 hover:text-amber-400 hover:bg-amber-950/30 cursor-pointer"
                            }`}
                          >
                            {user.blocked ? (
                              <Unlock className="h-4 w-4" />
                            ) : (
                              <Ban className="h-4 w-4" />
                            )}
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => !isCurrent && !isOtherSuper && setDeleteTarget(user)}
                            disabled={isCurrent || isOtherSuper}
                            title={
                              isCurrent
                                ? "You cannot delete yourself"
                                : isOtherSuper
                                ? "Cannot delete other Super Admins"
                                : "Delete Administrator"
                            }
                            className={`p-2 rounded-lg transition-colors ${
                              isCurrent || isOtherSuper
                                ? "text-neutral-600 cursor-not-allowed opacity-30 hover:bg-transparent"
                                : "text-neutral-400 hover:text-[#D32F2F] hover:bg-red-950/30 cursor-pointer"
                            }`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#141414] border border-white/15 p-6 sm:p-7 shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              disabled={isSubmitting}
              className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-30"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4 mb-6 pr-10">
              <div className="h-11 w-11 rounded-2xl bg-red-950/50 border border-red-500/30 flex items-center justify-center text-[#D32F2F] shrink-0">
                {editingUser ? (
                  <UserCog className="h-5 w-5" />
                ) : (
                  <UserPlus className="h-5 w-5" />
                )}
              </div>
              <div className="pt-0.5">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {editingUser ? "Edit Administrator" : "Add New Administrator"}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  {editingUser
                    ? "Update administrator account details and system privileges."
                    : "Create a new administrator credential with granular privileges."}
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative group rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 focus-within:border-[#D32F2F] transition-all">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. John Doe"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-transparent text-white placeholder-neutral-500 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative group rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 focus-within:border-[#D32F2F] transition-all">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="user@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-transparent text-white placeholder-neutral-500 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Role Select */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "ADMIN" })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      formData.role === "ADMIN"
                        ? "bg-white/[0.08] border-white/30 text-white shadow-sm ring-1 ring-white/20"
                        : "bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 font-bold text-xs text-white">
                      <div
                        className={`h-6 w-6 rounded-lg flex items-center justify-center transition-colors ${
                          formData.role === "ADMIN"
                            ? "bg-white/20 text-white"
                            : "bg-white/5 text-neutral-400"
                        }`}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </div>
                      <span>Admin</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1.5 leading-snug">
                      Manages registrations, events, inquiries, blogs & camp pricing.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "SUPER_ADMIN" })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      formData.role === "SUPER_ADMIN"
                        ? "bg-red-950/60 border-[#D32F2F] text-white shadow-sm ring-1 ring-red-500/40"
                        : "bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 font-bold text-xs text-red-400">
                      <div
                        className={`h-6 w-6 rounded-lg flex items-center justify-center transition-colors ${
                          formData.role === "SUPER_ADMIN"
                            ? "bg-red-500/25 text-[#D32F2F]"
                            : "bg-white/5 text-neutral-400"
                        }`}
                      >
                        <Crown className="h-3.5 w-3.5" />
                      </div>
                      <span>Super Admin</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1.5 leading-snug">
                      Full system control including managing administrators & users.
                    </p>
                  </button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  {editingUser ? "New Password (optional)" : "Account Password"}
                </label>
                <div className="relative group rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 focus-within:border-[#D32F2F] transition-all">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder={
                      editingUser
                        ? "Leave blank to keep existing password"
                        : "Minimum 6 characters"
                    }
                    required={!editingUser}
                    className="w-full pl-10 pr-11 py-2.5 bg-transparent text-white placeholder-neutral-500 text-sm focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {editingUser && (
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Only enter a value if you wish to reset this user's password.
                  </p>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#D32F2F] hover:bg-[#b71c1c] text-white transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingUser ? (
                    "Save Changes"
                  ) : (
                    "Create User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteModal
          isOpen={true}
          title="Delete Administrator"
          description={`Are you sure you want to delete "${deleteTarget.name}" (${deleteTarget.email})? This user will immediately lose access to the admin portal.`}
          confirmText="Delete"
          icon={<Trash2 className="h-5 w-5 text-[#D32F2F]" />}
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {/* Block / Recover Confirmation Modal */}
      {blockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#141414] border border-white/10 p-6 shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setBlockTarget(null)}
              disabled={isBlocking}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4">
              <div
                className={`h-11 w-11 rounded-2xl border flex items-center justify-center shrink-0 ${
                  blockTarget.blocked
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                    : "bg-red-950/40 border-red-500/30 text-[#D32F2F]"
                }`}
              >
                {blockTarget.blocked ? (
                  <Unlock className="h-5 w-5" />
                ) : (
                  <Ban className="h-5 w-5" />
                )}
              </div>

              <div className="flex-1 pr-4">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {blockTarget.blocked ? "Recover Administrator" : "Block Administrator"}
                </h3>
                <p className="mt-1 text-sm font-semibold text-neutral-300 font-mono break-all">
                  "{blockTarget.name}" ({blockTarget.email})
                </p>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  {blockTarget.blocked
                    ? "Are you sure you want to unblock this administrator? Their login access will be immediately restored and an email notification will be sent."
                    : "Are you sure you want to block this administrator? They will immediately be prevented from logging in to the admin portal and an email notification will be sent."}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setBlockTarget(null)}
                disabled={isBlocking}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleToggleBlockConfirm}
                disabled={isBlocking}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-colors duration-150 active:scale-[0.98] disabled:opacity-50 cursor-pointer ${
                  blockTarget.blocked
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-[#D32F2F] hover:bg-[#b71c1c]"
                }`}
              >
                {isBlocking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : blockTarget.blocked ? (
                  "Unblock User"
                ) : (
                  "Block User"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile & Security Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSuccess={(updated) => {
          setCurrentUser(updated);
          fetchUsers();
          showToast("Profile updated successfully.");
        }}
      />
    </div>
  );
}
