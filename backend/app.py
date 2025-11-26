import json
import boto3
import os
import uuid
from datetime import datetime

# Conectar con DynamoDB
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('TABLE_NAME')
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    # 1. Generar ID y Fecha
    task_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat()

    # 2. Datos a guardar
    item = {
        'userId': 'usuario_demo',
        'taskId': task_id,
        'description': 'Mi primera tarea automática',
        'createdAt': timestamp,
        'status': 'pending'
    }

    # 3. Intentar guardar en Base de Datos
    try:
        table.put_item(Item=item)
        
        return {
            'statusCode': 201,
            'body': json.dumps({
                'message': 'Tarea creada con éxito',
                'taskId': task_id
            })
        }
    except Exception as e:
        # Aquí capturamos el error real si falla
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
