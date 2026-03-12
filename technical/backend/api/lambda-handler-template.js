/**
 * AWS Lambda Handler Template
 * IoT Startup - REST API Handler
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(ddbClient);

const TABLE_NAME = process.env.TABLE_NAME;

// ============================================================
// 回應格式工具
// ============================================================
const response = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    ...headers,
  },
  body: JSON.stringify(body),
});

const success = (data, meta = {}) => response(200, { success: true, data, ...meta });
const created = (data) => response(201, { success: true, data });
const notFound = (msg = 'Not found') => response(404, { success: false, error: msg });
const badRequest = (msg) => response(400, { success: false, error: msg });
const serverError = (msg = 'Internal server error') => response(500, { success: false, error: msg });

// ============================================================
// 設備管理 Handler
// ============================================================
const getDevice = async (deviceId, tenantId) => {
  const result = await ddb.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `DEVICE#${deviceId}`,
      SK: 'METADATA',
    },
  }));

  if (!result.Item || result.Item.tenantId !== tenantId) return null;
  return result.Item;
};

const listDevices = async (tenantId, limit = 20, lastKey = null) => {
  const params = {
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'orgId = :orgId',
    ExpressionAttributeValues: { ':orgId': tenantId },
    Limit: limit,
  };
  if (lastKey) params.ExclusiveStartKey = JSON.parse(Buffer.from(lastKey, 'base64').toString());

  const result = await ddb.send(new QueryCommand(params));
  return {
    items: result.Items,
    nextToken: result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
      : null,
  };
};

// ============================================================
// 主 Handler
// ============================================================
exports.handler = async (event) => {
  const { httpMethod, pathParameters, queryStringParameters, body, requestContext } = event;

  // 從 Cognito JWT 取得租戶 ID
  const tenantId = requestContext?.authorizer?.claims?.['custom:tenantId'];
  if (!tenantId) return response(401, { error: 'Unauthorized' });

  try {
    // GET /devices
    if (httpMethod === 'GET' && !pathParameters?.id) {
      const { limit, nextToken } = queryStringParameters || {};
      const result = await listDevices(tenantId, parseInt(limit) || 20, nextToken);
      return success(result.items, { nextToken: result.nextToken });
    }

    // GET /devices/{id}
    if (httpMethod === 'GET' && pathParameters?.id) {
      const device = await getDevice(pathParameters.id, tenantId);
      if (!device) return notFound('Device not found');
      return success(device);
    }

    // POST /devices
    if (httpMethod === 'POST') {
      const payload = JSON.parse(body);
      if (!payload.deviceId || !payload.name) return badRequest('deviceId and name are required');

      const item = {
        PK: `DEVICE#${payload.deviceId}`,
        SK: 'METADATA',
        tenantId,
        orgId: tenantId,
        deviceId: payload.deviceId,
        name: payload.name,
        type: payload.type || 'sensor',
        status: 'inactive',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
      return created(item);
    }

    return notFound();
  } catch (err) {
    console.error('Handler error:', err);
    return serverError();
  }
};
