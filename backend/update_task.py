import json
import boto3
import os

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['TABLE_NAME']
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    try:
        task_id = event['pathParameters']['taskId']
        
        # Leemos el body para saber el nuevo estado
        body = json.loads(event['body'])
        new_status = body.get('status') # Esperamos {"status": "completed"}

        # Actualizamos solo el campo 'status'
        response = table.update_item(
            Key={
                'userId': 'usuario_demo',
                'taskId': task_id
            },
            UpdateExpression="set #s = :s",
            ExpressionAttributeNames={
                '#s': 'status'
            },
            ExpressionAttributeValues={
                ':s': new_status
            },
            ReturnValues="UPDATED_NEW"
        )

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE,PUT"
            },
            "body": json.dumps({"message": "Estado actualizado"})
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": { "Access-Control-Allow-Origin": "*" },
            "body": json.dumps({"error": str(e)})
        }
