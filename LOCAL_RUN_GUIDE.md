# WorkMate - 多租户 AI Agent 平台

基于 QwenPaw 的多租户 AI Agent 产品，参考 WorkBuddy 的产品形态。

## 功能特性

- ✅ 用户注册与登录（JWT 认证）
- ✅ 多租户架构
- ✅ 聊天功能
- ✅ 专家模式（5个预置专家角色）
- ✅ 对话历史管理
- ✅ 流式响应支持

## 本地运行要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0（推荐）或 npm
- QwenPaw 服务（可选，用于实际 AI 对话）

## 快速开始

### 1. 克隆项目

```bash
git clone <项目地址>
cd workspace
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库配置
DATABASE_PATH=./data/workmate.db

# JWT 配置（生产环境请修改）
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# QwenPaw API 配置（可选）
QWENPAW_BASE_URL=http://localhost:8000
QWENPAW_API_KEY=
QWENPAW_TIMEOUT=30000

# 服务配置
PORT=3000
NODE_ENV=development
```

### 4. 启动开发服务器

同时启动前端和后端：

```bash
pnpm run dev
```

或分别启动：

```bash
# 后端服务
pnpm run server:dev

# 前端开发服务器（另一个终端）
pnpm run client:dev
```

### 5. 访问应用

打开浏览器访问：`http://localhost:5173`

## API 端点

### 认证

```bash
# 注册用户
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "用户名",
  "tenant_name": "公司名称"
}

# 登录
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# 获取用户信息
GET /api/auth/profile
Authorization: Bearer <token>
```

### 聊天

```bash
# 发送消息
POST /api/chat
Authorization: Bearer <token>
{
  "message": "你好！"
}

# 创建对话
POST /api/chat/conversations
Authorization: Bearer <token>
{
  "title": "新对话"
}

# 获取消息历史
GET /api/chat/conversations/:id/messages
Authorization: Bearer <token>
```

### 专家模式

```bash
# 获取所有专家
GET /api/expert
Authorization: Bearer <token>

# 获取特定专家详情
GET /api/expert/:id
Authorization: Bearer <token>
```

## 项目结构

```
/workspace
├── api/                    # 后端代码
│   ├── controllers/         # 控制器
│   ├── database/           # 数据库初始化
│   ├── middleware/         # 中间件
│   ├── repositories/       # 数据访问层
│   ├── routes/             # 路由
│   ├── services/           # 业务逻辑
│   ├── app.ts             # Express 应用
│   └── server.ts          # 服务器入口
├── src/                    # 前端代码
│   ├── api/               # API 调用
│   ├── components/         # React 组件
│   ├── pages/             # 页面
│   ├── stores/            # 状态管理
│   └── App.tsx            # 应用入口
├── dist/                   # 构建输出
├── data/                   # 数据库文件
└── .env                    # 环境变量
```

## 技术栈

- **前端**：React 18, TypeScript, Vite, Tailwind CSS, Zustand
- **后端**：Express, TypeScript, sql.js
- **认证**：JWT
- **数据库**：SQLite (sql.js)

## 生产部署

### 构建前端

```bash
pnpm run build
```

### 启动生产服务器

```bash
PORT=3000 node api/server.ts
```

前端文件会从 `/dist` 目录提供。

## 常见问题

### Q: 提示 "nodemon not found"
```bash
pnpm install
```

### Q: 端口被占用
修改 `.env` 中的 `PORT` 值。

### Q: QwenPaw 连接失败
确保 QwenPaw 服务已启动并正确配置 `QWENPAW_BASE_URL`。如果未配置，系统会使用模拟响应。

## 许可证

MIT
