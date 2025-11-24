import json
import boto3
import os
import uuid
from datetime import datetime

# Conectar con DynamoDB
dynamodb = boto3.resource('dynamodb')
# Obtenemos el nombre de la tabla desde las variables de entorno (configuración)
table_name = os.environ.get('TABLE_NAME')
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    # 1. Generar un ID único para la tarea y la fecha actual
    task_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat()

    # 2. Preparar los datos a guardar
    # (En el futuro estos vendrán del 'event', por ahora los "quemamos" para probar)
    item = {
        'userId': 'usuario_demo',   # Simulado
        'taskId': task_id,
        'description': 'Mi primera tarea automática',
        'createdAt': timestamp,
        'status': 'pending'
    }

    # 3. Escribir en la Base de Datos
    try:
        table.put_item(Item=item)
        
        return {
            'statusCode': 201,
            'body': json.dumps({
                'message': 'Tarea creada con éxito',
                'taskId': task_id,
                'data': item
            })
        }
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'No se pudo guardar la tarea'})
        }
