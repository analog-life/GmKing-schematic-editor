import { applySchematicMessage, message, schematicLanguage } from "../schematicI18n";
import type { UiBuilder } from "../schematicUiElements";
import { createAgentPrompt } from "./agentPrompt";
import { AgentSession, type AgentContext, type AgentStatus } from "./agentSession";
import type { AgentTransaction } from "./agentTransaction";

const STATUS = {
  off: message("agent.manual", "Manual editing"),
  waiting: message("agent.waiting", "Waiting for AI pairing"),
  connected: message("agent.connected", "AI connected"),
  paused: message("agent.suspended", "Connection suspended"),
  offline: message("agent.offline", "Local connector offline")
};

export function buildAgentDialog<T extends object>(ui: UiBuilder<T>, namespace: string) {
  const { el } = ui;
  const id = `${namespace}-agent`;
  return el("dialog", {
    id, class: "schematic-dialog schematic-agent-dialog", "aria-labelledby": `${id}-title`,
    "data-schematic-agent-dialog": true
  },
    el("h2", { id: `${id}-title` }, message("agent.title", "AI Agent")),
    el("div", { class: "schematic-agent-actions" },
      el("button", { type: "button", "data-agent-connect": true }, message("agent.connect", "Hand off to AI")),
      el("button", { type: "button", "data-agent-copy": true, hidden: true }, message("agent.copy", "Copy text")),
      el("button", { type: "button", "data-agent-suspend": true, hidden: true }, message("agent.suspend", "Suspend")),
      el("button", { type: "button", "data-agent-disconnect": true, hidden: true }, message("agent.disconnect", "Disconnect"))
    ),
    el("p", {}, message("agent.local",
      "Start the local connector with npm run agent:connector, then copy the pairing prompt to your AI. The code expires after two minutes. A paired session lasts up to two hours.")),
    el("div", { class: "schematic-agent-status-divider", role: "separator" }),
    el("p", { "data-agent-state": true, role: "status" }),
    el("textarea", {
      "data-agent-prompt": true, readonly: true, hidden: true, spellcheck: "false",
      "aria-label": message("agent.prompt", "Text for AI Agent")
    }),
    el("div", { class: "schematic-agent-footer" },
      el("output", { "data-agent-feedback": true, role: "status" }),
      el("button", { type: "button", "data-agent-close": true }, message("options.close", "Close"))
    )
  );
}

export function buildAgentBanner<T extends object>({ el }: UiBuilder<T>) {
  return el("div", { class: "schematic-agent-banner", "data-agent-banner": true, hidden: true },
    el("span", { "data-agent-banner-state": true, role: "status" }),
    el("button", { type: "button", "data-agent-banner-suspend": true }, message("agent.suspend", "Suspend")),
    el("button", { type: "button", "data-agent-banner-disconnect": true }, message("agent.disconnect", "Disconnect")),
    el("button", { type: "button", "data-agent-reclaim": true }, message("agent.reclaim", "Reclaim editing"))
  );
}

export function bindAgentDialog(root: HTMLElement, host: {
  context(): AgentContext | undefined;
  busy(): boolean;
  snapshot(): object;
  transact(transaction: AgentTransaction): object;
}) {
  const view = root.ownerDocument.defaultView;
  const dialog = root.querySelector<HTMLDialogElement>("[data-schematic-agent-dialog]");
  const trigger = root.querySelector<HTMLButtonElement>("[data-schematic-open-agent]");
  if (!view || !dialog || !trigger) return () => {};
  const controller = new view.AbortController();
  const { signal } = controller;
  const connect = dialog.querySelector<HTMLButtonElement>("[data-agent-connect]")!;
  const copy = dialog.querySelector<HTMLButtonElement>("[data-agent-copy]")!;
  const suspend = dialog.querySelector<HTMLButtonElement>("[data-agent-suspend]")!;
  const disconnect = dialog.querySelector<HTMLButtonElement>("[data-agent-disconnect]")!;
  const prompt = dialog.querySelector<HTMLTextAreaElement>("[data-agent-prompt]")!;
  const feedback = dialog.querySelector<HTMLOutputElement>("[data-agent-feedback]")!;
  const notice = dialog.querySelector<HTMLElement>("[data-agent-state]")!;
  const banner = root.querySelector<HTMLElement>("[data-agent-banner]")!;
  const bannerNotice = banner.querySelector<HTMLElement>("[data-agent-banner-state]")!;
  const bannerSuspend = banner.querySelector<HTMLButtonElement>("[data-agent-banner-suspend]")!;
  const pointers = new Set<number>();
  const session = new AgentSession(view, {
    ...host,
    busy: () => pointers.size > 0 || host.busy() ||
      !!root.querySelector("dialog[open]:not([data-schematic-agent-dialog])"),
    render: () => render()
  });

  const render = () => {
    const context = host.context();
    const status: AgentStatus = session.status;
    const active = status !== "off";
    connect.hidden = active;
    connect.disabled = !context || !view.isSecureContext;
    copy.hidden = suspend.hidden = disconnect.hidden = !active;
    copy.disabled = !session.pairingCode || status === "paused";
    const pauseMessage = status === "paused" ? message("agent.resume", "Resume") : message("agent.suspend", "Suspend");
    applySchematicMessage(suspend, pauseMessage);
    applySchematicMessage(bannerSuspend, pauseMessage);
    applySchematicMessage(notice, view.isSecureContext
      ? message("agent.currentStatus", "Current status: {status}", { status: STATUS[status] })
      : message("agent.secureContext", "Open the editor over HTTPS or localhost to connect."));
    applySchematicMessage(bannerNotice, STATUS[status]);
    banner.hidden = !active;
    banner.dataset.agentStatus = status;
    prompt.hidden = copy.disabled || !context;
    const code = session.pairingCode;
    if (prompt.value && (prompt.hidden || !prompt.value.includes(code))) clearFeedback();
    prompt.value = prompt.hidden || !context ? "" : createAgentPrompt({
      site: `${view.location.origin}${view.location.pathname}`, projectId: context.projectId,
      sheetId: context.sheetId, code
    }, schematicLanguage());
  };

  const clearFeedback = () => {
    feedback.textContent = "";
    delete feedback.dataset.schematicMessage;
  };
  root.addEventListener("pointerdown", event => {
    if (!(event.target as Element | null)?.closest("[data-schematic-agent-dialog], [data-agent-banner], [data-schematic-open-agent]")) {
      pointers.add(event.pointerId);
    }
  }, { capture: true, signal });
  for (const type of ["pointerup", "pointercancel"] as const) {
    view.addEventListener(type, event => pointers.delete(event.pointerId), { capture: true, signal });
  }
  view.addEventListener("blur", () => pointers.clear(), { signal });
  trigger.addEventListener("click", () => {
    if (dialog.open) return;
    render();
    dialog.showModal();
  }, { signal });
  connect.addEventListener("click", () => {
    session.begin();
    copy.focus();
  }, { signal });
  suspend.addEventListener("click", () => session.togglePause(), { signal });
  bannerSuspend.addEventListener("click", () => session.togglePause(), { signal });
  disconnect.addEventListener("click", () => {
    session.disconnect();
    connect.focus();
  }, { signal });
  for (const selector of ["[data-agent-banner-disconnect]", "[data-agent-reclaim]"]) {
    banner.querySelector(selector)?.addEventListener("click", () => {
      session.disconnect();
      trigger.focus();
    }, { signal });
  }
  copy.addEventListener("click", async () => {
    const text = prompt.value;
    if (!text) return;
    try {
      await view.navigator.clipboard.writeText(text);
      if (dialog.open && text === prompt.value) {
        applySchematicMessage(feedback, message("agent.copied", "Text copied."));
      }
    } catch {
      if (!dialog.open || text !== prompt.value) return;
      prompt.focus();
      prompt.select();
      applySchematicMessage(feedback, message("agent.copyUnavailable", "Use your device’s copy command to copy the selected text."));
    }
  }, { signal });
  dialog.querySelector("[data-agent-close]")?.addEventListener("click", () => dialog.close(), { signal });
  dialog.addEventListener("close", () => {
    if (dialog.open) return;
    prompt.value = "";
    clearFeedback();
  }, { signal });
  return () => {
    controller.abort();
    session.disconnect();
    prompt.value = "";
    if (dialog.open) dialog.close();
  };
}
