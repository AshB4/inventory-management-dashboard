import ConfirmDialog from "./ConfirmDialog";
import EditProductModal from "./EditProductModal";
import ProductForm from "./ProductForm";
import ProductTable from "./ProductTable";
import StatsCards from "./StatsCards";

function DashboardPage({
  editingProduct,
  errorMessage,
  isAdmin,
  isLoading,
  pendingDeleteProduct,
  onCreateProduct,
  onConfirmDelete,
  onDeleteCancel,
  onDeleteProduct,
  onEditProduct,
  onRefresh,
  onUpdateProduct,
  products,
  role,
  searchQuery,
  setEditingProduct,
  stats,
  successMessage,
}) {
  return (
    <div className="dashboard-page">
      <section className="page-intro" id="dashboard">
        <div>
          <p className="section-kicker">Industrial SaaS Dashboard</p>
          <h2 className="page-title">Inventory command center</h2>
          <p className="page-copy">
            Monitor robotics stock levels, product value, and operational risk
            from one workspace.
          </p>
        </div>
        <div className="page-actions">
          <button
            aria-label="Refresh inventory dashboard data"
            className="ui-button ui-button--secondary"
            onClick={onRefresh}
            type="button"
          >
            Refresh Dashboard
          </button>
        </div>
      </section>

      {successMessage ? (
        <p aria-live="polite" className="feedback-message feedback-message--success" role="status">
          {successMessage}
        </p>
      ) : null}
      <p aria-live="polite" className="role-banner" role="status">
        {isAdmin
          ? "Admin access: create, edit, and delete actions are enabled."
          : "Viewer access: inventory is read-only."}
      </p>

      <StatsCards stats={stats} />

      <div className="dashboard-grid">
        <ProductForm isAdmin={isAdmin} onCreateProduct={onCreateProduct} />
        <section
          aria-labelledby="inventory-table-title"
          className="panel panel--table"
          id="inventory"
        >
          <div className="panel-header">
            <div>
              <p className="section-kicker">Inventory Ledger</p>
              <h3 className="panel-title" id="inventory-table-title">
                Product table
              </h3>
            </div>
          </div>
          <ProductTable
            errorMessage={errorMessage}
            isAdmin={isAdmin}
            isLoading={isLoading}
            onDeleteProduct={onDeleteProduct}
            onEditProduct={onEditProduct}
            onRetry={onRefresh}
            products={products}
            role={role}
            searchQuery={searchQuery}
          />
        </section>
      </div>

      <EditProductModal
        isAdmin={isAdmin}
        onClose={() => setEditingProduct(null)}
        onUpdateProduct={onUpdateProduct}
        product={editingProduct}
      />
      <ConfirmDialog
        confirmLabel="Delete Product"
        isOpen={Boolean(pendingDeleteProduct)}
        message={
          pendingDeleteProduct
            ? `Delete ${pendingDeleteProduct.name}? This action removes the item from the inventory ledger.`
            : ""
        }
        onCancel={onDeleteCancel}
        onConfirm={onConfirmDelete}
        title="Confirm deletion"
      />
    </div>
  );
}

export default DashboardPage;
