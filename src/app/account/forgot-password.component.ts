import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first, finalize } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';

@Component({ templateUrl: 'forgot-password.component.html', standalone: false })
export class ForgotPasswordComponent implements OnInit {
	form!: FormGroup;
	loading = false;
	submitted = false;
	resetLink: string | null = null;

	constructor(
		private formBuilder: FormBuilder,
		private accountService: AccountService,
		private alertService: AlertService,
		private router: Router,
		private cdr: ChangeDetectorRef
	) { }

	ngOnInit() {
		this.form = this.formBuilder.group({
			email: ['', [Validators.required, Validators.email]]
		});
	}

	// convenience getter for easy access to form fields
	get f() { return this.form.controls; }

	onSubmit() {
		this.submitted = true;
		this.cdr.detectChanges();
		this.resetLink = null;

		// reset alerts on submit
		this.alertService.clear();

		// stop here if form is invalid
		if (this.form.invalid) {
			return;
		}

		this.loading = true;
		this.cdr.detectChanges();
		this.accountService.forgotPassword(this.f.email.value)
			.pipe(first())
			.pipe(finalize(() => {
				this.loading = false;
				this.cdr.detectChanges();
			}))
			.subscribe({
				next: (response: any) => {
					const resetToken = response?.resetToken;
					if (resetToken) {
						this.resetLink = `${location.origin}/account/reset-password?token=${resetToken}`;
						this.alertService.success('Reset link generated. Click the link below to continue.');
						this.cdr.detectChanges();
						this.router.navigate(['/account/reset-password'], { queryParams: { token: resetToken } });
						return;
					}
					this.alertService.success('Please check your email for password reset instructions');
					this.cdr.detectChanges();
				},
				error: error => {
					this.alertService.error(error);
					this.cdr.detectChanges();
				}
			});
	}
}
