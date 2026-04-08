import { useState } from 'react';

const defaultRegisterForm = {
  name: '',
  email: '',
  password: '',
};

const defaultLoginForm = {
  email: '',
  password: '',
};

function AuthPanel({ onRegister, onLogin, loading, error }) {
  const [mode, setMode] = useState('login');
  const [registerForm, setRegisterForm] = useState(defaultRegisterForm);
  const [loginForm, setLoginForm] = useState(defaultLoginForm);

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    await onRegister(registerForm);
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    await onLogin(loginForm);
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card__badge">Free Diet Account</div>
        <h1 className="auth-card__title">Личный кабинет питания</h1>
        <p className="auth-card__text">
          Зарегистрируйтесь или войдите в аккаунт, чтобы дневник, заметки и статистика были привязаны именно к вам.
        </p>

        <div className="auth-switcher">
          <button
            className={`auth-switcher__button ${mode === 'login' ? 'auth-switcher__button--active' : ''}`}
            type="button"
            onClick={() => setMode('login')}
          >
            Вход
          </button>
          <button
            className={`auth-switcher__button ${mode === 'register' ? 'auth-switcher__button--active' : ''}`}
            type="button"
            onClick={() => setMode('register')}
          >
            Регистрация
          </button>
        </div>

        {error && <div className="feedback feedback--error auth-card__feedback">{error}</div>}

        {mode === 'login' && (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <label className="field-group">
              <span className="field-label">Email</span>
              <input
                className="field-control"
                type="email"
                value={loginForm.email}
                onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                placeholder="you@example.com"
              />
            </label>

            <label className="field-group">
              <span className="field-label">Пароль</span>
              <input
                className="field-control"
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                placeholder="Не менее 6 символов"
              />
            </label>

            <button className="notes-panel__button auth-form__button" type="submit" disabled={loading}>
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <label className="field-group">
              <span className="field-label">Имя</span>
              <input
                className="field-control"
                type="text"
                value={registerForm.name}
                onChange={(event) => setRegisterForm({ ...registerForm, name: event.target.value })}
                placeholder="Например, Diana"
              />
            </label>

            <label className="field-group">
              <span className="field-label">Email</span>
              <input
                className="field-control"
                type="email"
                value={registerForm.email}
                onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
                placeholder="you@example.com"
              />
            </label>

            <label className="field-group">
              <span className="field-label">Пароль</span>
              <input
                className="field-control"
                type="password"
                value={registerForm.password}
                onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
                placeholder="Не менее 6 символов"
              />
            </label>

            <button className="notes-panel__button auth-form__button" type="submit" disabled={loading}>
              {loading ? 'Создаём аккаунт...' : 'Создать аккаунт'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

export default AuthPanel;
