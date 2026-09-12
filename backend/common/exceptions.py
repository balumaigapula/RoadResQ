import logging

from django.core.exceptions import PermissionDenied, ValidationError as DjangoValidationError
from django.http import Http404
from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler as drf_exception_handler

from common.response import error

logger = logging.getLogger('django')


def roadresq_exception_handler(exc, context):
    """
    Normalizes every error response (validation, auth, permission, 404,
    unhandled server errors) into the { success, message, errors } shape,
    and ensures Python/Django stack traces never leak to the client.
    """
    response = drf_exception_handler(exc, context)

    if response is not None:
        message = 'Request failed'
        errors = response.data
        if isinstance(response.data, dict) and 'detail' in response.data and len(response.data) == 1:
            message = str(response.data['detail'])
            errors = {}
        response.data = {'success': False, 'message': message, 'errors': errors}
        return response

    if isinstance(exc, Http404):
        return error('Resource not found', status=404)
    if isinstance(exc, PermissionDenied):
        return error('You do not have permission to perform this action', status=403)
    if isinstance(exc, DjangoValidationError):
        return error('Validation failed', errors=getattr(exc, 'message_dict', {'detail': exc.messages}), status=400)

    # Anything else is an unhandled server error — log it, but never expose
    # internals to the client.
    logger.exception('Unhandled exception', exc_info=exc)
    return error('Something went wrong on our end. Please try again shortly.', status=500)
