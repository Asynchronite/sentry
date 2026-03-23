from __future__ import annotations

from collections.abc import Callable
from typing import Any

# from asgiref.sync import iscoroutinefunction, markcoroutinefunction
from django.http.response import HttpResponseBase
from rest_framework.request import Request

from sentry.hybridcloud.apigateway import proxy_request_if_needed


class ApiGatewayMiddleware:
    """Proxy requests intended for remote silos"""

    async_capable = True
    sync_capable = False

    def __init__(self, get_response: Callable[[Request], HttpResponseBase]):
        self.get_response = get_response
        # if iscoroutinefunction(self.get_response):
        #    markcoroutinefunction(self)

    def __call__(self, request: Request) -> HttpResponseBase:
        return self.get_response(request)

    async def process_view(
        self,
        request: Request,
        view_func: Callable[..., HttpResponseBase],
        view_args: tuple[str],
        view_kwargs: dict[str, Any],
    ) -> HttpResponseBase | None:
        proxy_response = await proxy_request_if_needed(request, view_func, view_kwargs)
        if proxy_response is not None:
            return proxy_response
        else:
            return None
