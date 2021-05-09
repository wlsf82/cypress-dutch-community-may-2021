describe('Hacker Search', () => {
  context('Happy path', () => {
    const initialTerm = 'redux'
    const searchTerm = 'cypress.io'

    beforeEach(() => {
      cy.intercept(
        'GET',
        `**/search?query=${initialTerm}&page=0&hitsPerPage=100`,
        { fixture: 'empty' }
      ).as('getEmptyStories')

      cy.intercept(
        'GET',
        `**/search?query=${searchTerm}&page=**`,
        { fixture: 'stories' }
      ).as('getStories')

      cy.visit('/')
      cy.wait('@getEmptyStories')

      cy.get('.table-row')
        .should('not.exist')

      cy.get('input[type="text"]')
        .clear()
        .type(`${searchTerm}{enter}`)
      cy.wait('@getStories')
    })

    it('asserts on the number of stories', () => {
      cy.fixture('stories').then(stories => {
        cy.get('.table-row')
          .should('have.length', stories.hits.length)
      })
    })

    it('dismisses a story', () => {
      cy.fixture('stories').then(stories => {
        cy.get('span')
          .contains('Dismiss')
          .click()

        cy.get('.table-row')
          .should('have.length', stories.hits.length - 1)
      })
    })

    it('renders two more when clicking "More"', () => {
      cy.fixture('stories').then(stories => {
        cy.get('button')
          .contains('More')
          .click()
        cy.wait('@getStories')

        cy.get('.table-row')
          .should('have.length', stories.hits.length * 2)
      })
    })

    context('Order by', () => {
      const stories = require('../fixtures/stories')

      it('Orders by title', () => {
        cy.get('.table-header button:contains(Title)')
          .as('titleHeader')
          .should('not.have.class', 'button-active')
          .click()
          .should('have.class', 'button-active')

        cy.get('.table-row')
          .first()
          .should('contain', stories.hits[1].title)
        cy.get('.table-row')
          .last()
          .should('contain', stories.hits[0].title)

        cy.get('@titleHeader')
          .click()

        cy.get('.table-row')
          .first()
          .should('contain', stories.hits[0].title)
        cy.get('.table-row')
          .last()
          .should('contain', stories.hits[1].title)
      })

      it('Orders by author', () => {
        cy.get('.table-header button:contains(Author)')
          .as('authorHeader')
          .should('not.have.class', 'button-active')
          .click()
          .should('have.class', 'button-active')

        cy.get('.table-row')
          .first()
          .should('contain', stories.hits[1].author)
        cy.get('.table-row')
          .last()
          .should('contain', stories.hits[0].author)

        cy.get('@authorHeader')
          .click()

        cy.get('.table-row')
          .first()
          .should('contain', stories.hits[0].author)
        cy.get('.table-row')
          .last()
          .should('contain', stories.hits[1].author)
      })

      it('Orders by comments', () => {
        cy.get('.table-header button:contains(Comments)')
          .as('commentsHeader')
          .should('not.have.class', 'button-active')
          .click()
          .should('have.class', 'button-active')

        cy.get('.table-row')
          .first()
          .should('contain', stories.hits[1].num_comments)
        cy.get('.table-row')
          .last()
          .should('contain', stories.hits[0].num_comments)

        cy.get('@commentsHeader')
          .click()

        cy.get('.table-row')
          .first()
          .should('contain', stories.hits[0].num_comments)
        cy.get('.table-row')
          .last()
          .should('contain', stories.hits[1].num_comments)
      })

      it('Orders by points', () => {
        cy.get('.table-header button:contains(Points)')
          .as('pointsHeader')
          .should('not.have.class', 'button-active')
          .click()
          .should('have.class', 'button-active')

        cy.get('.table-row')
          .first()
          .should('contain', stories.hits[1].points)
        cy.get('.table-row')
          .last()
          .should('contain', stories.hits[0].points)

        cy.get('@pointsHeader')
          .click()

        cy.get('.table-row')
          .first()
          .should('contain', stories.hits[0].points)
        cy.get('.table-row')
          .last()
          .should('contain', stories.hits[1].points)
      })
    })
  })

  context('Error scenarios', () => {
    it('shows a fallback component in case of a server error', () => {
      cy.intercept(
        'GET',
        '**/search**',
        { statusCode: 500 }
      ).as('serverFailure')
      cy.visit('/')
      cy.wait('@serverFailure')

      cy.get('p')
        .contains('Something went wrong.')
        .should('be.visible')
    })

    it('shows a fallback component in case of a network failure', () => {
      cy.intercept(
        'GET',
        '**/search**',
        { forceNetworkError: true }
      ).as('networkFailure')
      cy.visit('/')
      cy.wait('@networkFailure')

      cy.get('p')
        .contains('Something went wrong.')
        .should('be.visible')
    })
  })

  it('shows a loading component while retriving stories', () => {
    cy.intercept(
      'GET',
      '**/search**',
      {
        delay: 1000,
        fixture: 'stories'
      }
    ).as('getDelayedStories')
    cy.visit('/')
    
    cy.get('.loading')
      .as('loading')
      .contains('Loading ...')
      .should('be.visible')

    cy.wait('@getDelayedStories')

    cy.get('@loading')
      .should('not.exist')

    cy.fixture('stories').then(stories => {
      cy.get('.table-row')
        .should('have.length', stories.hits.length)
    })
  })
})
