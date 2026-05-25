import { useEffect, useState } from "react";
import AppShell from "./components/AppShell";
import DashboardPage from "./components/DashboardPage";
import InventoryBotWidget from "./components/InventoryBotWidget";
import {
  askInventoryBot,
  createProduct,
  deleteProduct,
  fetchProducts,
  fetchStats,
  updateProduct,
} from "./services/api";

function App() {
  const [role, setRole] = useState("admin");
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    inventoryValue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => setSuccessMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  async function loadDashboardData() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [productsData, statsData] = await Promise.all([
        fetchProducts(),
        fetchStats(),
      ]);

      setProducts(productsData);
      setStats(statsData);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateProduct(formData) {
    setErrorMessage("");

    try {
      const createdProduct = await createProduct(formData);
      setProducts((currentProducts) => [createdProduct, ...currentProducts]);
      setStats((currentStats) => ({
        totalProducts: currentStats.totalProducts + 1,
        lowStockCount:
          currentStats.lowStockCount +
          (createdProduct.status === "low_stock" ? 1 : 0),
        inventoryValue: roundCurrency(
          currentStats.inventoryValue +
            createdProduct.price * createdProduct.quantity
        ),
      }));
      setSuccessMessage("Product added successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to create product.");
      throw error;
    }
  }

  async function handleUpdateProduct(productId, updates) {
    setErrorMessage("");

    try {
      const originalProduct = products.find((product) => product.id === productId);
      const updatedProduct = await updateProduct(productId, updates);

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === productId ? updatedProduct : product
        )
      );

      if (originalProduct) {
        setStats((currentStats) => {
          const originalValue = originalProduct.price * originalProduct.quantity;
          const updatedValue = updatedProduct.price * updatedProduct.quantity;
          const originalLowStock = originalProduct.status === "low_stock" ? 1 : 0;
          const updatedLowStock = updatedProduct.status === "low_stock" ? 1 : 0;

          return {
            totalProducts: currentStats.totalProducts,
            lowStockCount:
              currentStats.lowStockCount - originalLowStock + updatedLowStock,
            inventoryValue: roundCurrency(
              currentStats.inventoryValue - originalValue + updatedValue
            ),
          };
        });
      }

      setEditingProduct(null);
      setSuccessMessage("Product updated successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to update product.");
      throw error;
    }
  }

  function handleDeleteRequest(product) {
    setPendingDeleteProduct(product);
  }

  async function handleConfirmDelete() {
    if (!pendingDeleteProduct) {
      return;
    }

    setErrorMessage("");

    try {
      const productId = pendingDeleteProduct.id;
      const productToRemove = products.find((product) => product.id === productId);
      await deleteProduct(productId);

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== productId)
      );

      if (productToRemove) {
        setStats((currentStats) => ({
          totalProducts: Math.max(0, currentStats.totalProducts - 1),
          lowStockCount:
            currentStats.lowStockCount -
            (productToRemove.status === "low_stock" ? 1 : 0),
          inventoryValue: roundCurrency(
            currentStats.inventoryValue -
              productToRemove.price * productToRemove.quantity
          ),
        }));
      }

      setPendingDeleteProduct(null);
      setSuccessMessage("Product deleted successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to delete product.");
    }
  }

  function handleDeleteCancel() {
    setPendingDeleteProduct(null);
  }

  const filteredProducts = products.filter((product) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return true;
    }

    return [product.name, product.category, product.status]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  const isAdmin = role === "admin";

  return (
    <AppShell
      onRoleChange={setRole}
      onRefresh={loadDashboardData}
      onSearchChange={setSearchQuery}
      role={role}
      searchQuery={searchQuery}
    >
      <DashboardPage
        editingProduct={editingProduct}
        errorMessage={errorMessage}
        isAdmin={isAdmin}
        isLoading={isLoading}
        pendingDeleteProduct={pendingDeleteProduct}
        onCreateProduct={handleCreateProduct}
        onConfirmDelete={handleConfirmDelete}
        onDeleteCancel={handleDeleteCancel}
        onDeleteProduct={handleDeleteRequest}
        onEditProduct={isAdmin ? setEditingProduct : () => {}}
        onRefresh={loadDashboardData}
        onUpdateProduct={handleUpdateProduct}
        products={filteredProducts}
        role={role}
        searchQuery={searchQuery}
        setEditingProduct={setEditingProduct}
        stats={stats}
        successMessage={successMessage}
      />
      <InventoryBotWidget onAskBot={askInventoryBot} />
    </AppShell>
  );
}

function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}

export default App;
