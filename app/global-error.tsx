'use client';

export default function GlobalError({ error }: { error: Error }) {
  console.error(error);

  return (
    <html>
      <body style={{ padding: 40 }}>
        <h1>App Error ⚠️</h1>
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 20 }}>
          {error.message}
        </pre>
      </body>
    </html>
  );
}