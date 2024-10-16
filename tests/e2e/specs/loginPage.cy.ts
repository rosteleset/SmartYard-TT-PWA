describe('Login Page', () => {
  it('должен отображать ошибку при неправильных учетных данных', () => {
    cy.visit('/tt/login');
    cy.get('#ion-input-0').type('testuser');
    cy.get('#ion-input-1').type('password123');
    cy.get('.button').click();
    
    cy.contains('userNotFound');
  });
});