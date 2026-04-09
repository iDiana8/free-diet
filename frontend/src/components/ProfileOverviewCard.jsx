function ProfileOverviewCard({
  profileForm,
  healthForm,
  onProfileChange,
  onHealthChange,
  onSaveProfile,
  profileSaving,
  selectedDate,
}) {
  return (
    <section className="profile-card">
      <div className="profile-card__header">
        <div>
          <div className="profile-card__eyebrow">Данные человека</div>
          <h2 className="profile-card__title">Профиль и ежедневные показатели</h2>
          <p className="profile-card__text">
            Рост, вес и возраст можно менять по мере изменений. Давление и сахар в крови относятся к выбранной дате {selectedDate}.
          </p>
        </div>
        <button className="notes-panel__button profile-card__button" type="button" onClick={onSaveProfile} disabled={profileSaving}>
          {profileSaving ? 'Сохраняем...' : 'Сохранить данные'}
        </button>
      </div>

      <div className="profile-card__grid">
        <article className="profile-panel">
          <h3 className="profile-panel__title">Постоянные параметры</h3>
          <div className="profile-panel__fields">
            <label className="field-group">
              <span className="field-label">Рост</span>
              <div className="amount-wrap">
                <input
                  className="field-control"
                  type="number"
                  min="50"
                  max="260"
                  value={profileForm.height_cm}
                  onChange={(event) => onProfileChange('height_cm', event.target.value)}
                  placeholder="Например, 170"
                />
                <span className="amount-wrap__unit">см</span>
              </div>
            </label>

            <label className="field-group">
              <span className="field-label">Вес</span>
              <div className="amount-wrap">
                <input
                  className="field-control"
                  type="number"
                  min="20"
                  max="400"
                  step="0.1"
                  value={profileForm.weight_kg}
                  onChange={(event) => onProfileChange('weight_kg', event.target.value)}
                  placeholder="Например, 72.5"
                />
                <span className="amount-wrap__unit">кг</span>
              </div>
            </label>

            <label className="field-group">
              <span className="field-label">Возраст</span>
              <div className="amount-wrap">
                <input
                  className="field-control"
                  type="number"
                  min="1"
                  max="120"
                  value={profileForm.age_years}
                  onChange={(event) => onProfileChange('age_years', event.target.value)}
                  placeholder="Например, 29"
                />
                <span className="amount-wrap__unit">лет</span>
              </div>
            </label>
          </div>
        </article>

        <article className="profile-panel">
          <h3 className="profile-panel__title">Показатели на день</h3>
          <div className="profile-panel__fields">
            <label className="field-group">
              <span className="field-label">Давление</span>
              <div className="pressure-row">
                <input
                  className="field-control"
                  type="number"
                  min="50"
                  max="300"
                  value={healthForm.blood_pressure_systolic}
                  onChange={(event) => onHealthChange('blood_pressure_systolic', event.target.value)}
                  placeholder="Систолическое"
                />
                <span className="pressure-row__separator">/</span>
                <input
                  className="field-control"
                  type="number"
                  min="30"
                  max="200"
                  value={healthForm.blood_pressure_diastolic}
                  onChange={(event) => onHealthChange('blood_pressure_diastolic', event.target.value)}
                  placeholder="Диастолическое"
                />
              </div>
            </label>

            <label className="field-group">
              <span className="field-label">Уровень сахара в крови</span>
              <div className="amount-wrap">
                <input
                  className="field-control"
                  type="number"
                  min="1"
                  max="40"
                  step="0.1"
                  value={healthForm.blood_sugar_level}
                  onChange={(event) => onHealthChange('blood_sugar_level', event.target.value)}
                  placeholder="Например, 5.4"
                />
                <span className="amount-wrap__unit">ммоль/л</span>
              </div>
            </label>
          </div>
        </article>
      </div>
    </section>
  );
}

export default ProfileOverviewCard;
