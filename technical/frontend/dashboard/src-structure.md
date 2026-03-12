# React Dashboard 前端架構

## 技術棧
- React 18 + TypeScript 5
- Vite (建置工具)
- TanStack Query v5 (資料請求/快取)
- Zustand (全域狀態)
- Recharts / ECharts (資料視覺化)
- AWS Amplify (Cognito 認證 + API)
- Tailwind CSS + shadcn/ui

## 目錄結構

```
src/
├── main.tsx
├── App.tsx
├── aws-exports.ts            # AWS Amplify 設定
│
├── features/                 # 功能模組（按場域）
│   ├── manufacturing/        # 智慧製造
│   │   ├── pages/
│   │   │   ├── FactoryOverview.tsx
│   │   │   └── EquipmentDetail.tsx
│   │   └── components/
│   │       ├── VibrationChart.tsx
│   │       └── MaintenanceAlert.tsx
│   │
│   ├── building/             # 智慧建築
│   │   ├── pages/
│   │   │   ├── BuildingDashboard.tsx
│   │   │   └── EnergyMonitor.tsx
│   │   └── components/
│   │       ├── FloorMap.tsx
│   │       └── EnergyChart.tsx
│   │
│   └── agriculture/          # 農業監測
│       ├── pages/
│       │   ├── FarmDashboard.tsx
│       │   └── SensorMap.tsx
│       └── components/
│           ├── SoilMoistureGauge.tsx
│           └── WeatherWidget.tsx
│
├── shared/                   # 共用元件
│   ├── components/
│   │   ├── DeviceCard.tsx
│   │   ├── AlertBadge.tsx
│   │   ├── TelemetryChart.tsx    # 通用即時圖表
│   │   ├── DeviceStatusTable.tsx
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       ├── Header.tsx
│   │       └── MainLayout.tsx
│   ├── hooks/
│   │   ├── useDevices.ts         # 設備資料 hook
│   │   ├── useTelemetry.ts       # 遙測資料 hook
│   │   ├── useAlerts.ts          # 警報 hook
│   │   └── useWebSocket.ts       # 即時連線 hook
│   └── api/
│       ├── devices.ts
│       ├── telemetry.ts
│       └── alerts.ts
│
├── store/                    # Zustand 全域狀態
│   ├── authStore.ts
│   ├── deviceStore.ts
│   └── alertStore.ts
│
└── lib/
    ├── amplify.ts            # AWS Amplify 初始化
    ├── queryClient.ts        # TanStack Query 設定
    └── utils.ts
```

## 核心 Hook 範例

### useDevices.ts
```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchDevices } from '../api/devices';

export const useDevices = (tenantId: string) =>
  useQuery({
    queryKey: ['devices', tenantId],
    queryFn: () => fetchDevices(tenantId),
    staleTime: 30_000,  // 30 秒快取
  });
```

### useWebSocket.ts（即時遙測）
```typescript
import { useEffect, useCallback } from 'react';
import { useDeviceStore } from '../store/deviceStore';

export const useWebSocket = (deviceIds: string[]) => {
  const updateTelemetry = useDeviceStore(s => s.updateTelemetry);

  useEffect(() => {
    // 使用 AWS AppSync WebSocket 訂閱
    const subscriptions = deviceIds.map(id =>
      subscribeToTelemetry(id, (data) => updateTelemetry(id, data))
    );
    return () => subscriptions.forEach(s => s.unsubscribe());
  }, [deviceIds]);
};
```

## 即時儀表板頁面規劃

### 製造業 - 設備監控儀表板
- 即時振動/溫度趨勢圖
- OEE（設備效率）指標
- 預測維護排程
- 異常警報清單

### 建築 - 能源管理儀表板
- 樓層平面圖（設備位置熱圖）
- 即時用電量/碳排放
- 溫控設備遠端控制
- 月度能耗報表

### 農業 - 環境監測儀表板
- 感測器地圖（衛星圖層）
- 土壤濕度/溫度趨勢
- 自動灌溉控制
- 天氣預報整合
