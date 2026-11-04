import { useState, useEffect } from "react";
import { Plus, Check, Trash2, Edit3, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export interface UserAddress {
  id: string;
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function Addresses() {
  const { user } = useAuth();
  const storageKey = `buddy_addresses_${user?.id || "guest"}`;

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setAddresses(JSON.parse(saved));
      } else if (user) {
        // Seed initial address for user if none exists
        const initial: UserAddress[] = [
          {
            id: `addr-${Date.now()}`,
            name: user.name,
            phone: "+91 98765 43210",
            addressLine: "Flat 402, Royal Residency, 12th Main",
            city: "Bengaluru",
            state: "Karnataka",
            pincode: "560001",
            isDefault: true,
          },
        ];
        setAddresses(initial);
        localStorage.setItem(storageKey, JSON.stringify(initial));
      }
    } catch (e) {
      console.error("Failed to load addresses:", e);
    }
  }, [storageKey, user]);

  const saveToStorage = (newList: UserAddress[]) => {
    setAddresses(newList);
    localStorage.setItem(storageKey, JSON.stringify(newList));
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setName(user?.name || "");
    setPhone("");
    setAddressLine("");
    setCity("Bengaluru");
    setState("Karnataka");
    setPincode("560001");
    setIsDefault(addresses.length === 0);
    setShowModal(true);
  };

  const openEditModal = (addr: UserAddress) => {
    setEditingAddress(addr);
    setName(addr.name);
    setPhone(addr.phone);
    setAddressLine(addr.addressLine);
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
    setIsDefault(addr.isDefault);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !addressLine || !city || !pincode) return;

    let updated: UserAddress[] = [];
    if (editingAddress) {
      updated = addresses.map((a) =>
        a.id === editingAddress.id
          ? { ...a, name, phone, addressLine, city, state, pincode, isDefault }
          : isDefault
          ? { ...a, isDefault: false }
          : a
      );
    } else {
      const newAddr: UserAddress = {
        id: `addr-${Date.now()}`,
        name,
        phone,
        addressLine,
        city,
        state,
        pincode,
        isDefault: isDefault || addresses.length === 0,
      };
      if (newAddr.isDefault) {
        updated = addresses.map((a) => ({ ...a, isDefault: false }));
        updated.push(newAddr);
      } else {
        updated = [...addresses, newAddr];
      }
    }

    saveToStorage(updated);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to remove this delivery address?")) return;
    const remaining = addresses.filter((a) => a.id !== id);
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0].isDefault = true;
    }
    saveToStorage(remaining);
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveToStorage(updated);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#191142]">Your Addresses</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage your delivery locations for faster checkout</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0ea9df] hover:bg-[#0c93c4] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Address
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {/* Add Address Card */}
        <div
          onClick={openAddModal}
          className="border-2 border-dashed border-gray-300 hover:border-[#0ea9df] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-white hover:bg-cyan-50/20 transition-all min-h-[220px] shadow-2xs group"
        >
          <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-[#0ea9df]" />
          </div>
          <span className="font-bold text-sm text-[#191142]">Add Address</span>
          <p className="text-xs text-gray-500 mt-1">Add a new home, office, or gift delivery destination</p>
        </div>

        {/* Dynamic Address Cards */}
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`bg-white border rounded-xl p-5 flex flex-col justify-between shadow-2xs transition-all relative ${
              addr.isDefault ? "border-[#0ea9df] ring-2 ring-[#0ea9df]/10" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div>
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pb-2 border-b border-gray-100 flex justify-between items-center">
                <span className={addr.isDefault ? "text-[#0ea9df]" : "text-gray-500"}>
                  {addr.isDefault ? "Default Delivery Address" : "Alternate Address"}
                </span>
                {addr.isDefault && <Check className="w-4 h-4 text-[#0ea9df]" />}
              </div>

              <div className="mt-3 text-xs text-gray-800 space-y-1">
                <p className="font-bold text-sm text-[#191142]">{addr.name}</p>
                <p>{addr.addressLine}</p>
                <p>
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <p>India</p>
                {addr.phone && <p className="text-gray-500 pt-1 font-medium">Phone: {addr.phone}</p>}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <div className="flex gap-3 text-[#0ea9df] font-bold">
                <button
                  onClick={() => openEditModal(addr)}
                  className="hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <span>|</span>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-red-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>

              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-[11px] text-gray-500 hover:text-[#0ea9df] font-semibold"
                >
                  Set as Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Add / Edit Address */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-[#191142]">
                {editingAddress ? "Edit Delivery Address" : "Add a New Delivery Address"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#0ea9df]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#0ea9df]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Street Address / Flat No.</label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="Flat, House no., Building, Company, Apartment"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#0ea9df]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">City / Town</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#0ea9df]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="6 digits"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#0ea9df]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#0ea9df]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-[#0ea9df] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isDefault" className="text-gray-700 font-medium cursor-pointer">
                  Make this my default delivery address
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 rounded-lg bg-[#0ea9df] hover:bg-[#0c93c4] text-white font-bold shadow-xs transition-colors"
                >
                  {editingAddress ? "Save Changes" : "Add Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="pt-4">
        <Link
          to="/profile"
          className="text-xs text-[#0ea9df] hover:underline font-bold"
        >
          ← Back to Your Account
        </Link>
      </div>
    </div>
  );
}
