const btn = document.getElementById("btn");
const result = document.getElementById("result");

btn.onclick = async () => {
  const text = document.getElementById("text").value;
  const length = document.getElementById("length").value;

  result.textContent = "⏳ Génération du résumé...";

  const res = await fetch("/api/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, length })
  });

  const data = await res.json();
  result.textContent = data.summary || data.error;
};
