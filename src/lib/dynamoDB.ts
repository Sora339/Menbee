import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function saveTokenToDynamoDB(
  email: string,
  accessToken: string,
  refreshToken: string
): Promise<void> {
  if (!email || !accessToken || !refreshToken) {
    throw new Error("Missing required parameters for saving tokens");
  }

  const params = {
    TableName: "GoogleTokens",
    Item: {
      email: { S: email },
      accessToken: { S: accessToken },
      refreshToken: { S: refreshToken },
      updatedAt: { S: new Date().toISOString() },
    },
  };

  try {
    await client.send(new PutItemCommand(params));
    console.log("✅ Tokens saved to DynamoDB for user:", email);
  } catch (error) {
    console.error("❌ Failed to save tokens to DynamoDB:", error);
    throw error;
  }
}
  