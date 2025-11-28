import json
import boto3
import os

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['TABLE_NAME']
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    try:
        # Obtenemos el ID de la URL (ej: /tasks/123)
        task_id = event['pathParameters']['taskId']
        
        # Borramos el item
        table.delete_item(
            Key={
                'userId': 'usuario_demo', # Hardcoded por ahora
                'taskId': task_id
            }
        )

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE,PUT"
            },
            "body": json.dumps({"message": "Tarea eliminada"})
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": { "Access-Control-Allow-Origin": "*" },
            "body": json.dumps({"error": str(e)})
        }
