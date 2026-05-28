const API_BASE = getApiBase();
const N8N_CHAT_URL =
  process.env.REACT_APP_N8N_CHAT_URL?.replace(/\/$/, "") ||
  "http://localhost:5678/webhook/atlas-inventory-bot-chat-trigger/chat";
const N8N_CHAT_SESSION_KEY = "atlas-inventory-chat-session";

function getApiBase() {
  const explicitBase = process.env.REACT_APP_API_BASE?.replace(/\/$/, "");
  if (explicitBase) {
    return explicitBase;
  }

  return "/api";
}

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
  if (!N8N_CHAT_URL) {
    const payload = await requestJson(`${API_BASE}/inventory-bot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    if (!payload.success) {
      throw createApiError(payload, "Atlas Inventory Bot request failed.");
    }

    return normalizeBotPayload(payload, question);
  }

  const sessionId = getChatSessionId();
  const payload = await requestJson(N8N_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "sendMessage",
      sessionId,
      chatInput: question,
    }),
  });

  return normalizeBotPayload(payload, question);
}

function normalizeBotPayload(payload, question) {
  const data = Array.isArray(payload)
    ? payload[payload.length - 1]
    : payload?.data && typeof payload.data === "object"
      ? payload.data
      : payload;
  const answer = extractBotAnswer(data) || stringifyBotPayload(data);

  return {
    question: data?.question || question,
    answer,
    data: data?.data || null,
  };
}

function extractBotAnswer(data) {
  if (typeof data === "string") {
    return extractStreamingAnswer(data) || data;
  }

  if (!data || typeof data !== "object") {
    return "";
  }

  const directAnswer =
    data.answer ||
    data.output ||
    data.text ||
    data.response ||
    data.message ||
    data.chatOutput ||
    data.content;

  if (typeof directAnswer === "string") {
    return directAnswer;
  }

  if (directAnswer && typeof directAnswer === "object") {
    return extractBotAnswer(directAnswer);
  }

  if (Array.isArray(data.messages)) {
    const lastMessage = data.messages[data.messages.length - 1];
    return extractBotAnswer(lastMessage);
  }

  if (Array.isArray(data.output)) {
    return extractBotAnswer(data.output[data.output.length - 1]);
  }

  for (const value of Object.values(data)) {
    const nestedAnswer = extractBotAnswer(value);
    if (nestedAnswer) {
      return nestedAnswer;
    }
  }

  return "";
}

function extractStreamingAnswer(text) {
  if (!text.includes('"type":"item"') || !text.includes('"content"')) {
    return "";
  }

  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        const event = JSON.parse(line);
        return event.type === "item" && typeof event.content === "string"
          ? event.content
          : "";
      } catch (error) {
        return "";
      }
    })
    .join("")
    .trim();
}

function stringifyBotPayload(data) {
  if (!data || typeof data !== "object") {
    return "";
  }

  try {
    return JSON.stringify(data);
  } catch (error) {
    return "";
  }
}

function getChatSessionId() {
  try {
    const existingSessionId = window.localStorage.getItem(N8N_CHAT_SESSION_KEY);
    if (existingSessionId) {
      return existingSessionId;
    }

    const nextSessionId = window.crypto?.randomUUID?.() || `atlas-${Date.now()}`;
    window.localStorage.setItem(N8N_CHAT_SESSION_KEY, nextSessionId);
    return nextSessionId;
  } catch (error) {
    return `atlas-${Date.now()}`;
  }
}

async function requestJson(url, options) {
  let response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    const networkError = new Error(
      "Sorry, Atlas is down right now. Error 0. Start the Flask backend on http://127.0.0.1:5000 and try again."
    );
    networkError.statusCode = 0;
    throw networkError;
  }

  const responseText = await response.text();
  let payload = responseText;

  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch (error) {
      payload = responseText;
    }
  }

  if (!responseText && !response.ok) {
    const unreadableError = new Error(
      `${response.status} ${response.statusText || "Request failed"}: The API returned an empty response.`
    );
    unreadableError.statusCode = response.status;
    throw unreadableError;
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
