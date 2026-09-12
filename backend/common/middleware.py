class ExceptionNormalizationMiddleware:
    """Placeholder hook for request/response-level normalization or logging.

    DRF's EXCEPTION_HANDLER (see exceptions.py) already normalizes API error
    payloads; this middleware exists so non-DRF errors (e.g. before routing
    reaches a DRF view) can be extended later without touching settings.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)
