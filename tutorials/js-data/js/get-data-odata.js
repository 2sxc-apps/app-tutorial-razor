// Use an IIFE to ensure the variables are not exposed globally
// See https://developer.mozilla.org/en-US/docs/Glossary/IIFE
(() => {
  /**
   * Load poets from the DataSource.
   * The specs object contains the moduleId, outputId and optional OData parameters like $select.
   */
  function load(specs) {
    const { moduleId, outputId, ...params } = specs;

    const sxc = $2sxc(moduleId);

    const outputElement = document.querySelector(`#${outputId}`);
    if (!outputElement)
      throw new Error(`Output element with id ${outputId} not found`);

    // Convert the params object to a query string, ensuring $ is not encoded
    showUrl(sxc, outputElement, params);

    // Do the fetch and display the data in the table
    sxc.data("Poets")
      .getAll(params)
      .then((poets) => displayPoets(poets, outputElement));
  }

  // Display example data in the table
  function displayPoets(poets, outputElement) {
    const tableElement = outputElement.querySelector("table");
    if (!tableElement) return;

    const thead = tableElement.querySelector("thead");
    const tbody = tableElement.querySelector("tbody");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    if (!poets || !poets.length) return;

    const columns = Object.keys(poets[0]);

    const headerRow = document.createElement("tr");
    columns.forEach((column) => addHeader(headerRow, column));
    thead.appendChild(headerRow);

    poets.forEach((poet) => {
      const row = document.createElement("tr");

      columns.forEach((column) => {
        addField(row, formatValue(poet[column], column));
      });

      tbody.appendChild(row);
    });
  }

  function formatValue(value, columnName) {
    if (value == null) return "";

    if (columnName === "BirthDate") {
      return new Date(value).toLocaleDateString();
    }

    return value;
  }

  function addHeader(row, text) {
    const th = document.createElement("th");
    th.innerText = text;
    row.appendChild(th);
  }

  function addField(row, text) {
    const td = document.createElement("td");
    td.innerText = text ?? "";
    row.appendChild(td);
  }

  function buildDisplayUrl(sxc, params) {
    const url = sxc.webApi
      .url(`app/auto/data/Poets`, params)
      .replace(/%24/g, "$")
      .replace(/%2C/g, ",");

    return url
      .substring(url.indexOf("2sxc"))
      .replace("2sxc/", `.../`)
      .replace(/%20/g, " ");
  }

  /**
   * Show the URL in the UI.
   */
  function showUrl(sxc, outputElement, params) {
    const urlElement = outputElement.querySelector("code");
    if (!urlElement) return;
    const url = buildDisplayUrl(sxc, params);
    urlElement.innerText = `Fetching ${url}`;
  }

  const tutorial = (window.tutOdata = window.tutOdata || {});
  tutorial.load = tutorial.load || load;
})();
