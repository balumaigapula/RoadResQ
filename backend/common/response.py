"""
Consistent API response envelope used across every endpoint:

    { "success": true,  "message": "...", "data": {...} }
    { "success": false, "message": "...", "errors": {...} }
"""
from rest_framework.response import Response


def success(data=None, message='Success', status=200, meta=None):
    payload = {'success': True, 'message': message, 'data': data if data is not None else {}}
    if meta is not None:
        payload['meta'] = meta
    return Response(payload, status=status)


def error(message='Something went wrong', errors=None, status=400):
    return Response({'success': False, 'message': message, 'errors': errors or {}}, status=status)
