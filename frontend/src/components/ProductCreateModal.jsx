function ProductCreateModal({
  isOpen,
  form,
  submitting,
  error,
  onChange,
  onClose,
  onSubmit,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="product-modal-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-card__header">
          <div>
            <p className="modal-card__eyebrow">Новый продукт</p>
            <h3 id="product-modal-title" className="modal-card__title">Добавить продукт в каталог</h3>
            <p className="modal-card__text">
              Название и калорийность обязательны. Белки, жиры и углеводы можно оставить пустыми.
            </p>
          </div>
          <button className="modal-card__close" type="button" onClick={onClose}>
            Закрыть
          </button>
        </div>

        {error && <div className="feedback feedback--error">{error}</div>}

        <form className="modal-card__form" onSubmit={onSubmit}>
          <label className="field-group">
            <span className="field-label">Название</span>
            <input
              className="field-control"
              type="text"
              value={form.name}
              onChange={(event) => onChange('name', event.target.value)}
              placeholder="Например, кленовый пекан"
            />
          </label>

          <div className="modal-card__grid">
            <label className="field-group">
              <span className="field-label">Калорийность</span>
              <input
                className="field-control"
                type="number"
                min="0"
                max="5000"
                value={form.calories}
                onChange={(event) => onChange('calories', event.target.value)}
                placeholder="Например, 420"
              />
            </label>

            <label className="field-group">
              <span className="field-label">Белки</span>
              <input
                className="field-control"
                type="number"
                min="0"
                max="500"
                step="0.1"
                value={form.protein}
                onChange={(event) => onChange('protein', event.target.value)}
                placeholder="Необязательно"
              />
            </label>

            <label className="field-group">
              <span className="field-label">Жиры</span>
              <input
                className="field-control"
                type="number"
                min="0"
                max="500"
                step="0.1"
                value={form.fat}
                onChange={(event) => onChange('fat', event.target.value)}
                placeholder="Необязательно"
              />
            </label>

            <label className="field-group">
              <span className="field-label">Углеводы</span>
              <input
                className="field-control"
                type="number"
                min="0"
                max="500"
                step="0.1"
                value={form.carbs}
                onChange={(event) => onChange('carbs', event.target.value)}
                placeholder="Необязательно"
              />
            </label>
          </div>

          <div className="modal-card__actions">
            <button className="modal-card__secondary" type="button" onClick={onClose}>
              Отмена
            </button>
            <button className="section-card__button" type="submit" disabled={submitting}>
              {submitting ? 'Сохраняем...' : 'Добавить продукт'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductCreateModal;
