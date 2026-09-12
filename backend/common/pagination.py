from rest_framework.pagination import PageNumberPagination

from common.response import success


class StandardResultsPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return success(
            data=data,
            message='Success',
            meta={
                'count': self.page.paginator.count,
                'page': self.page.number,
                'pages': self.page.paginator.num_pages,
                'next': bool(self.get_next_link()),
                'previous': bool(self.get_previous_link()),
            },
        )
