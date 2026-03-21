// Use an IIFE to ensure the variables are not exposed globally
// See https://developer.mozilla.org/en-US/docs/Glossary/IIFE
(() => {
  // Name of the query used on the backend
  const QUERY_NAME = "AuthorsWithBooks";

  // Columns which should be formatted as dates
  const dateColumns = new Set(["BirthDate", "Birthday", "Created", "Modified"]);

  /**
   * load query data and render one stream into a table.
   */
  function load(specs) {
    const { moduleId, outputId, stream = "Current", ...inputParams } = specs;

    const sxc = $2sxc(moduleId);
    const webApi = sxc.webApi;

    const outputElement = document.querySelector(`#${outputId}`);
    if (!outputElement) return;

    const urlElement = outputElement.querySelector("code");
    const tableElement = outputElement.querySelector("table");
    if (!urlElement || !tableElement) return;

    const url = buildQueryUrl(webApi, inputParams, stream);
    showUrl(urlElement, url);

    webApi.fetchJson(url).then((data) => {
      renderTable(data?.[stream], tableElement);
    });
  }

  /**
   * Render items into a table using the keys of the first item as columns.
   */
  function renderTable(items, tableElement) {
    const thead = tableElement.querySelector("thead");
    const tbody = tableElement.querySelector("tbody");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    if (!items?.length) return;

    const columns = Object.keys(items[0]);

    thead.innerHTML = `<tr>${columns.map((column) => `<th>${column}</th>`).join("")}</tr>`;

    items.forEach((item) => {
      const row = document.createElement("tr");

      columns.forEach((column) => {
        const td = document.createElement("td");
        const value = formatValue(item[column], column);

        td.innerText = value;
        row.appendChild(td);
      });

      tbody.appendChild(row);
    });
  }

  /**
   * Format values for display.
   */
  function formatValue(value, columnName) {
    if (value == null) return "";

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

  /**
   * Build the query URL
   */
  function buildQueryUrl(webApi, inputParams, stream) {
    const params = {};

    Object.entries(inputParams).forEach(([key, value]) => {
      if (value == null || value === "") return;
      params[key.startsWith("$") ? `${stream}${key}` : key] = value;
    });

    return webApi
      .url(`app/auto/query/${QUERY_NAME}`, params)
      .replace(/%24/g, "$")
      .replace(/%2C/g, ",")
      .replace(/%27/g, "'");
  }

  /**
   * Show the URL in the UI.
   */
  function showUrl(urlElement, url) {
    urlElement.innerText = `Fetching ${url.substring(url.indexOf("2sxc")).replace("2sxc/", ".../")}`;
  }

  // Expose API globally for the tutorial buttons
  const tutorial = (window.tutQueryOdata = window.tutQueryOdata || {});
  tutorial.load = tutorial.load || load;
})();