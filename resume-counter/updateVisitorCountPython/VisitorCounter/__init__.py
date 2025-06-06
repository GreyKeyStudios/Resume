# Trigger CI/CD workflow - safe change-6-6-25
import os
# ...rest of your code...
import azure.functions as func
from azure.data.tables import TableServiceClient

COSMOSDB_CONNECTION_STRING = os.environ.get('COSMOSDB_CONNECTION_STRING')
TABLE_NAME = 'VisitorCount'
PARTITION_KEY = 'counter'
ROW_KEY = 'site'

def main(req: func.HttpRequest) -> func.HttpResponse:
    # Connect to CosmosDB Table API
    service = TableServiceClient.from_connection_string(conn_str=COSMOSDB_CONNECTION_STRING)
    table_client = service.get_table_client(table_name=TABLE_NAME)

    # Try to get the current count
    try:
        entity = table_client.get_entity(partition_key=PARTITION_KEY, row_key=ROW_KEY)
        count = entity['count'] + 1
        entity['count'] = count
        table_client.update_entity(entity)
    except Exception:
        # If not found, create it
        count = 1
        entity = {'PartitionKey': PARTITION_KEY, 'RowKey': ROW_KEY, 'count': count}
        table_client.create_entity(entity)

    return func.HttpResponse(f"You are visitor #{count}", status_code=200) 