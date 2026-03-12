import { useState, useEffect } from 'react'

export interface Device {
  id: string
  name: string
  type: '製造' | '建築' | '農業'
  status: 'online' | 'offline' | 'warning'
  temperature: number
  humidity: number
  lastSeen: string
}

export interface Alert {
  id: string
  deviceId: string
  deviceName: string
  metric: string
  value: number
  threshold: number
  severity: 'high' | 'medium' | 'low'
  time: string
  resolved: boolean
}

const DEVICES: Device[] = [
  { id: 'd1', name: 'CNC機台-A01', type: '製造', status: 'online', temperature: 72, humidity: 45, lastSeen: '剛剛' },
  { id: 'd2', name: 'CNC機台-A02', type: '製造', status: 'warning', temperature: 89, humidity: 50, lastSeen: '1分鐘前' },
  { id: 'd3', name: '空調感測-B01', type: '建築', status: 'online', temperature: 24, humidity: 62, lastSeen: '剛剛' },
  { id: 'd4', name: '能源計-B02', type: '建築', status: 'online', temperature: 28, humidity: 58, lastSeen: '2分鐘前' },
  { id: 'd5', name: '土壤感測-F01', type: '農業', status: 'online', temperature: 22, humidity: 78, lastSeen: '剛剛' },
  { id: 'd6', name: '氣象站-F02', type: '農業', status: 'offline', temperature: 0, humidity: 0, lastSeen: '30分鐘前' },
]

const ALERTS: Alert[] = [
  { id: 'a1', deviceId: 'd2', deviceName: 'CNC機台-A02', metric: '溫度', value: 89, threshold: 85, severity: 'high', time: '10:32', resolved: false },
  { id: 'a2', deviceId: 'd5', deviceName: '土壤感測-F01', metric: '土壤濕度', value: 18, threshold: 20, severity: 'medium', time: '09:15', resolved: false },
  { id: 'a3', deviceId: 'd6', deviceName: '氣象站-F02', metric: '連線狀態', value: 0, threshold: 1, severity: 'high', time: '09:00', resolved: false },
  { id: 'a4', deviceId: 'd3', deviceName: '空調感測-B01', metric: 'CO₂濃度', value: 850, threshold: 800, severity: 'low', time: '昨天 18:00', resolved: true },
]

function randomDelta(base: number, range: number) {
  return +(base + (Math.random() - 0.5) * range).toFixed(1)
}

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>(DEVICES)

  useEffect(() => {
    const id = setInterval(() => {
      setDevices(prev => prev.map(d =>
        d.status === 'offline' ? d : {
          ...d,
          temperature: randomDelta(d.temperature, 2),
          humidity: randomDelta(d.humidity, 3),
        }
      ))
    }, 3000)
    return () => clearInterval(id)
  }, [])

  return devices
}

export function useAlerts() {
  return ALERTS
}

export function useTelemetryHistory(deviceId: string) {
  const [history, setHistory] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      time: `${10 + i}:00`,
      temperature: randomDelta(60 + Math.random() * 30, 5),
      humidity: randomDelta(50 + Math.random() * 20, 5),
    }))
  )

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date()
      setHistory(prev => [
        ...prev.slice(-11),
        {
          time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
          temperature: randomDelta(prev[prev.length - 1].temperature, 3),
          humidity: randomDelta(prev[prev.length - 1].humidity, 4),
        },
      ])
    }, 3000)
    return () => clearInterval(id)
  }, [deviceId])

  return history
}
