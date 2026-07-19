// ---------------------------------------------------------------------------
// app/admin/page.js  →  the admin home, at /admin
//
// AuthGate shows the login form if you're signed out, or the Dashboard if
// you're signed in. That's the whole protection in one wrapper.
// ---------------------------------------------------------------------------

"use client";

import AuthGate from "./AuthGate";
import Dashboard from "./Dashboard";

export default function AdminPage() {
  return (
    <AuthGate>
      <Dashboard />
    </AuthGate>
  );
}
