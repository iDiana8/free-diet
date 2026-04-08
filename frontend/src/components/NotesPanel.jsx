function NotesPanel({ note, onChange, onSave, saving }) {
  return (
    <aside className="notes-panel">
      <div className="notes-panel__eyebrow">Заметки</div>
      <h2 className="notes-panel__title">Комментарий к дню</h2>
      <p className="notes-panel__text">
        Сюда можно записывать ощущения, комментарии по режиму питания и любые наблюдения.
      </p>

      <textarea
        className="notes-panel__textarea"
        value={note}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Например: было мало воды, вечером перекус вышел больше обычного."
      />

      <button className="notes-panel__button" type="button" onClick={onSave} disabled={saving}>
        {saving ? 'Сохраняем...' : 'Сохранить день'}
      </button>
    </aside>
  );
}

export default NotesPanel;
