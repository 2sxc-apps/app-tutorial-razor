(() => {
  // Columns which should be formatted as dates
  // Not perfect, because it's specific to this tutorial, but ok for demo
  const dateColumns = new Set(["BirthDate", "Birthday", "Created", "Modified"]);

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

    thead.innerHTML = `<tr>${columns.map((column) => `<th>${column}</th>`).join("")}</tr>`;

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

    if (Array.isArray(value) || typeof value === "object")
      return JSON.stringify(value);

    if (dateColumns.has(columnName))
      return new Date(value).toLocaleDateString();

    if (typeof value === "string" && value.includes("<")) {
      const temp = document.createElement("div");
      temp.innerHTML = value;
      return temp.textContent || temp.innerText || "";
    }

    return value;
  }

  function addField(row, text) {
    const td = document.createElement("td");
    td.innerText = text ?? "";
    row.appendChild(td);
  }

  /**
   * Show the URL in the UI.
   */
  function showUrl(sxc, outputElement, params, stream) {
    const urlElement = outputElement.querySelector("code");
    if (!urlElement) return;
    const url = buildUrl(sxc, params, stream);
    urlElement.innerText = `Fetching ${url}`;
  }

  /**
   * Build the query URL
   */
  function buildUrl(sxc, inputParams, stream) {
    let params = {};

    // copy params and do ???
    if (stream)
      Object.entries(inputParams).forEach(([key, value]) => {
        if (value == null || value === "")
          return;
        params[key.startsWith("$") ? `${stream}${key}` : key] = value;
      });
    else
      params = inputParams;

    const url = sxc.webApi
      .url(`app/auto/data/Poets`, params)
      .replace(/%24/g, "$")
      .replace(/%2C/g, ",");

    return url
      .substring(url.indexOf("2sxc"))
      .replace("2sxc/", `.../`)
      .replace(/%20/g, " ");
  }

  window.tutOutputHelpers = window.tutOutputHelpers || {
    showData,
    showUrl,
    buildUrl,
  };
})();
