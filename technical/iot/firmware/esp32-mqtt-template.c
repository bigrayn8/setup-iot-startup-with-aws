/**
 * ESP32 AWS IoT Core MQTT 連線範本
 * 使用 AWS IoT Device SDK for Embedded C
 *
 * 功能：
 * - X.509 憑證認證
 * - MQTT 遙測資料發布
 * - 設備影子（Device Shadow）同步
 * - OTA 更新支援
 */

#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "nvs_flash.h"
#include "mqtt_client.h"
#include "esp_tls.h"
#include "cJSON.h"

// ============================================================
// 設定（實際部署時從 NVS 或 KConfig 讀取）
// ============================================================
#define AWS_IOT_ENDPOINT     "xxxxxxxx-ats.iot.ap-northeast-1.amazonaws.com"
#define AWS_IOT_PORT         8883
#define DEVICE_ID            "esp32-001"
#define TENANT_ID            "tenant-abc"
#define TELEMETRY_INTERVAL_MS 5000   // 5 秒上報一次

// MQTT Topics
#define TOPIC_TELEMETRY      "iot/" TENANT_ID "/" DEVICE_ID "/telemetry"
#define TOPIC_COMMAND        "iot/" TENANT_ID "/" DEVICE_ID "/command"
#define TOPIC_SHADOW_UPDATE  "$aws/things/" DEVICE_ID "/shadow/update"
#define TOPIC_SHADOW_GET     "$aws/things/" DEVICE_ID "/shadow/get"

// ============================================================
// 模擬感測器讀取（實際替換為真實感測器 API）
// ============================================================
typedef struct {
    float temperature;
    float humidity;
    float vibration;
    float voltage;
    int   rssi;
} sensor_data_t;

static sensor_data_t read_sensors(void) {
    sensor_data_t data = {
        .temperature = 25.5f + (rand() % 100) / 10.0f,
        .humidity    = 60.0f + (rand() % 200) / 10.0f,
        .vibration   = (rand() % 50) / 10.0f,
        .voltage     = 220.0f + (rand() % 20) - 10,
        .rssi        = -65,
    };
    return data;
}

// ============================================================
// MQTT 事件處理
// ============================================================
static void mqtt_event_handler(void *args, esp_event_base_t base,
                                int32_t event_id, void *event_data) {
    esp_mqtt_event_handle_t event = event_data;

    switch (event->event_id) {
        case MQTT_EVENT_CONNECTED:
            printf("[MQTT] Connected to AWS IoT Core\n");
            // 訂閱命令 Topic
            esp_mqtt_client_subscribe(event->client, TOPIC_COMMAND, 1);
            // 取得設備影子
            esp_mqtt_client_publish(event->client, TOPIC_SHADOW_GET, "", 0, 1, 0);
            break;

        case MQTT_EVENT_DISCONNECTED:
            printf("[MQTT] Disconnected, will reconnect...\n");
            break;

        case MQTT_EVENT_DATA:
            printf("[MQTT] Received on topic: %.*s\n", event->topic_len, event->topic);
            // 處理遠端命令（例：開關繼電器）
            cJSON *cmd = cJSON_ParseWithLength(event->data, event->data_len);
            if (cmd) {
                cJSON *action = cJSON_GetObjectItem(cmd, "action");
                if (cJSON_IsString(action)) {
                    printf("[CMD] Action: %s\n", action->valuestring);
                    // TODO: 執行對應動作
                }
                cJSON_Delete(cmd);
            }
            break;

        default:
            break;
    }
}

// ============================================================
// 遙測發布任務
// ============================================================
static void telemetry_task(void *pvParameters) {
    esp_mqtt_client_handle_t client = (esp_mqtt_client_handle_t)pvParameters;
    char payload[512];

    while (1) {
        sensor_data_t data = read_sensors();

        // 建構 JSON payload
        cJSON *root = cJSON_CreateObject();
        cJSON_AddStringToObject(root, "deviceId", DEVICE_ID);
        cJSON_AddStringToObject(root, "tenantId", TENANT_ID);
        cJSON_AddNumberToObject(root, "temperature", data.temperature);
        cJSON_AddNumberToObject(root, "humidity", data.humidity);
        cJSON_AddNumberToObject(root, "vibration", data.vibration);
        cJSON_AddNumberToObject(root, "voltage", data.voltage);
        cJSON_AddNumberToObject(root, "rssi", data.rssi);

        char *json_str = cJSON_PrintUnformatted(root);
        snprintf(payload, sizeof(payload), "%s", json_str);
        cJSON_free(json_str);
        cJSON_Delete(root);

        int msg_id = esp_mqtt_client_publish(client, TOPIC_TELEMETRY, payload, 0, 1, 0);
        printf("[TELEMETRY] Published (msg_id=%d): temp=%.1f°C, humidity=%.1f%%\n",
               msg_id, data.temperature, data.humidity);

        vTaskDelay(TELEMETRY_INTERVAL_MS / portTICK_PERIOD_MS);
    }
}

// ============================================================
// 主函數
// ============================================================
void app_main(void) {
    nvs_flash_init();
    esp_netif_init();
    esp_event_loop_create_default();

    // WiFi 初始化（省略細節）
    // wifi_init_sta(WIFI_SSID, WIFI_PASSWORD);

    // MQTT over TLS 設定
    esp_mqtt_client_config_t mqtt_cfg = {
        .broker = {
            .address.uri = "mqtts://" AWS_IOT_ENDPOINT,
            .address.port = AWS_IOT_PORT,
        },
        .credentials = {
            .client_id = DEVICE_ID,
            // 憑證從 NVS 讀取（生產環境）
            // .authentication.certificate = device_cert,
            // .authentication.key = device_key,
        },
    };

    esp_mqtt_client_handle_t client = esp_mqtt_client_init(&mqtt_cfg);
    esp_mqtt_client_register_event(client, ESP_EVENT_ANY_ID, mqtt_event_handler, NULL);
    esp_mqtt_client_start(client);

    // 等待連線後啟動遙測任務
    vTaskDelay(2000 / portTICK_PERIOD_MS);
    xTaskCreate(telemetry_task, "telemetry", 4096, client, 5, NULL);
}
