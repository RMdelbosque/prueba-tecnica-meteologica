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
    { label: 'commercial', address: 'commercial@meteologica.com' },
    { label: 'usa', address: 'usa@meteologica.com' },
    { label: 'china', address: 'china@meteologica.com' },
    { label: 'brasil', address: 'brasil@meteologica.com' },
    { label: 'india', address: 'india@meteologica.com' },
  ];

  phone = '+34 914561001';
  linkedinUrl = 'https://es.linkedin.com/company/meteologica';
  addressUrl = 'https://goo.gl/maps/sXSK5hiCV1m';
  address = {
    street: 'Calle Costa Brava, 10',
    city: '28034, Madrid',
    country: 'Spain',
  };

  legalUrl = 'https://www.meteologica.com/legal.html';
}
