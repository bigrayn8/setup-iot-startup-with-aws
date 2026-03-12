"""
IoT Rule Engine 資料處理器
觸發來源：AWS IoT Core Rule Engine -> Lambda

處理流程：
1. 接收設備遙測資料
2. 異常偵測與警報
3. 寫入 DynamoDB
4. 推送 SNS 通知
"""

import json
import os
import boto3
from datetime import datetime, timezone
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')
table = dynamodb.Table(os.environ['TABLE_NAME'])
ALERT_TOPIC_ARN = os.environ['ALERT_TOPIC_ARN']


# ============================================================
# 閾值設定（可移至 DynamoDB 動態設定）
# ============================================================
THRESHOLDS = {
    'temperature': {'min': -10, 'max': 85, 'unit': '°C'},
    'humidity': {'min': 0, 'max': 100, 'unit': '%'},
    'pressure': {'min': 800, 'max': 1200, 'unit': 'hPa'},
    'vibration': {'max': 10, 'unit': 'g'},
    'current': {'max': 20, 'unit': 'A'},
    'voltage': {'min': 180, 'max': 260, 'unit': 'V'},
    'soil_moisture': {'min': 20, 'max': 80, 'unit': '%'},
    'co2': {'max': 1000, 'unit': 'ppm'},
}


def check_anomaly(metric: str, value: float) -> dict | None:
    """
    檢查數值是否超出閾值
    返回 None 表示正常，返回 dict 表示異常
    """
    threshold = THRESHOLDS.get(metric)
    if not threshold:
        return None

    if 'min' in threshold and value < threshold['min']:
        return {
            'type': 'LOW',
            'metric': metric,
            'value': value,
            'threshold': threshold['min'],
            'unit': threshold.get('unit', ''),
        }
    if 'max' in threshold and value > threshold['max']:
        return {
            'type': 'HIGH',
            'metric': metric,
            'value': value,
            'threshold': threshold['max'],
            'unit': threshold.get('unit', ''),
        }
    return None


def save_telemetry(device_id: str, tenant_id: str, payload: dict, timestamp: str):
    """寫入遙測資料至 DynamoDB"""
    table.put_item(Item={
        'PK': f'DEVICE#{device_id}',
        'SK': f'TELEMETRY#{timestamp}',
        'tenantId': tenant_id,
        'deviceId': device_id,
        'timestamp': timestamp,
        'metrics': {k: Decimal(str(v)) for k, v in payload.items()
                    if isinstance(v, (int, float))},
        'ttl': int(datetime.now(timezone.utc).timestamp()) + (365 * 24 * 3600),  # 1 年 TTL
    })


def save_alert(device_id: str, tenant_id: str, anomaly: dict, timestamp: str):
    """寫入警報至 DynamoDB"""
    alert_id = f'alert-{device_id}-{timestamp}'
    table.put_item(Item={
        'PK': f'ALERT#{alert_id}',
        'SK': timestamp,
        'tenantId': tenant_id,
        'alertId': alert_id,
        'deviceId': device_id,
        'status': 'OPEN',
        'severity': 'HIGH' if anomaly['type'] in ('HIGH', 'LOW') else 'MEDIUM',
        **anomaly,
        'createdAt': timestamp,
    })
    return alert_id


def send_alert_notification(device_id: str, anomaly: dict, alert_id: str):
    """透過 SNS 發送警報通知"""
    message = {
        'alertId': alert_id,
        'deviceId': device_id,
        'message': (
            f"設備 {device_id} 異常：{anomaly['metric']} = "
            f"{anomaly['value']}{anomaly['unit']} "
            f"（閾值：{anomaly['threshold']}{anomaly['unit']}）"
        ),
        **anomaly,
    }
    sns.publish(
        TopicArn=ALERT_TOPIC_ARN,
        Message=json.dumps(message, ensure_ascii=False),
        Subject=f'IoT Alert - {device_id}',
        MessageAttributes={
            'alertType': {'DataType': 'String', 'StringValue': anomaly['type']},
        }
    )


def lambda_handler(event, context):
    """
    IoT Rule Engine 觸發
    event 格式：
    {
        "deviceId": "esp32-001",
        "tenantId": "tenant-abc",
        "timestamp": "2026-03-12T10:00:00Z",
        "temperature": 85.5,
        "humidity": 60.2,
        "vibration": 0.5
    }
    """
    timestamp = event.get('timestamp', datetime.now(timezone.utc).isoformat())
    device_id = event.get('deviceId')
    tenant_id = event.get('tenantId')

    if not device_id or not tenant_id:
        print(f"Missing deviceId or tenantId: {event}")
        return {'statusCode': 400, 'error': 'Missing deviceId or tenantId'}

    # 儲存遙測資料
    save_telemetry(device_id, tenant_id, event, timestamp)

    # 異常偵測
    alerts = []
    for metric, value in event.items():
        if not isinstance(value, (int, float)):
            continue
        anomaly = check_anomaly(metric, value)
        if anomaly:
            alert_id = save_alert(device_id, tenant_id, anomaly, timestamp)
            send_alert_notification(device_id, anomaly, alert_id)
            alerts.append(alert_id)
            print(f"Alert created: {alert_id} for device {device_id}")

    print(f"Processed telemetry for {device_id}, alerts: {len(alerts)}")
    return {'statusCode': 200, 'alertsCreated': len(alerts)}
