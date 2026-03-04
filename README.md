# SheetTools — DatasheetSearch

A Google Apps Script tool that adds a fully configurable, user-friendly search web app on top of any Google Sheet — no external server, no database, no coding required after setup.

---

## How It Works

Once installed in a Google Sheet, SheetTools adds a **Sheet Tools** menu. From there, you open a **Configuration** dialog that lets you set up your search interface visually. After saving and deploying as a Web App, anyone with the link gets a clean search UI that queries your sheet data live.

Everything — config storage, search logic, and the web app itself — runs entirely inside Google Apps Script.

---

## Features

- **Visual configuration UI** — set up search fields and display columns through a point-and-click dialog inside the sheet, no code editing needed
- **Flexible search parameters** — each field can be marked as optional or required, text-contains or exact match, and rendered as a free-text input or a dropdown populated from unique column values
- **Configurable display** — choose which columns appear on result cards, in what order, and whether a column should render as an image (including Google Drive embeds)
- **Pagination** — configurable results per page with First / Prev / Next / Last controls
- **Minimum character enforcement** — set a minimum character count before a required text field is accepted, preventing overly broad searches
- **Copy to clipboard** — each result card has a copy button; image columns also get a dedicated "Copy Image URL" button
- **Share button** — optionally set your deployed Web App URL in config to show a share button on the search page
- **Import / Export config** — save your configuration as a JSON file and import it later, useful for replication across sheets
- **Google Drive image support** — automatically converts Drive sharing URLs to embeddable preview URLs for seamless image display
- **Responsive design** — the search page adapts cleanly to mobile screen sizes

---

## File Structure

| File | Purpose |
|---|---|
| `Code.gs` | Core backend: menu setup, web app entry point (`doGet`), sheet data reading, search logic, pagination |
| `config.gs` | Config persistence layer using `PropertiesService` (stored per document) |
| `configui.html` | The configuration dialog UI rendered inside the sheet as a modal |
| `index.html` | The public-facing search web app (HTML + CSS + JS, fully self-contained) |

---

## Setup

### 1. Copy the files into Apps Script

Open your Google Sheet, then go to **Extensions → Apps Script**. Create the following files and paste in the contents from this repo:

- `Code.gs` (replace the default file)
- `config.gs` (new script file)
- `configui.html` (new HTML file)
- `index.html` (new HTML file)

Save the project.

### 2. Configure the web app

Reload your Google Sheet. A **Sheet Tools** menu will appear in the menu bar. Click:

> **Sheet Tools → Search Webtool → Configuration**

In the dialog that opens, fill in:

| Setting | Description |
|---|---|
| **Webpage Title** | Title shown on the search page |
| **Favicon URL** | URL to an image used as the browser tab icon |
| **Webapp URL** | Your deployed Web App URL (enables the share button) |
| **Sheet Name** | The sheet tab to search |
| **Max results per page** | How many results to show per page (default: 10) |
| **Min search chars** | Minimum characters required in required text fields before searching (default: 2) |

### 3. Add Search Parameters

Click **Add new parameter** for each column you want users to search by. For each parameter you can configure:

- **Label** — display name shown on the search form
- **Column** — which sheet column this parameter maps to
- **Optional** — if unchecked, the field is required before search is enabled
- **Exact** — if checked, matches only exact values instead of partial contains
- **Dropdown** — if checked, renders as a dropdown populated from all unique values in that column

Use the ↑ ↓ arrows to reorder fields, and ✕ to remove them.

### 4. Add Display Values

Click **Add new display value** for each column you want to show on result cards. For each:

- **Label** — the field label shown on the card
- **Column** — which sheet column to display
- **Image** — if checked, the value is treated as a URL and rendered as an image (or Google Drive embed)

### 5. Deploy as a Web App

In the Apps Script editor, click **Deploy → New deployment**. Set:

- **Type:** Web app
- **Execute as:** Me
- **Who has access:** Anyone (or restrict as needed)

Copy the generated URL, paste it into the **Webapp URL** field in the Configuration dialog, and save again.

---

## Configuration Import / Export

The Configuration dialog has **Export** and **Import** buttons in the top-right corner.

- **Export** downloads your current configuration as `webapp_config.json`
- **Import** lets you load a previously exported JSON to restore or duplicate a configuration

This is useful when setting up the same search tool on multiple sheets.

---

## Configuration Options Reference

```json
{
  "pageTitle": "Datasheet Search",
  "favicon": "https://...",
  "webappUrl": "https://script.google.com/...",
  "sheetName": "Sheet1",
  "maxPerPage": 10,
  "minChars": 2,
  "showMultiple": true,
  "searchParams": [
    {
      "id": "p_abc123",
      "colIndex": 1,
      "label": "Name",
      "optional": false,
      "exactMatch": false,
      "dropdown": false
    }
  ],
  "displayValues": [
    {
      "id": "d_xyz456",
      "colIndex": 2,
      "label": "Email",
      "image": false
    }
  ]
}
```

---

## Google Drive Image Support

When a display column is marked as **Image**, the tool automatically detects Google Drive share URLs and converts them to embeddable preview `<iframe>` URLs. Supported URL formats:

- `https://drive.google.com/open?id=FILE_ID`
- `https://drive.google.com/file/d/FILE_ID/view`
- `https://drive.google.com/file/d/FILE_ID/preview`

Make sure the Drive files are shared with "Anyone with the link" for them to display correctly in the web app.

---

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
