import json
import boto3
import os
import uuid
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['TABLE_NAME']
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        description = body.get('description')
        
        task_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        item = {
            'userId': 'user_id', # Hardcoded por ahora
            'taskId': task_id,
            'description': description,
            'status': 'pending',
            'createdAt': timestamp
        }
        
        table.put_item(Item=item)

        return {
            "statusCode": 201,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
            },
            "body": json.dumps({"message": "Tarea creada", "taskId": task_id})
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": { "Access-Control-Allow-Origin": "*" },
            "body": json.dumps({"error": str(e)})
        }
