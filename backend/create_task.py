import json
import boto3
import os
import uuid
import datetime

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['TABLE_NAME']
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    print("EVENTO:", json.dumps(event)) # Para ver en CloudWatch si algo falla

    try:
        # 1. Obtener datos del cuerpo
        body = json.loads(event['body'])
        description = body.get('description')
        
        # 2. Obtener ID del usuario desde Cognito
        # El Authorizer de Cognito pone los datos en requestContext -> authorizer -> claims
        try:
            user_id = event['requestContext']['authorizer']['claims']['sub']
        except KeyError:
            # Fallback por si acaso (para pruebas locales o errores de config)
            print("No se encontró usuario en authorizer, usando fallback")
            user_id = "usuario_desconocido"

        # 3. Crear ítem
        task_id = str(uuid.uuid4())
        timestamp = datetime.datetime.now().isoformat()
        
        item = {
            'userId': user_id,
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
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            "body": json.dumps({"message": "Tarea creada", "taskId": task_id})
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            "statusCode": 500,
            "headers": { "Access-Control-Allow-Origin": "*" },
            "body": json.dumps({"error": str(e)})
        }
