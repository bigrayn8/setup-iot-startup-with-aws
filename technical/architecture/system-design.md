# 系統設計規範

## 技術棧選型

### 後端
| 層級 | 技術 | 說明 |
|------|------|------|
| 無伺服器 API | AWS Lambda + Node.js 20 / Python 3.12 | 主要業務邏輯 |
| 容器服務 | AWS ECS Fargate | 長時間執行服務 |
| 資料庫 | DynamoDB + RDS PostgreSQL | NoSQL + 關聯式 |
| 快取 | ElastiCache Redis | 即時資料快取 |
| 訊息佇列 | SQS + SNS | 非同步通訊 |

### 前端
| 類型 | 技術 | 說明 |
|------|------|------|
| Web Dashboard | React 18 + TypeScript | 管理後台 |
| 行動 App | React Native | iOS / Android |
| 即時圖表 | Recharts / Apache ECharts | 資料視覺化 |
| 狀態管理 | Zustand / TanStack Query | 前端狀態 |

### IoT 韌體
| 平台 | 語言 | SDK |
|------|------|-----|
| ESP32 | C/C++ | AWS IoT Device SDK for Embedded C |
| Raspberry Pi | Python | AWS IoT Device SDK v2 for Python |
| Industrial PC | Python/Node.js | AWS Greengrass SDK |

---

## API 設計規範

### REST API 端點結構
```
/api/v1/
├── /devices              # 設備管理
│   ├── GET    /          # 列出設備
│   ├── POST   /          # 新增設備
│   ├── GET    /{id}      # 設備詳情
│   ├── PUT    /{id}      # 更新設備
│   └── DELETE /{id}      # 刪除設備
├── /telemetry            # 遙測資料
│   ├── GET    /          # 查詢歷史資料
│   └── POST   /          # 手動上傳
├── /alerts               # 警報管理
├── /reports              # 報表
└── /users                # 用戶管理
```

### WebSocket 即時事件
```
ws://api.example.com/ws
Events:
- device.telemetry      # 即時感測資料
- device.status         # 設備狀態變化
- alert.triggered       # 警報觸發
- command.response      # 指令回應
```

---

## 資料模型設計

### DynamoDB 主表設計（單表設計）
```
Table: IoTStartup-{env}

PK (partition key): 實體類型前綴
SK (sort key): 子項目識別

範例：
PK: DEVICE#esp32-001       SK: METADATA
PK: DEVICE#esp32-001       SK: TELEMETRY#2026-03-12T10:00:00Z
PK: USER#user-123          SK: PROFILE
PK: ALERT#alert-456        SK: 2026-03-12T10:05:00Z
```

### 索引設計
- GSI1: 依組織查詢設備 (orgId / createdAt)
- GSI2: 依設備查詢最新遙測 (deviceId / timestamp)

---

## 安全設計

### 認證授權
```
用戶認證: Amazon Cognito User Pool
  ├── JWT Token (access / refresh / id)
  ├── MFA 支援
  └── 社交登入 (Google, Microsoft)

設備認證: AWS IoT Core
  ├── X.509 憑證
  ├── 政策（Policy）：最小權限
  └── 設備憑證輪換機制
```

### 資料加密
- 傳輸中：TLS 1.3
- 靜止中：AWS KMS 金鑰加密（DynamoDB, S3, RDS）
- 敏感欄位：應用層加密

---

## 多租戶設計

```
租戶隔離策略：
├── 資料隔離：DynamoDB tenantId partition key
├── API 隔離：API Gateway 使用量方案
├── 設備隔離：IoT Core Thing Group
└── 儀表板隔離：Cognito User Pool 群組
```

---

## 效能目標

| 指標 | 目標值 |
|------|--------|
| API 回應時間 | P99 < 500ms |
| IoT 資料延遲 | < 1 秒端對端 |
| 儀表板更新頻率 | 每 5 秒 |
| 系統可用性 | 99.9% SLA |
| 資料保留期 | 原始資料 1 年，彙總資料 5 年 |
