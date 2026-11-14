import localtunnel from "localtunnel";

async function start() {
  try {
    const tunnel = await localtunnel({
      port: 3000,
      subdomain: "finlit-ai-live",
    });

    console.log(`🚀 Public Tunnel URL: ${tunnel.url}`);

    tunnel.on("close", () => {
      console.log("Tunnel closed, auto-reconnecting in 2s...");
      setTimeout(start, 2000);
    });

    tunnel.on("error", (err) => {
      console.error("Tunnel error:", err.message);
    });
  } catch (err) {
    console.error("Failed to establish tunnel:", err.message);
    setTimeout(start, 3000);
  }
}

start();
