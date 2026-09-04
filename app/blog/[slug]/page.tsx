import { notFound } from "next/navigation";
import { getSeoPost } from "notfair-nextjs-blog";
import { NotFairPostHero } from "notfair-nextjs-blog/react";
import { sanitizeNotFairArticleHtml } from "@/lib/notfair-article";
import styles from "../notfair-article.module.css";

export const revalidate = 3600;

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getSeoPost(slug);
  if (!post) notFound();
  return (
    <main style={{ background: "#f5f0e8", minHeight: "100vh" }}>
      <NotFairPostHero post={post} />
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <div
          className={styles.articleContent}
          dangerouslySetInnerHTML={{
            __html: sanitizeNotFairArticleHtml(post.content_html),
          }}
        />
      </div>
    </main>
  );
}
