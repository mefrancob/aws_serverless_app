# backend/get_tasks.py CORREGIDO PARA SEGURIDAD
import json
import boto3
import os
from decimal import Decimal
from boto3.dynamodb.conditions import Key # <--- IMPORTANTE

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
        # OBTENER EL USUARIO REAL
        user_id = event['requestContext']['authorizer']['claims']['sub']

        # USAR QUERY EN LUGAR DE SCAN (Mucho más eficiente y seguro)
        response = table.query(
            KeyConditionExpression=Key('userId').eq(user_id)
        )
        items = response.get('Items', [])

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            "body": json.dumps(items, cls=DecimalEncoder)
        }
    except Exception as e:
        print(e)
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": str(e)})
        }
