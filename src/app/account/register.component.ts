import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { MustMatch } from '@app/_helpers';

@Component({ templateUrl: 'register.component.html', standalone: false })
export class RegisterComponent implements OnInit {
	form!: FormGroup;
	submitting = false;
	submitted = false;

	constructor(
		private formBuilder: FormBuilder,
		private route: ActivatedRoute,
		private router: Router,
		private accountService: AccountService,
		private alertService: AlertService,
		private cdr: ChangeDetectorRef
	) { }

	ngOnInit() {
		this.form = this.formBuilder.group({
			title: ['', Validators.required],
			firstName: ['', Validators.required],
			lastName: ['', Validators.required],
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required, Validators.minLength(6)]],
			confirmPassword: ['', Validators.required],
			acceptTerms: [false, Validators.requiredTrue]
		}, {
			validator: MustMatch('password', 'confirmPassword')
		});
	}

	// convenience getter for easy access to form fields
	get f() { return this.form.controls; }

	onSubmit() {
		this.submitted = true;
		this.cdr.detectChanges();

		// reset alerts on submit
		this.alertService.clear();

		// stop here if form is invalid
		if (this.form.invalid) {
			return;
		}

		this.submitting = true;
		this.cdr.detectChanges();
		this.accountService.register(this.form.value)
			.pipe(first())
			.subscribe({
				next: (response: any) => {
					if (response.verificationLink) {
						// 1. Browser Level Popup (Hard to miss)
						window.alert(`REGISTRATION SUCCESSFUL!\n\nClick OK then use this link to verify:\n${response.verificationLink}`);

						// 2. Giant Green Box on Screen
						this.alertService.success(`
							<h4>Verification Link (TEST MODE)</h4>
							<div>Thanks for registering! Your account is created.</div>
							<div class="my-3 p-3 border border-success bg-light text-center">
								<strong>CLICK HERE TO VERIFY:</strong><br>
								<a href="${response.verificationLink}" style="font-weight: bold; font-size: 1.1em;">${response.verificationLink}</a>
							</div>
							<div class="mt-2 text-muted" style="font-size: 0.85em;">Copy and paste the link above if it's not clickable.</div>
						`, { keepAfterRouteChange: false });
						this.submitting = false; 
					} else {
						this.alertService.success('Registration successful, please check your email', { keepAfterRouteChange: true });
						this.router.navigate(['../login'], { relativeTo: this.route });
					}
					this.cdr.detectChanges();
				},
				error: error => {
					this.alertService.error(error);
					this.submitting = false;
					this.cdr.detectChanges();
				}
			});
	}
}
