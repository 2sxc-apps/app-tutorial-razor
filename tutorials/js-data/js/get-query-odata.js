// Use an IIFE to ensure the variables are not exposed globally
// See https://developer.mozilla.org/en-US/docs/Glossary/IIFE
(() => {
  // Name of the query used on the backend
  const QUERY_NAME = "AuthorsWithBooks";

  /**
   * load query data and render one stream into a table.
   */
  function load(specs) {
    const { moduleId, outputId, stream = "Current", ...inputParams } = specs;

    const sxc = $2sxc(moduleId);

    const outputElement = document.querySelector(`#${outputId}`);
    if (!outputElement)
      throw new Error(`Output element with id ${outputId} not found`);

    // Show the url in the UI - note: uses global helper loaded in another JS file
    window.tutOutputHelpers.showUrl(sxc, outputElement, inputParams, stream);

    // sxc.query('AuthorsWithBooks').getStream(stream, inputParams).then((data) => {
    //   console.log('2dm', data);
    //   renderTable(data?.[stream], outputElement);
    // });

    console.log('2dm new');
    const url = buildQueryUrl(sxc, inputParams, stream);

    sxc.webApi.fetchJson(url).then((data) => {
      window.tutOutputHelpers.showData(data?.[stream], outputElement);
    });
  }

  /**
   * Build the query URL
   */
  function buildQueryUrl(sxc, inputParams, stream) {
    const params = {};

    Object.entries(inputParams).forEach(([key, value]) => {
      if (value == null || value === "")
        return;
      params[key.startsWith("$") ? `${stream}${key}` : key] = value;
    });

    return sxc.webApi
      .url(`app/auto/query/${QUERY_NAME}`, params)
      .replace(/%24/g, "$")
      .replace(/%2C/g, ",")
      .replace(/%27/g, "'");
  }

  // Expose API globally for the tutorial buttons
  const tutorial = (window.tutQueryOdata = window.tutQueryOdata || {});
  tutorial.load = tutorial.load || load;
})();