// Runs once when the server boots: warm the MongoDB connection so the
// first login/dashboard request doesn't pay the cold-connect cost.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { default: dbConnect } = await import("./lib/db.js");
      await dbConnect();
      console.log("[startup] MongoDB connection ready");
    } catch (e) {
      console.warn("[startup] MongoDB warm-up failed (will retry on first request):", e.message);
    }
  }
}
