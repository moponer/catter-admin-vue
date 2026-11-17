# Catter Admin 代码审查与修复报告

- 项目：`catter-admin-vue`（Vue 3.5 + TypeScript 5 + Vite 5 + Element Plus 2.13 + Pinia + vue-i18n + vite-plugin-mock）
- 审查范围：`src/` 全部 89 个文件、构建与 lint 配置、mock 服务、依赖清单
- 审查方式：逐文件静态审查 + `vue-tsc` 类型检查 + `eslint` + 生产构建 + 本地 dev server 接口冒烟
- 结论：修复 **37 项** 缺陷（其中 6 项高危、13 项功能性缺陷），当前 **类型检查 / Lint / 生产构建 全部通过**

---

## 一、验证结果（修复后）

| 检查项 | 命令 | 结果 |
| --- | --- | --- |
| 类型检查 | `npx vue-tsc --noEmit` | ✅ 0 error |
| 代码规范 | `npx eslint . --ext .js,.jsx,.ts,.vue` | ✅ 0 error / 0 warning |
| 生产构建 | `npx vite build` | ✅ 成功（15.7s，echarts 已独立分包） |
| 接口冒烟 | dev server + `/api/auth/login` 等 10 个端点 | ✅ 全部符合预期 |

> 说明：本机工作区的 Windows 目录权限导致 DSH 沙箱无法注入 workspace 授权（目录所有者为 `BUILTIN\Administrators`，当前会话未提权，缺少修改权限的权限），审查与修复全程在 full-access 模式下完成，未改动任何目录权限。

---

## 二、高危问题（已修复）

### 1. 登录后从不加载用户信息，权限体系整体失效
- 位置：[src/router/index.ts](src/router/index.ts)、[src/store/modules/user.ts](src/store/modules/user.ts)
- 现象：`getUserInfoAction()` 全项目无任何调用点。刷新页面后 `userInfo` 恒为 `null`，导致顶栏无昵称/头像、`permissionStore.roles` 恒为空、`permissions` 只能从菜单里推导（mock 菜单没有 `permission` 字段）。最终结果是所有带 `v-permission` 的按钮永久消失。
- 修复：路由守卫初始化流程改为「用户信息 → 菜单 → 角色/权限 → 动态路由 → 兜底 404」，并以用户信息中的角色/权限为准。

### 2. 登出不清理权限与动态路由（切换账号后可复用上一个账号的菜单）
- 位置：新增 [src/utils/session.ts](src/utils/session.ts)，被 [src/components/layout/Header.vue](src/components/layout/Header.vue) 与 [src/utils/request.ts](src/utils/request.ts) 调用
- 现象：原 `logout()` 只清 token 与用户信息，`permissionStore.isLoaded` 保持 `true`，动态路由也未移除；同浏览器换账号登录后仍沿用旧账号的菜单/路由。
- 修复：`resetSession()` 统一清理 token、用户信息、菜单、权限、角色、标签页与动态路由；登出时先请求 `/api/auth/logout`，失败也继续本地清理。

### 3. 403 被当作「登录失效」强制登出
- 位置：[src/utils/request.ts](src/utils/request.ts)
- 现象：业务码 / HTTP 403 走与 401 相同的登出分支，越权访问一个接口就会把用户踢下线。
- 修复：403 仅提示「没有权限访问」，401 才清理会话并跳转登录页。

### 4. 登录页开放重定向 + 重复提交
- 位置：[src/views/login/index.vue](src/views/login/index.vue)
- 现象：`router.push(route.query.redirect)` 直接使用 URL 参数（可能是 `string[]` 或 `//host`、外部地址）；回车 + 点击可并发登录；生产环境预填并展示演示账号密码。
- 修复：redirect 只接受以单个 `/` 开头的站内路径；`loading` 互斥防重复提交；演示账号仅在 `import.meta.env.DEV` 下预填与展示。

### 5. `v-permission` 三个叠加缺陷
- 位置：[src/directives/permission.ts](src/directives/permission.ts)、[src/composables/usePermission.ts](src/composables/usePermission.ts)
- 现象：① 不支持 `*` 通配符（mock 用户返回 `permissions: ['*']`，却全部判为无权限）；② 只在 `mounted` 判定一次，权限异步加载后不会恢复；③ 用 `removeChild` 删节点，容易和 Vue diff 冲突。
- 修复：支持 `*` 通配；用 `watch` 响应权限变化（`unmounted` 解绑）；改为 `display:none` 隐藏并可恢复。

### 6. 令牌持久化策略不可选，且「记住我」是死开关
- 位置：[src/store/modules/user.ts](src/store/modules/user.ts)
- 现象：`pinia-plugin-persistedstate` 无条件把 token 写 localStorage，勾选框无任何作用。
- 修复：勾选「记住我」→ localStorage，否则 → sessionStorage（关标签即失效）；登录/登出时同步清理另一处存储。

---

## 三、功能性缺陷（已修复）

| # | 位置 | 问题 | 修复 |
| --- | --- | --- | --- |
| 7 | [src/views/system/role/index.vue](src/views/system/role/index.vue) | 编辑过某角色后点「新建」，残留 `id` 使提交走 `updateRole`，把上一个角色覆盖 | 新建时清空 `id` 并 `clearValidate` |
| 8 | [src/views/system/menu/index.vue](src/views/system/menu/index.vue) | 同上：新增菜单会变成更新最后编辑的菜单 | 同上 |
| 9 | [src/views/system/user/index.vue](src/views/system/user/index.vue)、role | `<el-pagination @change="loadData">`：Element Plus 没有 `change` 事件，翻页/改每页条数**从不重新请求** | 改为 `@current-change` / `@size-change`，改条数回第 1 页 |
| 10 | [src/components/common/ProTable.vue](src/components/common/ProTable.vue) | `v-model` 写入 `computed` 生成的临时对象，分页状态被静默丢弃 | 改为受控 props + 事件（`:current-page` / `:page-size`） |
| 11 | [src/views/monitor/login-log/index.vue](src/views/monitor/login-log/index.vue)、[operate-log](src/views/monitor/operate-log/index.vue) | 日期区间写到 `dateRange`，而接口只认 `startTime/endTime` → **筛选条件从未生效**；且请求里多传 `dateRange` | 搜索时把区间转换为 `startTime/endTime`，请求前剔除 `dateRange` |
| 12 | 同上 + [file](src/views/system/file/index.vue) | `@search="loadData"` 不重置页码，在第 5 页筛选后得到空列表 | 新增 `handleSearch()`，先 `page = 1` |
| 13 | 日志/文件三个列表 | 批量删除**无二次确认**，误点即删 | 统一 `ElMessageBox.confirm` + 取消早退 + `Promise.all` |
| 14 | user / dept / dict×2 / permission / form 示例 / settings | `await formRef.validate()` 未捕获，校验失败变成未处理的 Promise 异常（被全局 `errorHandler` 打印为 `[Vue Error]`） | 统一 `validate().catch(() => false)` 后早退 |
| 15 | [src/views/system/dept/index.vue](src/views/system/dept/index.vue) | 搜索框的 `watch` 是空函数，输入无任何效果 | 实现前端树过滤（命中节点或其子孙都保留链路），并保存完整树 |
| 16 | menu / dept / permission 三个树 | 父级下拉包含自身与自身子树，可把 `parentId` 指成自己形成环 | 编辑时用 `excludeSubtree()` 排除自身子树 |
| 17 | [src/components/layout/TagsView.vue](src/components/layout/TagsView.vue) + [src/router/index.ts](src/router/index.ts) | 「刷新标签」跳到 `/redirect/...`，但该路由从未注册 → 直接 404；`document.addEventListener` 每次挂载都泄漏 | 注册隐藏的 `redirect/:path(.*)` 子路由；监听器在 `onUnmounted` 解绑 |
| 18 | [src/views/profile/index.vue](src/views/profile/index.vue)、[settings.vue](src/views/profile/settings.vue) | 快捷入口 command 不以 `/` 开头 → 四个按钮全无反应；`$t('profile.settings')` 键不存在 → 页面标题直接显示 key；三个 `el-col` 不在 `el-row` 内 | 统一走路由路径；补齐 i18n 键；补 `el-row` 包裹；「重置/更换头像」接上行为 |
| 19 | [src/composables/useDict.ts](src/composables/useDict.ts) | 缓存放在 composable 内部，每个组件一份（等于没缓存）；`===` 比较导致 `'1'` 与 `1` 永远匹配不上 | 模块级缓存 + 并发去重 + 字符串比较 |
| 20 | [src/composables/useTree.ts](src/composables/useTree.ts)、[useSelection.ts](src/composables/useSelection.ts)、[useTable.ts](src/composables/useTable.ts) | 树过滤写死 `data.label`（部门/菜单树用 `name`）；`loadTree` 无兜底；`clearSelection()` 不清表格内部勾选；一次网络抖动就把表格清空 | 增加可配置 `labelKey`、异常兜底、透传 tableRef、失败保留上次数据 |
| 21 | [src/components/common/FileUpload.vue](src/components/common/FileUpload.vue)、[ImageUpload.vue](src/components/common/ImageUpload.vue) | `accept` 只是浏览器提示，`beforeUpload` 不校验类型，可上传 html/svg/js 等可在同源执行的文件 | 拦截可执行/可注入扩展名 + 支持白名单；图片上传拒绝 SVG |
| 22 | [src/utils/export.ts](src/utils/export.ts) | 导出 CSV 未处理公式前缀，`=cmd`/`+...` 会被 Excel 当公式执行（CSV 注入） | 以 `= + - @ \t \r` 开头的值加 `'` 前缀 |
| 23 | [src/composables/useCrud.ts](src/composables/useCrud.ts) | 编辑后再新增会带上残留字段；删除确认取消时 Promise 直接 reject；提交失败无兜底 | 统一 `resetForm()`、确认封装为返回 boolean、提交 try/catch |

---

## 四、工程化与构建（已修复）

| # | 位置 | 问题 | 修复 |
| --- | --- | --- | --- |
| 24 | [.eslintrc.cjs](.eslintrc.cjs) + [package.json](package.json) | 配置 `require('@rushstack/eslint-patch')` 并 extends `@vue/eslint-config-typescript`，但三个包都不在依赖里 → **`npm run lint` 完全跑不起来** | 补齐依赖并 `npm install`；增加 ignorePatterns（dist/deploy/自动生成的 d.ts） |
| 25 | [vite.config.ts](vite.config.ts) | `vite-plugin-mock@3` 不认 `localEnabled/prodEnabled`（v2 语义，被静默忽略）；`injectCode` 引用不存在的 `src/mockProdServer` | 改用 `enable: command === 'serve'`，删除 injectCode |
| 26 | [tsconfig.json](tsconfig.json) | `vite.config.ts` 不在 include 内，构建脚本实际从不检查它（`tsc -p tsconfig.node.json` 才能发现 TS2353） | 纳入 include，移除会触发 TS6305 的 references |
| 27 | [vite.config.ts](vite.config.ts) | dev server 绑定 `0.0.0.0`，同一局域网可访问开发服务器与 mock 登录接口 | 默认 `127.0.0.1`，需要时用 `VITE_HOST=true` 放开 |
| 28 | [vite.config.ts](vite.config.ts) | `manualChunks` 未包含 echarts，1.1MB 打进主包且随业务代码失效 | 增加 `echarts` 分包（构建产物已见 `echarts-*.js`）；补齐 `optimizeDeps` |
| 29 | [src/mock/user.ts](src/mock/user.ts)、[file.ts](src/mock/file.ts)、[log.ts](src/mock/log.ts) | `/batch`、`/clean` 声明在 `:id` 之后，被参数路由吃掉（返回了单条删除的语义） | 静态路由前置 |
| 30 | [src/mock/dept.ts](src/mock/dept.ts)、[permission.ts](src/mock/permission.ts) | 缺 `GET /api/depts/:id`、`GET /api/permissions/:id`，调用会落到 3000 端口代理并报网络错误 | 补齐两个接口 |
| 31 | [index.html](index.html) | `/vite.svg` 不存在，每次加载 404 | 补充 [public/vite.svg](public/vite.svg) |
| 32 | [.gitignore](.gitignore) | `deploy/` 未忽略，陈旧构建产物会被提交 | 加入 `deploy`、`dist-verify` |
| 33 | [package.json](package.json) | `vue-echarts`、`js-cookie` 全项目 0 引用；`mockjs` 仅 mock 使用却在 dependencies | 移除前两者，`mockjs` 移入 devDependencies，`element-plus` 下限提到 ^2.6（`el-radio value` 需要 2.6+） |

此外：`src/directives` 的 debounce / throttle / longpress / copy 四个指令原先在 `mounted` 里注册 DOM 监听且永不释放（元素复用后回调还是旧的闭包），已统一改为 WeakMap 保存 + `unmounted` 解绑 + 调用时读取最新的 `binding.value`；[src/utils/download.ts](src/utils/download.ts) 的 `byUrl` 增加了协议校验与 `rel="noopener noreferrer"`；[src/utils/storage.ts](src/utils/storage.ts) 的 `clear()` 不再清空整个同源 localStorage。

---

## 五、未处理项（建议后续跟进）

1. **mock 认证是"假"的**：`admin/123456` 硬编码，签发 `mock_token_<时间戳>`，任何 token 都通过。仅限开发环境（`enable: command === 'serve'`），但不要当作真实鉴权。
2. **token 存于 Web Storage**：一旦出现 XSS 即可被读取（`index.html` 也没有 CSP）。生产建议改用 httpOnly + SameSite Cookie，并补 `default-src 'self'` 级别的 CSP。
3. **Element Plus 全量引入与按需 resolver 并存**：`app.use(ElementPlus)` + `element-plus/dist/index.css` 与 `ElementPlusResolver` 会重复注入样式（约 367KB CSS）。移除任一侧都可能影响 `ElMessage` 等命令式组件与模板类型推导，因此本次未动，建议单独做一次引入方式重构并回归验证。
4. **`deploy/` 陈旧产物仍在工作区**（302 个文件、233 个不在 `dist` 中），已加入 .gitignore 但未删除，建议由 CI 产出与发布。
5. **占位实现**：个人设置的保存/头像上传、演示页 `components/table` 的筛选与分页按钮、首页「最近动态」中的中文硬编码文案，仍是脚手架占位，未接后端接口。
6. **未做浏览器级端到端验证**：本次通过类型检查、lint、生产构建与 dev server 模块转换/接口冒烟确认，但路由守卫的完整跳转链路（登录 → 刷新 → 401 → 重新登录）建议补一套 Playwright 用例。

---

## 六、附：关键文件改动清单

新增：
- [src/utils/session.ts](src/utils/session.ts) — 统一会话清理
- [public/vite.svg](public/vite.svg) — 修复 favicon 404

重写：
- [src/utils/request.ts](src/utils/request.ts) — 401/403 分流、超时提示、类型净化
- [src/router/index.ts](src/router/index.ts) — 会话初始化、路由名去重、redirect 路由、安全兜底
- [src/store/modules/user.ts](src/store/modules/user.ts) — 记住我 + 存储策略
- [src/directives/permission.ts](src/directives/permission.ts) — 响应式 + 通配符
- [src/directives/debounce.ts](src/directives/debounce.ts) / [throttle.ts](src/directives/throttle.ts) / [longpress.ts](src/directives/longpress.ts) / [copy.ts](src/directives/copy.ts) — 监听器生命周期
- [src/composables/useDict.ts](src/composables/useDict.ts) / [useTable.ts](src/composables/useTable.ts)
- [src/App.vue](src/App.vue) — Element Plus 语言随 i18n 切换
- [package.json](package.json) / [.eslintrc.cjs](.eslintrc.cjs) / [vite.config.ts](vite.config.ts) / [tsconfig.json](tsconfig.json) / [.gitignore](.gitignore)

修改（按目录）：`src/api` 无逻辑改动；`src/mock/*` 路由顺序与新接口；`src/locales/*` 新增 3 个键；`src/views/**` 10 个页面的分页、筛选、校验、确认与错误处理。
