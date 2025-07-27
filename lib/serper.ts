export async function searchSerper(query: string) {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.SERPER_API_KEY || "",
    },
    body: JSON.stringify({
      q: query,
      gl: "us",
      num: 10,
    }),
  });
  return res.json();
}
