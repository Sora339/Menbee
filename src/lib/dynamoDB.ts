import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// export async function getTokenFromDynamoDB(email: string) {
//   const params = {
//     TableName: "GoogleTokens",
//     Key: {
//       email: { S: email },
//     },
//   };

//   try {
//     const { Item } = await client.send(new GetItemCommand(params));
//     if (!Item) return null;

//     return {
//       accessToken: Item.accessToken.S,
//       refreshToken: Item.refreshToken.S,
//     };
//   } catch (error) {
//     console.error("❌ Failed to fetch token from DynamoDB", error);
//     return null;
//   }
// }

export async function saveTokenToDynamoDB(email: string, accessToken: string, refreshToken: string) {
  const params = {
    TableName: "GoogleTokens",
    Item: {
      email: { S: email },
      accessToken: { S: accessToken },
      refreshToken: { S: refreshToken },
    },
  };

  try {
    await client.send(new PutItemCommand(params));
    console.log("✅ Successfully saved tokens to DynamoDB");
  } catch (error) {
    console.error("❌ Failed to save tokens to DynamoDB", error);
  }
}


  export async function refreshAccessToken(email: string, refreshToken?: string) {
    if (!refreshToken) {
      console.error("❌ refreshToken is missing, cannot refresh access token.");
      return null;
    }
  
    try {
      console.log("🔄 Refreshing access token...");
  
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.AUTH_GOOGLE_ID!,
          client_secret: process.env.AUTH_GOOGLE_SECRET!,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });
  
      const newTokens = await response.json();
      if (!response.ok) throw newTokens;
  
      console.log("✅ New access token:", newTokens.access_token);
  
      await saveTokenToDynamoDB(email, newTokens.access_token, refreshToken);
      return newTokens.access_token;
    } catch (error) {
      console.error("❌ Error refreshing access token:", error);
      return null;
    }
  }
  
  