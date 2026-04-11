import { useParams } from "wouter";
import ArticleReader from "@/components/ArticleReader";
import { getLibraryArticle } from "@/data/libraryArticles";
import NotFound from "@/pages/NotFound";

export default function LibraryArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = getLibraryArticle(slug ?? "");
  if (!article) return <NotFound />;
  return <ArticleReader article={article} />;
}
