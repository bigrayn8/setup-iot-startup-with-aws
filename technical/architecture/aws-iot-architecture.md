# AWS IoT 系統架構設計

## 架構概覽

```
[IoT 設備層] --> [邊緣運算層] --> [AWS 雲端層] --> [應用層]
```

---

## 一、IoT 設備層

### 設備類型
| 場域 | 設備範例 | 通訊協定 |
|------|----------|----------|
| 智慧製造 | 感測器、PLC、機械手臂 | MQTT, Modbus, OPC-UA |
| 智慧建築 | 溫濕度計、門禁、能源表 | MQTT, Zigbee, Z-Wave |
| 農業監測 | 土壤感測、氣象站、水位計 | MQTT, LoRaWAN, NB-IoT |

### 設備連線安全
- X.509 憑證認證（AWS IoT Core）
- TLS 1.3 加密傳輸
- 設備影子（Device Shadow）狀態同步

---

## 二、邊緣運算層（AWS Greengrass）

```
AWS IoT Greengrass Core
├── 本地 MQTT Broker
├── Lambda 函數（本地執行）
├── 串流資料本地處理
├── OTA 更新管理
└── 離線運作緩衝
```

**適用場景：** 製造業低延遲控制、農場弱網路環境

---

## 三、AWS 雲端核心架構

### 資料接入層
```
IoT 設備
    │
    ▼
AWS IoT Core
├── MQTT Broker (QoS 0/1/2)
├── IoT Rule Engine
│   ├── --> Amazon Kinesis Data Streams (高頻資料)
│   ├── --> Amazon SQS (命令佇列)
│   ├── --> Amazon DynamoDB (設備狀態)
│   └── --> Amazon S3 (原始資料歸檔)
└── Device Shadow Service
```

### 資料處理層
```
Amazon Kinesis Data Streams
    │
    ▼
AWS Lambda (串流處理)
    │
    ├── 異常偵測 --> Amazon SNS (警報通知)
    ├── 資料轉換 --> Amazon DynamoDB (即時資料)
    └── 批次寫入 --> Amazon S3 (Data Lake)
            │
            ▼
    AWS Glue (ETL 資料轉換)
            │
            ▼
    Amazon Redshift / Athena (分析查詢)
```

### AI/ML 層
```
Amazon SageMaker
├── 預測維護模型（製造）
├── 能源預測模型（建築）
└── 作物生長預測（農業）

Amazon Lookout for Equipment   # 設備異常偵測
Amazon Forecast                # 時序預測
```

### API 與後端層
```
Amazon API Gateway (REST / WebSocket)
    │
    ▼
AWS Lambda (無伺服器後端)
    │
    ├── Amazon DynamoDB (設備/用戶資料)
    ├── Amazon ElastiCache Redis (快取)
    ├── Amazon RDS PostgreSQL (業務資料)
    └── Amazon S3 (檔案儲存)
```

### 前端層
```
Amazon CloudFront (CDN)
    │
Amazon S3 (靜態網頁托管)

Amazon Cognito (用戶認證)
AWS AppSync (GraphQL 即時訂閱)
```

---

## 四、多場域架構隔離

```
AWS Organization
├── Production Account
│   ├── 製造業 VPC (10.0.0.0/16)
│   ├── 建築業 VPC (10.1.0.0/16)
│   └── 農業 VPC (10.2.0.0/16)
├── Development Account
└── Staging Account
```

---

## 五、監控與運維

| 服務 | 用途 |
|------|------|
| Amazon CloudWatch | 日誌、指標、警報 |
| AWS X-Ray | 分散式追蹤 |
| AWS CloudTrail | 稽核日誌 |
| Amazon GuardDuty | 安全威脅偵測 |

---

## 六、成本估算（月）

| 服務 | 小型 (1K設備) | 中型 (10K設備) |
|------|---------------|----------------|
| IoT Core | $5 | $50 |
| Lambda | $10 | $80 |
| DynamoDB | $20 | $150 |
| API Gateway | $15 | $100 |
| **小計** | **~$50** | **~$380** |

> 建議使用 AWS Free Tier 進行 POC 開發

---

## 七、部署順序建議

1. **Phase 1** - IoT Core + DynamoDB + Lambda（設備連線 MVP）
2. **Phase 2** - API Gateway + Cognito + 前端（Dashboard）
3. **Phase 3** - Kinesis + SageMaker（分析與 AI）
4. **Phase 4** - Greengrass（邊緣運算）+ 多租戶
