import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  createAmenity,
  createRoom,
  createDiscount,
  deleteAmenity,
  deleteRoom,
  deleteBooking,
  deleteDiscount,
  getAdminData,
  updateAmenity,
  updateRoom,
  updateBookingStatus,
  toggleDiscountActive,
} from "./api";
import { useAuth } from "@/hooks/useAuth";
import type { Amenity, Room, Booking, Discount } from "../types/admin";
import yuhrumLogo from "../assets/yuhrumlogo.png";
import {
  LogOut,
  ArrowUpRight,
  Edit2,
  Trash2,
  LayoutDashboard,
  Calendar,
  Users,
  Tag,
  Home,
  Waves,
  Plus,
  Sun,
  Moon,
  Sunrise,
} from "lucide-react";

const STAY_LABELS: Record<string, { label: string; Icon: React.ElementType }> = {
  dayStay: { label: "Day Stay", Icon: Sun },
  nightStay: { label: "Night Stay", Icon: Moon },
  overnight: { label: "Overnight", Icon: Sunrise },
};

const emptyRoom = {
  name: "",
  category: "Suites",
  description: "",
  features: "",
  price: "",
  ctaLabel: "View Details",
  image: "",
};
const emptyAmenity = { title: "", text: "" };
const emptyDiscount: Omit<Discount, "id" | "created_at"> = {
  code: "",
  discount_type: "percentage",
  amount: 10,
  is_active: true,
};

type Tab =
  | "overview"
  | "calendar"
  | "bookings"
  | "discounts"
  | "spaces"
  | "amenities";

export function AdminPage() {
  const { user, signOut } = useAuth();
  const loggedIn = Boolean(user);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);

  const [tab, setTab] = useState<Tab>("overview");

  const [roomForm, setRoomForm] = useState(emptyRoom);
  const [amenityForm, setAmenityForm] = useState(emptyAmenity);
  const [discountForm, setDiscountForm] = useState(emptyDiscount);

  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingAmenityId, setEditingAmenityId] = useState<string | null>(null);

  useEffect(() => {
    if (!loggedIn) return;
    setLoading(true);
    void getAdminData()
      .then((data) => {
        setRooms(data.rooms);
        setAmenities(data.amenities);
        setBookings(data.bookings);
        setDiscounts(data.discounts);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [loggedIn]);

  // Inactivity timeout: 20 minutes
  useEffect(() => {
    if (!loggedIn) return;

    let timeoutId: number;

    const resetTimer = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(
        () => {
          signOut().then(() => {
            setError("Session expired due to inactivity. Please log in again.");
          });
        },
        20 * 60 * 1000,
      ); // 20 minutes
    };

    const events = ["mousemove", "keydown", "scroll", "click"];
    events.forEach((e) => window.addEventListener(e, resetTimer));

    resetTimer();

    return () => {
      window.clearTimeout(timeoutId);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [loggedIn]);

  const handleRoomSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!roomForm.name || !roomForm.image) return;
    try {
      if (editingRoomId) {
        const updated = await updateRoom(editingRoomId, roomForm);
        setRooms((items) =>
          items.map((r) => (r.id === updated.id ? updated : r)),
        );
      } else {
        const created = await createRoom(roomForm);
        setRooms((items) => [created, ...items]);
      }
      setRoomForm(emptyRoom);
      setEditingRoomId(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleAmenitySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!amenityForm.title || !amenityForm.text) return;
    try {
      if (editingAmenityId) {
        const updated = await updateAmenity(editingAmenityId, amenityForm);
        setAmenities((items) =>
          items.map((a) => (a.id === updated.id ? updated : a)),
        );
      } else {
        const created = await createAmenity(amenityForm);
        setAmenities((items) => [created, ...items]);
      }
      setAmenityForm(emptyAmenity);
      setEditingAmenityId(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDiscountSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!discountForm.code || !discountForm.amount) return;
    try {
      const created = await createDiscount(discountForm);
      setDiscounts((items) => [created, ...items]);
      setDiscountForm(emptyDiscount);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const fmt = (n: number) => `₱${n.toLocaleString()}`;

  // Derived Analytics
  const totalRevenue = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((acc, b) => acc + b.total_price, 0);
  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "bookings", label: "Bookings", icon: Users },
    { id: "discounts", label: "Discounts", icon: Tag },
    { id: "spaces", label: "Villa Spaces", icon: Home },
    { id: "amenities", label: "Amenities", icon: Waves },
  ];

  return (
    <div className="min-h-screen bg-petal text-plum flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0 border-r border-blush/20 bg-white">
        <div className="flex h-20 items-center justify-between border-b border-blush/20 px-6 md:px-8">
          <img
            src={yuhrumLogo}
            alt="Yuhrum Villas"
            className="h-8 w-auto object-contain"
          />
          <div className="md:hidden">
            <button
              onClick={() => signOut()}
              className="text-shadow/70 hover:text-plum"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
        <nav className="flex overflow-x-auto md:flex-col md:overflow-visible py-4 px-3 gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex shrink-0 items-center gap-3 px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] transition-colors ${
                tab === item.id
                  ? "bg-plum text-petal"
                  : "text-shadow hover:bg-petal hover:text-plum"
              }`}
            >
              <item.icon className="size-4" /> {item.label}
            </button>
          ))}
        </nav>
        <div className="hidden md:block absolute bottom-0 left-0 w-64 border-t border-blush/20 bg-petal p-4">
          <a
            href="/"
            target="_blank"
            className="flex w-full items-center justify-center gap-2 border border-blush/20 bg-white px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-plum hover:border-[#0A192F] transition-colors"
          >
            View Live Site <ArrowUpRight className="size-3" />
          </a>
          <button
            onClick={() => signOut()}
            className="mt-3 flex w-full items-center justify-center gap-2 bg-plum text-petal px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] transition-all hover:bg-shadow px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em]"
          >
            <LogOut className="size-3" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:p-12">
        <div className="mb-8">
          <h1 className="font-display italic text-4xl text-plum">
            {navItems.find((n) => n.id === tab)?.label}
          </h1>
          {loading && (
            <p className="mt-2 text-[10px] uppercase tracking-widest text-shadow/70">
              Syncing database...
            </p>
          )}
          {error && (
            <p className="mt-4 border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="border border-blush/20 bg-white p-6 shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.2em] text-shadow/70">
                  Total Bookings
                </p>
                <p className="mt-2 font-display italic text-4xl text-plum">
                  {bookings.length}
                </p>
                {pendingCount > 0 && (
                  <p className="mt-2 text-xs text-orange-600 font-medium">
                    {pendingCount} pending approval
                  </p>
                )}
              </div>
              <div className="border border-blush/20 bg-white p-6 shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.2em] text-shadow/70">
                  Confirmed Revenue
                </p>
                <p className="mt-2 font-display italic text-4xl text-plum">
                  {fmt(totalRevenue)}
                </p>
              </div>
              <div className="border border-blush/20 bg-white p-6 shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.2em] text-shadow/70">
                  Active Discounts
                </p>
                <p className="mt-2 font-display italic text-4xl text-plum">
                  {discounts.filter((d) => d.is_active).length}
                </p>
              </div>
              <div className="border border-blush/20 bg-white p-6 shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.2em] text-shadow/70">
                  Managed Spaces
                </p>
                <p className="mt-2 font-display italic text-4xl text-plum">
                  {rooms.length}
                </p>
              </div>
            </div>

            <h2 className="font-display italic text-2xl text-plum border-b border-blush/20 pb-3 mt-10">
              Recent Bookings
            </h2>
            <div className="overflow-x-auto border border-blush/20 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-petal text-[10px] uppercase tracking-[0.15em] text-shadow/70">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Guest</th>
                    <th className="px-6 py-4 font-semibold">Package</th>
                    <th className="px-6 py-4 font-semibold">Check In</th>
                    <th className="px-6 py-4 font-semibold">Total</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.slice(0, 5).map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-plum">
                        {b.guest_name}
                      </td>
                      <td className="px-6 py-4 text-shadow">
                        <div className="flex items-center gap-1.5">
                          {b.stay_type && STAY_LABELS[b.stay_type] && (
                            <>
                              <span className="text-plum">
                                {STAY_LABELS[b.stay_type].label}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-shadow">{b.check_in}</td>
                      <td className="px-6 py-4 text-shadow">
                        {fmt(b.total_price)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block border px-2 py-1 text-[10px] uppercase tracking-0.1em font-semibold ${
                            b.status === "confirmed"
                              ? "border-green-200 bg-green-50 text-green-700"
                              : b.status === "cancelled"
                                ? "border-red-200 bg-red-50 text-red-700"
                                : "border-orange-200 bg-orange-50 text-orange-700"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-shadow/70"
                      >
                        No bookings yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CALENDAR TAB */}
        {tab === "calendar" && (
          <div className="space-y-6">
            <div className="border border-blush/20 bg-white p-6 shadow-sm">
              <p className="text-sm text-shadow leading-relaxed">
                A visual calendar view requires a complex grid component. For
                now, here is a chronological list of all confirmed upcoming
                bookings.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bookings
                .filter((b) => b.status === "confirmed")
                .sort(
                  (a, b) =>
                    new Date(a.check_in).getTime() -
                    new Date(b.check_in).getTime(),
                )
                .map((b) => (
                  <div
                    key={b.id}
                    className="border-l-4 border-#0A192F bg-white border-y border-r border-blush/20 p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-0.1em text-plum">
                      <Calendar className="size-4" /> {b.check_in}
                      {b.stay_type && (
                        <span className="ml-auto bg-gray-100 px-2 py-0.5 rounded text-[9px]">
                          {STAY_LABELS[b.stay_type]?.label}
                        </span>
                      )}
                    </div>
                    <p className="font-display italic text-xl text-plum">
                      {b.guest_name}
                    </p>
                    <p className="text-sm text-shadow/70">{b.guests} guests</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {tab === "bookings" && (
          <div className="overflow-x-auto border border-blush/20 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-petal text-[10px] uppercase tracking-[0.15em] text-shadow/70">
                <tr>
                  <th className="px-6 py-4 font-semibold">Guest Details</th>
                  <th className="px-6 py-4 font-semibold">Stay Details</th>
                  <th className="px-6 py-4 font-semibold">Package</th>
                  <th className="px-6 py-4 font-semibold">Pricing</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-plum">
                        {b.guest_name}
                      </p>
                      <p className="text-xs text-shadow/70">{b.email}</p>
                      <p className="text-xs text-shadow/70">{b.phone || "—"}</p>
                    </td>
                    <td className="px-6 py-4 text-shadow">
                      {b.check_in}
                      <p className="text-xs text-shadow/50 mt-1">
                        {b.guests} pax
                      </p>
                    </td>
                    <td className="px-6 py-4 text-shadow">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">
                          {STAY_LABELS[b.stay_type]?.label || b.stay_type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-plum">
                      {fmt(b.total_price)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={b.status}
                        onChange={async (e) => {
                          const val = e.target.value as any;
                          try {
                            const updated = await updateBookingStatus(
                              b.id,
                              val,
                            );
                            setBookings((items) =>
                              items.map((i) =>
                                i.id === updated.id ? updated : i,
                              ),
                            );
                          } catch (err) {
                            alert("Failed to update status.");
                          }
                        }}
                        className={`border px-3 py-1.5 text-[10px] uppercase tracking-0.1em font-semibold outline-none ${
                          b.status === "confirmed"
                            ? "border-green-300 bg-green-50 text-green-700 focus:border-green-500"
                            : b.status === "cancelled"
                              ? "border-red-300 bg-red-50 text-red-700 focus:border-red-500"
                              : "border-orange-300 bg-orange-50 text-orange-700 focus:border-orange-500"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={async () => {
                          if (confirm("Permanently delete this booking?")) {
                            await deleteBooking(b.id);
                            setBookings((items) =>
                              items.filter((i) => i.id !== b.id),
                            );
                          }
                        }}
                        className="text-shadow/50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="size-4 ml-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-shadow/70"
                    >
                      No bookings found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* DISCOUNTS TAB */}
        {tab === "discounts" && (
          <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
            <form
              onSubmit={handleDiscountSubmit}
              className="h-fit space-y-5 border border-blush/20 bg-white p-7 shadow-sm"
            >
              <h2 className="font-display italic text-2xl text-plum border-b border-blush/10 pb-4 mb-6 flex items-center gap-2">
                <Tag className="size-5" /> Generate Discount
              </h2>
              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-shadow/70">
                  Promo Code
                </label>
                <input
                  value={discountForm.code}
                  onChange={(e) =>
                    setDiscountForm((v) => ({
                      ...v,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  className="w-full border border-blush/20 bg-petal px-4 py-3 text-sm font-medium uppercase tracking-widest outline-none focus:border-[#0A192F]"
                  placeholder="SUMMER20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-shadow/70">
                    Type
                  </label>
                  <select
                    value={discountForm.discount_type}
                    onChange={(e) =>
                      setDiscountForm((v) => ({
                        ...v,
                        discount_type: e.target.value as any,
                      }))
                    }
                    className="w-full border border-blush/20 bg-petal px-4 py-3.5 text-sm outline-none focus:border-[#0A192F]"
                  >
                    <option value="percentage">% Percentage</option>
                    <option value="fixed">₱ Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-shadow/70">
                    Value
                  </label>
                  <input
                    title="number"
                    type="number"
                    value={discountForm.amount}
                    onChange={(e) =>
                      setDiscountForm((v) => ({
                        ...v,
                        amount: Number(e.target.value),
                      }))
                    }
                    className="w-full border border-blush/20 bg-petal px-4 py-3 text-sm outline-none focus:border-[#0A192F]"
                  />
                </div>
              </div>
              <button className="w-full bg-plum text-petal px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] transition-all hover:bg-shadow mt-4 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] flex justify-center items-center gap-2">
                <Plus className="size-4" /> Create Promo Code
              </button>
            </form>

            <div className="grid gap-4 sm:grid-cols-2">
              {discounts.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-col justify-between border border-blush/20 bg-white p-6 shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-plum uppercase tracking-[0.15em] text-lg">
                        {d.code}
                      </span>
                      <button
                        onClick={async () => {
                          const updated = await toggleDiscountActive(
                            d.id,
                            !d.is_active,
                          );
                          setDiscounts((items) =>
                            items.map((i) => (i.id === d.id ? updated : i)),
                          );
                        }}
                        className={`border px-3 py-1 text-[10px] uppercase tracking-0.1em font-semibold transition-colors ${
                          d.is_active
                            ? "border-green-300 bg-green-50 text-green-700"
                            : "border-gray-300 bg-gray-50 text-shadow/70"
                        }`}
                      >
                        {d.is_active ? "Active" : "Disabled"}
                      </button>
                    </div>
                    <p className="mt-4 text-sm text-shadow">
                      Value:{" "}
                      <strong className="text-plum">
                        {d.discount_type === "percentage"
                          ? `${d.amount}% OFF`
                          : `₱${d.amount} OFF`}
                      </strong>
                    </p>
                  </div>
                  <div className="mt-6 border-t border-blush/10 pt-4 flex justify-end">
                    <button
                      onClick={async () => {
                        if (confirm("Delete discount code?")) {
                          await deleteDiscount(d.id);
                          setDiscounts((items) =>
                            items.filter((i) => i.id !== d.id),
                          );
                        }
                      }}
                      className="text-xs text-red-600 hover:underline uppercase tracking-wider font-medium"
                    >
                      Delete Code
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SPACES TAB (Legacy Rooms) */}
        {tab === "spaces" && (
          <div className="grid gap-10 lg:grid-cols-[400px_1fr]">
            <form
              onSubmit={handleRoomSubmit}
              className="h-fit space-y-4 border border-blush/20 bg-white p-7 shadow-sm"
            >
              <h2 className="font-display italic text-2xl text-plum border-b border-blush/10 pb-4 mb-6">
                {editingRoomId ? "Edit Space" : "Add New Space"}
              </h2>
              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-shadow/70">
                  Space Name
                </label>
                <input
                  value={roomForm.name}
                  onChange={(e) =>
                    setRoomForm((v) => ({ ...v, name: e.target.value }))
                  }
                  className="w-full border border-blush/20 bg-petal px-4 py-3 text-sm outline-none focus:border-[#0A192F]"
                  placeholder="e.g. Master Suite"
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-shadow/70">
                  Category
                </label>
                <input
                  value={roomForm.category}
                  onChange={(e) =>
                    setRoomForm((v) => ({ ...v, category: e.target.value }))
                  }
                  className="w-full border border-blush/20 bg-petal px-4 py-3 text-sm outline-none focus:border-[#0A192F]"
                  placeholder="e.g. Bedroom"
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-shadow/70">
                  Description
                </label>
                <textarea
                  value={roomForm.description}
                  onChange={(e) =>
                    setRoomForm((v) => ({ ...v, description: e.target.value }))
                  }
                  className="min-h-24 w-full border border-blush/20 bg-petal px-4 py-3 text-sm outline-none focus:border-[#0A192F]"
                  placeholder="Describe the space..."
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-shadow/70">
                  Features Highlights
                </label>
                <input
                  value={roomForm.features}
                  onChange={(e) =>
                    setRoomForm((v) => ({ ...v, features: e.target.value }))
                  }
                  className="w-full border border-blush/20 bg-petal px-4 py-3 text-sm outline-none focus:border-[#0A192F]"
                  placeholder="e.g. King Bed · Ocean View"
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-shadow/70">
                  Image URL
                </label>
                <input
                  value={roomForm.image}
                  onChange={(e) =>
                    setRoomForm((v) => ({ ...v, image: e.target.value }))
                  }
                  className="w-full border border-blush/20 bg-petal px-4 py-3 text-sm outline-none focus:border-[#0A192F]"
                  placeholder="https://..."
                />
              </div>
              <div className="pt-4 border-t border-blush/10">
                <button className="w-full bg-plum text-petal px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] transition-all hover:bg-shadow py-3.5 text-xs font-semibold uppercase tracking-[0.15em]">
                  {editingRoomId ? "Update Space" : "Save New Space"}
                </button>
                {editingRoomId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRoomId(null);
                      setRoomForm(emptyRoom);
                    }}
                    className="mt-3 w-full border border-blush/20 bg-white py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-shadow hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="grid gap-5">
              {rooms.map((room) => (
                <article
                  key={room.id}
                  className="flex flex-col sm:flex-row gap-6 border border-blush/20 bg-white p-6 shadow-sm"
                >
                  <div className="h-40 w-full sm:w-48 shrink-0 overflow-hidden border border-blush/10">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-display italic text-2xl text-plum">
                        {room.name}
                      </h3>
                      <p className="mt-4 text-sm leading-relaxed text-shadow line-clamp-2">
                        {room.description}
                      </p>
                    </div>
                    <div className="mt-6 flex gap-3 border-t border-blush/10 pt-4">
                      <button
                        onClick={() => {
                          setEditingRoomId(room.id);
                          setRoomForm({ ...room });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="flex items-center gap-2 border border-blush/20 bg-petal px-4 py-2 text-[10px] font-semibold uppercase tracking-0.1em text-plum hover:border-[#0A192F] transition-colors"
                      >
                        <Edit2 className="size-3" /> Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm("Delete?")) {
                            await deleteRoom(room.id);
                            setRooms((i) => i.filter((r) => r.id !== room.id));
                          }
                        }}
                        className="flex items-center gap-2 border border-red-200 bg-red-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-0.1em text-red-700 hover:border-red-300 transition-colors"
                      >
                        <Trash2 className="size-3" /> Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* AMENITIES TAB */}
        {tab === "amenities" && (
          <div className="grid gap-10 lg:grid-cols-[400px_1fr]">
            <form
              onSubmit={handleAmenitySubmit}
              className="h-fit space-y-4 border border-blush/20 bg-white p-7 shadow-sm"
            >
              <h2 className="font-display italic text-2xl text-plum border-b border-blush/10 pb-4 mb-6">
                {editingAmenityId ? "Edit Amenity" : "Add New Amenity"}
              </h2>
              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-shadow/70">
                  Title
                </label>
                <input
                  title="amenity"
                  value={amenityForm.title}
                  onChange={(e) =>
                    setAmenityForm((v) => ({ ...v, title: e.target.value }))
                  }
                  className="w-full border border-blush/20 bg-petal px-4 py-3 text-sm outline-none focus:border-[#0A192F]"
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-shadow/70">
                  Description
                </label>
                <textarea
                  title="amenity"
                  value={amenityForm.text}
                  onChange={(e) =>
                    setAmenityForm((v) => ({ ...v, text: e.target.value }))
                  }
                  className="min-h-24 w-full border border-blush/20 bg-petal px-4 py-3 text-sm outline-none focus:border-[#0A192F]"
                />
              </div>
              <div className="pt-4 border-t border-blush/10">
                <button className="w-full bg-plum text-petal px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] transition-all hover:bg-shadow py-3.5 text-xs font-semibold uppercase tracking-[0.15em]">
                  {editingAmenityId ? "Update Amenity" : "Save Amenity"}
                </button>
                {editingAmenityId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAmenityId(null);
                      setAmenityForm(emptyAmenity);
                    }}
                    className="mt-3 w-full border border-blush/20 bg-white py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-shadow hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="grid gap-5">
              {amenities.map((amenity) => (
                <article
                  key={amenity.id}
                  className="border border-blush/20 bg-white p-6 shadow-sm"
                >
                  <h3 className="font-display italic text-2xl text-plum">
                    {amenity.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-shadow">
                    {amenity.text}
                  </p>
                  <div className="mt-6 flex gap-3 border-t border-blush/10 pt-4">
                    <button
                      onClick={() => {
                        setEditingAmenityId(amenity.id);
                        setAmenityForm({
                          title: amenity.title,
                          text: amenity.text,
                        });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex items-center gap-2 border border-blush/20 bg-petal px-4 py-2 text-[10px] font-semibold uppercase tracking-0.1em text-plum hover:border-[#0A192F] transition-colors"
                    >
                      <Edit2 className="size-3" /> Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm("Delete?")) {
                          await deleteAmenity(amenity.id);
                          setAmenities((i) =>
                            i.filter((a) => a.id !== amenity.id),
                          );
                        }
                      }}
                      className="flex items-center gap-2 border border-red-200 bg-red-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-0.1em text-red-700 hover:border-red-300 transition-colors"
                    >
                      <Trash2 className="size-3" /> Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

