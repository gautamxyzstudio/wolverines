import React from "react";
import type { Metadata } from "next";
import BlogsListClient from "@/components/blogs/BlogsListClient";

export const metadata: Metadata = {
  title: "Blogs | The Wolverines Field Hockey Club",
  description:
    "Stay updated with the latest field hockey news, tips, and training resources. Join the Wolverine community today!",
};

export default function BlogsPage() {
  return <BlogsListClient />;
}
