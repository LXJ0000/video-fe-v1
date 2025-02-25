export const formatDate = (isoString: string, format: 'full' | 'short' = 'full') => {
  // 处理无效日期
  if (!isoString || isoString === "0001-01-01T00:00:00Z") {
    return format === 'short' ? '刚刚' : '最近'
  }

  const date = new Date(isoString)
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return format === 'short' ? '刚刚' : '最近'
  }

  if (format === 'short') {
    return date.toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
} 