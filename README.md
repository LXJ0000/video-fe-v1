# VideoHub - 现代化视频分享平台

## 项目概述
VideoHub 是一个基于 Vue 3 的现代化视频分享平台，提供视频上传、播放和管理功能。

## 技术栈
- Vue 3 - 渐进式 JavaScript 框架
- Pinia - 状态管理
- TailwindCSS - 样式框架
- HeadlessUI - 无样式组件库
- Plyr - 视频播放器
- Axios - HTTP 客户端
- Vue Router - 路由管理

## 功能模块

### 已实现功能
1. 主题系统
   - [x] 亮色/暗色模式切换
   - [x] 主题持久化
   - [x] 系统主题跟随

2. 视频管理
   - [x] 视频上传（支持进度显示）
   - [x] 视频列表展示
   - [x] 视频信息编辑
   - [x] 视频状态切换
   - [x] 视频删除
   - [x] 批量删除
   - [x] 视频筛选和排序

3. 视频播放
   - [x] 视频播放器
   - [x] 播放控制
   - [x] 全屏支持
   - [x] 播放统计

### 计划功能
1. 用户系统
   - [ ] 用户注册/登录
   - [ ] 个人中心
   - [ ] 用户权限管理

2. 互动功能
   - [ ] 点赞
   - [ ] 评论
   - [ ] 分享
   - [ ] 收藏

3. 其他功能
   - [ ] 视频标签管理
   - [ ] 视频分类
   - [ ] 搜索建议
   - [ ] 观看历史

## API 接口

### 视频接口
1. 上传视频
   ```
   POST /videos
   Content-Type: multipart/form-data
   ```
   - 支持格式：MP4、MOV、AVI
   - 大小限制：1GB

2. 获取视频列表
   ```
   GET /videos
   ```
   参数：
   - `page`: 页码（默认1）
   - `pageSize`: 每页数量（默认10，最大50）
   - `keyword`: 关键词搜索
   - `status`: 视频状态（public/private/draft）
   - `startDate`: 开始日期（YYYY-MM-DD）
   - `endDate`: 结束日期（YYYY-MM-DD）
   - `tags`: 标签筛选，多个用逗号分隔
   - `sortBy`: 排序字段（created_at/views/likes/file_size）
   - `sortOrder`: 排序方向（asc/desc）

3. 获取视频详情
   ```
   GET /videos/:id
   ```

4. 更新视频信息
   ```
   PUT /videos/:id
   ```
   参数：
   - `title`: 标题
   - `description`: 描述
   - `status`: 状态
   - `tags`: 标签数组

5. 删除视频
   ```
   DELETE /videos/:id
   ```

6. 批量操作
   ```
   POST /videos/batch
   ```
   参数：
   - `ids`: 视频ID数组
   - `action`: 操作类型（delete/update_status）
   - `status`: 新状态（当action为update_status时必填）

## 开发指南

### 项目设置
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 目录结构
```
src/
├── api/        # API 接口
├── assets/     # 静态资源
├── components/ # 通用组件
├── layouts/    # 布局组件
├── router/     # 路由配置
├── stores/     # 状态管理
├── types/      # TypeScript 类型
└── views/      # 页面组件
```

### 代码规范
- 使用 TypeScript 进行类型检查
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 Vue 3 组合式 API 风格指南 

## 开发日志

### 开发沟通记录

#### 2024-03-21 视频时长功能开发
1. 需求分析与确认
   - 确认需要在视频卡片上显示时长
   - 统一首页和管理页的时长显示样式
   - 时长格式需要支持小时/分钟/秒的智能显示

2. 开发过程中的问题与解决
   - 问题：发现视频列表接口返回的 duration 为 0
   - 分析：上传时未传递视频时长信息
   - 解决：
     1. 添加前端获取视频时长的方法
     2. 在上传时将时长信息传给后端
     3. 确认使用 'duration' 作为字段名

3. 功能迭代过程
   - 第一轮：基础时长显示功能
     * 添加 VideoCard 组件的时长显示
     * 实现时长格式化函数
   - 第二轮：上传功能完善
     * 添加上传时获取时长的逻辑
     * 完善上传参数处理
   - 第三轮：界面统一
     * 同步更新首页的视频卡片
     * 统一时长显示样式
   - 第四轮：空状态优化
     * 添加首页空状态显示
     * 统一空状态样式
   - 第五轮：管理功能增强
     * 添加视频全选功能
     * 优化批量操作体验

4. 代码优化
   - 抽取公共的时长格式化函数
   - 完善类型定义
   - 统一组件样式
   - 优化代码复用

5. 文档更新
   - 更新 README 功能列表
   - 记录开发过程
   - 补充问题解决方案
   - 添加后续优化建议

### 2024-03-21
1. 视频状态管理优化
   - 更新视频状态类型：public 改为 ready，表示已发布状态
   - 添加 draft（草稿）状态
   - 优化状态筛选逻辑，支持空值表示全部视频
   - 更新状态标签样式：已发布（绿色）、私有（灰色）、草稿（黄色）

2. 视频列表功能优化
   - 统一首页和管理页的视频卡片样式
   - 添加创建时间和文件大小显示
   - 优化视频卡片布局，避免标题和状态标签重叠
   - 修复编辑按钮点击时误触发视频播放的问题

3. 接口对接优化
   - 更新视频列表接口参数
   - 完善类型定义
   - 优化请求响应处理

4. 类型系统优化
   - 修复视频状态切换的类型错误
   - 优化排序选项的类型定义
   - 添加类型安全的事件处理函数
   - 完善 VideoItem 接口定义

5. 交互优化
   - 修复视频管理页面选择框点击跳转问题
   - 优化事件处理逻辑，避免事件冒泡
   - 完善点击判断逻辑
   - 修复视频卡片点击失效问题
   - 优化鼠标指针样式

6. 功能优化
   - 实现视频上传后自动刷新列表
   - 优化组件间通信机制
   - 添加页面刷新方法
   - 完善错误处理
   - 统一使用 store 管理视频列表数据
   - 修复管理页面数据同步问题 

## 最近更新 (2024-03-21)

### 开发过程
1. 视频时长功能迭代
   - 首先在 VideoCard 组件中添加时长显示
   - 发现上传时需要获取视频时长
   - 在上传时添加时长获取逻辑
   - 统一首页和管理页的时长显示

2. 问题排查与解决
   - 发现接口返回的 duration 字段为 0
   - 检查上传参数，确认使用 duration 字段名
   - 实现上传时自动获取视频时长
   - 完善时长格式化逻辑

3. 界面统一
   - 统一首页和管理页的视频卡片样式
   - 添加空状态显示
   - 优化管理页面的全选功能
   - 改进批量操作体验

### 1. 视频时长功能
- ✅ 上传时自动获取视频时长
- ✅ 视频卡片显示时长
- ✅ 智能时长格式化（小时:分钟:秒）
- ✅ 统一首页和管理页的时长显示

### 2. 视频管理优化
- ✅ 添加全选功能
- ✅ 支持批量删除
- ✅ 优化空状态显示
- ✅ 统一首页和管理页的空状态样式

### 3. 界面优化
- ✅ 优化视频卡片布局
- ✅ 统一视频展示样式
- ✅ 优化暗色模式显示
- ✅ 改进操作按钮样式

### 4. 代码优化
- ✅ 统一时长格式化逻辑
- ✅ 优化类型定义
- ✅ 改进状态管理
- ✅ 提升代码复用性

## 待办事项
- [x] 添加视频时长显示 ✅ 已完成
- [ ] 优化视频播放体验
- [ ] 添加视频预览功能
- [ ] 优化移动端适配

## 当前开发进度

### 已完成功能 (2024-03-21)
1. 视频时长功能 ✅
   - 上传时自动获取时长
   - 视频卡片显示时长
   - 智能时长格式化

2. 视频管理功能 ✅
   - 全选功能
   - 批量删除
   - 空状态显示

3. 界面统一 ✅
   - 统一视频卡片样式
   - 统一空状态显示
   - 优化操作按钮

### 进行中功能
1. 视频播放体验优化
   - [ ] 添加播放进度记录
   - [ ] 支持画质切换
   - [ ] 添加播放速度控制

2. 视频预览功能
   - [ ] 悬停预览
   - [ ] 缩略图生成
   - [ ] GIF预览

3. 移动端适配
   - [ ] 响应式布局优化
   - [ ] 触摸操作优化
   - [ ] 移动端播放优化

### 下一步计划
1. 完善视频播放体验
2. 实现视频预览功能
3. 优化移动端适配
4. 添加用户系统 

# 智能视频播放器

一个支持智能调速的在线视频播放器。

## 功能特性

### 1. 智能调速
- **原理**: 通过分析音频特征，自动调整播放速度以匹配目标语速
- **核心功能**:
  - 实时音频分析
  - 自适应速度调整
  - 平滑变速过渡
  - 可配置目标语速(WPM)

### 2. 播放控制
- 基础播放控制(播放/暂停/进度)
- 音量控制
- 手动速度调节
- 全屏支持

### 3. 用户设置
- 目标语速设置(80-300 WPM)
- 播放速度范围限制(0.25x-3.0x)
- 设置自动保存

## 技术实现

### 智能调速算法
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

### 技术栈
- Vue 3 + TypeScript
- Pinia 状态管理
- Web Audio API
- Plyr 播放器

## 使用说明

1. 开启智能调速
2. 设置目标语速(WPM)
3. 系统会自动调整播放速度以匹配目标语速

## 注意事项

- 智能调速功能需要音频支持
- 建议目标语速设置在 80-300 WPM 范围内
- 播放速度变化平滑，可能需要短暂时间达到目标速度 