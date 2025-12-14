import json
import boto3
import os

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['TABLE_NAME']
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    try:
        # Obtener el ID de la tarea desde la URL (pathParameters)
        task_id = event['pathParameters']['taskId']
        
        user_id = event['requestContext']['authorizer']['claims']['sub']
        # Actualizar el estado en DynamoDB
        response = table.update_item(
            Key={
                'userId': user_id,
                'taskId': task_id
            },
            UpdateExpression="set #s = :s",
            ExpressionAttributeNames={
                '#s': 'status'
            },
            ExpressionAttributeValues={
                ':s': 'completed'
            },
            ReturnValues="UPDATED_NEW"
        )

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,PUT"
            },
            "body": json.dumps({"message": "Tarea completada", "updated": response})
        }
    except Exception as e:
        print(e)
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": str(e)})
        }
