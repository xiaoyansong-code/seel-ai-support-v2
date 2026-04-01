# Round 4 Feedback — Implementation Todo

## Issues from User Feedback

- [ ] **1. Playbook 配置入口统一**: Settings 模式下 Step 2 (Import Policies) 应显示已导入摘要 + 链接到 Playbook 页面。后续 import 主入口在 Playbook → Documents。
- [ ] **2a. Skip 后阻止使用 Rep**: Normal 模式下，如果 Zendesk 未连接，应显示明确的 blocking 状态，不能正常使用 Rep。
- [ ] **2b. Skip 后 Go Live 限制**: Configure Agent 中，如果 Zendesk 未连接，Go Live Mode 的 Production 选项应被禁用并显示原因。
- [ ] **3a. Agent Seat 改为下拉列表**: Zendesk Sub-step 2 中选择 Agent Seat 用 Select 下拉，不是 radio buttons。
- [ ] **3b. Channel 和 Handoff 移到 Configure Agent**: Channel 配置和 Escalation Handoff 从 Zendesk Step 移到 Configure Agent Step (Step 3)。Zendesk Step 只保留 API 授权、Seat 绑定、Trigger 验证。
- [ ] **4. 多 Agent 扩展性**: 在 Normal 模式中体现多 Agent 架构（Agent 列表视图、"Add Agent" 入口等）。
- [ ] **5. Readiness Check (PRD Step 3-2)**: Hire Rep 后在 Rep 对话区域展示 3 个测试场景（WISMO/Seel Claim/Escalation），含 Looks good / Needs adjustment 反馈路径。
- [ ] **6. 上线模式选择 (PRD Step 3-3)**: Readiness Check 完成后的模式选择 + 角色引导消息。
- [ ] **7. Escalation Handoff 完善**: 
  - 支持 Assign to Group（下拉选组）
  - 支持 Assign to Seat（下拉选人）
  - Notify via Email 增加更多设置（通知模板、CC 列表等）
  - Add Tag 增加更多设置（自定义标签、自动优先级等）
- [ ] **10. Import 完成后入口**: Setup 完成后 Settings 中的 Import 步骤显示摘要信息 + "Manage in Playbook" 链接。
