# Video Learning Platform

一个基于 Vue 3 的视频学习平台，支持智能调速、标记和笔记功能。

## 项目概述

VideoHub 是一个现代化视频分享与学习平台，提供视频上传、播放、管理以及智能学习辅助功能。平台特别优化了视频学习体验，集成了智能调速、标记和笔记系统，帮助用户更高效地学习视频内容。

## 功能特性

### 已实现功能

#### 1. 视频播放核心功能
- [x] 基础播放控制（播放/暂停、进度跳转、音量调节）
- [x] 全屏支持
- [x] 播放统计
- [x] 播放进度记录
- [x] 支持画质切换
- [x] 播放速度控制

#### 2. 智能调速系统
- [x] 实时音频分析
- [x] 自适应速度调整
- [x] 平滑变速过渡
- [x] 可配置目标语速(WPM)
- [x] 设置持久化
- [x] 实时显示当前语速和播放速度

#### 3. 主题系统
- [x] 亮色/暗色模式切换
- [x] 主题持久化
- [x] 系统主题跟随
- [x] 深色模式优化

#### 4. 视频管理
- [x] 视频上传（支持进度显示）
- [x] 上传时自动获取视频时长
- [x] 视频列表展示
- [x] 视频信息编辑
- [x] 视频状态切换
- [x] 视频删除
- [x] 批量删除
- [x] 视频筛选和排序
- [x] 智能时长格式化（小时:分钟:秒）
- [x] 全选功能
- [x] 空状态显示优化

#### 5. 用户系统（部分实现）
- [x] 用户注册/登录（前端基础功能已实现）
- [x] 用户状态管理
- [x] 基础认证路由守卫

### 进行中功能

#### 1. 用户系统完善
- [ ] 完成认证API对接
- [ ] 用户配置界面
- [ ] 个人中心
- [ ] 用户权限管理
- [ ] 个人设置保存
- [ ] 播放历史同步

### 计划功能

#### 1. 标记系统
- [ ] 在视频时间轴上添加标记
- [ ] 为标记添加注释
- [ ] 编辑和删除标记
- [ ] 快速跳转到标记位置
- [ ] 支持标记列表展示

#### 2. 笔记系统
- [ ] 在视频播放过程中添加笔记
- [ ] 笔记自动关联视频时间点
- [ ] 编辑和删除笔记
- [ ] 支持按时间点跳转
- [ ] 笔记列表展示

#### 3. 互动功能
- [ ] 点赞
- [ ] 评论
- [ ] 分享
- [ ] 收藏

#### 4. 体验优化
- [ ] 字幕支持
- [ ] 画中画模式
- [ ] 视频悬停预览
- [ ] 缩略图生成
- [ ] GIF预览
- [ ] 响应式布局优化
- [ ] 触摸操作优化
- [ ] 移动端播放优化

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **样式方案**: TailwindCSS
- **UI组件**: HeadlessUI
- **视频播放**: Plyr
- **音频处理**: Web Audio API
- **HTTP请求**: Axios
- **路由管理**: Vue Router

## 项目结构

```
src/
├── api/          # API 接口
├── assets/       # 静态资源
├── components/   # 组件
│   ├── marks/    # 标记相关组件
│   ├── video/    # 视频相关组件
│   └── common/   # 通用组件
├── layouts/      # 布局组件
├── router/       # 路由配置
├── stores/       # 状态管理
├── styles/       # 样式文件
├── types/        # 类型定义
├── utils/        # 工具函数
└── views/        # 页面组件
    ├── auth/     # 认证相关页面
    └── ...       # 其他页面
```

## API 接口

### 视频接口
1. 获取公开视频列表
   ```
   GET /videos/public
   ```
   参数：
   - `page`: 页码（从1开始，默认1）
   - `pageSize`: 每页数量（默认10，最大50）
   - `userId`: 用户ID（可选，指定后只返回该用户的公开视频）
   - `sort`: 排序方式（可选，默认"-created_at"）
     - created_at: 创建时间升序
     - -created_at: 创建时间降序
     - title: 标题升序
     - -title: 标题降序
   - `keyword`: 搜索关键词（可选，搜索标题和描述）

2. 获取用户视频列表
   ```
   GET /videos/user
   Authorization: Bearer <token>
   ```
   参数：同上

3. 上传视频
   ```
   POST /videos
   Content-Type: multipart/form-data
   ```
   - 支持格式：MP4、MOV、AVI
   - 大小限制：1GB

4. 获取视频详情
   ```
   GET /videos/:id
   ```

5. 更新视频信息
   ```
   PUT /videos/:id
   ```
   参数：
   - `title`: 标题
   - `description`: 描述
   - `status`: 状态
   - `tags`: 标签数组

6. 删除视频
   ```
   DELETE /videos/:id
   ```

7. 批量操作
   ```
   POST /videos/batch
   ```
   参数：
   - `ids`: 视频ID数组
   - `action`: 操作类型（delete/update_status）
   - `status`: 新状态（当action为update_status时必填）

### 用户接口
1. 用户注册
   ```
   POST /users/register
   Content-Type: application/json
   ```
   参数：
   - `username`: 用户名
   - `password`: 密码
   - `email`: 邮箱

2. 用户登录
   ```
   POST /users/login
   Content-Type: application/json
   ```
   参数：
   - `username`: 用户名
   - `password`: 密码

## 智能调速功能实现

### 原理
通过实时分析音频特征，自动调整播放速度以匹配用户设定的目标语速。

### 核心算法
```typescript
// 1. 音频分析
analyzeSpeech(audioData: Float32Array) {
  // 计算音量
  const volume = calculateVolume(audioData)
  
  // 估算当前语速
  const baseWPM = userPreferences.targetWPM
  const newWPM = baseWPM * (1 + (volume * volumeScale / baseWPM - 0.5))
  
  // 平滑处理
  currentWPM = smooth(lastWPM, newWPM)
}

// 2. 速度调整
suggestedSpeed = computed(() => {
  // 计算目标速度比率
  const targetSpeed = targetWPM / currentWPM
  
  // 渐进式调整
  let newSpeed = currentSpeed
  if (targetSpeed > currentSpeed) {
    newSpeed = Math.min(currentSpeed + 0.1, targetSpeed)
  } else if (targetSpeed < currentSpeed) {
    newSpeed = Math.max(currentSpeed - 0.1, targetSpeed)
  }
  
  // 限制范围
  return clamp(newSpeed, speedRange.min, speedRange.max)
})
```

## 开发指南

### 安装依赖
```bash
npm install
```

### 开发环境
```bash
npm run dev
```

### 构建
```bash
npm run build
```

### 代码规范
- 使用 TypeScript 进行类型检查
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 Vue 3 组合式 API 风格指南

## 最近更新 (2024-03-21)

### 视频时长功能
- ✅ 上传时自动获取视频时长
- ✅ 视频卡片显示时长
- ✅ 智能时长格式化（小时:分钟:秒）
- ✅ 统一首页和管理页的时长显示

### 视频管理优化
- ✅ 添加全选功能
- ✅ 支持批量删除
- ✅ 优化空状态显示
- ✅ 统一首页和管理页的空状态样式

### 界面优化
- ✅ 优化视频卡片布局
- ✅ 统一视频展示样式
- ✅ 优化暗色模式显示
- ✅ 改进操作按钮样式

### 视频状态管理优化
- ✅ 更新视频状态类型：public 改为 ready，表示已发布状态
- ✅ 添加 draft（草稿）状态
- ✅ 优化状态筛选逻辑，支持空值表示全部视频
- ✅ 更新状态标签样式：已发布（绿色）、私有（灰色）、草稿（黄色）

### 用户系统基础实现
- ✅ 创建注册/登录页面
- ✅ 实现用户状态管理
- ✅ 添加路由守卫基础结构
- ✅ 创建用户API接口

## 下一步计划

### 1. 完善视频播放体验
- 添加字幕支持
- 实现画中画模式
- 优化播放控制

### 2. 实现视频预览功能
- 添加视频缩略图
- 支持悬停预览
- 生成GIF预览

### 3. 优化移动端适配
- 改进响应式布局
- 优化触摸操作
- 提升移动端播放体验

### 4. 标记与笔记系统
- 实现视频标记功能
- 添加笔记系统
- 支持标记和笔记的同步

### 5. 用户系统完善
- 完成用户认证流程
- 添加个人中心
- 实现用户权限管理
- 添加用户设置页面

## 注意事项

- 智能调速功能需要浏览器支持 Web Audio API
- 建议目标语速设置在 80-300 WPM 范围内
- 播放速度变化平滑，可能需要短暂时间达到目标速度
- 移动端自动收起侧边栏以优化显示
- 部分高级功能需要用户登录
- 支持主流现代浏览器 