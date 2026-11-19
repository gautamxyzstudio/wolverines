"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Eye,
  RefreshCw,
  Loader2,
  Calendar,
  Phone,
  Mail,
  Users,
  CreditCard,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  Ticket,
  FileSpreadsheet,
  AlertCircle,
  ShieldCheck,
  User,
  DollarSign,
} from "lucide-react";
import {
  adminFetch,
  formatCurrency,
  formatDate,
  formatDateTime,
} from "@/app/lib/admin-api";
import { YEAR_END_EVENT_CONFIG } from "@/app/lib/year-end-constants";
import { capitalizeWords } from "@/app/lib/year-end-fee";
import DetailModal from "@/components/admin/DetailModal";

type FilterTab = "ALL" | "PAID" | "PENDING";

interface AttendeeDetail {
  name: string;
  dateOfBirth?: string;
  age?: number;
  categoryLabel?: string;
  price?: number;
}

function getAttendeesFromItem(item: any): AttendeeDetail[] {
  const details = item?.ticketDetails || {};

  // 1. Structured attendees array (from new registration flow)
  if (Array.isArray(details.attendees) && details.attendees.length > 0) {
    return details.attendees.map((att: any) => ({
      name: capitalizeWords(att.name) || "Unnamed Attendee",
      dateOfBirth: att.dateOfBirth || "",
      age: typeof att.age === "number" ? att.age : undefined,
      categoryLabel: att.categoryLabel || "",
      price: typeof att.price === "number" ? att.price : undefined,
    }));
  }

  // 2. Family members array (strings e.g. "Name (DOB, Age: X)" or objects)
  if (Array.isArray(details.familyMembers) && details.familyMembers.length > 0) {
    return details.familyMembers.map((m: any) => {
      if (typeof m === "string") {
        const match = m.match(/^(.*?)(?:\s*\(([\d\-]+)(?:,\s*Age:\s*(\d+))?\))?$/);
        if (match) {
          return {
            name: capitalizeWords(match[1]?.trim() || m),
            dateOfBirth: match[2]?.trim() || "",
            age: match[3] ? parseInt(match[3], 10) : undefined,
          };
        }
        return { name: capitalizeWords(m), dateOfBirth: "" };
      }
      return {
        name: capitalizeWords(m.name) || "Family Member",
        dateOfBirth: m.dateOfBirth || "",
        age: m.age,
        categoryLabel: m.categoryLabel,
        price: m.price,
      };
    });
  }

  // 3. Fallback to primary contact if no attendees recorded
  if (item?.primaryContactName) {
    return [
      {
        name: capitalizeWords(item.primaryContactName),
        dateOfBirth: "",
      },
    ];
  }

  return [];
}

export default function EventRegistrationsAdminPage() {
  const [confirmedList, setConfirmedList] = useState<any[]>([]);
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch("/api/year-end-celebration/admin");
      if (res.success && res.data) {
        setConfirmedList(res.data.confirmed || []);
        setPendingList(res.data.pending || []);
        setStats(res.data.stats || null);
      }
    } catch (error) {
      console.error("Failed to fetch event registrations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Combined and filtered data
  const combinedList = useMemo(() => {
    const list = [
      ...confirmedList.map((item) => ({ ...item, isPendingRecord: false })),
      ...pendingList.map((item) => ({ ...item, isPendingRecord: true })),
    ];

    return list.filter((item) => {
      // Tab filter
      if (activeTab === "PAID" && item.paymentStatus !== "PAID") return false;
      if (activeTab === "PENDING" && item.paymentStatus !== "PENDING") return false;

      // Search query filter
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      const attendees = getAttendeesFromItem(item);
      const matchesAttendee = attendees.some((att) =>
        att.name.toLowerCase().includes(q) || (att.dateOfBirth && att.dateOfBirth.includes(q))
      );

      return (
        item.registrationId?.toLowerCase().includes(q) ||
        item.primaryContactName?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.contactNumber?.includes(q) ||
        matchesAttendee
      );
    });
  }, [confirmedList, pendingList, activeTab, searchQuery]);

  const selectedAttendees = useMemo(() => {
    return selectedItem ? getAttendeesFromItem(selectedItem) : [];
  }, [selectedItem]);

  // CSV Export Function
  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const headers = [
        "Registration ID",
        "Registration Type",
        "Contact Name",
        "Email",
        "Phone",
        "Secondary Phone",
        "Total Attendees",
        "Attendees List (Full Name, DOB & Age)",
        "Under 5 Kids",
        "Children 5-10",
        "Ages 11+",
        "Subtotal (CAD)",
        "3% Processing Fee (CAD)",
        "Total Amount (CAD)",
        "Payment Status",
        "Stripe Session ID",
        "Payment Intent ID",
        "Registration Date",
        "Special Notes / Dietary",
      ];

      const rows = confirmedList.map((item) => {
        const details = item.ticketDetails || {};
        const under5Qty = details.under5?.quantity || 0;
        const child5to10Qty = details.child5to10?.quantity || 0;
        const ages11PlusQty =
          (details.ages11Plus?.quantity || 0) + (details.individual?.quantity || 0);

        const attendees = getAttendeesFromItem(item);
        const attendeesStr = attendees
          .map((a, i) => {
            const dobPart = a.dateOfBirth ? ` [DOB: ${a.dateOfBirth}${typeof a.age === "number" ? `, Age: ${a.age}` : ""}]` : "";
            const catPart = a.categoryLabel ? ` (${a.categoryLabel})` : "";
            return `${i + 1}. ${a.name}${dobPart}${catPart}`;
          })
          .join(" | ");

        const regType = details.registrationType || (attendees.length > 1 ? "FAMILY" : "INDIVIDUAL");

        return [
          `"${item.registrationId || ""}"`,
          `"${regType}"`,
          `"${(capitalizeWords(item.primaryContactName) || "").replace(/"/g, '""')}"`,
          `"${item.email || ""}"`,
          `"${item.countryCode || ""}${item.contactNumber || ""}"`,
          `"${item.secondaryCountryCode || ""}${item.secondaryContactNumber || ""}"`,
          item.totalAttendees || 0,
          `"${attendeesStr.replace(/"/g, '""')}"`,
          under5Qty,
          child5to10Qty,
          ages11PlusQty,
          Number(item.subtotal || 0).toFixed(2),
          Number(item.processingFee || 0).toFixed(2),
          Number(item.totalAmount || 0).toFixed(2),
          `"${item.paymentStatus || ""}"`,
          `"${item.stripeCheckoutSessionId || ""}"`,
          `"${item.stripePaymentIntentId || ""}"`,
          `"${new Date(item.createdAt).toLocaleString("en-CA")}"`,
          `"${(item.notes || "").replace(/"/g, '""')}"`,
        ].join(",");
      });

      const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Wolverines_Year_End_${YEAR_END_EVENT_CONFIG.eventYear}_Registrations_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {YEAR_END_EVENT_CONFIG.eventName}
            </h1>
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Manage registrations, attendee tickets, Stripe payment verification, and export attendee lists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRegistrations}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-sm font-medium border border-white/10 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={isExporting || confirmedList.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D9001B] hover:bg-[#b90017] text-white text-sm font-bold shadow-lg shadow-red-600/20 transition disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            ${(stats?.totalRevenue || 0).toLocaleString("en-CA", { minimumFractionDigits: 2 })}
            <span className="text-xs text-neutral-400 ml-1 font-normal">CAD</span>
          </div>
          <div className="text-xs text-neutral-400 mt-2">
            Includes 3% processing fees (${(stats?.totalProcessingFees || 0).toFixed(2)})
          </div>
        </div>

        {/* Confirmed Registrations */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider">
              Paid Registrations
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats?.totalConfirmed || 0}
          </div>
          <div className="text-xs text-neutral-400 mt-2">
            {stats?.totalPending || 0} pending in checkout
          </div>
        </div>

        {/* Total Attendees */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider">
              Total Attendees
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats?.totalAttendees || 0}
          </div>
          <div className="text-xs text-neutral-400 mt-2">
            Across all confirmed submissions
          </div>
        </div>

        {/* Ticket Breakdown */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider">
              Ticket Categories
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1 text-xs text-neutral-300 font-medium">
            <div className="flex justify-between text-emerald-400">
              <span>Under 5 (Free):</span>
              <span className="font-bold">{stats?.ticketBreakdown?.under5 || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Kids (5–10):</span>
              <span className="font-bold text-white">{stats?.ticketBreakdown?.child5to10 || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Ages 11+:</span>
              <span className="font-bold text-white">{stats?.ticketBreakdown?.ages11Plus || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#141414] border border-white/10">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === "ALL"
              ? "bg-[#D9001B] text-white shadow-sm"
              : "text-neutral-400 hover:text-white"
              }`}
          >
            All ({confirmedList.length + pendingList.length})
          </button>
          <button
            onClick={() => setActiveTab("PAID")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === "PAID"
              ? "bg-[#D9001B] text-white shadow-sm"
              : "text-neutral-400 hover:text-white"
              }`}
          >
            Paid ({confirmedList.length})
          </button>
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === "PENDING"
              ? "bg-[#D9001B] text-white shadow-sm"
              : "text-neutral-400 hover:text-white"
              }`}
          >
            Pending ({pendingList.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, name, email, phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500 transition"
          />
        </div>
      </div>

      {/* Registrations Table */}
      <div className="rounded-2xl bg-[#141414] border border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-neutral-400">
            <Loader2 className="w-8 h-8 text-[#D9001B] animate-spin mb-3" />
            <span className="text-sm">Loading registrations...</span>
          </div>
        ) : combinedList.length === 0 ? (
          <div className="py-20 text-center text-neutral-400 space-y-2">
            <Ticket className="w-10 h-10 mx-auto text-neutral-600 mb-2" />
            <p className="text-base font-bold text-white">No registrations found</p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {searchQuery
                ? `No submissions matched "${searchQuery}".`
                : "No registrations have been submitted yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0f0f0f] border-b border-white/10 text-neutral-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Reg ID</th>
                  <th className="py-3.5 px-4">Primary Contact</th>
                  <th className="py-3.5 px-4">Attendees & DOB</th>
                  <th className="py-3.5 px-4">Pricing</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-neutral-300">
                {combinedList.map((item) => {
                  const details = item.ticketDetails || {};
                  const under5 = details.under5?.quantity || 0;
                  const child5to10 = details.child5to10?.quantity || 0;
                  const ages11 =
                    (details.ages11Plus?.quantity || 0) + (details.individual?.quantity || 0);
                  const isPaid = item.paymentStatus === "PAID";
                  const attendees = getAttendeesFromItem(item);
                  const regType =
                    details.registrationType || (attendees.length > 1 ? "FAMILY" : "INDIVIDUAL");

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Registration ID */}
                      <td className="py-4 px-4 font-mono font-bold text-white align-top">
                        <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-red-400 inline-block">
                          {item.registrationId}
                        </span>
                        <div className="mt-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                              regType === "FAMILY"
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}
                          >
                            {regType === "FAMILY" ? "Family Package" : "Individual"}
                          </span>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold text-white text-sm capitalize">
                          {capitalizeWords(item.primaryContactName)}
                        </div>
                        <div className="text-neutral-400 text-[11px] mt-0.5 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-neutral-500" />
                          <span>{item.email}</span>
                        </div>
                        <div className="text-neutral-500 text-[11px] mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-neutral-500" />
                          <span>
                            {item.countryCode} {item.contactNumber}
                          </span>
                        </div>
                      </td>

                      {/* Attendees with Name & DOB */}
                      <td className="py-4 px-4 align-top min-w-[240px] max-w-sm">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-bold text-white flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-neutral-400" />
                            {item.totalAttendees} {item.totalAttendees === 1 ? "Attendee" : "Attendees"}
                          </span>
                          <div className="text-[10px] text-neutral-400 flex flex-wrap gap-1">
                            {under5 > 0 && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                                Under 5: {under5}
                              </span>
                            )}
                            {child5to10 > 0 && (
                              <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                                Kids: {child5to10}
                              </span>
                            )}
                            {ages11 > 0 && (
                              <span className="px-1.5 py-0.2 rounded bg-white/5 text-neutral-300 font-semibold border border-white/10">
                                11+: {ages11}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Attendee Name & DOB Pills */}
                      
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold text-white text-sm">
                          ${Number(item.totalAmount || 0).toFixed(2)} CAD
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          Fee (3%): ${Number(item.processingFee || 0).toFixed(2)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 align-top">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            PAID
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            PENDING
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-neutral-400 align-top">
                        {new Date(item.createdAt).toLocaleDateString("en-CA", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right align-top">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={`Registration: ${selectedItem.registrationId}`}
          subtitle={`Submitted on ${new Date(selectedItem.createdAt).toLocaleString("en-CA")}`}
          badge={
            selectedItem.paymentStatus === "PAID" ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PAID
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                PENDING CHECKOUT
              </span>
            )
          }
        >
          <div className="p-6 space-y-6 text-sm text-neutral-300">
            {/* Contact Person Details */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3">
              <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-red-400" />
                Contact Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-400 block">Full Name:</span>
                  <span className="font-bold text-white text-sm capitalize">
                    {capitalizeWords(selectedItem.primaryContactName)}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Email Address:</span>
                  <span className="font-bold text-white">{selectedItem.email}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Phone Number:</span>
                  <span className="font-bold text-white">
                    {selectedItem.countryCode} {selectedItem.contactNumber}
                  </span>
                </div>
                {selectedItem.secondaryContactNumber && (
                  <div>
                    <span className="text-neutral-400 block">Secondary Phone:</span>
                    <span className="font-bold text-white">
                      {selectedItem.secondaryCountryCode} {selectedItem.secondaryContactNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Family Members & Attendees */}
            {selectedAttendees.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    Family Members & Attendees ({selectedAttendees.length})
                  </h4>
                  <span className="text-xs text-neutral-400">
                    Registration Type:{" "}
                    <strong className="text-white font-bold">
                      {selectedItem.ticketDetails?.registrationType === "FAMILY"
                        ? "Family Package"
                        : "Individual"}
                    </strong>
                  </span>
                </div>

                <div className="divide-y divide-white/5 rounded-lg overflow-hidden border border-white/5 bg-black/30">
                  {selectedAttendees.map((att, idx) => (
                    <div
                      key={idx}
                      className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            {att.name}
                            {idx === 0 && (
                              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-white/10 text-neutral-300">
                                Primary Contact
                              </span>
                            )}
                          </div>
                          {att.categoryLabel && (
                            <div className="text-[11px] text-neutral-400">
                              {att.categoryLabel}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs pl-9 sm:pl-0">
                        {att.dateOfBirth ? (
                          <div className="flex items-center gap-1.5 text-neutral-300 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                            <Calendar className="w-3.5 h-3.5 text-red-400" />
                            <span>
                              DOB:{" "}
                              <strong className="font-mono text-white">
                                {att.dateOfBirth}
                              </strong>
                            </span>
                            {typeof att.age === "number" && (
                              <span className="text-[11px] text-neutral-400">
                                (Age: {att.age} yrs)
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-500 italic text-xs">
                            DOB not recorded
                          </span>
                        )}

                        {typeof att.price === "number" && (
                          <span
                            className={`font-bold ${
                              att.price === 0 ? "text-emerald-400" : "text-white"
                            }`}
                          >
                            {att.price === 0 ? "FREE" : `$${att.price.toFixed(2)} CAD`}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ticket Breakdown */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3">
              <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider flex items-center gap-2">
                <Ticket className="w-4 h-4 text-amber-400" />
                Ticket Breakdown
              </h4>

              <div className="space-y-2 text-xs">
                {selectedItem.ticketDetails?.under5?.quantity > 0 && (
                  <div className="flex justify-between py-1 border-b border-white/5 text-emerald-400">
                    <span>
                      Children Under 5 &times; {selectedItem.ticketDetails.under5.quantity}
                    </span>
                    <span className="font-bold">FREE ($0.00)</span>
                  </div>
                )}

                {selectedItem.ticketDetails?.child5to10?.quantity > 0 && (
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>
                      Children (5–10) &times; {selectedItem.ticketDetails.child5to10.quantity}
                    </span>
                    <span className="font-bold text-white">
                      ${Number(selectedItem.ticketDetails.child5to10.subtotal).toFixed(2)} CAD
                    </span>
                  </div>
                )}

                {selectedItem.ticketDetails?.ages11Plus?.quantity > 0 && (
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>
                      Ages 11+ &times; {selectedItem.ticketDetails.ages11Plus.quantity}
                    </span>
                    <span className="font-bold text-white">
                      ${Number(selectedItem.ticketDetails.ages11Plus.subtotal).toFixed(2)} CAD
                    </span>
                  </div>
                )}

                {selectedItem.ticketDetails?.familyOf4?.quantity > 0 && (
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>
                      Family of 4 &times; {selectedItem.ticketDetails.familyOf4.quantity}
                    </span>
                    <span className="font-bold text-white">
                      ${Number(selectedItem.ticketDetails.familyOf4.subtotal).toFixed(2)} CAD
                    </span>
                  </div>
                )}

                {selectedItem.ticketDetails?.familyOf5?.quantity > 0 && (
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>
                      Family of 5 &times; {selectedItem.ticketDetails.familyOf5.quantity}
                    </span>
                    <span className="font-bold text-white">
                      ${Number(selectedItem.ticketDetails.familyOf5.subtotal).toFixed(2)} CAD
                    </span>
                  </div>
                )}

                {selectedItem.ticketDetails?.individual?.quantity > 0 && (
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>
                      Individual Ticket &times; {selectedItem.ticketDetails.individual.quantity}
                    </span>
                    <span className="font-bold text-white">
                      ${Number(selectedItem.ticketDetails.individual.subtotal).toFixed(2)} CAD
                    </span>
                  </div>
                )}

                {selectedItem.ticketDetails?.family?.quantity > 0 && (
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>
                      Family Package &times; {selectedItem.ticketDetails.family.quantity}
                    </span>
                    <span className="font-bold text-white">
                      ${Number(selectedItem.ticketDetails.family.subtotal).toFixed(2)} CAD
                    </span>
                  </div>
                )}

                <div className="flex justify-between pt-2 text-neutral-400">
                  <span>Tickets Subtotal</span>
                  <span>${Number(selectedItem.subtotal).toFixed(2)} CAD</span>
                </div>

                <div className="flex justify-between text-neutral-400">
                  <span>Processing Fee (3%)</span>
                  <span>${Number(selectedItem.processingFee).toFixed(2)} CAD</span>
                </div>

                <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold text-white">
                  <span>Total Payable Amount</span>
                  <span className="text-red-400">
                    ${Number(selectedItem.totalAmount).toFixed(2)} CAD
                  </span>
                </div>
              </div>
            </div>

            {/* Special Notes */}
            {selectedItem.notes && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-1">
                <span className="text-xs font-bold uppercase text-neutral-400 tracking-wider">
                  Special Notes / Dietary Requirements:
                </span>
                <p className="text-xs text-white leading-relaxed">{selectedItem.notes}</p>
              </div>
            )}

            {/* Payment & Stripe Identifiers */}
            <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-2 text-[11px] font-mono text-neutral-400">
              <div className="flex items-center gap-1.5 text-neutral-300 font-bold mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Payment Identifiers</span>
              </div>
              <div className="break-all">
                <span className="text-neutral-500">Stripe Session:</span>{" "}
                {selectedItem.stripeCheckoutSessionId || "N/A (Complimentary)"}
              </div>
              {selectedItem.stripePaymentIntentId && (
                <div className="break-all">
                  <span className="text-neutral-500">Payment Intent:</span>{" "}
                  {selectedItem.stripePaymentIntentId}
                </div>
              )}
            </div>
          </div>
        </DetailModal>
      )}
    </div>
  );
}
