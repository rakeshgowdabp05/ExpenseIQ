import { createElement } from "react";
import { getCategoryIconComponent } from "../config/categoryOptions";

export default function CategoryIcon({
  iconKey,
  className,
}) {
  const IconComponent =
    getCategoryIconComponent(iconKey);

  return createElement(IconComponent, {
    className,
    "aria-hidden": true,
  });
}