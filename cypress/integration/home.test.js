describe("Home page", () => {
  beforeEach(() => {
    // Simulate http response - mock
    cy.fixture("courses.json").as("coursesJSON");

    // Start mock server
    cy.server();

    cy.route("/api/courses", "@coursesJSON").as("courses");

    cy.visit("/");
  });

  it("should display a list of courses", () => {
    // Expect this content in the DOM
    cy.contains("All Courses");
    // Wait fo this data response
    cy.wait("@courses");
    cy.get("mat-card").should("have.length", 9);
  });

  it("should display the advanced courses", () => {
    cy.get(".mat-tab-label").should("have.length", 2);
    cy.get(".mat-tab-label").last().click();
    // Check advanced tab
    cy.get(".mat-tab-body-active .mat-card-title")
      .its("length")
      .should("be.gt", 1);
    // Check title
    cy.get(".mat-tab-body-active .mat-card-title")
      .first()
      .should("contain", "Angular Security Course");
  });
});
