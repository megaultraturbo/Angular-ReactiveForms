import { trigger, state, transition, style, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';


import { Customer } from './customer';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css'],
  animations: [
    trigger(
      'slideIn', 
      [
        transition(
          ':enter', 
          [
            style({opacity: 0 }),
            animate('0.2s ease-out', 
              style({ opacity: 1 }))
          ]
        ),
        transition(
          ':leave', 
          [
            style({opacity: 1 }),
            animate('0.2s ease-out', 
              style({ height: 0, opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class CustomerComponent implements OnInit {
  //customer = new Customer();

  constructor(private fb: FormBuilder) { }

  private validationMessages :any = {
    required: 'Please enter your email address.',
    email: 'Please enter a valid email address.'
  };

  emailMessage: string = '';

  customerForm!: FormGroup;  
  // data model
  customer: Customer = new Customer();
  phoneRequired: boolean = false;


  ngOnInit(): void {
    // form model
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      emailGroup: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        confirmEmail: ['', [Validators.required]],
      }, { validator: this.compareEmails }),
      sendCatalog: true,
      phone: [''],
      notification: ['email'],
      addressType: ['home'],
      street1: [''],
      street2: [''],
      city: [''],
      state: [''],
      zip: ['']
    });

    // watch for changes to the notification radio buttons
    this.customerForm.get('notification')?.valueChanges.subscribe(value => this.setNotification(value));

    const emailControl = this.customerForm.get('emailGroup.email');
    emailControl?.valueChanges
    .pipe( 
      debounceTime(1000)
    //).subscribe(value => console.log(value));
    ).subscribe(value => this.setMessage(emailControl));
  }

  setMessage(c: AbstractControl): void {
    this.emailMessage = '';
    if ((c.touched || c.dirty) && c.errors) {
      this.emailMessage = Object.keys(c.errors).map(key => this.validationMessages[key]).join(' ');
    }
  }

  setNotification(notifyVia: string): void {
    if(notifyVia === 'text') {
      this.customerForm.get('phone')?.setValidators([
        Validators.required, 
        Validators.pattern("^[0-9]*$"), 
        Validators.minLength(9), 
        Validators.maxLength(9)])
        this.phoneRequired = true;
    }
    else {
      this.customerForm.get('phone')?.clearValidators();
      this.phoneRequired = false;
    }
    this.customerForm.get('phone')?.updateValueAndValidity();
  }

  compareEmails(c: AbstractControl): {[key: string]: boolean} | null {
    let email = c.get('email');
    let confirmEmail = c.get('confirmEmail');

    if(email?.value === confirmEmail?.value || (email?.pristine || confirmEmail?.pristine)) {
      return null;
    }
    else {
      return { 'match': true }; // adds broken validation name to errors 
    }
  }

  save(): void {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm));
  }
}
