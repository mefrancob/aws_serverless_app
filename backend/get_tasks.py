import json
import boto3
import os
import base64
from decimal import Decimal
from boto3.dynamodb.conditions import Key, Attr

# Clase para manejar números de DynamoDB
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['TABLE_NAME']
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    try:
        # 1. SEGURIDAD: Obtener usuario
        try:
            user_id = event['requestContext']['authorizer']['claims']['sub']
        except KeyError:
            return {
                "statusCode": 401,
                "headers": { "Access-Control-Allow-Origin": "*" },
                "body": json.dumps({"error": "No autorizado"})
            }

        # 2. LEER PARÁMETROS (Paginación y Búsqueda)
        query_params = event.get('queryStringParameters') or {}
        limit = int(query_params.get('limit', 5))  # Límite por página
        next_token = query_params.get('nextToken')
        search_term = query_params.get('search')   # Término de búsqueda
        
        exclusive_start_key = None
        
        # Decodificar el token si existe
        if next_token:
            try:
                json_str = base64.b64decode(next_token).decode('utf-8')
                exclusive_start_key = json.loads(json_str)
            except:
                pass # Si el token falla, empezamos desde el inicio

        # 3. PREPARAR CONSULTA DYNAMODB
        query_args = {
            'KeyConditionExpression': Key('userId').eq(user_id),
            'Limit': limit
        }
        
        # Si hay búsqueda, agregamos el filtro (Search Server-Side)
        if search_term:
            query_args['FilterExpression'] = Attr('description').contains(search_term) | Attr('details').contains(search_term)

        # Si hay paginación, agregamos la llave de inicio
        if exclusive_start_key:
            query_args['ExclusiveStartKey'] = exclusive_start_key

        # Ejecutar
        response = table.query(**query_args)
        items = response.get('Items', [])

        # 4. PREPARAR RESPUESTA (Formato Nuevo)
        response_data = {
            "tasks": items,
            "nextToken": None
        }

        # Generar siguiente token si hay más datos
        if 'LastEvaluatedKey' in response:
            last_key_json = json.dumps(response['LastEvaluatedKey'], cls=DecimalEncoder)
            encoded_token = base64.b64encode(last_key_json.encode('utf-8')).decode('utf-8')
            response_data["nextToken"] = encoded_token

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            # Enviamos un Objeto, no una Lista
            "body": json.dumps(response_data, cls=DecimalEncoder)
        }

    except Exception as e:
        print(e)
        return {
            "statusCode": 500,
            "headers": { "Access-Control-Allow-Origin": "*" },
            "body": json.dumps({"error": str(e)})
        }
