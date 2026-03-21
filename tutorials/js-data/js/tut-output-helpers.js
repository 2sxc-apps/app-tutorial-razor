// Use an IIFE to ensure the variables are not exposed globally
// See https://developer.mozilla.org/en-US/docs/Glossary/IIFE
(() => {

  // Display example data in the table
  function showData(items, outputElement) {
    const tableElement = outputElement.querySelector("table");
    if (!tableElement)
      throw new Error(`Table element not found in output element with id ${outputElement.id}`);

    const thead = tableElement.querySelector("thead");
    const tbody = tableElement.querySelector("tbody");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    if (!items || !items.length)
      return;

    const columns = Object.keys(items[0]);

    const headerRow = document.createElement("tr");
    columns.forEach((column) => addHeader(headerRow, column));
    thead.appendChild(headerRow);

    items.forEach((item) => {
      const row = document.createElement("tr");

      columns.forEach((column) => {
        addField(row, formatValue(item[column], column));
      });

      tbody.appendChild(row);
    });
  }

  function formatValue(value, columnName) {
    if (value == null)
      return "";

    if (columnName === "BirthDate")
      return new Date(value).toLocaleDateString();

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

  window.tutOutputHelpers = window.tutOutputHelpers || {
    showData,
    showUrl,
  };
})();
