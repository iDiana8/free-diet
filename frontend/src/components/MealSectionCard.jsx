import { useState } from 'react';
import {
  createProductsById,
  calculateRowNutrition,
  buildSectionSummary,
  getProductSuggestions,
} from '../lib/nutrition';

function getUnitLabel(productsById, productId) {
  const product = productsById[productId];
  return product?.unit_label || 'г';
}

function MealSectionCard({
  section,
  products,
  rows,
  onAddRow,
  onChangeRow,
  onPatchRow,
  onRemoveRow,
  onOpenCreateProduct,
}) {
  const [openedRowId, setOpenedRowId] = useState('');
  const productsById = createProductsById(products);
  const sectionSummary = buildSectionSummary(rows, productsById);
  const filteredProducts = products.filter((product) => product.allowed_sections.includes(section.key));

  return (
    <section className="section-card">
      <div className="section-card__line" />
      <div className="section-card__header">
        <div className="section-card__intro">
          <div className="section-card__index">{section.icon}</div>
          <div>
            <h3 className="section-card__title">{section.title}</h3>
            <p className="section-card__subtitle">{section.description}</p>
          </div>
        </div>
        <button className="section-card__button" type="button" onClick={() => onAddRow(section.key)}>
          Добавить запись
        </button>
      </div>

      <div className="section-card__summary-grid">
        <div className="summary-pill">
          <span>Ккал</span>
          <strong>{sectionSummary.calories}</strong>
        </div>
        <div className="summary-pill">
          <span>Б</span>
          <strong>{sectionSummary.protein} г</strong>
        </div>
        <div className="summary-pill">
          <span>Ж</span>
          <strong>{sectionSummary.fat} г</strong>
        </div>
        <div className="summary-pill">
          <span>У</span>
          <strong>{sectionSummary.carbs} г</strong>
        </div>
      </div>

      <div className="section-card__rows">
        {rows.length === 0 && (
          <div className="section-card__empty">
            Пока пусто. Добавьте продукт из выпадающего списка и укажите примерное количество.
          </div>
        )}

        {rows.map((row) => {
          const nutrition = calculateRowNutrition(row, productsById);
          const unitLabel = getUnitLabel(productsById, row.product_id);
          const selectedProduct = productsById[row.product_id];
          const productQuery = row.product_query || selectedProduct?.name || '';
          const suggestions = getProductSuggestions(filteredProducts, section.key, productQuery, 5);
          const showDropdown = openedRowId === row.client_id && (productQuery.trim() || suggestions.length > 0);

          function handleProductInputChange(value) {
            const patch = {
              product_query: value,
            };

            if (selectedProduct && selectedProduct.name !== value) {
              patch.product_id = '';
            }

            onPatchRow(section.key, row.client_id, patch);
          }

          function handleSelectProduct(product) {
            onPatchRow(section.key, row.client_id, {
              product_id: product.id,
              product_query: product.name,
            });
            setOpenedRowId('');
          }

          return (
            <div key={row.client_id} className="entry-row">
              <label className="field-group">
                <span className="field-label">Продукт</span>
                <div className="product-search">
                  <input
                    className="field-control"
                    type="text"
                    value={productQuery}
                    onFocus={() => setOpenedRowId(row.client_id)}
                    onBlur={() => {
                      window.setTimeout(() => {
                        setOpenedRowId((currentRowId) => (currentRowId === row.client_id ? '' : currentRowId));
                      }, 120);
                    }}
                    onChange={(event) => handleProductInputChange(event.target.value)}
                    placeholder="Начните печатать название продукта"
                  />

                  {showDropdown && (
                    <div className="product-dropdown">
                      {suggestions.map((product) => (
                        <button
                          key={product.id}
                          className="product-dropdown__item"
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleSelectProduct(product);
                          }}
                        >
                          <span>{product.name}</span>
                          <strong>{product.calories} ккал</strong>
                        </button>
                      ))}

                      <button
                        className="product-dropdown__item product-dropdown__item--accent"
                        type="button"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          onOpenCreateProduct(section.key, row.client_id, productQuery);
                          setOpenedRowId('');
                        }}
                      >
                        <span>Добавить самому</span>
                        <strong>{productQuery.trim() ? productQuery.trim() : 'Новый продукт'}</strong>
                      </button>
                    </div>
                  )}
                </div>
              </label>

              <label className="field-group">
                <span className="field-label">Количество</span>
                <div className="amount-wrap">
                  <input
                    className="field-control"
                    type="number"
                    min="1"
                    max="5000"
                    value={row.amount}
                    onChange={(event) => onChangeRow(section.key, row.client_id, 'amount', event.target.value)}
                    placeholder="Например, 150"
                  />
                  <span className="amount-wrap__unit">{unitLabel}</span>
                </div>
              </label>

              <div className="entry-row__nutrition">
                <span>{nutrition.calories} ккал</span>
                <span>Б {nutrition.protein}</span>
                <span>Ж {nutrition.fat}</span>
                <span>У {nutrition.carbs}</span>
              </div>

              <button className="entry-row__remove" type="button" onClick={() => onRemoveRow(section.key, row.client_id)}>
                Удалить
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default MealSectionCard;
