import { useState } from "react";

const INITIAL_FORM = {
  name: "",
  category: "",
  price: "",
  quantity: "",
  supplier: "",
  sku: "",
  status: "in_stock",
};

function ProductForm({ isAdmin, onCreateProduct }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = validateProductForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreateProduct({
        name: formData.name.trim(),
        category: formData.category.trim() || "Uncategorized",
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        supplier: formData.supplier.trim() || "Atlas Approved Vendor",
        sku: formData.sku.trim().toUpperCase(),
        status: formData.status,
      });
      setFormData(INITIAL_FORM);
      setFormErrors({});
    } catch (error) {
      const apiErrors = error.fieldErrors || {};
      setFormErrors(apiErrors);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  return (
    <section aria-labelledby="add-product-title" className="panel">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Catalog Intake</p>
          <h3 className="panel-title" id="add-product-title">
            Add product
          </h3>
        </div>
      </div>

      <form className="product-form" noValidate onSubmit={handleSubmit}>
        {!isAdmin ? (
          <p className="helper-text" id="product-form-access-note">
            Viewer mode is read-only. Switch to Admin to add products.
          </p>
        ) : null}
        <div className="form-field">
          <label className="form-label" htmlFor="product-name">
            Product name
          </label>
          <input
            aria-describedby={formErrors.name ? "product-name-error" : undefined}
            aria-invalid={Boolean(formErrors.name)}
            className="ui-input"
            disabled={!isAdmin}
            id="product-name"
            name="name"
            onChange={handleChange}
            required
            type="text"
            value={formData.name}
          />
          {formErrors.name ? (
            <p className="field-error" id="product-name-error" role="alert">
              {formErrors.name}
            </p>
          ) : null}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="product-category">
            Category
          </label>
          <input
            aria-describedby={formErrors.category ? "product-category-error" : undefined}
            aria-invalid={Boolean(formErrors.category)}
            className="ui-input"
            disabled={!isAdmin}
            id="product-category"
            name="category"
            onChange={handleChange}
            type="text"
            value={formData.category}
          />
          {formErrors.category ? (
            <p className="field-error" id="product-category-error" role="alert">
              {formErrors.category}
            </p>
          ) : null}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="product-supplier">
            Supplier
          </label>
          <input
            aria-describedby={formErrors.supplier ? "product-supplier-error" : undefined}
            aria-invalid={Boolean(formErrors.supplier)}
            className="ui-input"
            disabled={!isAdmin}
            id="product-supplier"
            name="supplier"
            onChange={handleChange}
            type="text"
            value={formData.supplier}
          />
          {formErrors.supplier ? (
            <p className="field-error" id="product-supplier-error" role="alert">
              {formErrors.supplier}
            </p>
          ) : null}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="product-sku">
            SKU
          </label>
          <input
            aria-describedby={formErrors.sku ? "product-sku-error" : undefined}
            aria-invalid={Boolean(formErrors.sku)}
            className="ui-input"
            disabled={!isAdmin}
            id="product-sku"
            name="sku"
            onChange={handleChange}
            required
            type="text"
            value={formData.sku}
          />
          {formErrors.sku ? (
            <p className="field-error" id="product-sku-error" role="alert">
              {formErrors.sku}
            </p>
          ) : null}
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label" htmlFor="product-price">
              Price
            </label>
            <input
              aria-describedby={formErrors.price ? "product-price-error" : undefined}
              aria-invalid={Boolean(formErrors.price)}
              className="ui-input"
              disabled={!isAdmin}
              id="product-price"
              min="0"
              name="price"
              onChange={handleChange}
              required
              step="0.01"
              type="number"
              value={formData.price}
            />
            {formErrors.price ? (
              <p className="field-error" id="product-price-error" role="alert">
                {formErrors.price}
              </p>
            ) : null}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="product-quantity">
              Quantity
            </label>
            <input
              aria-describedby={formErrors.quantity ? "product-quantity-error" : undefined}
              aria-invalid={Boolean(formErrors.quantity)}
              className="ui-input"
              disabled={!isAdmin}
              id="product-quantity"
              min="0"
              name="quantity"
              onChange={handleChange}
              required
              step="1"
              type="number"
              value={formData.quantity}
            />
            {formErrors.quantity ? (
              <p className="field-error" id="product-quantity-error" role="alert">
                {formErrors.quantity}
              </p>
            ) : null}
          </div>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="product-status">
            Status
          </label>
          <select
            aria-describedby={formErrors.status ? "product-status-error" : undefined}
            aria-invalid={Boolean(formErrors.status)}
            className="ui-input ui-select"
            disabled={!isAdmin}
            id="product-status"
            name="status"
            onChange={handleChange}
            value={formData.status}
          >
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="discontinued">Discontinued</option>
          </select>
          {formErrors.status ? (
            <p className="field-error" id="product-status-error" role="alert">
              {formErrors.status}
            </p>
          ) : null}
        </div>

        <button
          aria-label="Add product to inventory"
          className="ui-button"
          disabled={isSubmitting || !isAdmin}
          type="submit"
        >
          {isSubmitting ? "Saving..." : "Add Product"}
        </button>
      </form>
    </section>
  );
}

function validateProductForm(formData) {
  const errors = {};

  if (!formData.name.trim()) {
    errors.name = "Product name is required.";
  }

  if (formData.category && !formData.category.trim()) {
    errors.category = "Category cannot be blank.";
  }

  if (formData.supplier && !formData.supplier.trim()) {
    errors.supplier = "Supplier cannot be blank.";
  }

  if (!formData.sku.trim()) {
    errors.sku = "SKU is required.";
  }

  if (formData.price === "" || Number(formData.price) < 0) {
    errors.price = "Price must be a non-negative number.";
  }

  if (
    formData.quantity === "" ||
    !Number.isInteger(Number(formData.quantity)) ||
    Number(formData.quantity) < 0
  ) {
    errors.quantity = "Quantity must be a non-negative integer.";
  }

  return errors;
}

export default ProductForm;
