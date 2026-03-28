// Use an IIFE to ensure the variables are not exposed globally
// See https://developer.mozilla.org/en-US/docs/Glossary/IIFE
(() => {

  /**
   * load query data and render one stream into a table.
   */
  function load(specs) {
    const { moduleId, outputId, stream = "Current", ...params } = specs;

    const sxc = $2sxc(moduleId);

    const outputElement = document.querySelector(`#${outputId}`);
    if (!outputElement)
      throw new Error(`Output element with id ${outputId} not found`);

    // Show the url in the UI - note: uses global helper loaded in another JS file
    window.tutOutputHelpers.showUrl(sxc, outputElement, params, stream);

    // Get a specific stream
    // relevant for this demo, as we want to the "Authors" stream, not the "Default"
    sxc.query('AuthorsWithBooks').getStream(stream, params).then((data) => {
      window.tutOutputHelpers.showData(data, outputElement);
    });
  }

  // Expose API globally for the tutorial buttons
  const tutorial = (window.tutQueryOdata = window.tutQueryOdata || {});
  tutorial.load = tutorial.load || load;
})();