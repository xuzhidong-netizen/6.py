const QUOTES = [
  { symbol: "600519", name: "贵州茅台", price: 1688.2, change: 1.82, turnover: "12.4亿", volume: "7.8万手" },
  { symbol: "000001", name: "平安银行", price: 12.63, change: -0.94, turnover: "4.2亿", volume: "36.1万手" },
  { symbol: "601318", name: "中国平安", price: 46.72, change: 0.68, turnover: "9.5亿", volume: "28.3万手" },
  { symbol: "00700", name: "腾讯控股", price: 328.4, change: 1.12, turnover: "18.6亿", volume: "11.9万手" },
];

const HOLDINGS = [
  { name: "沪深股票", weight: 42, pnl: "+12.8%", amount: "¥1,268,000" },
  { name: "港股仓位", weight: 18, pnl: "+4.1%", amount: "¥542,000" },
  { name: "基金组合", weight: 24, pnl: "+7.6%", amount: "¥731,000" },
  { name: "现金管理", weight: 16, pnl: "+2.2%", amount: "¥486,000" },
];

const STATEMENTS = [
  { month: "2026-02", title: "二月对账单", amount: "¥3,027,900", delta: "+¥84,600", status: "已出单" },
  { month: "2026-01", title: "一月对账单", amount: "¥2,943,300", delta: "+¥41,280", status: "已归档" },
  { month: "2025-12", title: "十二月对账单", amount: "¥2,902,020", delta: "-¥18,340", status: "已归档" },
];

const FLOWS = [
  { time: "09:32", desc: "证券买入 - 600519", amount: "-¥84,410", state: "negative" },
  { time: "10:08", desc: "银证转入", amount: "+¥300,000", state: "positive" },
  { time: "13:24", desc: "基金赎回到账", amount: "+¥52,840", state: "positive" },
  { time: "15:01", desc: "利息结转", amount: "+¥1,260", state: "positive" },
];

function repoBase() {
  if (!window.location.hostname.endsWith("github.io")) {
    return "";
  }
  const [first] = window.location.pathname.split("/").filter(Boolean);
  return first ? `/${first}` : "";
}

function routeUrl(route) {
  return `${repoBase()}${route}`;
}

function currentRoute() {
  const path = window.location.pathname;
  const base = repoBase();
  if (base && path.startsWith(base)) {
    return path.slice(base.length) || "/";
  }
  return path || "/";
}

function bindRoutes() {
  document.querySelectorAll("[data-route]").forEach((node) => {
    const route = node.getAttribute("data-route");
    if (route) {
      node.setAttribute("href", routeUrl(route));
      if (currentRoute() === route) {
        node.setAttribute("data-active", "true");
      }
    }
  });
}

function authState() {
  try {
    return JSON.parse(localStorage.getItem("finance-demo-auth") || "null");
  } catch {
    return null;
  }
}

function setAuth(username) {
  const payload = {
    username,
    loginAt: new Date().toISOString(),
  };
  localStorage.setItem("finance-demo-auth", JSON.stringify(payload));
}

function clearAuth() {
  localStorage.removeItem("finance-demo-auth");
}

function guardProtectedPage() {
  if (document.body.dataset.protected !== "true") {
    return;
  }
  const session = authState();
  if (!session) {
    const next = encodeURIComponent(currentRoute());
    window.location.replace(`${routeUrl("/login/")}?next=${next}`);
  }
}

function hydrateSession() {
  const session = authState();
  const sessionUser = document.querySelector("[data-session-user]");
  const sessionTime = document.querySelector("[data-session-time]");
  const loginEntry = document.querySelector("[data-login-entry]");
  const logoutButton = document.querySelector("[data-action='logout']");

  if (sessionUser) {
    sessionUser.textContent = session ? session.username : "访客模式";
  }
  if (sessionTime) {
    sessionTime.textContent = session
      ? new Date(session.loginAt).toLocaleString("zh-CN", { hour12: false })
      : "未登录";
  }
  if (loginEntry) {
    loginEntry.textContent = session ? "已登录" : "去登录";
  }
  if (logoutButton) {
    logoutButton.hidden = !session;
    logoutButton.addEventListener("click", () => {
      clearAuth();
      window.location.href = routeUrl("/login/");
    });
  }
}

function mountLogin() {
  const form = document.querySelector("#loginForm");
  if (!form) {
    return;
  }
  const next = new URLSearchParams(window.location.search).get("next") || "/quotes/";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    setAuth(String(formData.get("username") || "demo.trader"));
    window.location.href = routeUrl(next);
  });
}

function mountQuotes() {
  const body = document.querySelector("#quotesBody");
  const clock = document.querySelector("#marketClock");
  if (!body) {
    return;
  }
  body.innerHTML = QUOTES.map((item) => {
    const className = item.change >= 0 ? "positive" : "negative";
    const mark = item.change >= 0 ? "+" : "";
    return `
      <tr>
        <td><strong>${item.symbol}</strong><div class="meta-line">${item.name}</div></td>
        <td>¥${item.price.toFixed(2)}</td>
        <td class="${className}">${mark}${item.change.toFixed(2)}%</td>
        <td>${item.turnover}</td>
        <td>${item.volume}</td>
      </tr>
    `;
  }).join("");
  if (clock) {
    clock.textContent = new Date().toLocaleString("zh-CN", { hour12: false });
  }
}

function mountPortfolio() {
  const total = document.querySelector("#portfolioTotal");
  const holdings = document.querySelector("#holdingsGrid");
  const allocation = document.querySelector("#allocationList");
  if (!holdings || !allocation) {
    return;
  }
  if (total) {
    total.textContent = "¥3,027,900";
  }
  holdings.innerHTML = HOLDINGS.map((item) => `
    <div class="account-card">
      <span class="chip">${item.name}</span>
      <strong>${item.amount}</strong>
      <div class="meta-line">区间收益 <span class="positive">${item.pnl}</span></div>
    </div>
  `).join("");
  allocation.innerHTML = HOLDINGS.map((item) => `
    <div class="allocation-item">
      <div class="hero-list-item">
        <div>
          <strong>${item.name}</strong>
          <div class="meta-line">资产占比 ${item.weight}%</div>
        </div>
        <div class="positive">${item.pnl}</div>
      </div>
      <div class="allocation-bar"><span style="width:${item.weight}%"></span></div>
    </div>
  `).join("");
}

function mountTrade() {
  const form = document.querySelector("#tradeForm");
  const preview = document.querySelector("#tradePreview");
  const history = document.querySelector("#orderHistory");
  if (!form || !preview || !history) {
    return;
  }

  const renderPreview = () => {
    const formData = new FormData(form);
    const side = String(formData.get("side"));
    const symbol = String(formData.get("symbol"));
    const quantity = Number(formData.get("quantity") || 0);
    const price = Number(formData.get("price") || 0);
    const amount = quantity * price;
    const fee = amount * 0.00035;
    preview.innerHTML = `
      <strong>${side === "BUY" ? "买入" : "卖出"}预览</strong>
      <div class="meta-line">证券代码：${symbol || "-"}</div>
      <div class="meta-line">委托数量：${quantity || 0} 股</div>
      <div class="meta-line">委托价格：¥${price.toFixed(2)}</div>
      <div class="meta-line">预计成交额：¥${amount.toFixed(2)}</div>
      <div class="meta-line">预估费用：¥${fee.toFixed(2)}</div>
    `;
  };

  const renderHistory = () => {
    const items = JSON.parse(localStorage.getItem("finance-demo-orders") || "[]");
    history.innerHTML = items.length
      ? items.map((item) => `
          <div class="timeline-item">
            <div>
              <strong>${item.side === "BUY" ? "买入" : "卖出"} ${item.symbol}</strong>
              <div class="meta-line">${item.quantity} 股 @ ¥${item.price.toFixed(2)}</div>
            </div>
            <div class="meta-line">${new Date(item.createdAt).toLocaleString("zh-CN", { hour12: false })}</div>
          </div>
        `).join("")
      : `<div class="empty-state">还没有委托记录，提交一笔演示订单即可看到回执。</div>`;
  };

  form.addEventListener("input", renderPreview);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const items = JSON.parse(localStorage.getItem("finance-demo-orders") || "[]");
    items.unshift({
      side: String(formData.get("side")),
      symbol: String(formData.get("symbol")),
      quantity: Number(formData.get("quantity") || 0),
      price: Number(formData.get("price") || 0),
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("finance-demo-orders", JSON.stringify(items.slice(0, 6)));
    renderPreview();
    renderHistory();
  });

  renderPreview();
  renderHistory();
}

function mountTransfer() {
  const form = document.querySelector("#transferForm");
  const receipt = document.querySelector("#transferReceipt");
  if (!form || !receipt) {
    return;
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    receipt.innerHTML = `
      <strong>划转已登记</strong>
      <div class="meta-line">转出账户：${formData.get("from")}</div>
      <div class="meta-line">转入账户：${formData.get("to")}</div>
      <div class="meta-line">金额：¥${Number(formData.get("amount") || 0).toLocaleString("zh-CN")}</div>
      <div class="meta-line">用途：${formData.get("remark") || "资金调拨"}</div>
      <div class="meta-line">流水号：TR-${Date.now()}</div>
    `;
  });
}

function mountStatements() {
  const statementList = document.querySelector("#statementList");
  const flowList = document.querySelector("#flowList");
  if (!statementList || !flowList) {
    return;
  }
  statementList.innerHTML = STATEMENTS.map((item) => `
    <div class="statement-item">
      <div>
        <strong>${item.title}</strong>
        <div class="meta-line">${item.month} · ${item.status}</div>
      </div>
      <div>
        <strong>${item.amount}</strong>
        <div class="meta-line ${item.delta.startsWith("-") ? "negative" : "positive"}">${item.delta}</div>
      </div>
    </div>
  `).join("");
  flowList.innerHTML = FLOWS.map((item) => `
    <div class="timeline-item">
      <div>
        <strong>${item.desc}</strong>
        <div class="meta-line">${item.time}</div>
      </div>
      <div class="${item.state}">${item.amount}</div>
    </div>
  `).join("");
}

guardProtectedPage();
bindRoutes();
hydrateSession();
mountLogin();
mountQuotes();
mountPortfolio();
mountTrade();
mountTransfer();
mountStatements();
