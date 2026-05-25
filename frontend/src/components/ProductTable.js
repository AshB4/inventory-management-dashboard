import StatusPanel from "./StatusPanel";

function ProductTable({
  errorMessage,
  isAdmin,
  isLoading,
  onDeleteProduct,
  onEditProduct,
  onRetry,
  products,
  role,
  searchQuery,
}) {
  if (isLoading) {
    return (
      <StatusPanel
        message="We are syncing your inventory ledger and analytics."
        title="Loading inventory data"
        variant="loading"
      />
    );
  }

  if (errorMessage) {
    return (
      <StatusPanel
        actionLabel="Retry"
        message={errorMessage}
        onAction={onRetry}
        title="Inventory request failed"
        variant="error"
      />
    );
  }

  if (products.length === 0) {
    return (
      <StatusPanel
        message={
          searchQuery
            ? "No products match the current search. Try a broader name, category, or status."
            : "No products found. Add your first inventory item to start tracking stock."
        }
        title={searchQuery ? "No matching products" : "Inventory is empty"}
        variant="empty"
      />
    );
  }

  return (
    <div className="table-wrap">
      <table className="product-table">
        <caption className="sr-only">
          Inventory products including name, category, stock, status, and price
        </caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Category</th>
            <th scope="col">Stock</th>
            <th scope="col">Status</th>
            <th scope="col">Price</th>
            <th scope="col">{isAdmin ? "Actions" : "Access"}</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <th scope="row">{product.name}</th>
              <td>{product.category}</td>
              <td>{product.quantity}</td>
              <td>
                <span className={`status-pill status-pill--${product.status}`}>
                  {formatStatus(product.status)}
                </span>
              </td>
              <td>${Number(product.price).toFixed(2)}</td>
              <td>
                {isAdmin ? (
                  <div className="table-actions">
                    <button
                      aria-label={`Edit ${product.name}`}
                      className="ui-button ui-button--ghost"
                      onClick={() => onEditProduct(product)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      aria-label={`Delete ${product.name}`}
                      className="ui-button ui-button--danger"
                      onClick={() => onDeleteProduct(product)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <span
                    aria-label={`Role ${role} has read only access`}
                    className="access-pill"
                  >
                    Read only
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatStatus(status) {
  return status
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export default ProductTable;
