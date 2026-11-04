import { useState, useEffect } from "react";
import { adminService } from "../../services/admin.service";
import Loader from "../../components/common/Loader";
import { Search, Check, Loader2 } from "lucide-react";

export default function UsersManage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      const res = await adminService.getUsers();
      setUsers(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    setSuccessMsg(null);
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setSuccessMsg(`Role updated to ${newRole}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("Failed to update user role.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.role || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader text="Loading user accounts..." />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Users</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
              {users.length}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage user accounts and change access permissions.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-900 focus:border-black focus:ring-0 outline-none bg-white placeholder:text-gray-400 shadow-2xs"
          />
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-gray-900 text-white rounded-md text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <Check className="w-4 h-4 text-white" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Clean Human Table */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-900">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    No users found matching "{search}"
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-xs text-gray-700 shrink-0 overflow-hidden">
                        {u.avatar_url ? (
                          <img
                            src={u.avatar_url}
                            alt={u.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          u.name?.charAt(0).toUpperCase() || "U"
                        )}
                      </div>
                      <span className="font-semibold text-gray-900 text-xs">
                        {u.name || "Customer"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-normal">{u.email}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={u.role}
                          disabled={updatingId === u.id}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="text-xs font-medium border border-gray-200 rounded-md px-2.5 py-1 bg-white text-gray-800 hover:border-gray-300 focus:outline-none focus:border-black cursor-pointer shadow-2xs transition-colors"
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        {updatingId === u.id && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-700" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-normal">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Registered User"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
