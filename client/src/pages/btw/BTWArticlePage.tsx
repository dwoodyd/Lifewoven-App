import { useParams } from "wouter";
import ArticleReader from "@/components/ArticleReader";
import { getBTWArticle } from "@/data/btwArticles";
import NotFound from "@/pages/NotFound";

export default function BTWArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = getBTWArticle(slug ?? "");
  if (!article) return <NotFound />;
  return <ArticleReader article={article} />;
}
