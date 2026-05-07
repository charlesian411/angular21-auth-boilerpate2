import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AccountService } from '@app/_services';

// Endpoints that are allowed to fail with 401 without triggering auto-logout.
// These are either background/silent calls or public flows where 401 is an
// expected business outcome (e.g. "no session to refresh" or "token invalid").
const SKIP_LOGOUT_URLS = [
	'/accounts/refresh-token',
	'/accounts/validate-reset-token',
];

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
	constructor(private accountService: AccountService) { }

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(request).pipe(catchError(err => {
			const isSkippedUrl = SKIP_LOGOUT_URLS.some(u => request.url.endsWith(u));

			if ([401, 403].includes(err.status) && this.accountService.accountValue && !isSkippedUrl) {
				// auto logout if 401 or 403 response returned from api
				this.accountService.logout();
			}

			const error = (err && err.error && err.error.message) || err.statusText;
			console.error(err);
			return throwError(() => error);
		}))
	}
}
