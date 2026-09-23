"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  RefreshCw,
  X,
  CheckCircle,
  Upload,
  Calendar,
  Eye,
  Link as LinkIcon,
  Tag,
} from "lucide-react";
import { adminFetch, formatDate } from "@/app/lib/admin-api";
import DeleteModal from "@/components/admin/DeleteModal";
import DatePicker from "@/components/admin/DatePicker";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default function BlogsManagementPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal / Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [deleteBlog, setDeleteBlog] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [date, setDate] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch("/api/blog");
      setBlogs(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load blogs", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    if (isFormOpen || deleteBlog) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFormOpen, deleteBlog]);

  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingBlog) {
      setSlug(generateSlug(val));
    }
  };

  const handleOpenCreate = () => {
    setEditingBlog(null);
    setTitle("");
    setSlug("");
    setDate(new Date().toISOString().slice(0, 10));
    setShortDescription("");
    setContent("");
    setMetaTitle("");
    setMetaDescription("");
    setImageFile(null);
    setImagePreview(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (blog: any) => {
    setEditingBlog(blog);
    setTitle(blog.title || "");
    setSlug(blog.slug || "");
    setDate(blog.date ? new Date(blog.date).toISOString().slice(0, 10) : "");
    setShortDescription(blog.shortDescription || "");
    setContent(blog.content || "");
    setMetaTitle(blog.metaTitle || "");
    setMetaDescription(blog.metaDescription || "");
    setImageFile(null);
    setImagePreview(blog.featuredImage || null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Blog title is required.");
      return;
    }

    if (!slug.trim()) {
      setFormError("Slug is required.");
      return;
    }

    if (!content.trim()) {
      setFormError("Blog content is required.");
      return;
    }

    if (!date) {
      setFormError("Date is required.");
      return;
    }

    if (!shortDescription.trim()) {
      setFormError("Short description is required.");
      return;
    }

    if (!editingBlog && !imageFile) {
      setFormError("Featured image is required for new blogs.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("slug", slug.trim());
      formData.append("date", date);
      formData.append("content", content);
      if (shortDescription.trim())
        formData.append("shortDescription", shortDescription.trim());
      if (metaTitle.trim()) formData.append("metaTitle", metaTitle.trim());
      if (metaDescription.trim())
        formData.append("metaDescription", metaDescription.trim());
      if (imageFile) formData.append("featuredImage", imageFile);

      let res;
      if (editingBlog) {
        res = await adminFetch(`/api/blog/${editingBlog.id}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        res = await adminFetch("/api/blog", {
          method: "POST",
          body: formData,
        });
      }

      if (!res.success) {
        setFormError(res.message || "Failed to save blog post.");
        setIsSubmitting(false);
        return;
      }

      showSuccess(
        editingBlog
          ? "Blog updated successfully!"
          : "Blog published successfully!",
      );
      setIsFormOpen(false);
      fetchBlogs();
    } catch (error: any) {
      setFormError(error.message || "Failed to save blog post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteBlog) return;
    setIsDeleting(true);

    try {
      const res = await adminFetch(`/api/blog/${deleteBlog.id}`, {
        method: "DELETE",
      });

      if (!res.success) {
        alert(res.message || "Failed to delete blog.");
        setIsDeleting(false);
        return;
      }

      showSuccess("Blog deleted successfully!");
      setDeleteBlog(null);
      fetchBlogs();
    } catch (error: any) {
      alert(error.message || "Failed to delete blog.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBlogs = blogs.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      b.title?.toLowerCase().includes(q) ||
      b.slug?.toLowerCase().includes(q) ||
      b.shortDescription?.toLowerCase().includes(q)
    );
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
            placeholder="Search blogs by title, slug, publishedDate..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#141414] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F] transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBlogs}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-[#141414] border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh blogs"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D32F2F] to-[#b91c1c] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-950/50 hover:brightness-110 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Write New Blog
          </button>
        </div>
      </div>

      {/* Blogs Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-neutral-400">
          <Loader2 className="h-8 w-8 animate-spin text-[#D32F2F] mb-3" />
          <p className="text-xs uppercase tracking-wider font-semibold">
            Loading blogs...
          </p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="py-20 rounded-3xl bg-[#141414] border border-white/10 text-center text-neutral-500">
          <FileText className="h-12 w-12 mx-auto text-neutral-600 mb-3" />
          <h3 className="text-base font-bold text-white">
            No Blog Posts Found
          </h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? "No articles match your search."
              : "You have not published any blogs yet. Click 'Write New Blog' to create one."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <div
              key={blog.id}
              className="overflow-hidden rounded-3xl bg-[#141414] border border-white/10 shadow-xl hover:border-white/20 transition-all flex flex-col justify-between group"
            >
              {/* Featured Image */}
              <div className="relative h-48 w-full bg-neutral-900 overflow-hidden">
                {blog.featuredImage ? (
                  <img
                    src={blog.featuredImage}
                    alt={blog.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-neutral-600">
                    <FileText className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-neutral-200 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-[#D32F2F]" />
                  {formatDate(blog.date)}
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-white line-clamp-2 leading-snug">
                    {blog.title}
                  </h4>
                  <p className="text-xs text-neutral-400 line-clamp-2">
                    {blog.shortDescription ||
                      blog.content?.slice(0, 120) + "..."}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-neutral-500 truncate max-w-[150px]">
                    /{blog.slug}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`/blogs/${blog.slug || blog.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View live blog post"
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleOpenEdit(blog)}
                      title="Edit blog post"
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteBlog(blog)}
                      title="Delete blog post"
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-[#141414] border border-white/10 shadow-2xl">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#0f0f0f]">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {editingBlog ? "Edit Blog" : "New Blog"}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Publish club articles, match updates, training guides, and
                  community announcements.
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form
              id="blogForm"
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar"
            >
              {formError && (
                <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Blog Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Wolverines Winter Training Highlights"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#D32F2F] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(generateSlug(e.target.value))}
                    placeholder="wolverines-winter-training"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#D32F2F] transition-all"
                  />
                </div>
              </div>

              {/* Date & Short Description */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <DatePicker
                    label="Publish Date *"
                    value={date}
                    onChange={(val) => setDate(val)}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Short Description *
                  </label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Brief 1-2 sentence preview for cards and social shares"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#D32F2F] transition-all"
                  />
                </div>
              </div>

              {/* Featured Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  Featured Image {!editingBlog && "*"}
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/15">
                  {imagePreview ? (
                    <div className="relative h-28 w-44 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-28 w-44 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-neutral-500 shrink-0">
                      <Upload className="h-6 w-6 mb-1" />
                      <span className="text-[10px]">No image selected</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <input
                      type="file"
                      id="featuredImageInput"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="featuredImageInput"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {imagePreview ? "Change Image" : "Upload Image"}
                    </label>
                    <p className="text-[11px] text-neutral-500">
                      Supports JPG, PNG, and WebP (Max 10MB recommended)
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Blog Content */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  Content *
                </label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your blog content with headings, lists, formatting, links, or HTML..."
                  minHeight="320px"
                />
              </div>

              {/* SEO Meta Fields Accordion */}
              <div className="p-4 rounded-2xl bg-[#0f0f0f] border border-white/5 space-y-4">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  SEO & Social Meta Tags (Optional)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="Custom page title for Google"
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#D32F2F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Meta Description
                    </label>
                    <input
                      type="text"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Custom search snippet description"
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#D32F2F]"
                    />
                  </div>
                </div>
              </div>
            </form>

            {/* Sticky Modal Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-white/10 bg-[#0f0f0f] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="blogForm"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D32F2F] to-[#b91c1c] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-950/50 hover:brightness-110 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingBlog ? "Save Updates" : "Publish Blog"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteBlog && (
        <DeleteModal
          isOpen={!!deleteBlog}
          title="Delete Blog Post"
          itemTitle={deleteBlog.title}
          description="Are you sure you want to delete this blog post? The published article and its uploaded image will be permanently removed."
          isLoading={isDeleting}
          onConfirm={handleDelete}
          onClose={() => setDeleteBlog(null)}
        />
      )}
    </div>
  );
}
