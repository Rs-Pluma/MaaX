import logger from '@/hooks/caller/logger'
import useDeviceStore from '@/store/devices'
import useSettingStore from '@/store/settings'
import useTaskStore from '@/store/tasks'
import type { Device } from '@type/device'
import type { GetTask, Task } from '@type/task'

import { showMessage } from './message'
import { convertToCoreTaskConfiguration } from './task_helper'

let selfIncreasedId = 1000000
const genUiTaskId = (): number => {
  selfIncreasedId += 1
  return selfIncreasedId
}

export async function runStartEmulator(uuid: string, task: GetTask<'Emulator'>): Promise<void> {
  const taskStore = useTaskStore()
  const deviceStore = useDeviceStore()
  const device = deviceStore.getDevice(uuid) as Device
  task.task_id = genUiTaskId()
  // 不await
  taskStore.updateTaskStatus(uuid, task.task_id, 'processing', 0)
  window.main.DeviceDetector.startEmulator(
    device.commandLine as string // 前置检查
  )
}

async function runTaskEmulator(uuid: string, task: GetTask<'Emulator'>): Promise<void> {
  const taskStore = useTaskStore()
  const settingStore = useSettingStore()
  const deviceStore = useDeviceStore()
  const device = deviceStore.getDevice(uuid) as Device
  task.task_id = genUiTaskId()
  taskStore.updateTaskStatus(uuid, task.task_id, 'processing', 0)
  window.main.DeviceDetector.startEmulator(device.commandLine as string)
  task.schedule_id = setTimeout(async () => {
    // FIXME: Emulator无法转换为Device
    const devices: Device[] = await window.main.DeviceDetector.getEmulators() // 等待时间结束后进行一次设备搜索，但不合并结果
    const device = devices.find(device => device.uuid === uuid) // 检查指定uuid的设备是否存在
    if (device) {
      // 设备活了
      logger.silly(`[runTaskEmulator] Emulator is alive, uuid: ${uuid}, address: ${device.address}`)
      deviceStore.updateDeviceStatus(uuid, 'waitingTask') // 修改状态为等待任务, 等连上后直接开始任务
      await window.main.CoreLoader.initCoreAsync({
        // 创建连接
        address: device.address,
        uuid: device.uuid,
        adb_path: device.adbPath,
        config: device.config,
        touch_mode: settingStore.touchMode,
      })
      taskStore.updateTaskStatus(uuid, task.task_id, 'success', 0)
    } else {
      // 设备没活
      taskStore.updateTaskStatus(uuid, task.task_id, 'exception', 0)
      showMessage('启动设备失败', {
        type: 'error',
        duration: 0,
        closable: true,
      })
    }
  }, task.configurations.delay * 1000)
}

async function runTaskShutdown(uuid: string, task: Task): Promise<void> {
  const taskStore = useTaskStore()
  // TODO
}

export async function runTasks(uuid: string): Promise<void> {
  const taskStore = useTaskStore()
  const tasks = taskStore.getCurrentTaskGroup(uuid)?.tasks
  // 寻找第一个可用的任务
  const task = tasks?.find(task => task.enable && task.status === 'idle')
  if (task) {
    switch (task.name) {
      case 'Emulator': {
        await runTaskEmulator(uuid, task)
        break
      }
      case 'Shutdown': {
        break
      }
      default: {
        // default -> core tasks
        const initStatus = await window.main.CoreLoader.isCoreInited({ uuid })
        if (!initStatus) {
          showMessage(
            `设备信息未知, 如果你希望自启动模拟器开始任务, 请在游戏任务前配置 '启动模拟器' 任务`,
            { type: 'error', duration: 0, closable: true }
          )
          const deviceStore = useDeviceStore()
          deviceStore.updateDeviceStatus(uuid, 'unknown')
          return
        }
        task.status = 'waiting'
        const taskId = await window.main.CoreLoader.appendTask({
          uuid: uuid,
          type: task.name,
          params: convertToCoreTaskConfiguration(task.name, task),
        })
        if (taskId !== 0) {
          task.task_id = taskId
        }
        await runTasks(uuid)
        break
      }
    }
  } else {
    // 无任务, 认为可以开始执行了
    await window.main.CoreLoader.start({ uuid })
  }
}
