"use client";

import { useEffect, useRef } from "react";
import navbarScrollEffect from "@/common/navbarScrollEffect";
import MainLayout from "@/layouts/Main";
import TopNav from "@/components/Navbars/TopNav";
import Navbar from "@/components/Navbars/SaasNav";
import BlogPost from "@/components/Blog/BlogPost";
import Footer from "@/components/Saas/Footer";
import "@/components/Blog/blog-post.css";

type BlogPostData = (typeof import("@/data/Blog/blog-grid.json"))[number];

export default function BlogDetailClient({ post }: { post?: BlogPostData }) {
  const navbarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (navbarRef.current) {
      navbarScrollEffect(navbarRef.current, true);
    }
  }, []);

  return (
    <MainLayout>
      <TopNav style="5" />
      <Navbar navbarRef={navbarRef} bgTransparent={false} />
      <main className="blog-page style-5">
        {post ? (
          <BlogPost post={post} />
        ) : (
          <div style={{ textAlign: 'center', padding: '100px 20px' }}>
            <h2>Artículo no encontrado</h2>
            <p>El artículo que buscas no existe.</p>
          </div>
        )}
      </main>
      <Footer noWave={true} />
    </MainLayout>
  );
}
