const CONFIG_KEY = 'webapp_search_config';

function saveConfigToStorage(config) {
  PropertiesService.getDocumentProperties().setProperty(CONFIG_KEY, JSON.stringify(config));
}

function loadConfig() {
  const raw = PropertiesService.getDocumentProperties().getProperty(CONFIG_KEY);
  if (!raw) {
    return {
      pageTitle: "Datasheet Search",
      favicon: "https://i.ibb.co.com/7dP6tWSm/favicon.png",
      sheetName: "",
      searchParams: [],
      displayValues: [],
      showMultiple: true,
      webappUrl: "",
      maxPerPage: 10,
      minChars: 2
    };
  }
  try {
    let config = JSON.parse(raw);
    if (!('webappUrl' in config)) config.webappUrl = "";
    if (!('maxPerPage' in config)) config.maxPerPage = 10;
    if (!('minChars' in config)) config.minChars = 2;
    return config;
  } catch(e) {
    return {
      pageTitle: "Datasheet Search",
      favicon: "https://i.ibb.co.com/7dP6tWSm/favicon.png",
      sheetName: "",
      searchParams: [],
      displayValues: [],
      showMultiple: true,
      webappUrl: "",
      maxPerPage: 10,
      minChars: 2
    };
  }
}