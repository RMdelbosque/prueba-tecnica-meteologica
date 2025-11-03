import { Component } from '@angular/core';

interface ContactEmail {
  label: string;
  address: string;
}

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  // Contact emails
  contactEmails: ContactEmail[] = [
    { label: 'personal', address: 'rodrigo.m.delbosque@gmail.com' }
  ];

  phone = '+34 654859387';
  linkedinUrl = 'https://www.linkedin.com/in/rodrigo-del-bosque/';
  addressUrl = 'https://maps.app.goo.gl/j4uNV3CASEUfqKtLA';
  address = {
    city: 'Madrid',
    country: 'Spain',
  };

  portfolio = 'https://rmdelbosque.com';
}
