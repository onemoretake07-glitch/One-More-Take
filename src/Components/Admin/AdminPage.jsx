
import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  getDocs,
  limit,
  query,
} from "firebase/firestore";
import ReviewsManager from "./ReviewsManager";
import { auth, db } from "../../firebase";
import ImageManager from "./ImageManager";
import "./AdminPage.css";

const ADMIN_UID = "J4ZRLCrni5RlsXI6xjByXRBWb8M2";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");

  // Keep the admin page out of Google search results
  useEffect(() => {
    const robotsMeta = document.querySelector('meta[name="robots"]');
    const previousRobots = robotsMeta?.getAttribute("content");
    const previousTitle = document.title;

    robotsMeta?.setAttribute("content", "noindex, nofollow");
    document.title = "Admin | One More Take";

    return () => {
      if (robotsMeta && previousRobots) robotsMeta.setAttribute("content", previousRobots);
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser?.uid === ADMIN_UID) {
        setUser(currentUser);
        setError("");
      } else {
        setUser(null);

        if (currentUser) {
          await signOut(auth).catch(() => {});
          setError("This account is not authorised to access the admin panel.");
        }
      }

      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user || user.uid !== ADMIN_UID) return;

    let active = true;

    async function loadQuotations() {
      setLoading(true);
      setError("");

      try {
        const snapshot = await getDocs(
          query(collection(db, "quotations"), limit(100))
        );

        if (active) {
          setQuotations(
            snapshot.docs.map((item) => ({
              id: item.id,
              ...item.data(),
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load quotations:", err);

        if (active) {
          setError(
            "Could not load quotations. Check your Firestore rules and collection."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadQuotations();

    return () => {
      active = false;
    };
  }, [user]);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      if (credential.user.uid !== ADMIN_UID) {
        await signOut(auth);
        setError("This account is not authorised as an admin.");
      }
    } catch (err) {
      console.error("Admin login failed:", err);
      setError("Login failed. Check your email and password.");
    }
  }

  async function handleSignOut() {
    try {
      await signOut(auth);
      setEmail("");
      setPassword("");
      setQuotations([]);
      setActiveSection("dashboard");
      setError("");
    } catch {
      setError("Could not sign out. Please try again.");
    }
  }

  if (authLoading) {
    return (
      <main className="admin-loading-screen">
        <div className="admin-loader" />
        <p>Checking admin access...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="admin-login-page">
        <form className="admin-login-card" onSubmit={handleLogin}>
          <div className="admin-login-logo">OMT</div>
          <p className="admin-brand">ONE MORE TAKE</p>
          <h1>Welcome back</h1>
          <p className="admin-subtitle">
            Sign in to manage your website content.
          </p>

          <label htmlFor="admin-email">Email address</label>
          <input
            id="admin-email"
            type="email"
            placeholder="Admin email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="admin-password">Password</label>
          <div className="admin-password-wrap">
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              className="admin-password-toggle"
              type="button"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          <button className="admin-primary-button" type="submit">
            Sign in securely
          </button>

          <p className="admin-login-footer">
            Restricted access · Authorised administrators only
          </p>
        </form>
      </main>
    );
  }

  const totalValue = quotations.reduce((sum, item) => {
    const amount = Number(item.total ?? item.price ?? 0);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: "⌂" },
    { id: "hero", label: "Hero Image", icon: "▧" },
    { id: "gallery", label: "Gallery Images", icon: "▦" },
    { id: "featured", label: "Featured Works", icon: "▶" },
    { id: "quotations", label: "Quotations", icon: "☷" },{ id: "reviews", label: "Reviews", icon: "💬" },
  ];

  return (
    <main className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-brand">
          <div className="admin-mini-logo">OMT</div>
          <div>
            <p className="admin-brand">ONE MORE TAKE</p>
            <h1>Admin Panel</h1>
            <p className="admin-user">{user.email}</p>
          </div>
        </div>

        <button
          className="admin-secondary-button"
          type="button"
          onClick={handleSignOut}
        >
          Sign out
        </button>
      </header>

      <nav className="admin-navigation" aria-label="Admin sections">
        {navigation.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`admin-nav-button ${
              activeSection === item.id ? "active" : ""
            }`}
            onClick={() => setActiveSection(item.id)}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      {activeSection === "dashboard" && (
        <>
          <section className="admin-welcome-panel">
            <p className="admin-eyebrow">WEBSITE CONTROL CENTRE</p>
            <h2>Welcome back!</h2>
            <p>
              Manage your Hero image, Gallery, Featured Works and client
              quotations from one place.
            </p>
          </section>

          <section className="admin-stats">
            <article className="admin-stat-card">
              <span className="admin-stat-label">Quotations loaded</span>
              <strong className="admin-stat-value">
                {quotations.length}
              </strong>
            </article>

            <article className="admin-stat-card">
              <span className="admin-stat-label">Total quoted value</span>
              <strong className="admin-stat-value">
                {totalValue.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                })}
              </strong>
            </article>

            <article className="admin-stat-card">
              <span className="admin-stat-label">Admin status</span>
              <strong className="admin-stat-value admin-authorised">
                Authorised
              </strong>
            </article>
          </section>

          <section className="admin-panel-card">
            <div className="admin-panel-heading">
              <div>
                <p className="admin-eyebrow">QUICK ACTIONS</p>
                <h2>Manage website images</h2>
              </div>
            </div>

            <div className="admin-quick-grid">
              <button
                className="admin-quick-card"
                onClick={() => setActiveSection("hero")}
              >
                <span>▧</span>
                <strong>Change Hero Image</strong>
                <small>Update the main Hero visual</small>
              </button>

              <button
                className="admin-quick-card"
                onClick={() => setActiveSection("gallery")}
              >
                <span>▦</span>
                <strong>Manage Gallery</strong>
                <small>Add or remove Gallery images</small>
              </button>

              <button
                className="admin-quick-card"
                onClick={() => setActiveSection("featured")}
              >
                <span>▶</span>
                <strong>Featured Works</strong>
                <small>Manage project thumbnails</small>
              </button>
            </div>
          </section>
        </>
      )}

      {activeSection === "hero" && (
        <ImageManager
          sectionId="hero"
          title="Hero Image"
          description="Choose the main visual shown in your website Hero section."
          mode="single"
        />
      )}

      {activeSection === "gallery" && (
        <ImageManager
          sectionId="gallery"
          title="Gallery Images"
          description="Upload, replace or remove images in your website Gallery."
          mode="multiple"
        />
      )}

      {activeSection === "featured" && (
        <ImageManager
          sectionId="featuredWorks"
          title="Featured Works"
          description="Manage the images used for your featured portfolio projects."
          mode="multiple"
        />
      )}{activeSection === "reviews" && <ReviewsManager />}

      {activeSection === "quotations" && (
        <section className="admin-panel-card">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-eyebrow">CLIENT MANAGEMENT</p>
              <h2>Recent Quotations</h2>
            </div>

            <button
              className="admin-secondary-button"
              type="button"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>

          {loading && (
            <div className="admin-empty-state">
              <div className="admin-loader" />
              <p>Loading quotations...</p>
            </div>
          )}

          {!loading && quotations.length === 0 && !error && (
            <div className="admin-empty-state">
              <h3>No quotations found</h3>
              <p>
                Quotations will appear here when documents exist in the
                Firestore quotations collection.
              </p>
            </div>
          )}

          {!loading && quotations.length > 0 && (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Service / Plan</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="admin-client-name">
                          {item.clientName || item.name || "Unnamed client"}
                        </span>
                        <small>
                          {item.clientEmail ||
                            item.email ||
                            "No email provided"}
                        </small>
                      </td>
                      <td>
                        {item.serviceName || item.planName || item.name || "—"}
                      </td>
                      <td className="admin-amount">
                        {item.total != null
                          ? `₹${Number(item.total).toLocaleString("en-IN")}`
                          : item.price != null
                          ? `₹${Number(item.price).toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                      <td>
                        <span className="admin-status">
                          {item.status || "New"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="admin-table-footer">
            Showing up to 100 quotation documents.
          </p>
        </section>
      )}

      <footer className="admin-footer">
        One More Take · Admin Workspace
      </footer>
    </main>
  );
}
