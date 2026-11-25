import { SCHEMATIC_UI_ZH } from "./schematicUiZh";
import { COMPONENT_NAMES_ZH, PARAMETER_LABELS_ZH } from "./schematicLabelsZh";

export type SchematicLanguage = "zh" | "en";

const ZH: Record<string, string> = {
  "note.place": "放置注释",
  "note.text": "文本",
  "note.fontSize": "字号",
  "note.anchor": "定位点",
  "note.anchor.upperLeft": "左上",
  "note.anchor.centerLeft": "左中",
  "note.anchor.lowerLeft": "左下",
  "note.anchor.upperCenter": "上中",
  "note.anchor.centerCenter": "正中",
  "note.anchor.lowerCenter": "下中",
  "note.anchor.upperRight": "右上",
  "note.anchor.centerRight": "右中",
  "note.anchor.lowerRight": "右下",
  "note.help": "Shift+Enter 换行。使用 \\(…\\) 输入行内 TeX，或使用 \\[…\\] 单独显示公式。",
  "agent.title": "AI 助手",
  "agent.connect": "交给 AI 修改",
  "agent.copy": "复制文本",
  "agent.suspend": "暂停连接",
  "agent.resume": "恢复连接",
  "agent.disconnect": "取消连接",
  "agent.suspended": "连接已暂停。",
  "agent.prompt": "给 AI Agent 的文本",
  "agent.local": "先运行 npm run agent:connector 启动本机连接器，再将配对提示词复制给 AI。配对码两分钟内有效，配对成功后会话最长持续两小时。",
  "agent.currentStatus": "当前状态：{status}",
  "agent.manual": "人工编辑",
  "agent.waiting": "等待 AI 配对",
  "agent.connected": "AI 已连接",
  "agent.offline": "本机连接器离线",
  "agent.reclaim": "收回编辑权",
  "agent.secureContext": "请通过 HTTPS 或 localhost 打开编辑器以使用连接器。",
  "log.source.agent": "AI 助手",
  "agent.copied": "已复制文本。",
  "agent.copyUnavailable": "请使用设备的复制命令，复制已选中的文本。",
  "toolbar.pinShortcut": "端口（P）",
  "toolbar.pin": "端口",
  "right.hierarchy": "层级",
  "hierarchy.projectJson": "项目 JSON",
  "hierarchy.cycle": "放置此子图会造成循环引用",
  "hierarchy.newSheet": "新建子图",
  "hierarchy.renameSheet": "重命名子图",
  "hierarchy.deleteSheet": "删除子图",
  "hierarchy.sheetName": "子图名称",
  "hierarchy.path": "子图路径",
  "hierarchy.currentPath": "当前层次：",
  "hierarchy.returnTop": "返回顶层",
  "hierarchy.returnParent": "返回上一层",
  "hierarchy.search": "搜索子图和实例",
  "hierarchy.enter": "进入",
  "hierarchy.place": "放置",
  "hierarchy.setTop": "设为 Top",
  "hierarchy.placePin": "放置端口",
  "hierarchy.deletePin": "删除端口",
  "hierarchy.showCallers": "查看引用",
  "hierarchy.includeCells": "包含的子图",
  "hierarchy.pinList": "端口列表",
  "hierarchy.pickChild": "请点选要进入的子图实例。按 Esc 取消。",
  "hierarchy.pickCanceled": "已取消点选子图。",
  "hierarchy.globalNets": "全局网络",
  "hierarchy.globalNetField": "网络名称（以逗号分隔）",
  "hierarchy.copyUnsupported": "请通过层次库放置子图实例，或通过端口工具创建端口。",
  "hierarchy.requiresProject": "请导入项目 JSON 以打开引用了子图的原理图。",
  "hierarchy.pinName": "端口名称",
  "hierarchy.pinType": "类型",
  "hierarchy.direction": "所在边",
  "hierarchy.supply": "电源",
  "hierarchy.ground": "接地",
  "hierarchy.input": "输入",
  "hierarchy.output": "输出",
  "hierarchy.inout": "双向",
  "hierarchy.passive": "无源",
  "hierarchy.left": "左",
  "hierarchy.right": "右",
  "hierarchy.top": "上",
  "hierarchy.bottom": "下",
  "hierarchy.confirm": "确认",
  "hierarchy.duplicateSheet": "已有同名子图。",
  "hierarchy.duplicatePin": "当前子图已有同名端口或重叠的总线位。",
  "hierarchy.portNameFormat": "请输入 OUT、OUT<3> 或 OUT<7:0> 这类端口名。总线最多 256 位。",
  "hierarchy.identifier": "请输入以字母或下划线开头的标量名称，最多 64 个字符。",
  ...SCHEMATIC_UI_ZH,
  "options.title": "选项",
  "options.close": "关闭",
  "options.symbolTemplate": "符号模板",
  "options.templatePending": "{name}（未就绪）",
  "options.colorMode": "颜色模式",
  "options.system": "跟随系统",
  "options.light": "亮色",
  "options.dark": "暗色",
  "options.wireCrossings": "导线交叉",
  "options.wireAngle": "导线角度",
  "options.wireAngleOrthogonal": "正交",
  "options.wireAngle45": "45 度",
  "options.wireAngleFree": "自由",
  "netLabel.place": "放置网络标签",
  "netLabel.name": "网络名称",
  "options.crossingPlain": "直线交叉",
  "options.crossingHop": "跨线桥",
  "options.defaultTextFont": "默认文字字体",
  "options.english": "English",
  "textFont.label": "字体",
  "textFont.inherit": "文档默认",
  "textFont.sans": "无衬线",
  "textFont.serif": "衬线",
  "textFont.mono": "等宽",
  "parameter.componentCaption": "元件{label}",
  "parameter.deviceModel": "器件模型",
  "parameter.processDefaultModel": "工艺默认（{name}）",
  "parameter.pinVisibility": "显示 {pin} 引脚",
  "parameter.pinRole": "{pin} 引脚角色",
  "parameter.pinSymbol": "显示 {pin} 引脚角色符号",
  "library.template": "模板",
  "browser.close": "关闭器件浏览器",
  "netlist.notReady": "网表尚未生成。",
  "netlist.waiting": "等待原理图。",
  "netlist.generatedErrors": "已生成 · {count} 个错误",
  "netlist.readyWarnings": "就绪 · {count} 个警告",
  "netlist.readyInstances": "就绪 · {count} 个实例",
  "netlist.diagnosticCounts": "诊断 · {errors} 个错误 · {warnings} 个警告",
  "netlist.noDiagnostics": "诊断 · 无",
  "analysis.computeLabel": "计算 H(s)、ZIN(s)、Zout(s)",
  "analysis.computing": "计算中…",
  "analysis.noDiagnostics": "无网表诊断信息。",
  "analysis.selectNet": "选择网络",
  "analysis.solving": "正在求解符号 MNA 方程…",
  "document.closeTab": "关闭 {name}",
  "document.renameTab": "重命名 {name}",
  "layer.numbered": "图层 {number}",
  "note.region": "原理图注释",
  "note.item": "注释",
  "note.edit": "编辑注释",
  "note.editSource": "编辑注释源码",
  "note.markdown": "Markdown 注释",
  "note.resize": "调整注释宽度",
  "note.emptyFormula": "空公式",
  "note.editBlockFormula": "编辑独立公式",
  "note.editInlineFormula": "编辑行内公式",
  "note.taskStatus": "任务状态",
  "layer.toggleObjects": "展开或收起 {name} 中的对象",
  "layer.togglePins": "展开或收起 {name} 的引脚",
  "layer.visible": "可见",
  "layer.locked": "锁定",
  "layer.raise": "上移图层",
  "layer.lower": "下移图层",
  "layer.hideObject": "隐藏 {name}",
  "layer.showObject": "显示 {name}",
  "layer.raiseObject": "上移 {name}",
  "layer.lowerObject": "下移 {name}",
  "layer.hiddenHint": "图层已隐藏",
  "layer.lockedHint": "图层已锁定",
  "layer.objectHidden": "对象已隐藏",
  "layer.pinFixed": "引脚可见性固定",
  "layer.pinOrder": "引脚无法调整层序",
  "layer.object.wire": "导线 {name}",
  "layer.object.junction": "连接点 {name}",
  "layer.object.pin": "引脚 {name}",
  "layer.object.label": "标签 {name}",
  "layer.object.note": "注释 {name}",
  "layer.object.coupling": "电感耦合 {name}",
  "color.default": "使用黑色（默认）{target}颜色",
  "color.set": "设置{target}颜色：{color}",
  "color.noteText": "设置注释文字颜色：{color}",
  "color.noteFill": "设置注释填充：{color}",
  "color.custom.network": "自定义导线或连接点颜色",
  "color.custom.component": "自定义符号颜色",
  "color.custom.coupling": "自定义耦合颜色",
  "menu.clipboard": "原理图剪贴板菜单",
  "menu.selection": "原理图选区菜单",
  "menu.paste": "粘贴原理图",
  "menu.svg": "复制为 SVG",
  "menu.png": "复制为 PNG",
  "menu.netlist": "复制为网表",
  "menu.json": "复制为 JSON",
  "log.source.status": "状态",
  "log.source.command": "命令",
  "log.source.import": "导入",
  "toolbar.help": "帮助（在新标签页打开）",
  "toolbar.instance": "元件",
  "toolbar.wire": "导线",
  "toolbar.label": "网络标签",
  "toolbar.note": "注释",
  "toolbar.rotate": "旋转",
  "toolbar.mirror-x": "沿 X 轴镜像",
  "toolbar.mirror-y": "沿 Y 轴镜像",
  "toolbar.delete": "删除",
  "toolbar.temp-delete": "暂时删除",
  "toolbar.presentation": "演示模式",
  "toolbar.fit": "适应画布",
  "toolbar.reset": "重置",
  "toolbar.undo": "撤销",
  "toolbar.redo": "重做",
  "toolbar.log": "日志",
  "sidebar.shortcut": "按 i 打开元件浏览器，按 Esc 取消",
  "properties.title": "属性编辑器",
  "properties.empty": "尚未选择对象。",
  "document.new": "新建原理图",
  "document.import": "导入原理图",
  "document.paste": "从剪贴板粘贴电路 JSON 到新标签页",
  "export.title": "导出电路图",
  "export.includeHidden": "在图像中包含隐藏对象",
  "export.json": "电路 JSON",
  "export.cancel": "取消",
  "layer.field": "图层",
  "layer.stackHint": "上方图层绘制在下方图层之上。",
  "layer.add": "+ 图层",
  "layer.mixed": "多个图层",
  "layer.hiddenSuffix": "（隐藏）",
  "layer.lockedSuffix": "（锁定）",
  "sidebar.library": "器件库",
  "sidebar.properties": "属性",
  "sidebar.layers": "图层",
  "sidebar.libraryLabel": "库",
  "sidebar.cells": "器件",
  "sidebar.all": "全部",
  "sidebar.empty": "该库中没有器件。",
  "browser.title": "添加器件",
  "browser.library": "库",
  "browser.cell": "器件",
  "browser.symbol": "符号",
  "browser.searchLibrary": "搜索库",
  "browser.searchCell": "搜索器件",
  "browser.empty": "没有匹配的器件",
  "browser.place": "放置",
  "browser.templateComponent": "模板器件",
  "browser.hint": "Enter 放置 · Esc 关闭",
  "browser.template": "模板",
  "browser.count": "{count} 个器件",
  "browser.countOne": "1 个器件",
  "right.analysis": "分析",
  "right.netlist": "网表",
  "right.diagnostics": "诊断",
  "right.analysisTitle": "符号分析",
  "right.netlistPlaceholder": "网表视图将在 R2 提供。",
  "right.diagnosticsPlaceholder": "诊断视图将在 R2 提供。",
  "log.title": "日志",
  "log.empty": "暂无记录。",
  "log.clear": "清空",
  "log.copy": "复制",
  "log.filter": "过滤",
  "log.search": "搜索日志",
  "log.all": "全部",
  "log.info": "信息",
  "log.warn": "警告",
  "log.error": "错误",
  "status.log": "日志",
  "toolbar.library": "器件库",
  "toolbar.analysis": "分析",
  "toolbar.netlist": "网表",
  "library.all": "全部",
  "library.sources": "源",
  "library.passives": "无源",
  "library.transistors": "晶体管",
  "library.amplifiers": "放大器",
  "library.digital": "数字",
  "library.blocks": "功能块",
  "library.shapes": "图形",
  "library.openShape": "开放图形",
  "library.closedShape": "闭合图形",
  "circle.dragTop": "从上方调整尺寸",
  "circle.dragRight": "从右侧调整尺寸",
  "circle.dragBottom": "从下方调整尺寸",
  "circle.dragLeft": "从左侧调整尺寸",
  "polygon.finish": "完成多边形",
  "arc.dragStart": "拖动起点",
  "arc.dragEnd": "拖动终点",
  "arc.dragThrough": "拖动弧上点",
  "polyline.finish": "完成折线",
  "polyline.vertex": "拖动顶点",
  "polyline.startArrow": "起点箭头",
  "polyline.endArrow": "终点箭头",
  "polyline.startArrowSize": "起点箭头大小",
  "polyline.endArrowSize": "终点箭头大小",
  "polyline.arrow.none": "无",
  "polyline.arrow.filled": "实心三角",
  "polyline.arrow.asmeFilled": "实心 ASME 箭头",
  "polyline.arrow.open": "开放箭头",
  "polyline.arrow.stealth": "燕尾箭头",
  "polyline.arrow.diamond": "实心菱形",
  "polyline.arrowSize.small": "小",
  "polyline.arrowSize.medium": "中",
  "polyline.arrowSize.large": "大",
  "polyline.arrowSize.extraLarge": "特大",
  "shape.fillColor": "填充颜色",
  "shape.defaultFillColor": "白色（默认）",
  "shape.customFillColor": "自定义填充颜色",
  "library.templates": "模板"
};

/** Hosts that expose a language switch (for example the site) publish AT_LANG. */
export function schematicLanguage(): SchematicLanguage {
  const preference = globalThis.document?.documentElement?.dataset.schematicLanguage;
  if (preference === "en" || preference === "zh") return preference;
  const current = (globalThis as { AT_LANG?: { current?: () => unknown } }).AT_LANG?.current?.();
  return current === "zh" ? "zh" : "en";
}

export function t(key: string, fallback: string): string {
  if (schematicLanguage() !== "zh") return fallback;
  return ZH[key] ?? fallback;
}

export function uiFormat(key: string, fallback: string, values: Readonly<Record<string, string>>) {
  return messageText(message(key, fallback, values));
}

export function componentName(type: string, fallback: string, language = schematicLanguage()) {
  return language === "zh" && Object.hasOwn(COMPONENT_NAMES_ZH, type) ? COMPONENT_NAMES_ZH[type] : fallback;
}

/** Localizes fixed model captions without translating entered values or identifiers. */
export function parameterLabel(label: string): string {
  if (schematicLanguage() !== "zh") return label;
  const indexed = /^(Time|Voltage) (\d+)$/.exec(label);
  if (indexed) return `${indexed[1] === "Time" ? "时间" : "电压"} ${indexed[2]}`;
  return Object.hasOwn(PARAMETER_LABELS_ZH, label) ? PARAMETER_LABELS_ZH[label] : label;
}

export interface SchematicMessage {
  readonly type: "schematic-message";
  readonly key: string;
  readonly fallback: string;
  readonly values?: Readonly<Record<string, string | SchematicMessage>>;
  readonly suffix?: string;
}

export function message(key: string, fallback: string, values?: SchematicMessage["values"]): SchematicMessage {
  return { type: "schematic-message", key, fallback, values };
}

export function messageText(value: SchematicMessage): string {
  const text = value.key.startsWith("parameterCaption.") ? parameterLabel(value.fallback) : t(value.key, value.fallback);
  return text.replace(/\{(\w+)\}/g, (token, key) => {
    const parameter = value.values?.[key];
    return typeof parameter === "object" ? messageText(parameter) : parameter ?? token;
  }) + (value.suffix ?? "");
}

export function parameterMessage(caption: string): SchematicMessage {
  return message(`parameterCaption.${caption}`, caption);
}

export function refreshSchematicMessages(root: HTMLElement) {
  for (const element of root.querySelectorAll<HTMLElement>("[data-schematic-message]")) {
    element.textContent = messageText(JSON.parse(element.dataset.schematicMessage!));
  }
  for (const attr of ["aria-label", "title", "placeholder"]) {
    const metadata = `data-schematic-message-${attr}`;
    for (const element of root.querySelectorAll(`[${metadata}]`)) {
      element.setAttribute(attr, messageText(JSON.parse(element.getAttribute(metadata)!)));
    }
  }
}

export function applySchematicMessage(element: HTMLElement, value: SchematicMessage, attr?: "aria-label" | "title" | "placeholder") {
  const text = messageText(value);
  if (attr) element.setAttribute(attr, text);
  else element.textContent = text;
  element.setAttribute(attr ? `data-schematic-message-${attr}` : "data-schematic-message", JSON.stringify(value));
}
