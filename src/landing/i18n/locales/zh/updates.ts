import type { UpdatesContent } from "@/landing/i18n/types";

export const zhUpdates: UpdatesContent = {
  header: {
    eyebrow: "更新",
    title: "每个版本的全部变化。",
    description:
      "EliasNote 的公开更新记录：从首个测试版到演示模式，每个功能、修复和基础设施里程碑都在这里。",
  },
  current: "当前版本",
  allReleases: "在 GitHub 查看全部",
  releaseLink: "打开发布页",
  changesLabel: "更新内容",
  kindLabels: {
    initial: "首个测试版",
    feature: "新功能",
    fix: "修复",
    infra: "基础设施",
  },
  releases: {
    "0.5.0": {
      title: "演示模式",
      summary: "隐藏应用界面展示画板，并浏览工作区。",
      changes: [
        "只读模式，隐藏侧边栏、顶栏、检查器和控件",
        "自动适应画板，并可用方向键、PageUp/PageDown 或按钮导航",
        "退出时恢复标签页、活动标签和视图位置；标签筛选保持不变",
      ],
    },
    "0.4.0": {
      title: "可编辑标签与标签筛选",
      summary: "用标签整理元素，专注于重要内容。",
      changes: [
        "标签编辑器支持标签块、画板建议和去重",
        "画布标签筛选保留上下文列",
        "连接线、迷你地图和选择都遵循当前筛选",
      ],
    },
    "0.3.0": {
      title: "全局任务面板",
      summary: "在一个视图中查看所有画板的截止日期和优先级。",
      changes: [
        "汇总所有工作区的任务并显示画板路径",
        "按逾期、今天、未来 7 天、以后和无截止日期分组",
        "可在列表中完成或打开任务；快捷键 Ctrl/Cmd+Shift+P",
      ],
    },
    "0.2.6": {
      title: "箭头居中与元素上平移",
      summary: "更精确的连接线和更流畅的画布导航。",
      changes: [
        "连接的箭头指向元素中心",
        "即使位于元素上，也可用空格或中键平移",
        "连接线释放到目标时有 12 px 容差",
      ],
    },
    "0.2.5": {
      title: "更稳健的发布流程",
      summary: "发布流程现在会遵守 GitHub API 速率限制。",
      changes: [
        "带请求节流的 workflow 跟踪",
        "修正发布流程和附件处理",
        "数据格式没有变化",
      ],
    },
    "0.2.4": {
      title: "自由文本与格式",
      summary: "直接在画布上书写并控制排版。",
      changes: [
        "粗体、斜体、下划线、删除线和颜色",
        "每个元素的字号、字体和对齐方式",
        "浮动工具栏、检查器和格式快捷键",
      ],
    },
    "0.2.3": {
      title: "一个命令完成发布",
      summary: "检查、版本、标签、推送和站点一次完成。",
      changes: [
        "单一发布脚本，包含 typecheck、测试和构建",
        "同步清单和 Cargo.lock 中的版本",
        "跟踪 workflow 直到安装包完成",
      ],
    },
    "0.2.2": {
      title: "代码、游戏模板与发布",
      summary: "为游戏开发者提供更多工具和发布流程。",
      changes: [
        "代码节点支持 GDScript、C#、shader、JSON 等语法高亮",
        "GDD、关卡设计、系统和游戏 Sprint 模板",
        "首个发布流程和项目资源",
      ],
    },
    "0.2.1": {
      title: "可调整检查器与更新提示",
      summary: "更多编辑空间，并在有新版本时显示提示。",
      changes: [
        "可调整大小并记住宽度的检查器",
        "检查 GitHub 上的最新版本",
        "有新版本时在顶栏显示更新按钮",
      ],
    },
    "0.2.0": {
      title: "首个公开测试版",
      summary: "本地优先、离线且集成 Excalidraw 的画布正式发布。",
      changes: [
        "无限画布、嵌套画板与可编辑 Excalidraw",
        "笔记、任务、清单、列、连接线、搜索和引用",
        "SQLite/IndexedDB 自动保存、备份和 Obsidian 仓库导入",
      ],
    },
  },
};
