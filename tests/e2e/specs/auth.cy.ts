describe('Auth Page', () => {
    it('should load the login page', () => {
      cy.visit('/login');
      cy.get('ion-input[label="Login"]').should('be.visible');
      cy.get('ion-input[label="Password"]').should('be.visible');
      cy.get('ion-button').contains('Login').click();
      cy.get('ion-text[color="danger"]').should('contain', 'Invalid credentials');

    });
  
    it('should show error for invalid credentials', () => {
      cy.visit('/login');
      cy.get('ion-input[name="username"]').type('invalidUser');
      cy.get('ion-input[name="password"]').type('wrongPass');
      cy.get('ion-button[type="submit"]').click();
      cy.contains('Invalid credentials').should('be.visible');
    });
  });
  