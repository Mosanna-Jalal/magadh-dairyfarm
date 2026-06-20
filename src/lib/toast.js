// Tiny toast bus — fire from anywhere, rendered by <Toaster/>.
export function toast(message, type = "info") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("app-toast", { detail: { message, type, id: Date.now() + Math.random() } }));
}
