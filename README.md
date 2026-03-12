# IoT 創業專案

> **IoT + AWS 智慧化平台** | 智慧製造 × 智慧建築 × 精準農業

---

## 專案概覽

本專案為以 AWS 雲端服務為核心的 IoT SaaS 平台，支援三大應用場域的智慧監控、數據分析與遠端管理。

### 技術核心
- **IoT 連線**：AWS IoT Core + Greengrass 邊緣運算
- **後端**：AWS Lambda + DynamoDB + API Gateway（無伺服器）
- **前端**：React + TypeScript Dashboard
- **AI/ML**：SageMaker 預測維護 + 異常偵測
- **韌體**：ESP32 / Raspberry Pi + MQTT

---

## 目錄結構

```
iot-startup-project/
│
├── technical/                    # 技術文件與程式碼
│   ├── architecture/
│   │   ├── aws-iot-architecture.md   # AWS 完整架構設計
│   │   └── system-design.md          # 系統設計規範
│   ├── backend/
│   │   ├── api/
│   │   │   └── lambda-handler-template.js   # Lambda API Handler
│   │   ├── services/
│   │   │   └── iot-rule-processor.py        # IoT 資料處理器
│   │   └── lambda/
│   ├── frontend/
│   │   ├── dashboard/
│   │   │   └── src-structure.md    # React Dashboard 架構
│   │   └── mobile/
│   └── iot/
│       ├── firmware/
│       │   └── esp32-mqtt-template.c   # ESP32 韌體範本
│       ├── protocols/
│       └── edge/
│
├── operations/                   # 營運文件
│   ├── patent/
│   │   └── patent-strategy.md    # 專利申請策略
│   ├── finance/
│   │   └── financial-model.md    # 三年財務模型
│   ├── marketing/
│   │   └── go-to-market.md       # 市場進入策略
│   └── legal/
│
├── infrastructure/               # 基礎設施即程式碼
│   ├── terraform/                # AWS 資源部署（待建）
│   ├── docker/                   # 容器設定
│   └── ci-cd/                    # CI/CD Pipeline
│
└── docs/                         # 文件
    ├── api-docs/
    └── user-guides/
```

---

## 快速開始

### 前置需求
- AWS 帳號（建議新帳號 Free Tier）
- Node.js 20+ / Python 3.12+
- AWS CLI v2
- ESP-IDF（ESP32 韌體開發）

### MVP 啟動步驟

```bash
# 1. 設定 AWS CLI
aws configure

# 2. 建立 IoT Thing
aws iot create-thing --thing-name "esp32-001"

# 3. 建立並下載憑證
aws iot create-keys-and-certificate --set-as-active \
  --certificate-pem-outfile cert.pem \
  --public-key-outfile public.key \
  --private-key-outfile private.key

# 4. 安裝後端依賴
cd technical/backend
npm install

# 5. 安裝前端依賴
cd ../frontend/dashboard
npm install
npm run dev
```

---

## 路線圖

### Phase 1 - MVP（0-3個月）
- [ ] AWS IoT Core 設備連線
- [ ] 基礎 Lambda API
- [ ] React Dashboard（設備狀態）
- [ ] ESP32 韌體（溫度/濕度）
- [ ] 取得 3 個 POC 客戶

### Phase 2 - 商業化（3-9個月）
- [ ] Cognito 多租戶認證
- [ ] 告警系統（SNS + Email/SMS）
- [ ] AI 異常偵測（SageMaker）
- [ ] 行動 App（React Native）
- [ ] 取得 20 個付費客戶

### Phase 3 - 規模化（9-18個月）
- [ ] Greengrass 邊緣運算
- [ ] 多場域儀表板
- [ ] Open API（合作夥伴整合）
- [ ] 海外擴展（東南亞）

---

## 關鍵文件導覽

| 文件 | 說明 |
|------|------|
| [AWS 架構設計](technical/architecture/aws-iot-architecture.md) | 完整 AWS 服務架構與成本估算 |
| [系統設計規範](technical/architecture/system-design.md) | 技術棧、API、資料模型 |
| [前端架構](technical/frontend/dashboard/src-structure.md) | React Dashboard 目錄結構 |
| [專利策略](operations/patent/patent-strategy.md) | 申請策略、費用、時程 |
| [財務模型](operations/finance/financial-model.md) | 三年預測、融資規劃 |
| [行銷策略](operations/marketing/go-to-market.md) | ICP、競品、銷售流程 |

---

## 技術架構圖（簡版）

```
[ESP32/RPi] --MQTT--> [AWS IoT Core]
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         [DynamoDB]   [Kinesis]      [S3]
              │            │
              ▼            ▼
         [Lambda API]  [ML Pipeline]
              │
              ▼
      [API Gateway]
              │
        ┌─────┴─────┐
        ▼           ▼
  [React Web]  [Mobile App]
```

---

## 聯絡與協作

- **版本控制**：Git（建議 GitHub / AWS CodeCommit）
- **任務管理**：建議使用 Linear 或 Jira
- **文件協作**：Notion 或 Confluence

---

*建立日期：2026-03-12*
