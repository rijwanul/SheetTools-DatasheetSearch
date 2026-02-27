function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Sheet Tools')
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu('Search Webtool')
        .addItem('Configuration', 'showConfigDialog')
    )
    .addToUi();
}

function showConfigDialog() {
  var html = HtmlService.createHtmlOutputFromFile('configui')
    .setWidth(850)
    .setHeight(700)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setTitle('Webapp Configuration');
  SpreadsheetApp.getUi().showModalDialog(html, 'Webapp Configuration');
}

function doGet() {
  var config = getConfig();
  var pageTitle = config.pageTitle || 'Datasheet Search';
  var favicon = config.favicon || 'https://i.ibb.co.com/7dP6tWSm/favicon.png';

  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle(pageTitle)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setFaviconUrl(favicon)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getSheetNames() {
  const sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  return sheets.map(s => s.getName());
}

function getColumnNames(sheetName) {
  if (!sheetName) return [];
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return headers.map((name, idx) => ({
    name: String(name||""),
    index: idx + 1
  }));
}

function getConfig() {
  return loadConfig();
}

function saveConfig(config) {
  saveConfigToStorage(config);
  return true;
}

// For import
function setConfigFromJSON(jsonString) {
  try {
    let parsed = JSON.parse(jsonString);
    saveConfigToStorage(parsed);
    return {success: true};
  } catch (e) {
    return {success: false, error: String(e)};
  }
}

function getUniqueColumnValues(sheetName, colIndex) {
  if(!sheetName || !colIndex) return [];
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  const values = sheet.getRange(2, colIndex, sheet.getLastRow()-1, 1).getValues().flat();
  return Array.from(new Set(values.filter(val => !!val))).sort();
}

function searchSheet(params, pageNumber, maxPerPage, minChars) {
  const config = getConfig();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(config.sheetName);
  if (!sheet) return {results: [], count: 0, totalPages: 1, page: 1};

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  let filters = config.searchParams.map(p => {
    const idx = p.colIndex-1;
    const val = params[p.id];

    // Only apply minChars if: required & not dropdown & not exactMatch
    const minCharsShouldCheck = !p.optional && !p.dropdown && !p.exactMatch;

    if (val === undefined || val === null || val === "") {
      if (p.optional) return () => true;
      else return null;
    }
    if (minCharsShouldCheck && minChars && String(val).length < minChars) {
      return null;
    }
    if (p.exactMatch) {
      return row => String(row[idx]).trim() === String(val).trim();
    } else {
      return row => String(row[idx]).toLowerCase().includes(String(val).toLowerCase());
    }
  });

  if (filters.some(f => f === null)) {
    return {results: [], count: 0, error: `Please fill all required fields (min ${minChars} characters for applicable fields).`, totalPages: 1, page: 1};
  }

  let results = rows.filter(row => filters.every(f => f(row)));
  let count = results.length;

  // Pagination
  pageNumber = Math.max(1, parseInt(pageNumber) || 1);
  maxPerPage = parseInt(maxPerPage) || 10;
  const totalPages = Math.max(1, Math.ceil(count / maxPerPage));
  let pagedResults = results.slice((pageNumber-1)*maxPerPage, pageNumber*maxPerPage);

  // Compose output per display config
  let dispCols = config.displayValues || [];
  let out = pagedResults.map(row => {
    let obj = {};
    for (let disp of dispCols) {
      let val = row[disp.colIndex-1];
      if (val === undefined || val === null || val === "") continue;
      if (disp.image) {
        let url = String(val), previewUrl = '';
        if (url.includes("open?id=")) {
          const fileId = url.split("id=")[1].split('&')[0];
          previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        } else if (url.includes("/view")) {
          previewUrl = url.replace("/view", "/preview");
        } else if (url.includes("drive.google.com/file/d/") && url.includes("/preview")) {
          previewUrl = url;
        } else {
          previewUrl = url;
        }
        obj[disp.id] = {type: 'image', value: val, embed: previewUrl, isDrive: !!previewUrl.match(/drive\.google\.com/)};
      } else {
        obj[disp.id] = {type: 'text', value: val};
      }
    }
    return obj;
  });

  return {
    results: out,
    count: count,
    totalPages: totalPages,
    page: pageNumber
  };
}