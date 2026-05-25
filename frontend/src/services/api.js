const API_BASE =
  process.env.REACT_APP_API_BASE?.replace(/\/$/, "") || `${window.location.origin}/api`;
const N8N_WEBHOOK_URL =
  process.env.REACT_APP_N8N_WEBHOOK_URL ||
  "http://127.0.0.1:5678/webhook/inventory-helper";

export async function fetchProducts() {
  const payload = await requestJson(`${API_BASE}/products`);

  if (!payload.success) {
    throw createApiError(payload, "Unable to fetch products.");
  }

  return payload.data;
}

export async function fetchStats() {
  const [totalProducts, lowStockCount, inventoryValue] = await Promise.all([
    fetchStat("/stats/total-products", "total_products"),
    fetchStat("/stats/low-stock", "low_stock_products"),
    fetchStat("/stats/inventory-value", "inventory_value"),
  ]);

  return {
    totalProducts,
    lowStockCount,
    inventoryValue,
  };
}

export async function createProduct(data) {
  return sendJsonRequest("/products", "POST", data, "Unable to create product.");
}

export async function updateProduct(productId, data) {
  return sendJsonRequest(
    `/products/${productId}`,
    "PUT",
    data,
    "Unable to update product."
  );
}

export async function deleteProduct(productId) {
  return sendJsonRequest(
    `/products/${productId}`,
    "DELETE",
    undefined,
    "Unable to delete product."
  );
}

async function fetchStat(path, field) {
  const payload = await requestJson(`${API_BASE}${path}`);

  if (!payload.success) {
    throw createApiError(payload, "Unable to fetch analytics.");
  }

  return payload.data[field];
}

async function sendJsonRequest(path, method, data, fallbackMessage) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data !== undefined) {
    options.body = JSON.stringify(data);
  }

  const payload = await requestJson(`${API_BASE}${path}`, options);

  if (!payload.success) {
    throw createApiError(payload, fallbackMessage);
  }

  return payload.data;
}

export async function askInventoryBot(question) {
  let response;

  try {
    response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });
  } catch (error) {
    throw new Error(
      "Atlas Inventory Bot is unavailable. Start n8n on http://127.0.0.1:5678 and activate the workflow."
    );
  }

  let payload = null;

  try {
    payload = await response.json();
  } catch (error) {
    throw new Error("Atlas Inventory Bot returned an unreadable response.");
  }

  if (!response.ok || payload?.success === false) {
    throw new Error(
      payload?.answer ||
        payload?.message ||
        `${response.status} ${response.statusText || "Bot request failed"}`
    );
  }

  return payload;
}

async function requestJson(url, options) {
  let response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    const networkError = new Error(
      "Network error. API unavailable. Start the Flask backend on http://127.0.0.1:5000 and try again."
    );
    networkError.statusCode = 0;
    throw networkError;
  }

  let payload = null;

  try {
    payload = await response.json();
  } catch (error) {
    if (!response.ok) {
      const unreadableError = new Error(
        `${response.status} ${response.statusText || "Request failed"}: The API returned an unreadable response.`
      );
      unreadableError.statusCode = response.status;
      throw unreadableError;
    }
  }

  if (!response.ok) {
    throw createApiError(payload, "The API request failed.", response.status);
  }

  return payload;
}

function createApiError(payload, fallbackMessage, statusCode) {
  const message = payload?.message || fallbackMessage;
  const prefix = statusCode ? `${statusCode} ` : "";
  const error = new Error(`${prefix}${message}`);
  error.fieldErrors = payload?.errors || {};
  error.statusCode = statusCode || null;
  return error;
}
