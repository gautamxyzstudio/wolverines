"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  RefreshCw,
  X,
  CheckCircle,
} from "lucide-react";
import { adminFetch, formatDate, formatTime } from "@/app/lib/admin-api";
import DeleteModal from "@/components/admin/DeleteModal";
import TimePicker from "@/components/admin/TimePicker";
import DatePicker from "@/components/admin/DatePicker";

export default function EventsManagementPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [deleteEvent, setDeleteEvent] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    date: "",
    location: "",
    startTime: "09:00:00",
    endTime: "12:00:00",
  });

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch("/api/event");
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load events", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (isFormOpen || deleteEvent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFormOpen, deleteEvent]);

  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormData({
      date: new Date().toISOString().slice(0, 10),
      location: "",
      startTime: "09:00:00",
      endTime: "12:00:00",
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (event: any) => {
    setEditingEvent(event);
    const eventDate = event.date ? new Date(event.date).toISOString().slice(0, 10) : "";

    // Parse time to HH:mm:ss
    const parseTimeStr = (t: string | Date) => {
      if (!t) return "09:00:00";
      const d = new Date(t);
      if (!isNaN(d.getTime())) {
        return d.toISOString().slice(11, 19);
      }
      return String(t);
    };

    setFormData({
      date: eventDate,
      location: event.location || "",
      startTime: parseTimeStr(event.startTime),
      endTime: parseTimeStr(event.endTime),
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.date || !formData.location.trim()) {
      setFormError("Date and location are required.");
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setFormError("End time must be later than start time.");
      return;
    }

    setIsSubmitting(true);

    try {
      let res;
      if (editingEvent) {
        res = await adminFetch(`/api/event/${editingEvent.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        res = await adminFetch("/api/event", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }

      if (!res.success) {
        setFormError(res.message || "Failed to save event.");
        setIsSubmitting(false);
        return;
      }

      showSuccess(editingEvent ? "Event updated successfully!" : "Event created successfully!");
      setIsFormOpen(false);
      fetchEvents();
    } catch (error: any) {
      setFormError(error.message || "Failed to save event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteEvent) return;
    setIsDeleting(true);

    try {
      const res = await adminFetch(`/api/event/${deleteEvent.id}`, {
        method: "DELETE",
      });

      if (!res.success) {
        alert(res.message || "Failed to delete event.");
        setIsDeleting(false);
        return;
      }

      showSuccess("Event deleted successfully!");
      setDeleteEvent(null);
      fetchEvents();
    } catch (error: any) {
      alert(error.message || "Failed to delete event.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEvents = events.filter((ev) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return ev.location?.toLowerCase().includes(q) || formatDate(ev.date).toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          {successToast}
        </div>
      )}

      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by location, date..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#141414] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F] transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchEvents}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-[#141414] border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh events"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D32F2F] to-[#b91c1c] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-950/50 hover:brightness-110 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add New Event
          </button>
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-neutral-400">
          <Loader2 className="h-8 w-8 animate-spin text-[#D32F2F] mb-3" />
          <p className="text-xs uppercase tracking-wider font-semibold">Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-20 rounded-3xl bg-[#141414] border border-white/10 text-center text-neutral-500">
          <Calendar className="h-12 w-12 mx-auto text-neutral-600 mb-3" />
          <h3 className="text-base font-bold text-white">No Events Found</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            {searchQuery ? "No events match your search term." : "You have not created any events yet. Click 'Add New Event' to schedule one."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="relative overflow-hidden rounded-3xl bg-[#141414] border border-white/10 p-6 shadow-xl hover:border-white/20 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Date Badge */}
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/50 border border-red-500/30 text-xs font-bold text-red-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(ev.date)}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(ev)}
                      title="Edit event"
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteEvent(ev)}
                      title="Delete event"
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h4 className="text-base font-bold text-white flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-[#D32F2F] shrink-0 mt-1" />
                    <span>{ev.location}</span>
                  </h4>
                </div>

                {/* Times */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="h-3.5 w-3.5 text-neutral-500" />
                    Start: {formatTime(ev.startTime)}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="h-3.5 w-3.5 text-neutral-500" />
                    End: {formatTime(ev.endTime)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-[2px] animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#141414] border border-white/10 p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold text-white tracking-tight">
              {editingEvent ? "Edit Event" : "Create New Event"}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Fill in the date, venue location, and session schedule times.
            </p>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <DatePicker
                label="Event Date"
                value={formData.date}
                onChange={(val) => setFormData({ ...formData, date: val })}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  Venue / Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Abbotsford Senior Turf Field"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#D32F2F] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TimePicker
                  label="Start Time"
                  value={formData.startTime}
                  onChange={(val) => setFormData({ ...formData, startTime: val })}
                  placement="top"
                  align="left"
                  required
                />

                <TimePicker
                  label="End Time"
                  value={formData.endTime}
                  onChange={(val) => setFormData({ ...formData, endTime: val })}
                  placement="top"
                  align="right"
                  required
                />
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D32F2F] to-[#b91c1c] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-950/50 hover:brightness-110 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingEvent ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteEvent && (
        <DeleteModal
          isOpen={!!deleteEvent}
          title="Delete Event"
          itemTitle={deleteEvent.location}
          description={`Are you sure you want to delete this event on ${formatDate(deleteEvent.date)}?`}
          isLoading={isDeleting}
          onConfirm={handleDelete}
          onClose={() => setDeleteEvent(null)}
        />
      )}
    </div>
  );
}
