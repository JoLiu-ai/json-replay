# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

# AI Conversation Management System

## 灵活的API配置系统

### 环境配置

1. **复制环境变量文件**：
```bash
cp env.example .env
```

2. **修改API地址**：
在 `.env` 文件中修改 `VITE_API_BASE_URL`：
```env
# 开发环境
VITE_API_BASE_URL=http://localhost:8001

# 生产环境
VITE_API_BASE_URL=https://your-api-domain.com

# 测试环境
VITE_API_BASE_URL=http://localhost:8002
```

### 配置系统特点

#### 1. 集中式配置管理
- **`src/config/api.ts`**: 所有API端点配置
- **`src/services/api.ts`**: 统一的API服务类
- **环境变量**: 支持不同环境的配置

#### 2. 类型安全
- TypeScript接口定义
- 统一的错误处理
- 类型化的API响应

#### 3. 易于维护
- 单点修改API地址
- 统一的错误处理逻辑
- 可复用的API服务

### 使用方法

#### 在组件中使用API服务：
```typescript
import { apiService } from '../services/api';

// 获取对话列表
const result = await apiService.getConversations();
if (result.success) {
  setConversations(result.data);
} else {
  message.error(result.error);
}

// 上传文件
const uploadResult = await apiService.uploadConversation(file);
```

#### 直接使用API URL：
```typescript
import { API_URLS } from '../config/api';

// 构建URL
const url = API_URLS.conversation(123);
const visualizerUrl = API_URLS.visualizer(123);
```

### 启动项目

1. **安装依赖**：
```bash
npm install
```

2. **启动前端**：
```bash
npm run dev
```

3. **启动后端**（在另一个终端）：
```bash
cd ../backend
python -m uvicorn app.main:app --reload --port 8001
```

### 项目结构

```
src/
├── config/
│   └── api.ts          # API配置
├── services/
│   └── api.ts          # API服务类
├── components/
│   └── ConversationManager.tsx  # 对话管理组件
└── App.tsx             # 主应用
```

### 优势

1. **灵活性**: 通过环境变量轻松切换API地址
2. **可维护性**: 集中管理所有API调用
3. **类型安全**: TypeScript提供完整的类型检查
4. **错误处理**: 统一的错误处理机制
5. **可扩展性**: 易于添加新的API端点
