// Use an IIFE to ensure the variables are not exposed globally
// See https://developer.mozilla.org/en-US/docs/Glossary/IIFE
(() => {
  /**
   * Load data from a specific content type, show the URL and the resulting data
   * The specs object contains the moduleId, outputId and optional OData parameters like $select.
   */
  function load(specs) {
    const { moduleId, outputId, ...params } = specs;

    const sxc = $2sxc(moduleId);

    const outputElement = document.querySelector(`#${outputId}`);
    if (!outputElement)
      throw new Error(`Output element with id ${outputId} not found`);

    // Convert the params object to a query string, ensuring $ is not encoded
    // note: uses global helper loaded in another JS file
    window.tutOutputHelpers.showUrl(sxc, outputElement, params);

    // Do the fetch and display the data in the table
    sxc.data("Poets")
      .getAll(params)
      .then((poets) => window.tutOutputHelpers.showData(poets, outputElement));
  }

  const tutorial = (window.tutOdata = window.tutOdata || {});
  tutorial.load = tutorial.load || load;
})();
