import logging
import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('🔄 Python HTTP trigger function processed a request.')

    return func.HttpResponse("Python function is live!", status_code=200)
