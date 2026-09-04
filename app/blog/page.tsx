import Image from "next/image";
import Link from "next/link";
import { getSeoPosts } from "notfair-nextjs-blog";

export const revalidate = 3600;

export default async function BlogIndex() {
  const posts = await getSeoPosts();
  return (
    <main style={{ background: "#f5f0e8", minHeight: "100vh", padding: "3rem 1.5rem" }}>
      <h1 style={{
        fontFamily: "var(--font-cormorant, serif)",
        fontSize: "2.5rem",
        fontWeight: 600,
        color: "#2d3228",
        marginBottom: "2.5rem",
        letterSpacing: "-0.02em",
      }}>
        Blog
      </h1>
      <div style={{ display: "grid", gap: "2rem", maxWidth: "860px" }}>
        {posts.map((p) => (
          <article key={p.slug} style={{
            background: "white",
            borderRadius: "1rem",
            border: "1px solid #e7e5e4",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}>
            <div style={{ position: "relative", aspectRatio: "16/7", width: "100%" }}>
              <Image src={p.image_url} alt={p.title} fill style={{ objectFit: "cover" }} />
            </div>
            <div style={{ padding: "1.5rem" }}>
              <Link href={`/blog/${p.slug}`} style={{
                fontFamily: "var(--font-cormorant, serif)",
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "#2d3228",
                textDecoration: "none",
                lineHeight: 1.3,
              }}>
                {p.title}
              </Link>
              {p.description && (
                <p style={{
                  marginTop: "0.75rem",
                  color: "#57534e",
                  fontFamily: "var(--font-lato, sans-serif)",
                  fontWeight: 300,
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                }}>
                  {p.description}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
