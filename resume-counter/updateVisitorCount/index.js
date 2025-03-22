const { CosmosClient } = require("@azure/cosmos");

module.exports = async function (context, req) {
  try {
    const endpoint = process.env.COSMOS_DB_ENDPOINT;
    const key = process.env.COSMOS_DB_KEY;
    const databaseId = "resumevisits";
    const containerId = "counter";

    const client = new CosmosClient({ endpoint, key });
    const database = client.database(databaseId);
    const container = database.container(containerId);

    const { resource } = await container.item("visitorCount", "visitorCount").read();
    const newCount = (resource.count || 0) + 1;
    resource.count = newCount;

    await container.items.upsert(resource);

    context.res = {
      status: 200,
      body: { count: newCount },
      headers: {
        "Content-Type": "application/json"
      }
    };
  } catch (error) {
    context.log.error("🔥 Error:", error.message);
    context.res = {
      status: 500,
      body: { error: `Something went wrong: ${error.message}` }
    };
  }
};
