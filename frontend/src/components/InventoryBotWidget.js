import { useEffect, useRef, useState } from "react";
import atlasLogo from "../assets/HexAtlasIcon.png";

const SUGGESTED_PROMPTS = [
  "How many products are low in stock?",
  "Show total inventory value.",
  "What is our most expensive product?",
];

function InventoryBotWidget({ onAskBot }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "bot",
      text: "Ask about low stock, total inventory value, most expensive product, or products by category.",
    },
  ]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  async function submitQuestion(nextQuestion) {
    const trimmedQuestion = nextQuestion.trim();
    if (!trimmedQuestion) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      { id: `user-${Date.now()}`, role: "user", text: trimmedQuestion },
    ]);
    setQuestion("");
    setIsSending(true);

    try {
      const response = await onAskBot(trimmedQuestion);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `bot-${Date.now()}`,
          role: "bot",
          text: response.answer || "No response received from Atlas Inventory Bot.",
        },
      ]);
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `error-${Date.now()}`,
          role: "bot",
          text: error.message || "Atlas Inventory Bot is unavailable right now.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    submitQuestion(question);
  }

  return (
    <aside
      aria-label="Atlas Inventory Bot assistant"
      className={`bot-widget ${isOpen ? "bot-widget--open" : "bot-widget--closed"}`}
    >
      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? "Minimize Atlas Inventory Bot" : "Open Atlas Inventory Bot"}
        className="bot-widget__toggle"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        type="button"
      >
        <img alt="" aria-hidden="true" className="bot-widget__logo" src={atlasLogo} />
        <span className="bot-widget__toggle-copy">
          <span className="bot-widget__eyebrow">
            {isOpen ? "AI Assistant" : "Chat Bot"}
          </span>
          <span className="bot-widget__title">Atlas Inventory Bot</span>
        </span>
        <span aria-hidden="true" className="bot-widget__toggle-icon">
          {isOpen ? "×" : "Chat"}
        </span>
      </button>

      {isOpen ? (
        <div className="bot-widget__panel">
          <div className="bot-widget__messages" role="log" aria-live="polite">
            {messages.map((message) => (
              <div
                className={`bot-message bot-message--${message.role}`}
                key={message.id}
              >
                <p>{message.text}</p>
              </div>
            ))}
            {isSending ? (
              <div className="bot-message bot-message--bot">
                <p>Atlas Inventory Bot is checking inventory...</p>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <div className="bot-widget__prompts" aria-label="Suggested prompts">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                className="bot-widget__prompt"
                key={prompt}
                onClick={() => submitQuestion(prompt)}
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form className="bot-widget__form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="inventory-bot-question">
              Ask Atlas Inventory Bot a question
            </label>
            <textarea
              aria-label="Ask Atlas Inventory Bot a question"
              className="ui-input bot-widget__input"
              id="inventory-bot-question"
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about inventory, value, stock levels, or categories"
              ref={inputRef}
              rows="3"
              value={question}
            />
            <button className="ui-button" disabled={isSending} type="submit">
              {isSending ? "Sending..." : "Ask Bot"}
            </button>
          </form>
        </div>
      ) : null}
    </aside>
  );
}

export default InventoryBotWidget;
