import { useEffect, useRef, useState } from "react";

function EditProductModal({ isAdmin, onClose, onUpdateProduct, product }) {
  const isOpen = isAdmin && Boolean(product);
  const modalRef = useRef(null);
  const initialFocusRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    supplier: "",
    sku: "",
    status: "in_stock",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previouslyFocusedElementRef.current = document.activeElement;
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      supplier: product.supplier || "",
      sku: product.sku || "",
      status: product.status,
    });
    setFormErrors({});
  }, [isOpen, product]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const focusTimer = window.setTimeout(() => {
      initialFocusRef.current?.focus();
    }, 0);

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) {
        return;
      }

      const focusableElements = getFocusableElements(modalRef.current);
      if (focusableElements.length === 0) {
        return;
      }

      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstFocusableElement) {
        event.preventDefault();
        lastFocusableElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusableElement) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElementRef.current?.focus?.();
    };
  }, [isOpen, onClose, product]);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = validateEditForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onUpdateProduct(product.id, {
        name: formData.name.trim(),
        category: formData.category.trim(),
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        supplier: formData.supplier.trim(),
        sku: formData.sku.trim().toUpperCase(),
        status: formData.status,
      });
    } catch (error) {
      setFormErrors(error.fieldErrors || {});
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
    <div className="modal-backdrop">
      <section
        aria-describedby="edit-product-description"
        aria-labelledby="edit-product-title"
        aria-modal="true"
        className="modal-panel"
        ref={modalRef}
        role="dialog"
      >
        <div className="panel-header">
          <div>
            <p className="section-kicker">Inventory Maintenance</p>
            <h3 className="panel-title" id="edit-product-title">
              Edit product
            </h3>
            <p className="modal-description" id="edit-product-description">
              Update product details. Press Escape to close this dialog.
            </p>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="edit-product-supplier">
              Supplier
            </label>
            <input
              aria-describedby={formErrors.supplier ? "edit-product-supplier-error" : undefined}
              aria-invalid={Boolean(formErrors.supplier)}
              className="ui-input"
              id="edit-product-supplier"
              name="supplier"
              onChange={handleChange}
              type="text"
              value={formData.supplier}
            />
            {formErrors.supplier ? (
              <p className="field-error" id="edit-product-supplier-error" role="alert">
                {formErrors.supplier}
              </p>
            ) : null}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="edit-product-sku">
              SKU
            </label>
            <input
              aria-describedby={formErrors.sku ? "edit-product-sku-error" : undefined}
              aria-invalid={Boolean(formErrors.sku)}
              className="ui-input"
              id="edit-product-sku"
              name="sku"
              onChange={handleChange}
              type="text"
              value={formData.sku}
            />
            {formErrors.sku ? (
              <p className="field-error" id="edit-product-sku-error" role="alert">
                {formErrors.sku}
              </p>
            ) : null}
          </div>
          <button
            aria-label="Close edit product dialog"
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <form className="product-form" noValidate onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="edit-product-name">
              Product name
            </label>
            <input
              aria-describedby={formErrors.name ? "edit-product-name-error" : undefined}
              aria-invalid={Boolean(formErrors.name)}
              className="ui-input"
              id="edit-product-name"
              name="name"
              onChange={handleChange}
              ref={initialFocusRef}
              type="text"
              value={formData.name}
            />
            {formErrors.name ? (
              <p className="field-error" id="edit-product-name-error" role="alert">
                {formErrors.name}
              </p>
            ) : null}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="edit-product-category">
              Category
            </label>
            <input
              aria-describedby={formErrors.category ? "edit-product-category-error" : undefined}
              aria-invalid={Boolean(formErrors.category)}
              className="ui-input"
              id="edit-product-category"
              name="category"
              onChange={handleChange}
              type="text"
              value={formData.category}
            />
            {formErrors.category ? (
              <p className="field-error" id="edit-product-category-error" role="alert">
                {formErrors.category}
              </p>
            ) : null}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="edit-product-price">
                Price
              </label>
              <input
                aria-describedby={formErrors.price ? "edit-product-price-error" : undefined}
                aria-invalid={Boolean(formErrors.price)}
                className="ui-input"
                id="edit-product-price"
                min="0"
                name="price"
                onChange={handleChange}
                step="0.01"
                type="number"
                value={formData.price}
              />
              {formErrors.price ? (
                <p className="field-error" id="edit-product-price-error" role="alert">
                  {formErrors.price}
                </p>
              ) : null}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="edit-product-quantity">
                Quantity
              </label>
              <input
                aria-describedby={
                  formErrors.quantity ? "edit-product-quantity-error" : undefined
                }
                aria-invalid={Boolean(formErrors.quantity)}
                className="ui-input"
                id="edit-product-quantity"
                min="0"
                name="quantity"
                onChange={handleChange}
                step="1"
                type="number"
                value={formData.quantity}
              />
              {formErrors.quantity ? (
                <p className="field-error" id="edit-product-quantity-error" role="alert">
                  {formErrors.quantity}
                </p>
              ) : null}
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="edit-product-status">
              Status
            </label>
            <select
              aria-describedby={formErrors.status ? "edit-product-status-error" : undefined}
              aria-invalid={Boolean(formErrors.status)}
              className="ui-input ui-select"
              id="edit-product-status"
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
              <p className="field-error" id="edit-product-status-error" role="alert">
                {formErrors.status}
              </p>
            ) : null}
          </div>

          <div className="modal-actions">
            <button
              aria-label="Cancel editing product"
              className="ui-button ui-button--ghost"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              aria-label="Save product changes"
              className="ui-button"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("aria-hidden"));
}

function validateEditForm(formData) {
  const errors = {};

  if (!formData.name.trim()) {
    errors.name = "Product name is required.";
  }

  if (!formData.category.trim()) {
    errors.category = "Category is required.";
  }

  if (!formData.supplier.trim()) {
    errors.supplier = "Supplier is required.";
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

export default EditProductModal;
