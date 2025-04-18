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

## 最近更新 (2024-04-20)

### 视频流功能优化
- ✅ 新增视频流页面，支持无限滚动和沉浸式观看
- ✅ 实现视频自动播放与暂停机制
- ✅ 添加右侧操作栏，包括作者头像、点赞/收藏、评论和分享功能
- ✅ 优化视频加载和播放过渡动画
- ✅ 实现视频声音控制和播放进度显示

### 个人主页功能增强
- ✅ 完善个人资料卡片，显示用户基本信息和统计数据
- ✅ 增加用户视频列表、收藏列表和观看历史标签页
- ✅ 实现个人资料编辑功能
- ✅ 优化个人主页布局和响应式适配
- ✅ 添加"返回首页"导航链接

### 视频组件改进
- ✅ 增强VideoCard组件，添加showActions属性控制操作菜单显示
- ✅ 优化视频封面显示和加载失败处理
- ✅ 改进视频信息展示，包括时长、发布时间和数据统计
- ✅ 简化视频标题和描述显示逻辑
- ✅ 实现点击穿透防护，防止误触发操作菜单

### 用户体验优化
- ✅ 改进用户头像获取逻辑，先获取用户ID再通过API获取头像
- ✅ 优化收藏功能，支持添加和取消收藏，实时更新收藏计数
- ✅ 统一使用message组件进行操作反馈，提升用户体验
- ✅ 修复各种边缘情况下的UI显示问题
- ✅ 统一不同页面组件的样式和交互方式

### 数据处理与API集成
- ✅ 重构API响应处理，支持两种格式的收藏列表数据结构
- ✅ 添加数据转换层，处理不同API返回格式的兼容问题
- ✅ 改进错误处理和加载状态显示
- ✅ 优化分页加载逻辑，提升数据加载效率
- ✅ 实现数据缓存和状态保持，减少重复请求

### 权限控制与安全性
- ✅ 根据用户权限控制编辑按钮和操作菜单的显示
- ✅ 区分当前用户和其他用户的页面显示逻辑
- ✅ 改进路由守卫，防止未授权访问
- ✅ 增强API请求的错误处理和异常情况恢复
- ✅ 保护用户敏感操作，确保安全性

### 代码架构优化
- ✅ 使用TypeScript接口统一类型定义
- ✅ 增强组件复用性，减少重复代码
- ✅ 优化状态管理，使用Pinia实现数据共享
- ✅ 加强代码模块化，提高可维护性
- ✅ 改进代码注释和文档，方便团队协作

## 最近更新 (2024-03-22)

### 主题系统优化
- ✅ 实现动态主题切换功能
- ✅ 优化视频播放页面的暗色模式体验
- ✅ 添加主题状态持久化
- ✅ 自动保存和恢复用户主题偏好

### 笔记系统实现
- ✅ 创建笔记数据结构和状态管理
- ✅ 实现笔记的增删改查功能
- ✅ 添加笔记操作的用户反馈
- ✅ 优化笔记编辑界面

### 代码架构优化
- ✅ 重构消息提示系统，统一使用 ant-design-vue 的 message 组件
- ✅ 优化组件生命周期管理
- ✅ 改进状态管理逻辑
- ✅ 完善错误处理机制

### 用户体验改进
- ✅ 添加操作成功/失败的即时反馈
- ✅ 优化加载状态展示
- ✅ 改进表单交互体验
- ✅ 统一界面交互风格

## 技术实现细节

### 主题系统
- 使用 Pinia 进行主题状态管理
  ```typescript
  export const useThemeStore = defineStore('theme', () => {
    const theme = ref<'light' | 'dark'>('light')
    const systemTheme = ref<'light' | 'dark'>('light')
    
    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    watch(mediaQuery, (e) => {
      systemTheme.value = e.matches ? 'dark' : 'light'
    })
    
    // 切换主题
    function setTheme(newTheme: 'light' | 'dark') {
      theme.value = newTheme
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }
    
    // 持久化主题设置
    const storage = useStorage()
    watch(theme, (value) => {
      storage.set('theme', value)
    })
  })
  ```

### 笔记功能
- 基于 TypeScript 的数据模型
  ```typescript
  interface Note {
    id: string
    videoId: string
    content: string
    timestamp: number  // 视频时间点
    createdAt: Date
    updatedAt: Date
  }

  interface NoteState {
    notes: Note[]
    loading: boolean
    error: Error | null
  }
  ```

- 笔记状态管理
  ```typescript
  export const useNoteStore = defineStore('notes', {
    state: (): NoteState => ({
      notes: [],
      loading: false,
      error: null
    }),
    
    actions: {
      async addNote(note: Omit<Note, 'id'>) {
        try {
          this.loading = true
          const response = await videoApi.createNote(note)
          this.notes.push(response.data)
          message.success('笔记添加成功')
        } catch (error) {
          message.error('添加笔记失败')
          this.error = error
        } finally {
          this.loading = false
        }
      }
    }
  })
  ```

### 性能优化
1. 组件懒加载
```typescript
// 路由配置中使用
const routes = [
  {
    path: '/video/:id',
    component: () => import('@/views/VideoPlayer.vue'),
    meta: { requiresAuth: true }
  }
]
```

2. 虚拟列表实现
```typescript
// 视频列表虚拟滚动
const videoList = ref<Video[]>([])
const containerHeight = ref(800)
const itemHeight = 200
const visibleCount = computed(() => Math.ceil(containerHeight.value / itemHeight))

const visibleVideos = computed(() => {
  const start = Math.floor(scrollTop.value / itemHeight)
  const end = Math.min(start + visibleCount.value, videoList.value.length)
  return videoList.value.slice(start, end)
})
```

3. 状态持久化
```typescript
// 封装 Storage 工具
export const useStorage = () => {
  const set = <T>(key: string, value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Storage error:', error)
    }
  }

  const get = <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  }

  return { set, get }
}
```

4. 防抖与节流优化
```typescript
// 防抖工具函数
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: number | null = null
  
  return function(this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = window.setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

// 应用示例
const handleSearch = debounce((keyword: string) => {
  searchVideos(keyword)
}, 300)
```

### 错误处理
```typescript
// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Global error:', err)
  message.error('操作失败，请稍后重试')
  
  // 错误上报
  errorTracker.capture(err, {
    component: vm?.$options.name,
    info,
    timestamp: Date.now()
  })
}

// API 错误拦截
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      userStore.logout()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)
```

### 测试实现
```typescript
// 组件测试示例
describe('VideoPlayer', () => {
  it('should update playback speed', async () => {
    const wrapper = mount(VideoPlayer)
    await wrapper.find('.speed-control').trigger('click')
    await wrapper.find('.speed-2x').trigger('click')
    
    expect(wrapper.vm.currentSpeed).toBe(2)
    expect(wrapper.emitted('speed-change')?.[0]).toEqual([2])
  })
})

// Store 测试示例
describe('noteStore', () => {
  it('should add note successfully', async () => {
    const store = useNoteStore()
    const note = {
      videoId: '1',
      content: 'Test note',
      timestamp: 60
    }
    
    await store.addNote(note)
    expect(store.notes).toHaveLength(1)
    expect(store.notes[0].content).toBe('Test note')
  })
})
```

## 下一步计划

### 1. 评论系统开发
- 实现视频评论功能，支持评论发布、回复和点赞
- 添加评论管理系统，支持评论筛选和置顶
- 开发评论通知机制，提醒用户新回复
- 实现敏感内容过滤，保障社区环境
- 添加表情和图片支持，丰富评论内容

### 2. 数据分析与统计
- 开发用户学习行为分析，包括视频观看偏好和学习习惯
- 实现视频热点分析，识别视频中最受关注的片段
- 添加用户学习进度统计和可视化展示
- 开发视频内容标签分析，辅助用户内容搜索
- 构建用户学习路径推荐系统

### 3. AI辅助功能
- 添加视频内容智能摘要，快速获取核心信息
- 实现智能问答功能，解答视频内容相关问题
- 开发自动字幕生成和翻译功能
- 添加智能内容标签，提升内容分类准确性
- 集成语音识别，支持语音操作和搜索

### 4. 完善视频播放体验
- 添加字幕支持，支持多语言字幕
- 实现画中画模式，提升多任务体验
- 优化播放控制，增加手势和快捷键支持
- 添加视频片段循环播放功能
- 开发视频播放速度预设方案

### 5. 实现视频预览功能
- 添加视频缩略图自动生成
- 支持视频悬停预览，快速浏览内容
- 生成视频关键帧预览，展示重要内容
- 实现视频时间轴预览，辅助内容定位
- 添加预览图质量控制选项

### 6. 优化移动端适配
- 改进响应式布局，提升跨设备体验
- 优化触摸操作，改善手势交互
- 提升移动端播放体验，解决移动网络问题
- 添加离线缓存功能，支持无网络观看
- 优化移动端性能，减少资源占用

### 7. 用户系统完善
- 完成用户认证流程，支持多种登录方式
- 添加个人中心，集中管理用户内容和设置
- 实现用户权限管理，支持多级权限控制
- 添加用户设置页面，个性化功能配置
- 开发用户关系系统，支持关注和推荐

## 注意事项

- 智能调速功能需要浏览器支持 Web Audio API
- 建议目标语速设置在 80-300 WPM 范围内
- 播放速度变化平滑，可能需要短暂时间达到目标速度
- 移动端自动收起侧边栏以优化显示
- 部分高级功能需要用户登录
- 支持主流现代浏览器 