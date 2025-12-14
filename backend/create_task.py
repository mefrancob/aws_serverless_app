import json
import boto3
import os
import uuid
import datetime

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['TABLE_NAME']
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    print("EVENTO:", json.dumps(event)) 

    try:
        body = json.loads(event['body'])
        
        description = body.get('description')
        details = body.get('details', '')
        priority = body.get('priority', 'normal')
        #Obtención de la fecha de vencimiento
        dueDate = body.get('dueDate', '') 
        
        try:
            user_id = event['requestContext']['authorizer']['claims']['sub']
        except KeyError:
            user_id = "usuario_desconocido"

        task_id = str(uuid.uuid4())
        timestamp = datetime.datetime.now().isoformat()
        
        item = {
            'userId': user_id,
            'taskId': task_id,
            'description': description,
            'details': details,
            'priority': priority,
            'dueDate': dueDate,  
            'status': 'pending',
            'createdAt': timestamp
        }
        
        table.put_item(Item=item)

        return {
            "statusCode": 201,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            "body": json.dumps({"message": "Tarea creada", "taskId": task_id, "item": item})
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            "statusCode": 500,
            "headers": { "Access-Control-Allow-Origin": "*" },
            "body": json.dumps({"error": str(e)})
        }
