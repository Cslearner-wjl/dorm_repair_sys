import { Wrench } from "lucide-react";
import CATEGORY_ICONS from "../icons";

export function CategoryPill({ category }: { category: string }) {
  return (
    <span className="category-pill">
      {CATEGORY_ICONS[category] ?? <Wrench size={14} />}
      {category}
    </span>
  );
}
