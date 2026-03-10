"use client";

import { useState, FormEvent } from "react";

const PREFISSI = [
  { flag: "🇮🇹", code: "+39" },
  { flag: "🇺🇸", code: "+1" },
  { flag: "🇬🇧", code: "+44" },
  { flag: "🇫🇷", code: "+33" },
  { flag: "🇩🇪", code: "+49" },
  { flag: "🇪🇸", code: "+34" },
  { flag: "🇨🇭", code: "+41" },
];

function validateEmail(email: string): string | null {
  const match = email.match(/@[^.]+\.(.+)$/);
  if (!match || match[1].length < 2) {
    return "Inserisci un indirizzo email valido (es. nome@esempio.com)";
  }
  return null;
}

export default function Home() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [prefisso, setPrefisso] = useState("+39");
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setEmailError("");
    setError("");

    const emailErr = validateEmail(email);
    if (emailErr) {
      setEmailError(emailErr);
      return;
    }

    setLoading(true);
    const telefonoCompleto = `${prefisso}${telefono.replace(/\s/g, "")}`;

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, telefono: telefonoCompleto }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Errore durante l'iscrizione.");
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Errore durante l'iscrizione."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <p className="eyebrow">EVENTO GRATUITO · 3 SERE LIVE</p>

      <h1 className="headline">
        Il sistema che separa chi <em>emerge</em> da chi scompare.
      </h1>

      <p className="subheadline">
        Tre sere in live streaming per costruire il tuo sistema di
        posizionamento, offerta e vendita. Con i dati reali di chi lo ha già
        fatto. <strong>16·17·18 Aprile 2026 — dalle 21:00.</strong>
      </p>

      <ul className="bullets">
        <li>Come posizionarti per essere scelto, non confrontato</li>
        <li>
          Come costruire un&apos;offerta che si vende prima ancora di essere
          finita
        </li>
        <li>
          Il funnel che ha generato 170.000€ in 72 ore — smontato pezzo per
          pezzo
        </li>
      </ul>

      <div className="divider"></div>

      {success ? (
        <div className="success-message">
          <h2>Ci sei! 🎉</h2>
          <p>
            Controlla la tua email per la conferma.
            <br />
            Ci vediamo il 16 Aprile alle 21:00.
          </p>
        </div>
      ) : (
        <form className="form-wrapper" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome">Nome</label>
            <input
              type="text"
              id="nome"
              name="nome"
              placeholder="Il tuo nome"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="la@tua.email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
            />
            {emailError && <p className="field-error">{emailError}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="telefono">Telefono</label>
            <div className="phone-row">
              <select
                className="phone-prefix"
                value={prefisso}
                onChange={(e) => setPrefisso(e.target.value)}
              >
                {PREFISSI.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.flag} {p.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                placeholder="000 000 0000"
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="cta-button" disabled={loading}>
            {loading ? "Invio in corso..." : "Iscriviti gratis →"}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      )}

      <p className="social-proof">
        +100.000 imprenditori <span>·</span> 15+ anni nel digitale{" "}
        <span>·</span> Financial Times
      </p>

      <div className="footer">
        <p>© 2026 WeAreMarketers Srl</p>
      </div>
    </div>
  );
}
