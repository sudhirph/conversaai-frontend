(function () {
  function createConversation(apiBaseUrl, customerLanguage) {
    var base = String(apiBaseUrl).replace(/\/$/, "");
    var body = JSON.stringify({
      agent_language: "en",
      customer_language: customerLanguage,
    });
    return fetch(base + "/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Could not create conversation");
        console.log("[ConversaAI] POST /conversations ok", res.status);
        return res.json();
      })
      .then(function (data) {
        var id = data.conversation_id != null ? data.conversation_id : data.id;
        if (!id) throw new Error("Invalid response from server");
        return id;
      });
  }

  function wsOriginFromApiBase(apiBaseUrl) {
    var u = new URL(apiBaseUrl);
    return (u.protocol === "https:" ? "wss:" : "ws:") + "//" + u.host;
  }

  function injectWidgetStylesOnce() {
    if (document.getElementById("conversaai-widget-styles")) return;
    var style = document.createElement("style");
    style.id = "conversaai-widget-styles";
    style.textContent = [
      ".conversaai-widget{position:fixed;bottom:28px;right:28px;width:360px;height:520px;background:rgba(8,15,35,0.85);backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);border:1px solid rgba(255,255,255,0.12);border-radius:20px;box-shadow:0 32px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(99,102,241,0.2),inset 0 1px 0 rgba(255,255,255,0.1);overflow:hidden;font-family:'DM Sans',system-ui,sans-serif;display:flex;flex-direction:column;z-index:30;animation:conversaai-widget-in 400ms cubic-bezier(0.34,1.56,0.64,1) forwards;transition:height .4s cubic-bezier(0.4,0,0.2,1)}",
      "@keyframes conversaai-widget-in{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:translateY(0)}}",
      ".conversaai-widget input::placeholder{color:rgba(255,255,255,0.3)}",
      ".conversaai-widget--collapsed{height:64px!important}",
      ".conversaai-widget--collapsed .conversaai-widget-body{display:none!important}",
      ".conversaai-widget--collapsed .conversaai-header-full{display:none!important}",
      ".conversaai-widget--collapsed .conversaai-header-compact{display:flex!important}",
      ".conversaai-widget--collapsed>header.conversaai-header{padding-top:10px!important;padding-bottom:10px!important}",
      ".conversaai-header{background:linear-gradient(135deg,rgba(99,102,241,0.2),rgba(6,182,212,0.1));border-bottom:1px solid rgba(255,255,255,0.08);padding:10px;display:flex;align-items:center;gap:10px;flex-shrink:0}",
      ".conversaai-header-full{display:flex;align-items:center;gap:10px;flex:1;min-width:0}",
      ".conversaai-header-compact{display:none;align-items:center;justify-content:space-between;width:100%;gap:10px;min-width:0}",
      ".conversaai-compact-title{color:#fff;font-weight:600;font-size:13px;line-height:1.35;min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".conversaai-head-status-line{font-size:13px;font-weight:600;line-height:1.35;color:rgba(255,255,255,0.92);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".conversaai-head-status-line--accent{color:#a5f3fc}",
      ".conversaai-head-status-line--ok{color:#a7f3d0}",
      ".conversaai-head-status-line--warn{color:#fde68a}",
      ".conversaai-head-status-line--bad{color:#fecaca}",
      ".conversaai-compact-title.conversaai-head-status-line--accent{color:#a5f3fc}",
      ".conversaai-compact-title.conversaai-head-status-line--ok{color:#a7f3d0}",
      ".conversaai-compact-title.conversaai-head-status-line--warn{color:#fde68a}",
      ".conversaai-compact-title.conversaai-head-status-line--bad{color:#fecaca}",
      ".conversaai-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-weight:700;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0}",
      ".conversaai-head-center{flex:1;min-width:0}",
      ".conversaai-title-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
      ".conversaai-head-title{color:#fff;font-size:14px;font-weight:600}",
      ".conversaai-live-pill{font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px;text-transform:uppercase;letter-spacing:0.04em}",
      ".conversaai-live-pill--demo{background:rgba(168,85,247,0.35);color:#e9d5ff;border:1px solid rgba(168,85,247,0.5)}",
      ".conversaai-live-pill--ok{background:rgba(34,197,94,0.25);color:#86efac;border:1px solid rgba(34,197,94,0.45)}",
      ".conversaai-live-pill--warn{background:rgba(251,191,36,0.2);color:#fde68a;border:1px solid rgba(251,191,36,0.45)}",
      ".conversaai-live-pill--bad{background:rgba(239,68,68,0.25);color:#fecaca;border:1px solid rgba(239,68,68,0.45)}",
      ".conversaai-status-row{display:flex;align-items:center;gap:6px;margin-top:2px;font-size:12px}",
      ".conversaai-status-dot{font-size:10px;line-height:1}",
      ".conversaai-status-dot--green{color:#34d399}",
      ".conversaai-status-dot--amber{color:#fbbf24}",
      ".conversaai-status-dot--red{color:#f87171}",
      ".conversaai-status-dot--hidden{display:none}",
      "@keyframes conversaai-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.65;transform:scale(1.2)}}",
      ".conversaai-status-dot--pulse{animation:conversaai-pulse 2s ease-in-out infinite}",
      ".conversaai-status-label{color:rgba(255,255,255,0.85)}",
      ".conversaai-status-label--accent{color:#a5f3fc}",
      ".conversaai-header-actions{display:flex;align-items:center;gap:6px;flex-shrink:0}",
      ".conversaai-icon-btn{width:32px;height:32px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.75);cursor:pointer;font-size:16px;line-height:1;display:flex;align-items:center;justify-content:center}",
      ".conversaai-icon-btn:hover{background:rgba(255,255,255,0.1)}",
      ".conversaai-icon-btn--newchat{color:rgba(255,255,255,0.65)}",
      ".conversaai-retry-btn{display:none;font-size:11px;padding:4px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);color:#fecaca;cursor:pointer;white-space:nowrap;font-family:inherit}",
      ".conversaai-retry-btn:hover{background:rgba(255,255,255,0.12)}",
      ".conversaai-expand-btn{font-size:12px;padding:6px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.08);color:#e5e7eb;cursor:pointer;font-family:inherit}",
      ".conversaai-widget-body{flex:1;display:flex;flex-direction:column;min-height:0}",
      ".conversaai-error-banner{display:none;padding:8px 12px;font-size:12px;background:rgba(239,68,68,0.15);border-bottom:1px solid rgba(239,68,68,0.25);color:#fecaca}",
      ".conversaai-messages{flex:1;overflow-y:auto;padding:16px;min-height:0;background:transparent}",
      ".conversaai-messages::-webkit-scrollbar{width:4px}",
      ".conversaai-messages::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:4px}",
      ".conversaai-messages::-webkit-scrollbar-track{background:transparent}",
      ".conversaai-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px 16px;min-height:160px;color:rgba(255,255,255,0.45)}",
      ".conversaai-empty-icon{font-size:48px;line-height:1;margin-bottom:12px;opacity:0.85}",
      ".conversaai-empty-title{font-size:14px;font-weight:600;color:rgba(255,255,255,0.55);margin-bottom:6px}",
      ".conversaai-empty-sub{font-size:12px;color:rgba(255,255,255,0.35)}",
      ".conversaai-input-area{background:rgba(255,255,255,0.03);border-top:1px solid rgba(255,255,255,0.08);padding:14px 16px;flex-shrink:0;display:flex;flex-direction:column;gap:10px}",
      ".conversaai-input-row{display:flex;gap:10px;align-items:center}",
      ".conversaai-input{flex:1;min-width:0;padding:10px 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.06);color:#fff;font-size:14px;outline:none;font-family:inherit;transition:border-color .15s ease,box-shadow .15s ease}",
      ".conversaai-input:focus{border-color:rgba(99,102,241,0.6);box-shadow:0 0 0 3px rgba(99,102,241,0.15)}",
      ".conversaai-send-btn{width:40px;height:40px;flex-shrink:0;border:none;border-radius:50%;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;transition:transform .12s ease,filter .15s ease,opacity .15s ease}",
      ".conversaai-send-btn:hover:not(:disabled){transform:scale(1.05);filter:brightness(1.1)}",
      ".conversaai-send-btn:active:not(:disabled){transform:scale(0.95)}",
      ".conversaai-send-btn:disabled{opacity:0.4;cursor:not-allowed;transform:none;filter:none}",
      ".conversaai-lang-badge{align-self:center;font-size:11px;color:rgba(255,255,255,0.45);padding:4px 10px;border-radius:999px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08)}",
      "@keyframes conversaai-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}",
      ".conversaai-typing-dot{display:inline-block;width:6px;height:6px;margin:0 2px;border-radius:50%;background:rgba(255,255,255,0.4);animation:conversaai-bounce 1.2s ease-in-out infinite}",
      ".conversaai-typing-dot:nth-child(2){animation-delay:0.15s}",
      ".conversaai-typing-dot:nth-child(3){animation-delay:0.3s}",
      ".conversaai-typing-wrap{display:flex;justify-content:flex-start;margin-bottom:10px}",
      ".conversaai-typing-bubble{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:16px 16px 16px 4px;padding:10px 14px;display:flex;align-items:center;gap:2px}",
      ".conversaai-msg-col{display:flex;flex-direction:column;margin-bottom:12px}",
      ".conversaai-msg-col--customer{align-items:flex-end}",
      ".conversaai-msg-col--agent{align-items:flex-start}",
      ".conversaai-bubble{max-width:75%;padding:10px 14px;font-size:14px}",
      ".conversaai-bubble--customer{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border-radius:16px 16px 4px 16px}",
      ".conversaai-bubble--agent{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.9);border-radius:16px 16px 16px 4px}",
      ".conversaai-msg-text{font-size:14px}",
      ".conversaai-bubble--customer .conversaai-msg-text{color:#fff}",
      ".conversaai-bubble--agent .conversaai-msg-text{color:rgba(255,255,255,0.9)}",
      ".conversaai-msg-trans{font-size:11px;font-style:italic;margin-top:6px}",
      ".conversaai-bubble--customer .conversaai-msg-trans{color:rgba(255,255,255,0.6)}",
      ".conversaai-bubble--agent .conversaai-msg-trans{color:rgba(255,255,255,0.5)}",
      ".conversaai-msg-time{font-size:10px;color:rgba(255,255,255,0.28);margin-top:4px}",
      ".conversaai-msg-col--customer .conversaai-msg-time{align-self:flex-end}",
      ".conversaai-msg-col--agent .conversaai-msg-time{align-self:flex-start}",
      ".conversaai-cta-wrap{margin-top:12px;padding:10px;border-radius:8px;width:100%;box-sizing:border-box;background:rgba(99,102,241,0.14);border:1px solid rgba(99,102,241,0.28);display:flex;flex-direction:column;align-items:flex-start;flex-shrink:0}",
      ".conversaai-cta-text{font-size:13px;line-height:1.45;color:rgba(255,255,255,0.9);margin:0 0 10px;white-space:pre-line}",
      ".conversaai-cta-btn{padding:8px 12px;border-radius:6px;border:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;color:#fff;background:linear-gradient(135deg,#4f46e5,#7c3aed)}",
      ".conversaai-cta-btn:hover{filter:brightness(1.08)}",
      ".conversaai-demo-toast{position:fixed;bottom:24px;left:24px;z-index:100000;padding:10px 14px;border-radius:10px;font-size:13px;font-family:'DM Sans',system-ui,sans-serif;color:#fff;background:rgba(8,15,35,0.92);border:1px solid rgba(255,255,255,0.12);backdrop-filter:blur(12px);box-shadow:0 12px 40px rgba(0,0,0,0.45);opacity:0;transform:translateY(8px);transition:opacity .25s ease,transform .25s ease}",
      ".conversaai-demo-toast--show{opacity:1;transform:translateY(0)}",
    ].join("");
    document.head.appendChild(style);
  }

  var ConversaAI = {
    createConversation: createConversation,
    _toggleDemo: null,

    init: function (config) {
      injectWidgetStylesOnce();

      var apiBaseUrl = config && config.apiBaseUrl;
      if (!apiBaseUrl) {
        console.error("[ConversaAI] init requires config.apiBaseUrl");
        return;
      }

      var configDemo = config && config.demoMode === true;
      var browserLang = navigator.language || "en";
      var detectedLang = browserLang.split("-")[0] || "en";
      var conversationIdKey = "conversaai_conversation_id";
      var ws = null;
      var conversationId = null;
      var typingRow = null;
      var minimized = true;
      var wsBackoffStep = 0;
      var wsReconnectTimer = null;
      var wsAutoReconnectCount = 0;
      var intentionalWsClose = false;
      var demoActive = false;
      var liveReady = false;
      var demoGreetingTimerId = null;
      var demoReplyIndex = 0;
      var demoMsgQueue = [];
      var demoQueueProcessing = false;
      var liveDemoFallbackTimerId = null;
      let messageCount = 0;
      let ctaShown = false;

      var DEMO_REPLIES = [
        "Great question! Let me help you with that right away.",
        "I can assist you with that. Could you share more details?",
        "Thanks for reaching out! Our team is here to help.",
        "Absolutely! That's something we specialize in.",
      ];

      function showDemoToast(text) {
        var el = document.createElement("div");
        el.className = "conversaai-demo-toast";
        el.textContent = text;
        document.body.appendChild(el);
        requestAnimationFrame(function () {
          el.classList.add("conversaai-demo-toast--show");
        });
        setTimeout(function () {
          el.classList.remove("conversaai-demo-toast--show");
          setTimeout(function () {
            if (el.parentNode) el.parentNode.removeChild(el);
          }, 280);
        }, 2200);
      }

      function clearWsReconnectTimer() {
        if (wsReconnectTimer) {
          clearTimeout(wsReconnectTimer);
          wsReconnectTimer = null;
        }
      }

      function clearDemoGreetingTimer() {
        if (demoGreetingTimerId) {
          clearTimeout(demoGreetingTimerId);
          demoGreetingTimerId = null;
        }
      }

      function clearLiveDemoFallbackTimer() {
        if (liveDemoFallbackTimerId) {
          clearTimeout(liveDemoFallbackTimerId);
          liveDemoFallbackTimerId = null;
        }
      }

      function scheduleLiveDemoFallback() {
        clearLiveDemoFallbackTimer();
        if (configDemo) return;
        liveDemoFallbackTimerId = setTimeout(function () {
          liveDemoFallbackTimerId = null;
          if (demoActive) return;
          if (ws && ws.readyState === WebSocket.OPEN) return;
          if (ws && ws.readyState === WebSocket.CONNECTING) return;
          console.log(
            "[ConversaAI] Live backend/WebSocket not ready within 3s — switching to offline demo mode"
          );
          enterDemoMode(false);
        }, 3000);
      }

      function closeWebSocketSilently() {
        if (!ws) return;
        try {
          ws.onopen = null;
          ws.onmessage = null;
          ws.onerror = null;
          ws.onclose = null;
          ws.close();
        } catch (e) {}
        ws = null;
      }

      function langDisplayName(code) {
        try {
          return new Intl.DisplayNames(["en"], { type: "language" }).of(code);
        } catch (e) {
          return code;
        }
      }

      var container = document.createElement("div");
      container.className = "conversaai-widget";

      function applyWidgetLayout() {
        if (window.matchMedia("(max-width: 1199px)").matches) {
          container.style.width = "320px";
        } else {
          container.style.width = "360px";
        }
      }
      applyWidgetLayout();
      window.addEventListener("resize", applyWidgetLayout);

      var header = document.createElement("header");
      header.className = "conversaai-header";

      var avatar = document.createElement("div");
      avatar.className = "conversaai-avatar";
      avatar.textContent = "C";

      var headCenter = document.createElement("div");
      headCenter.className = "conversaai-head-center";

      var statusLine = document.createElement("div");
      statusLine.className = "conversaai-head-status-line";
      statusLine.textContent =
        "Chat with us (" + (detectedLang || "en") + ") • Connecting...";
      headCenter.appendChild(statusLine);

      var newChatBtn = document.createElement("button");
      newChatBtn.type = "button";
      newChatBtn.className = "conversaai-icon-btn conversaai-icon-btn--newchat";
      newChatBtn.setAttribute("aria-label", "New chat");
      newChatBtn.title = "New chat — start fresh conversation";
      newChatBtn.innerHTML =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 1 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>';

      var retryBtn = document.createElement("button");
      retryBtn.type = "button";
      retryBtn.className = "conversaai-retry-btn";
      retryBtn.textContent = "Retry Connection";

      var minBtn = document.createElement("button");
      minBtn.type = "button";
      minBtn.className = "conversaai-icon-btn";
      minBtn.setAttribute("aria-label", "Minimize");
      minBtn.title = "Minimize";
      minBtn.textContent = "−";

      var headerFull = document.createElement("div");
      headerFull.className = "conversaai-header-full";
      headerFull.appendChild(avatar);
      headerFull.appendChild(headCenter);

      var headerActions = document.createElement("div");
      headerActions.className = "conversaai-header-actions";
      headerActions.appendChild(retryBtn);
      headerActions.appendChild(newChatBtn);
      headerActions.appendChild(minBtn);

      header.appendChild(headerFull);
      header.appendChild(headerActions);

      var headerCompact = document.createElement("div");
      headerCompact.className = "conversaai-header-compact";
      var compactTitle = document.createElement("span");
      compactTitle.className = "conversaai-compact-title";
      compactTitle.textContent = statusLine.textContent;
      var expandBtn = document.createElement("button");
      expandBtn.type = "button";
      expandBtn.className = "conversaai-expand-btn";
      expandBtn.textContent = "Expand";
      headerCompact.appendChild(compactTitle);
      headerCompact.appendChild(expandBtn);
      header.appendChild(headerCompact);

      var bodyWrap = document.createElement("div");
      bodyWrap.className = "conversaai-widget-body";

      var errorBanner = document.createElement("div");
      errorBanner.className = "conversaai-error-banner";

      var messages = document.createElement("div");
      messages.className = "conversaai-messages";

      var messagesStack = document.createElement("div");
      messages.appendChild(messagesStack);

      var emptyState = document.createElement("div");
      emptyState.className = "conversaai-empty";
      var emptyIcon = document.createElement("div");
      emptyIcon.className = "conversaai-empty-icon";
      emptyIcon.textContent = "🌐";
      emptyIcon.setAttribute("aria-hidden", "true");
      var emptyTitle = document.createElement("div");
      emptyTitle.className = "conversaai-empty-title";
      emptyTitle.textContent = "Send a message to get started";
      var emptySub = document.createElement("div");
      emptySub.className = "conversaai-empty-sub";
      emptySub.textContent = "We speak your language";
      emptyState.appendChild(emptyIcon);
      emptyState.appendChild(emptyTitle);
      emptyState.appendChild(emptySub);
      messagesStack.appendChild(emptyState);

      var inputArea = document.createElement("div");
      inputArea.className = "conversaai-input-area";

      var inputRow = document.createElement("div");
      inputRow.className = "conversaai-input-row";

      var input = document.createElement("input");
      input.type = "text";
      input.className = "conversaai-input";
      input.placeholder = "Type a message...";

      var sendBtn = document.createElement("button");
      sendBtn.type = "button";
      sendBtn.className = "conversaai-send-btn";
      sendBtn.setAttribute("aria-label", "Send message");
      sendBtn.innerHTML =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';

      var langBadge = document.createElement("div");
      langBadge.className = "conversaai-lang-badge";
      langBadge.textContent =
        "🌐 Chatting in: " + langDisplayName(detectedLang);

      inputRow.appendChild(input);
      inputRow.appendChild(sendBtn);
      inputArea.appendChild(inputRow);
      inputArea.appendChild(langBadge);

      bodyWrap.appendChild(errorBanner);
      bodyWrap.appendChild(messages);
      bodyWrap.appendChild(inputArea);

      container.appendChild(header);
      container.appendChild(bodyWrap);
      container.classList.add("conversaai-widget--collapsed");
      container.style.height = "64px";
      document.body.appendChild(container);

      function setWidgetCollapsed(collapsed) {
        minimized = collapsed;
        if (collapsed) {
          container.classList.add("conversaai-widget--collapsed");
          container.style.height = "64px";
        } else {
          container.classList.remove("conversaai-widget--collapsed");
          container.style.height = "520px";
        }
      }

      setWidgetCollapsed(true);

      minBtn.onclick = function () {
        setWidgetCollapsed(true);
      };

      expandBtn.onclick = function () {
        setWidgetCollapsed(false);
      };

      function showErrorBanner(text) {
        errorBanner.textContent = text;
        errorBanner.style.display = "block";
      }

      function hideErrorBanner() {
        errorBanner.style.display = "none";
        errorBanner.textContent = "";
      }

      function setChatEnabled(on) {
        var wsOk = demoActive || (ws && ws.readyState === WebSocket.OPEN);
        input.disabled = !on;
        sendBtn.disabled = !on;
        if (!demoActive) {
          input.title = wsOk ? "" : "Not connected";
          sendBtn.title = wsOk ? "" : "Not connected";
        } else {
          input.title = "";
          sendBtn.title = "";
        }
      }

      function setConnectionStatus(mode) {
        retryBtn.style.display = "none";
        var lang = detectedLang || "en";
        var prefix = "Chat with us (" + lang + ") • ";
        var tail = "";
        var tone = "";

        if (mode === "demo") {
          tail = "Demo";
          tone = " conversaai-head-status-line--accent";
        } else if (mode === "connecting") {
          tail = "Connecting...";
        } else if (mode === "online") {
          tail = "Connected";
          tone = " conversaai-head-status-line--ok";
        } else if (mode === "reconnecting") {
          hideErrorBanner();
          tail =
            "Reconnecting (" + Math.min(wsAutoReconnectCount, 3) + "/3)";
          tone = " conversaai-head-status-line--warn";
        } else if (mode === "connection_exhausted") {
          tail = "Connection lost — tap Retry";
          tone = " conversaai-head-status-line--bad";
          retryBtn.style.display = "inline-block";
          showErrorBanner("Realtime connection failed");
        } else if (mode === "lost" || mode === "realtime_failed") {
          tail =
            mode === "realtime_failed"
              ? "Realtime failed"
              : "Connection lost";
          tone = " conversaai-head-status-line--bad";
          retryBtn.style.display = "inline-block";
          showErrorBanner("Realtime connection failed");
        } else if (mode === "backend_error") {
          tail = "Backend unreachable";
          tone = " conversaai-head-status-line--bad";
          retryBtn.style.display = "inline-block";
          showErrorBanner("Backend not reachable");
        } else if (mode === "disconnected") {
          tail = "Disconnected";
          tone = " conversaai-head-status-line--bad";
        }

        var line = prefix + tail;
        var baseLine = "conversaai-head-status-line";
        var baseCompact = "conversaai-compact-title";
        statusLine.className = baseLine + tone;
        compactTitle.className = baseCompact + tone;
        statusLine.textContent = line;
        compactTitle.textContent = line;
      }

      function hideEmptyState() {
        emptyState.style.display = "none";
      }

      function showEmptyState() {
        emptyState.style.display = "flex";
      }

      function removeTypingIndicator() {
        if (typingRow && typingRow.parentNode) typingRow.parentNode.removeChild(typingRow);
        typingRow = null;
      }

      function showTypingIndicator() {
        removeTypingIndicator();
        typingRow = document.createElement("div");
        typingRow.className = "conversaai-typing-wrap";

        var bubble = document.createElement("div");
        bubble.className = "conversaai-typing-bubble";

        for (var i = 0; i < 3; i += 1) {
          var d = document.createElement("span");
          d.className = "conversaai-typing-dot";
          bubble.appendChild(d);
        }

        typingRow.appendChild(bubble);
        messagesStack.appendChild(typingRow);
        messages.scrollTop = messages.scrollHeight;
      }

      function fmtTime() {
        var d = new Date();
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }

      function renderMessage(data) {
        hideEmptyState();
        removeTypingIndicator();

        var isCustomer = data.sender_type === "customer";
        var col = document.createElement("div");
        col.className =
          "conversaai-msg-col " +
          (isCustomer ? "conversaai-msg-col--customer" : "conversaai-msg-col--agent");

        var bubble = document.createElement("div");
        bubble.className =
          "conversaai-bubble " +
          (isCustomer ? "conversaai-bubble--customer" : "conversaai-bubble--agent");

        var orig = document.createElement("div");
        orig.className = "conversaai-msg-text";
        orig.textContent = data.original_text || "";

        var trans = document.createElement("div");
        trans.className = "conversaai-msg-trans";
        trans.textContent = "🌐 " + (data.translated_text || "");

        bubble.appendChild(orig);
        bubble.appendChild(trans);

        var ts = document.createElement("div");
        ts.className = "conversaai-msg-time";
        ts.textContent = fmtTime();

        col.appendChild(bubble);
        col.appendChild(ts);
        messagesStack.appendChild(col);
        messages.scrollTop = messages.scrollHeight;
      }

      async function loadMessages(cid) {
        var url =
          String(apiBaseUrl).replace(/\/$/, "") + "/conversations/" + cid + "/messages";
        console.log("[ConversaAI] GET messages", url);
        var res = await fetch(url);
        if (res.status === 404 || !res.ok) {
          console.warn("[ConversaAI] messages fetch failed", res.status);
          var err = new Error("messages_unavailable");
          err.status = res.status;
          throw err;
        }
        var data = await res.json();
        console.log("[ConversaAI] messages response", data);
        return data;
      }

      function createConversationWithRetry() {
        function attempt(n) {
          console.log("[ConversaAI] createConversation attempt", n);
          return createConversation(apiBaseUrl, detectedLang)
            .then(function (id) {
              console.log("[ConversaAI] conversation created", id);
              return id;
            })
            .catch(function (err) {
              console.warn("[ConversaAI] createConversation failed", err);
              if (n < 3) {
                return new Promise(function (r) {
                  setTimeout(r, 1000);
                }).then(function () {
                  return attempt(n + 1);
                });
              }
              throw err;
            });
        }
        return attempt(1);
      }

      function clearMessagesUI() {
        removeTypingIndicator();
        while (messagesStack.firstChild) {
          messagesStack.removeChild(messagesStack.firstChild);
        }
        messagesStack.appendChild(emptyState);
        showEmptyState();
      }

      function enterDemoMode(showToggleToast) {
        clearLiveDemoFallbackTimer();
        demoActive = true;
        liveReady = false;
        hideErrorBanner();
        closeWebSocketSilently();
        clearWsReconnectTimer();
        wsAutoReconnectCount = 0;
        wsBackoffStep = 0;
        removeTypingIndicator();
        demoMsgQueue = [];
        demoQueueProcessing = false;
        setConnectionStatus("demo");
        setChatEnabled(true);
        clearMessagesUI();
        demoReplyIndex = 0;
        clearDemoGreetingTimer();
        demoGreetingTimerId = setTimeout(function () {
          demoGreetingTimerId = null;
          if (!demoActive) return;
          renderMessage({
            sender_type: "agent",
            original_text: "👋 Hi! How can I help you today?",
            translated_text: "[En español: ¡Hola! ¿En qué puedo ayudarte hoy?]",
          });
        }, 1500);
        if (showToggleToast) showDemoToast("Demo mode: ON");
      }

      function toggleDemoModeInternal() {
        if (demoActive) {
          demoActive = false;
          clearDemoGreetingTimer();
          removeTypingIndicator();
          demoMsgQueue = [];
          demoQueueProcessing = false;
          liveReady = false;
          showDemoToast("Demo mode: OFF");
          startLiveChat();
          scheduleLiveDemoFallback();
        } else {
          enterDemoMode(true);
        }
      }

      function demoFlushMessageQueue() {
        if (!demoActive || demoQueueProcessing) return;
        if (demoMsgQueue.length === 0) return;
        demoQueueProcessing = true;
        var text = demoMsgQueue.shift();
        hideEmptyState();
        renderMessage({
          sender_type: "customer",
          original_text: text,
          translated_text: "[Translated from Spanish]",
        });
        showTypingIndicator();
        setTimeout(function () {
          if (!demoActive) {
            demoQueueProcessing = false;
            return;
          }
          removeTypingIndicator();
          var reply = DEMO_REPLIES[demoReplyIndex % DEMO_REPLIES.length];
          demoReplyIndex += 1;
          renderMessage({
            sender_type: "agent",
            original_text: reply,
            translated_text:
              "[En español: Gracias por tu mensaje. Estamos aquí para ayudarte.]",
          });
          demoQueueProcessing = false;
          demoFlushMessageQueue();
        }, 1200);
      }

      function scheduleWsReconnect() {
        if (demoActive || intentionalWsClose) return;
        clearWsReconnectTimer();
        var idx = Math.min(wsBackoffStep, 3);
        var delays = [1000, 2000, 5000, 10000];
        var delay = delays[idx];
        wsBackoffStep += 1;
        console.log(
          "[ConversaAI] WebSocket scheduling reconnect",
          wsAutoReconnectCount,
          "/3 in",
          delay,
          "ms"
        );
        setConnectionStatus("reconnecting");
        wsReconnectTimer = setTimeout(function () {
          wsReconnectTimer = null;
          connectWebSocket();
        }, delay);
      }

      function connectWebSocket() {
        if (demoActive) return;
        clearWsReconnectTimer();
        setChatEnabled(false);
        setConnectionStatus("connecting");
        var wsBase = wsOriginFromApiBase(apiBaseUrl);
        var wsUrl =
          wsBase +
          "/ws/conversations/" +
          encodeURIComponent(conversationId) +
          "?role=customer";
        console.log("[ConversaAI] WebSocket connecting:", wsUrl);
        ws = new WebSocket(wsUrl);

        ws.onmessage = function (event) {
          var payload;
          try {
            payload = JSON.parse(event.data);
          } catch (parseErr) {
            console.warn("[ConversaAI] WebSocket message parse error", parseErr, event.data);
            return;
          }
          console.log("[ConversaAI] WebSocket payload received", payload);
          renderMessage(payload);
        };

        ws.onopen = function () {
          if (demoActive) return;
          console.log("[ConversaAI] WebSocket open");
          clearLiveDemoFallbackTimer();
          liveReady = true;
          wsBackoffStep = 0;
          wsAutoReconnectCount = 0;
          intentionalWsClose = false;
          hideErrorBanner();
          setConnectionStatus("online");
          setChatEnabled(true);
        };

        ws.onerror = function (ev) {
          if (demoActive) return;
          console.warn("[ConversaAI] WebSocket error", ev);
          removeTypingIndicator();
          setChatEnabled(false);
        };

        ws.onclose = function (ev) {
          if (demoActive) return;
          console.log("[ConversaAI] WebSocket close", ev.code, ev.reason);
          removeTypingIndicator();
          setChatEnabled(false);
          if (intentionalWsClose) {
            intentionalWsClose = false;
            return;
          }
          liveReady = false;
          wsAutoReconnectCount += 1;
          if (wsAutoReconnectCount > 3) {
            console.warn(
              "[ConversaAI] WebSocket gave up after",
              wsAutoReconnectCount - 1,
              "failed reconnect cycles"
            );
            setConnectionStatus("connection_exhausted");
            return;
          }
          setConnectionStatus("realtime_failed");
          scheduleWsReconnect();
        };
      }

      function retryConnectionFull() {
        if (demoActive) return;
        console.log("[ConversaAI] Retry Connection (full)");
        intentionalWsClose = true;
        clearWsReconnectTimer();
        wsBackoffStep = 0;
        wsAutoReconnectCount = 0;
        closeWebSocketSilently();
        intentionalWsClose = false;
        try {
          localStorage.removeItem(conversationIdKey);
        } catch (e) {}
        conversationId = null;
        hideErrorBanner();
        startLiveChat();
        scheduleLiveDemoFallback();
      }

      retryBtn.onclick = function () {
        if (demoActive) return;
        retryConnectionFull();
      };

      function showCTA() {
        if (ctaShown) return;
        ctaShown = true;
        var wrap = document.createElement("div");
        wrap.className = "conversaai-cta-wrap";
        wrap.setAttribute("role", "region");
        wrap.setAttribute("aria-label", "Early access");
        var text = document.createElement("div");
        text.className = "conversaai-cta-text";
        text.textContent =
          "🔥 Want this on your website?\nSupport your customers in any language instantly.";
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "conversaai-cta-btn";
        btn.textContent = "Get Early Access";
        btn.onclick = function () {
          window.open("https://forms.gle/NmF1PuNbyP7Bp6kB7", "_blank");
        };
        wrap.appendChild(text);
        wrap.appendChild(btn);
        messagesStack.appendChild(wrap);
        messages.scrollTop = messages.scrollHeight;
      }

      newChatBtn.onclick = function () {
        if (demoActive) {
          try {
            localStorage.removeItem(conversationIdKey);
          } catch (e) {}
          conversationId = null;
          clearDemoGreetingTimer();
          removeTypingIndicator();
          demoMsgQueue = [];
          demoQueueProcessing = false;
          demoReplyIndex = 0;
          clearMessagesUI();
          demoGreetingTimerId = setTimeout(function () {
            demoGreetingTimerId = null;
            if (!demoActive) return;
            renderMessage({
              sender_type: "agent",
              original_text: "👋 Hi! How can I help you today?",
              translated_text: "[En español: ¡Hola! ¿En qué puedo ayudarte hoy?]",
            });
          }, 1500);
          return;
        }
        try {
          localStorage.removeItem(conversationIdKey);
        } catch (e) {}
        clearWsReconnectTimer();
        wsBackoffStep = 0;
        wsAutoReconnectCount = 0;
        if (ws) {
          try {
            ws.onopen = null;
            ws.onmessage = null;
            ws.onerror = null;
            ws.onclose = null;
            ws.close();
          } catch (e) {}
          ws = null;
        }
        conversationId = null;
        clearMessagesUI();
        startLiveChat();
        scheduleLiveDemoFallback();
      };

      function sendMessage() {
        if (demoActive) {
          var t = input.value.trim();
          if (!t) return;
          input.value = "";
          demoMsgQueue.push(t);
          demoFlushMessageQueue();
          messageCount += 1;
          if (messageCount === 3) {
            showCTA();
          }
          return;
        }
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        if (!input.value.trim()) return;
        hideEmptyState();
        showTypingIndicator();
        ws.send(JSON.stringify({ text: input.value }));
        input.value = "";
        messageCount += 1;
        if (messageCount === 3) {
          showCTA();
        }
      }

      sendBtn.onclick = sendMessage;
      input.onkeydown = function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          sendMessage();
        }
      };

      async function startLiveChat() {
        if (demoActive) return;
        try {
          setConnectionStatus("connecting");
          liveReady = false;
          wsAutoReconnectCount = 0;
          var historyData;
          var existingId = null;
          try {
            existingId = localStorage.getItem(conversationIdKey);
          } catch (e) {
            existingId = null;
          }

          if (existingId) {
            try {
              historyData = await loadMessages(existingId);
              if (demoActive) return;
              conversationId = existingId;
            } catch (err) {
              if (demoActive) return;
              console.warn(
                "[ConversaAI] Stored conversation unavailable (404, network, or stale). Creating a new one.",
                err
              );
              try {
                localStorage.removeItem(conversationIdKey);
              } catch (e2) {}
              conversationId = await createConversationWithRetry();
              if (demoActive) return;
              try {
                localStorage.setItem(conversationIdKey, conversationId);
              } catch (e3) {}
              historyData = await loadMessages(conversationId);
            }
          } else {
            conversationId = await createConversationWithRetry();
            if (demoActive) return;
            try {
              localStorage.setItem(conversationIdKey, conversationId);
            } catch (e) {}
            historyData = await loadMessages(conversationId);
          }

          if (demoActive) return;

          clearMessagesUI();
          var list = Array.isArray(historyData) ? historyData : historyData.messages || [];
          if (list.length) {
            hideEmptyState();
            for (var i = 0; i < list.length; i += 1) {
              renderMessage(list[i]);
            }
          } else {
            showEmptyState();
          }

          if (demoActive) return;
          connectWebSocket();
        } catch (err) {
          if (!demoActive) {
            console.error("[ConversaAI] startLiveChat failed", err);
            setConnectionStatus("backend_error");
            setChatEnabled(false);
          }
        }
      }

      ConversaAI._toggleDemo = toggleDemoModeInternal;

      if (!ConversaAI._demoKeyBound) {
        ConversaAI._demoKeyBound = true;
        document.addEventListener("keydown", function (e) {
          if (e.ctrlKey && e.shiftKey && (e.key === "d" || e.key === "D")) {
            e.preventDefault();
            if (typeof ConversaAI._toggleDemo === "function") {
              ConversaAI._toggleDemo();
            }
          }
        });
      }

      if (configDemo) {
        enterDemoMode(false);
      } else {
        startLiveChat();
        scheduleLiveDemoFallback();
      }
    },
  };

  window.ConversaAI = ConversaAI;
})();
