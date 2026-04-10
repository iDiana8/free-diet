import { useEffect, useMemo, useState } from 'react';
import {
  createCatalogProduct,
  getCurrentUser,
  getDailyJournal,
  loginUser,
  registerUser,
  saveDailyJournal,
  updateCurrentUser,
} from './api/client';
import AuthPanel from './components/AuthPanel';
import DashboardCard from './components/DashboardCard';
import MealSectionCard from './components/MealSectionCard';
import NotesPanel from './components/NotesPanel';
import ProductCreateModal from './components/ProductCreateModal';
import ProfileOverviewCard from './components/ProfileOverviewCard';
import { sections } from './constants/sections';
import {
  createEmptyEntriesMap,
  createClientRow,
  normalizeEntries,
  buildDashboard,
  createSavePayload,
  sortProductsByName,
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

const defaultProfileForm = {
  height_cm: '',
  weight_kg: '',
  age_years: '',
};

const defaultHealthForm = {
  blood_pressure_systolic: '',
  blood_pressure_diastolic: '',
  blood_sugar_level: '',
};

const defaultProductModal = {
  is_open: false,
  section_key: '',
  client_id: '',
  name: '',
  calories: '',
  protein: '',
  fat: '',
  carbs: '',
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

function normalizeProfileForm(user) {
  return {
    height_cm: user?.height_cm ?? '',
    weight_kg: user?.weight_kg ?? '',
    age_years: user?.age_years ?? '',
  };
}

function normalizeHealthForm(healthMetrics) {
  return {
    blood_pressure_systolic: healthMetrics?.blood_pressure_systolic ?? '',
    blood_pressure_diastolic: healthMetrics?.blood_pressure_diastolic ?? '',
    blood_sugar_level: healthMetrics?.blood_sugar_level ?? '',
  };
}

function parseOptionalNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    return null;
  }

  return parsedValue;
}

function App() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate);
  const [products, setProducts] = useState([]);
  const [entriesBySection, setEntriesBySection] = useState(createEmptyEntriesMap);
  const [targets, setTargets] = useState(defaultTargets);
  const [note, setNote] = useState('');
  const [profileForm, setProfileForm] = useState(defaultProfileForm);
  const [healthForm, setHealthForm] = useState(defaultHealthForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [token, setToken] = useState(getStoredToken);
  const [currentUser, setCurrentUser] = useState(null);
  const [productModal, setProductModal] = useState(defaultProductModal);
  const [productModalSaving, setProductModalSaving] = useState(false);
  const [productModalError, setProductModalError] = useState('');

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
      setProfileForm(normalizeProfileForm(data.user));
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
      setHealthForm(normalizeHealthForm(data.health_metrics));
      setProductModal(defaultProductModal);
      setProductModalError('');
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
      setHealthForm(defaultHealthForm);
      setProductModal(defaultProductModal);
      setProductModalError('');
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
      setProfileForm(normalizeProfileForm(data.user));
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
      setProfileForm(normalizeProfileForm(data.user));
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
    setProfileForm(defaultProfileForm);
    setHealthForm(defaultHealthForm);
    setError('');
    setSuccessMessage('');
    setLoading(false);
    setProductModal(defaultProductModal);
    setProductModalError('');
  }

  function handleProfileChange(fieldName, value) {
    setProfileForm((currentState) => ({
      ...currentState,
      [fieldName]: value,
    }));
  }

  function handleHealthChange(fieldName, value) {
    setHealthForm((currentState) => ({
      ...currentState,
      [fieldName]: value,
    }));
  }

  async function handleSaveProfile() {
    setProfileSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const profilePayload = {
        height_cm: parseOptionalNumber(profileForm.height_cm),
        weight_kg: parseOptionalNumber(profileForm.weight_kg),
        age_years: parseOptionalNumber(profileForm.age_years),
      };

      const profileResponse = await updateCurrentUser(profilePayload, token);
      const journalPayload = createSavePayload(entriesBySection, note);
      const savedData = await saveDailyJournal(
        selectedDate,
        {
          ...journalPayload,
          health_metrics: {
            blood_pressure_systolic: parseOptionalNumber(healthForm.blood_pressure_systolic),
            blood_pressure_diastolic: parseOptionalNumber(healthForm.blood_pressure_diastolic),
            blood_sugar_level: parseOptionalNumber(healthForm.blood_sugar_level),
          },
        },
        token,
      );

      setCurrentUser(profileResponse.user);
      setProfileForm(normalizeProfileForm(profileResponse.user));
      setHealthForm(normalizeHealthForm(savedData.health_metrics));
      setSuccessMessage('Профиль и показатели дня сохранены.');
    } catch (requestError) {
      if (requestError.message === 'Нужна авторизация') {
        handleLogout();
        return;
      }

      setError(requestError.message || 'Не удалось сохранить данные человека');
    } finally {
      setProfileSaving(false);
    }
  }

  function handleAddRow(sectionKey) {
    setEntriesBySection((currentState) => ({
      ...currentState,
      [sectionKey]: [...currentState[sectionKey], createClientRow(sectionKey)],
    }));
  }

  function handlePatchRow(sectionKey, clientId, patch) {
    setEntriesBySection((currentState) => ({
      ...currentState,
      [sectionKey]: currentState[sectionKey].map((row) => {
        if (row.client_id !== clientId) {
          return row;
        }

        return {
          ...row,
          ...patch,
        };
      }),
    }));
  }

  function handleChangeRow(sectionKey, clientId, fieldName, value) {
    handlePatchRow(sectionKey, clientId, { [fieldName]: value });
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
      const savedData = await saveDailyJournal(
        selectedDate,
        {
          ...payload,
          health_metrics: {
            blood_pressure_systolic: parseOptionalNumber(healthForm.blood_pressure_systolic),
            blood_pressure_diastolic: parseOptionalNumber(healthForm.blood_pressure_diastolic),
            blood_sugar_level: parseOptionalNumber(healthForm.blood_sugar_level),
          },
        },
        token,
      );
      setEntriesBySection(normalizeEntries(savedData.entries));
      setTargets(savedData.dashboard?.targets || defaultTargets);
      setHealthForm(normalizeHealthForm(savedData.health_metrics));
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

  function handleOpenCreateProduct(sectionKey, clientId, productName) {
    setProductModal({
      is_open: true,
      section_key: sectionKey,
      client_id: clientId,
      name: productName.trim(),
      calories: '',
      protein: '',
      fat: '',
      carbs: '',
    });
    setProductModalError('');
  }

  function handleCloseCreateProduct() {
    setProductModal(defaultProductModal);
    setProductModalError('');
  }

  function handleChangeCreateProduct(fieldName, value) {
    setProductModal((currentState) => ({
      ...currentState,
      [fieldName]: value,
    }));
  }

  async function handleCreateProductSubmit(event) {
    event.preventDefault();
    setProductModalSaving(true);
    setProductModalError('');

    try {
      const payload = {
        section_key: productModal.section_key,
        name: productModal.name.trim(),
        calories: parseOptionalNumber(productModal.calories),
        protein: parseOptionalNumber(productModal.protein),
        fat: parseOptionalNumber(productModal.fat),
        carbs: parseOptionalNumber(productModal.carbs),
      };

      const data = await createCatalogProduct(payload, token);
      const product = data.product;

      setProducts((currentProducts) => sortProductsByName([...currentProducts, product]));
      handlePatchRow(productModal.section_key, productModal.client_id, {
        product_id: product.id,
        product_query: product.name,
      });
      setSuccessMessage(`Продукт "${product.name}" добавлен в каталог.`);
      handleCloseCreateProduct();
    } catch (requestError) {
      if (requestError.message === 'Нужна авторизация') {
        handleLogout();
        return;
      }

      setProductModalError(requestError.message || 'Не удалось добавить продукт');
    } finally {
      setProductModalSaving(false);
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

        <ProfileOverviewCard
          profileForm={profileForm}
          healthForm={healthForm}
          onProfileChange={handleProfileChange}
          onHealthChange={handleHealthChange}
          onSaveProfile={handleSaveProfile}
          profileSaving={profileSaving}
          selectedDate={selectedDate}
        />

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
                      onPatchRow={handlePatchRow}
                      onRemoveRow={handleRemoveRow}
                      onOpenCreateProduct={handleOpenCreateProduct}
                    />
                  ))}
                </div>
              </div>

              <NotesPanel note={note} onChange={setNote} onSave={handleSave} saving={saving} />
            </div>
          </div>
        </div>
      </div>

      <ProductCreateModal
        isOpen={productModal.is_open}
        form={productModal}
        submitting={productModalSaving}
        error={productModalError}
        onChange={handleChangeCreateProduct}
        onClose={handleCloseCreateProduct}
        onSubmit={handleCreateProductSubmit}
      />
    </main>
  );
}

export default App;
