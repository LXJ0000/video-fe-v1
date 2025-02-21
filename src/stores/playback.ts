import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface UserPreferences {
  targetWPM: number
  speedRange: {
    min: number
    max: number
  }
}

export const usePlaybackStore = defineStore('playback', () => {
  // 用户偏好设置
  const userPreferences = ref<UserPreferences>({
    targetWPM: 150,
    speedRange: {
      min: 0.25,
      max: 3.0
    }
  })

  const isAutoSpeedEnabled = ref(false)
  const currentWPM = ref(0)
  const currentSpeed = ref(1) // 添加当前速度追踪
  
  // 调整平滑因子，使变化更平缓
  const smoothingFactor = 0.1
  let lastWPM = 0

  // 改进速度计算逻辑
  const suggestedSpeed = computed(() => {
    if (!isAutoSpeedEnabled.value || currentWPM.value === 0) {
      return 1
    }
    
    // 修正：目标语速与当前语速的比率
    // 如果当前语速高于目标，应该降低速度；反之提高速度
    const targetSpeed = userPreferences.value.targetWPM / currentWPM.value
    
    // 逐步调整速度，避免突变
    let newSpeed = currentSpeed.value
    
    if (targetSpeed > currentSpeed.value) {
      // 当前语速过慢，需要加快
      newSpeed = Math.min(currentSpeed.value + 0.1, targetSpeed)
    } else if (targetSpeed < currentSpeed.value) {
      // 当前语速过快，需要减慢
      newSpeed = Math.max(currentSpeed.value - 0.1, targetSpeed)
    }
    
    // 限制在允许范围内
    newSpeed = Math.max(
      Math.min(newSpeed, userPreferences.value.speedRange.max),
      userPreferences.value.speedRange.min
    )
    
    // 更新当前速度
    currentSpeed.value = newSpeed
    return newSpeed
  })

  // 改进语速分析逻辑
  const analyzeSpeech = async (audioData: Float32Array) => {
    try {
      let sum = 0
      let count = 0
      
      const threshold = 0.02
      
      for (let i = 0; i < audioData.length; i++) {
        if (Math.abs(audioData[i]) > threshold) {
          sum += Math.abs(audioData[i])
          count++
        }
      }
      
      const volume = count > 0 ? sum / count : 0
      
      // 调整WPM计算
      const baseWPM = userPreferences.value.targetWPM
      const volumeScale = 1000
      
      // 修正：根据音量调整WPM，使其围绕目标值波动
      let newWPM = baseWPM * (1 + (volume * volumeScale / baseWPM - 0.5))
      
      // 限制WPM的范围
      newWPM = Math.max(
        Math.min(newWPM, baseWPM * 1.5),
        baseWPM * 0.5
      )
      
      // 应用平滑处理
      newWPM = lastWPM * (1 - smoothingFactor) + newWPM * smoothingFactor
      lastWPM = newWPM
      
      currentWPM.value = Math.round(newWPM)
    } catch (error) {
      console.error('Speech analysis failed:', error)
      currentWPM.value = userPreferences.value.targetWPM
    }
  }

  // 加载用户设置
  const loadPreferences = () => {
    const saved = localStorage.getItem('playbackPreferences')
    if (saved) {
      userPreferences.value = JSON.parse(saved)
    }
  }

  // 保存用户设置
  const savePreferences = () => {
    localStorage.setItem('playbackPreferences', JSON.stringify(userPreferences.value))
  }

  // 重置状态
  const reset = () => {
    currentWPM.value = 0
    currentSpeed.value = 1
    lastWPM = 0
    isAutoSpeedEnabled.value = false
  }

  return {
    isAutoSpeedEnabled,
    currentWPM,
    currentSpeed,
    userPreferences,
    suggestedSpeed,
    analyzeSpeech,
    loadPreferences,
    savePreferences,
    reset
  }
}) 