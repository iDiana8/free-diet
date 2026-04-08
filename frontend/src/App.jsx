import { useEffect, useMemo, useState } from 'react';
import { getCurrentUser, getDailyJournal, loginUser, registerUser, saveDailyJournal } from './api/client';
import AuthPanel from './components/AuthPanel';
import DashboardCard from './components/DashboardCard';
import MealSectionCard from './components/MealSectionCard';
import NotesPanel from './components/NotesPanel';
import { sections } from './constants/sections';
import {
  createEmptyEntriesMap,
  createClientRow,
  normalizeEntries,
  buildDashboard,
  createSavePayload,
} from './lib/nutrition';
import './styles/main.css';
import './styles/app.css';

const defaultTargets = {
  calories: 2000,
  protein: 120,
  fat: 70,
  carbs: 220,
  water_ml: 2000,
};

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getStoredToken() {
  return localStorage.getItem('free-diet-token') || '';
}

function storeToken(token) {
  localStorage.setItem('free-diet-token', token);
}

function clearToken() {
  localStorage.removeItem('free-diet-token');
}

function App() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate);
  const [products, setProducts] = useState([]);
  const [entriesBySection, setEntriesBySection] = useState(createEmptyEntriesMap);
  const [targets, setTargets] = useState(defaultTargets);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [token, setToken] = useState(getStoredToken);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    if (!token || !currentUser) {
      setLoading(false);
      return;
    }

    loadDailyJournalData(selectedDate, token);
  }, [selectedDate, token, currentUser]);

  const dashboard = useMemo(() => {
    return {
      ...buildDashboard(entriesBySection, products, targets),
      targets,
    };
  }, [entriesBySection, products, targets]);

  async function restoreSession() {
    const storedToken = getStoredToken();

    if (!storedToken) {
      setAuthLoading(false);
      setLoading(false);
      return;
    }

    try {
      const data = await getCurrentUser(storedToken);
      setToken(storedToken);
      setCurrentUser(data.user);
    } catch (requestError) {
      clearToken();
      setToken('');
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  }

  async function loadDailyJournalData(date, currentToken) {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const data = await getDailyJournal(date, currentToken);
      setProducts(data.products || []);
      setEntriesBySection(normalizeEntries(data.entries));
      setTargets(data.dashboard?.targets || defaultTargets);
      setNote(data.note || '');
    } catch (requestError) {
      if (requestError.message === 'Нужна авторизация') {
        handleLogout();
        return;
      }

      setError(requestError.message || 'Не удалось загрузить дневник');
      setProducts([]);
      setEntriesBySection(createEmptyEntriesMap());
      setTargets(defaultTargets);
      setNote('');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(form) {
    setAuthSubmitting(true);
    setAuthError('');

    try {
      const data = await registerUser(form);
      storeToken(data.token);
      setToken(data.token);
      setCurrentUser(data.user);
    } catch (requestError) {
      setAuthError(requestError.message || 'Не удалось создать аккаунт');
    } finally {
      setAuthSubmitting(false);
    }
  }

  async function handleLogin(form) {
    setAuthSubmitting(true);
    setAuthError('');

    try {
      const data = await loginUser(form);
      storeToken(data.token);
      setToken(data.token);
      setCurrentUser(data.user);
    } catch (requestError) {
      setAuthError(requestError.message || 'Не удалось войти');
    } finally {
      setAuthSubmitting(false);
    }
  }

  function handleLogout() {
    clearToken();
    setToken('');
    setCurrentUser(null);
    setProducts([]);
    setEntriesBySection(createEmptyEntriesMap());
    setTargets(defaultTargets);
    setNote('');
    setError('');
    setSuccessMessage('');
    setLoading(false);
  }

  function handleAddRow(sectionKey) {
    setEntriesBySection((currentState) => ({
      ...currentState,
      [sectionKey]: [...currentState[sectionKey], createClientRow(sectionKey)],
    }));
  }

  function handleChangeRow(sectionKey, clientId, fieldName, value) {
    setEntriesBySection((currentState) => ({
      ...currentState,
      [sectionKey]: currentState[sectionKey].map((row) => {
        if (row.client_id !== clientId) {
          return row;
        }

        return {
          ...row,
          [fieldName]: value,
        };
      }),
    }));
  }

  function handleRemoveRow(sectionKey, clientId) {
    setEntriesBySection((currentState) => ({
      ...currentState,
      [sectionKey]: currentState[sectionKey].filter((row) => row.client_id !== clientId),
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = createSavePayload(entriesBySection, note);
      const savedData = await saveDailyJournal(selectedDate, payload, token);
      setEntriesBySection(normalizeEntries(savedData.entries));
      setTargets(savedData.dashboard?.targets || defaultTargets);
      setSuccessMessage('Дневник питания сохранён в ваш аккаунт.');
    } catch (requestError) {
      if (requestError.message === 'Нужна авторизация') {
        handleLogout();
        return;
      }

      setError(requestError.message || 'Не удалось сохранить дневник');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) {
    return <main className="auth-page"><section className="auth-card"><h1 className="auth-card__title">Проверяем сессию...</h1></section></main>;
  }

  if (!currentUser) {
    return <AuthPanel onRegister={handleRegister} onLogin={handleLogin} loading={authSubmitting} error={authError} />;
  }

  return (
    <main className="page">
      <div className="page__shell">
        <section className="hero">
          <div>
            <div className="hero__badge">Nutrition tablet</div>
            <h1 className="hero__title">Free Diet Daily Board</h1>
            <p className="hero__text">
              Аккаунт <strong>{currentUser.name}</strong>: ваш дневник питания, личные заметки и статистика по дням.
            </p>
          </div>

          <div className="hero__actions">
            <label className="hero__date-picker">
              <span>Дата</span>
              <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
            </label>
            <button className="hero__logout" type="button" onClick={handleLogout}>Выйти</button>
          </div>
        </section>

        <div className="tablet">
          <div className="tablet__camera" />
          <div className="tablet__screen">
            <header className="screen-header">
              <div>
                <p className="screen-header__eyebrow">Персональный журнал питания</p>
                <h2 className="screen-header__title">День под контролем</h2>
                <p className="screen-header__subtitle">
                  Все записи сохраняются только в ваш аккаунт и доступны при следующем входе.
                </p>
              </div>
              <div className="screen-header__status-wrap">
                {loading && <span className="screen-header__status">Загрузка...</span>}
                {!loading && successMessage && <span className="screen-header__status screen-header__status--success">{successMessage}</span>}
                {!loading && !successMessage && <span className="screen-header__status">Готово к работе</span>}
              </div>
            </header>

            {error && <div className="feedback feedback--error">{error}</div>}

            <div className="content-grid">
              <div className="content-grid__main">
                <DashboardCard dashboard={dashboard} selectedDate={selectedDate} />

                <div className="sections-grid">
                  {sections.map((section) => (
                    <MealSectionCard
                      key={section.key}
                      section={section}
                      products={products}
                      rows={entriesBySection[section.key] || []}
                      onAddRow={handleAddRow}
                      onChangeRow={handleChangeRow}
                      onRemoveRow={handleRemoveRow}
                    />
                  ))}
                </div>
              </div>

              <NotesPanel note={note} onChange={setNote} onSave={handleSave} saving={saving} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
