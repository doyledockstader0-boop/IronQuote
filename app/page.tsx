export default function Home() {
  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif', background: '#0f172a', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🚀 IronQuote</h1>
      <p style={{ fontSize: '24px', color: '#94a3b8' }}>Your app is running!</p>
      <p style={{ marginTop: '20px' }}>Welcome to your professional quote generation system.</p>
      <div style={{ marginTop: '40px', padding: '20px', background: '#1e293b', borderRadius: '8px' }}>
        <h2>✅ Setup Complete!</h2>
        <ul>
          <li>Next.js installed</li>
          <li>Supabase connected</li>
          <li>Ready to build</li>
        </ul>
      </div>
    </div>
  );
}