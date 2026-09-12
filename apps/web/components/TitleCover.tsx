"use client";

import {
  GAME_INTRO,
  GAME_KICKER,
  GAME_TAGLINE,
  GAME_TITLE,
  TITLE_COVER_GATE,
  TITLE_COVER_PILLARS,
  titleCoverAuthLabel,
} from "@/lib/title-cover";

export interface TitleCoverProps {
  username: string;
  password: string;
  busy: boolean;
  error: string | null;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: () => void;
  onRegister: () => void;
}

/**
 * Full-screen game cover shown before a session exists.
 *
 * @param props - Credentials, busy/error, and login/register handlers.
 * @returns Title art, intro, and the styled connect gate.
 */
export function TitleCover({
  username,
  password,
  busy,
  error,
  onUsernameChange,
  onPasswordChange,
  onLogin,
  onRegister,
}: TitleCoverProps) {
  return (
    <main className="title-cover" data-testid="title-cover">
      <div className="title-cover__art" aria-hidden>
        <div className="title-cover__sky" />
        <div className="title-cover__stars" />
        <div className="title-cover__sun" />
        <div className="title-cover__ridge title-cover__ridge--far" />
        <div className="title-cover__ridge title-cover__ridge--mid" />
        <div className="title-cover__ground" />
        <div className="title-cover__mill">
          <div className="title-cover__mill-sails" />
          <div className="title-cover__mill-tower" />
          <div className="title-cover__mill-glow" />
        </div>
        <div className="title-cover__lantern title-cover__lantern--a" />
        <div className="title-cover__lantern title-cover__lantern--b" />
        <div className="title-cover__fireflies" />
        <div className="title-cover__grain" />
        <div className="title-cover__vignette" />
      </div>
      <div className="title-cover__frame" aria-hidden>
        <span className="title-cover__corner title-cover__corner--tl" />
        <span className="title-cover__corner title-cover__corner--tr" />
        <span className="title-cover__corner title-cover__corner--bl" />
        <span className="title-cover__corner title-cover__corner--br" />
      </div>
      <div className="title-cover__layout">
        <header className="title-cover__masthead">
          <p className="title-cover__kicker">{GAME_KICKER}</p>
          <h1 className="title-cover__title">{GAME_TITLE}</h1>
          <p className="title-cover__tagline">{GAME_TAGLINE}</p>
        </header>
        <section className="title-cover__brand">
          <p className="title-cover__intro">{GAME_INTRO}</p>
          <ul className="title-cover__pillars">
            {TITLE_COVER_PILLARS.map((pillar) => (
              <li key={pillar.word}>
                <span className="title-cover__pillar-glyph" aria-hidden>
                  {pillar.glyph}
                </span>
                <strong>{pillar.word}</strong>
                <span>{pillar.blurb}</span>
              </li>
            ))}
          </ul>
        </section>
        <form
          className="title-cover__gate"
          data-testid="title-cover-gate"
          onSubmit={(event) => {
            event.preventDefault();
            onLogin();
          }}
        >
          <p className="title-cover__gate-kicker">Welcome, settler</p>
          <h2>{TITLE_COVER_GATE.heading}</h2>
          <p className="title-cover__gate-lede">{TITLE_COVER_GATE.lede}</p>
          <label className="title-cover__field">
            <span>{TITLE_COVER_GATE.usernameLabel}</span>
            <input
              autoComplete="username"
              value={username}
              onChange={(event) => onUsernameChange(event.target.value)}
              disabled={busy}
            />
          </label>
          <label className="title-cover__field">
            <span>{TITLE_COVER_GATE.passwordLabel}</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              disabled={busy}
            />
          </label>
          {error ? (
            <p className="title-cover__error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="title-cover__actions">
            <button
              className="title-cover__enter"
              type="submit"
              disabled={busy}
            >
              {titleCoverAuthLabel("login", busy)}
            </button>
            <button
              className="title-cover__join"
              type="button"
              disabled={busy}
              onClick={onRegister}
            >
              {titleCoverAuthLabel("register", busy)}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
