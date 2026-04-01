# Seel AI Support — Onboarding PRD

**Version**: 2.0  
**Last Updated**: 2026-04-01  
**Status**: Draft for Review

---

## 1. Overview

Seel AI Support 的 Onboarding 流程旨在引导商家完成 AI Rep 的首次配置并投入使用。整个流程不采用独立的 Wizard 页面，而是通过 **Setup Progress 面板** 将用户引导至产品内已有的功能模块（Settings、Playbook）完成各步骤。

**核心原则**：
- 降低用户的感知操作成本，所有配置在产品内原生模块完成
- Setup Progress 是唯一的 Onboarding 入口和状态追踪面板
- 每个步骤完成后自动回到 Setup Progress，用户始终知道自己在哪里

---

## 2. Setup Progress 面板

### 2.1 展示位置

- 位于 Agents Tab → Team Lead 视图的主内容区
- **当 Setup 未全部完成时，Setup Progress 是该区域的唯一内容**，不展示 Daily Digest、Rule Proposals 等功能模块

### 2.2 步骤定义

| 步骤 | 名称 | 完成条件 | 跳转目标 | 前置依赖 |
|------|------|----------|----------|----------|
| 1 | Connect Ticketing System | Zendesk 三个子步骤全部完成 | Settings → Ticketing System | 无 |
| 2 | Import Policies | 至少一个文档上传并成功提取规则 | Playbook → Documents Tab | 无 |
| 3 | Configure Agent | Rep Name 已填写 + Personality 已选择 + 点击 Hire Rep | Settings → Configure Agent | 无 |
| 4 | Send Rep to Work | 用户将 Agent 状态从 Off 切换为 Training 或 Production | 引导至 Rep Header 的 Go Live 下拉 | 步骤 1、2、3 全部完成 |

### 2.3 步骤状态

- **Pending**：未开始，可点击跳转
- **Complete**：已完成，显示绿色勾
- **Locked**：前置依赖未满足（仅 Step 4），灰色不可点击，显示提示文字

### 2.4 步骤之间的独立性

- 步骤 1、2、3 之间**无强制顺序**，用户可以按任意顺序完成
- 步骤 4 是唯一有前置依赖的步骤
- 每个步骤的完成状态独立追踪

### 2.5 Setup 完成后

- Setup Progress 面板消失
- Team Lead 视图切换为正常的 Daily Digest + Rule Proposals + Escalation Feed 等功能模块
- Setup 完成的判定条件：**4 个步骤全部 Complete**

---

## 3. Step 1: Connect Ticketing System

### 3.1 入口

- Setup Progress 点击 "Connect Ticketing System" → 打开 Settings Overlay → 自动切换到 Ticketing System tab

### 3.1.1 Settings 布局

- Settings 采用**两 tab 布局**：Ticketing System | Agent Config
- 从 Setup Progress 进入时自动切换到对应 tab

### 3.2 配置内容

在 Settings 中以上下结构展示 3 个子步骤：

| 子步骤 | 操作 | 完成标志 |
|--------|------|----------|
| Authorize API | 输入 Zendesk subdomain，点击 Connect | OAuth 授权成功 |
| Bind Agent Seat | 从下拉列表选择 Agent Seat，点击 Bind | Seat 绑定成功 |
| Verify Connection | 用户在 Zendesk 侧 assign 一个 test ticket 给 AI Agent，点击 Verify | 系统确认收到 ticket |

### 3.3 Progressive Disclosure（Settings 模式）

- 子步骤 2 在子步骤 1 未完成时**不展示**
- 子步骤 3 在子步骤 2 未完成时**不展示**
- 已完成的子步骤折叠为一行摘要，可展开修改

### 3.4 命名

- 模块名称为 "Ticketing System"，上方提示 "Currently supports Zendesk integration"
- 统一的 "View Setup Guide" 外部链接放在模块顶部

### 3.5 完成后行为

- Settings 中该区块显示 "Connected" 状态
- 自动回到 Setup Progress（如果是从 Setup Progress 进入的）

---

## 4. Step 2: Import Policies

### 4.1 入口

- Setup Progress 点击 "Import Policies" → 切换到 Playbook Tab → Documents 子 Tab

### 4.2 Documents Tab 空状态

当没有任何文档时，展示引导式空状态：

- 标题："Upload your SOP documents"
- 描述：简要说明系统会从文档中提取规则
- 操作区：
  - 拖拽上传区域
  - URL 导入输入框
  - **"Try with a sample document"** 按钮（与 Onboarding 中的体验一致）
- 支持格式提示：PDF, DOCX, TXT, CSV

### 4.3 首次提取成功

- 文档处理完成后，**自动跳转到 Rules tab** 查看提取出的规则
- 同时在 Team Lead 消息流中发送一条通知
- 通知形式类似 "New Rule" 提案卡片（复用 Topic 组件，type 为 `document-parse`）
- 内容包含：文档名称、提取出的规则数量、规则摘要列表
- 用户可以在 Team Lead 视图中 Accept / Reject 提取出的规则

### 4.3.1 Rules Tab 约束

- Rules Tab **不支持手动添加规则**（无 "Add Rule" 按钮）
- 规则只能通过文档提取或 Team Lead 审批产生

### 4.4 完成条件

- 至少一个文档状态变为 "Processed" 且提取出规则
- Step 2 标记为 Complete

### 4.5 后续管理

- 所有文档管理（上传新文档、删除、启用/禁用）都在 Playbook → Documents Tab 完成
- 不存在独立的 "Import Policies" 页面或 Settings 区块

---

## 5. Step 3: Configure Agent

### 5.1 入口

- Setup Progress 点击 "Configure Agent" → 打开 Settings Overlay → 自动切换到 Agent Config tab

### 5.2 首次配置 vs 后续编辑

| 场景 | Rep Name | Personality | 按钮文案 | 完成后行为 |
|------|----------|-------------|----------|----------|
| 首次（未 Hire） | 默认 "Ava"，可修改 | 默认 "Friendly"，可修改 | "Hire [Name]" | 关闭 Settings，回到 Agents 首页 |
| 后续编辑 | 已有值，可修改 | 已有值，可修改 | "Save Changes" | 保存并提示成功 |

### 5.3 配置项

以下配置项直接平铺展示，不使用外层折叠：

**Identity**
- Rep Name（文本输入）
- Personality（pill 选择器：Friendly / Professional / Casual / Customize）
  - 选中后下方展示描述 + 示例消息预览
  - Customize 选项展开自定义 tone 输入框
- Disclose AI Identity（Toggle：是否告知用户它是 AI）

**Action Permissions**
- Read Actions：按子分类分组（Tickets, Orders, Customers, Products, Insurance, Returns），默认全部开启
- Read & Write Actions：按子分类分组（Tickets, Orders, Insurance, Returns），每个权限项显示名称 + Toggle，描述在 hover tooltip 中

**Channels & Escalation**
- 按 Channel 分组（Email, Live Chat, SMS）
- Email Channel：
  - 启用 Toggle
  - Sending Sign-off（落款文本框）
  - Escalation Handoff（Assign to Group / Assign to Person / Add Tag，并列展示）
- Live Chat / SMS：标记 "Coming soon"

### 5.4 多 Agent 扩展性

- Configure Agent 区块顶部显示 Agent 列表（pill 导航）
- "Add Agent" 入口（MVP 阶段显示 "Coming soon" toast）
- 每个 Agent 的配置独立

---

## 6. Step 4: Send Rep to Work

### 6.1 前置条件

- 步骤 1、2、3 全部 Complete
- 如果任一步骤未完成，Step 4 显示为 Locked 状态，附带提示："Complete all previous steps first"

### 6.2 交互

- 点击 "Send Rep to Work" → 切换到 Rep 视图
- 在 Rep Header 的 Go Live 下拉处显示**新手引导**（首次触发）
  - 引导内容：高亮 Go Live 下拉，提示用户选择 Training 或 Production 模式
  - 引导样式：tooltip / spotlight 指引
- 用户选择 Training 或 Production 后，Step 4 标记为 Complete

### 6.3 Go Live 模式说明

| 模式 | 行为 | 前提 |
|------|------|------|
| Production | 直接回复客户 | Zendesk 已连接 |
| Training | 仅写入 Internal Notes | Zendesk 已连接 |
| Off | Agent 不活跃 | 无 |

- Training 和 Production 都需要 Zendesk 连接（Training 需要写 Internal Notes）
- 未连接 Zendesk 时，Production 和 Training 选项禁用并显示提示

---

## 7. 状态流转总结

```
用户首次进入 Agents Tab
  └─ Team Lead 视图
       └─ 显示 Setup Progress（4 步骤）
            ├─ 点击 Step 1 → Settings > Ticketing System → 完成后回到 Setup Progress
            ├─ 点击 Step 2 → Playbook > Documents → 上传文档 → 提取成功 → Team Lead 收到通知
            ├─ 点击 Step 3 → Settings > Configure Agent → Hire Rep → 回到 Agents 首页
            └─ 点击 Step 4（需 1-3 全完成）→ 切换到 Rep 视图 → 新手引导 → 选择模式
                 └─ 全部完成 → Setup Progress 消失 → 正常 Team Lead 视图
```

---

## 8. 需要讨论的问题

### 8.1 Step 2 完成条件的边界情况

> 如果用户上传了文档但提取失败（status = "Error"），Step 2 是否算完成？

**建议**：不算完成。必须至少有一个 "Processed" 状态的文档。需要在 Documents Tab 中给出明确的错误提示和重试引导。

### 8.2 Step 4 新手引导的触发条件

> 新手引导是否只在第一次触发？如果用户关闭了引导但没有切换模式，下次进入是否再次触发？

**建议**：引导在 Step 4 首次点击时触发，用户关闭引导后不再重复。如果用户没有切换模式就离开，Step 4 保持 Pending，下次点击仍然跳转到 Rep 视图但不再显示引导。

### 8.3 Setup Progress 消失后的重新访问

> 用户完成 Setup 后，如果想重新查看 Setup 状态或重新配置，入口在哪里？

**建议**：所有配置项都在 Settings 中可编辑。Setup Progress 本身不需要重新展示，因为它的作用是一次性引导。

### 8.4 多 Agent 场景下的 Setup Progress

> 当用户添加第二个 Agent 时，是否需要新的 Setup Progress？

**建议**：第二个 Agent 不需要重复 Step 1（Ticketing System 是全局的）和 Step 2（Policies 是共享的）。只需要 Configure Agent + Send Rep to Work。这个逻辑需要在多 Agent 功能实现时进一步定义。**标记为 Future**。

### 8.5 Import Policies 与 Playbook 的数据一致性

> 首次提取的规则是自动添加到 Playbook Rules 中，还是需要用户在 Team Lead 消息流中逐条 Accept？

**建议**：提取的规则以 Topic（type = `document-parse`）形式出现在 Team Lead 消息流中，用户 Accept 后才添加到 Playbook Rules。这样保持了 Team Lead 的审核权。

---

## 9. MVP vs Future

| 功能 | MVP | Future |
|------|-----|--------|
| Setup Progress 4 步骤 | Yes | — |
| Ticketing System (Zendesk) | Yes | 支持更多 Ticketing 系统 |
| Documents 空状态 + Try Sample | Yes | — |
| 首次提取 → Team Lead 通知 | Yes | — |
| Configure Agent (单 Agent) | Yes | — |
| Hire Rep 首次流程 | Yes | — |
| Send Rep to Work + 新手引导 | Yes | — |
| 多 Agent 管理 | 入口占位 | 完整实现 |
| Step 4 新手引导 (Spotlight) | 简化版 tooltip | 完整 guided tour |
| Playbook URL 导入 | 入口占位 | 爬虫实现 |

---

## 10. 附录：UI 中不再存在的元素

以下元素在本次重构中移除：

- **Setup / Normal 模式切换 Toggle**：不再需要，Setup Progress 和 Normal 视图根据完成状态自动切换
- **独立的 Setup Wizard 页面**：所有配置在 Settings 和 Playbook 中完成
- **Import Policies 在 Settings 中的区块**：Import 完全由 Playbook → Documents 承载
- **Go Live Mode 在 Settings 表单中的配置项**：Go Live 作为全局状态在 Rep Header 中控制
- **Skip for now 按钮**：不再有 Wizard 流程，无需 Skip
