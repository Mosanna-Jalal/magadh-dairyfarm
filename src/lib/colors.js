// Consistent colors per product across charts.
export const PRODUCT_COLORS = {
  milk: "#3E7C4A",
  paneer: "#d97706",
  ghee: "#eab308",
  khowa: "#9a6b4f",
  dahi: "#6b8fb5",
};

export const colorFor = (slug) => PRODUCT_COLORS[slug] || "#7c7c7c";
