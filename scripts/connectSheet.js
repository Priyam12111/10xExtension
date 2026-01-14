console.log("Executing Sheet Script");

/* -------------------- LOADER HELPERS (added) -------------------- */
function ensureSheetLoaderStyles() {
  if (document.getElementById("sheet-loader-style")) return;

  const style = document.createElement("style");
  style.id = "sheet-loader-style";
  style.textContent = `
    .sheet-loader-inline{
      width:14px;height:14px;
      border:2px solid rgba(0,0,0,0.2);
      border-top-color: rgba(0,0,0,0.7);
      border-radius:50%;
      display:inline-block;
      animation: sheetSpin 0.7s linear infinite;
      vertical-align: middle;
    }
    @keyframes sheetSpin { to { transform: rotate(360deg); } }

    /* used on the gmail top button */
    .sheet-button.loading{
      pointer-events:none;
      opacity:0.75;
    }

    /* used inside modal/list if needed */
    .sheet-list-loading{
      display:flex;
      align-items:center;
      gap:8px;
      padding:10px 12px;
      font-size:14px;
      color:#444;
      border-bottom:1px solid #eee;
    }
  `;
  document.head.appendChild(style);
}

function setButtonLoading(btn, isLoading, idleText = "Sheets") {
  if (!btn) return;

  // store original once
  if (!btn.dataset.originalHtml) {
    btn.dataset.originalHtml = btn.innerHTML || idleText;
  }

  if (isLoading) {
    btn.classList.add("loading");
    btn.innerHTML = `<span class="sheet-loader-inline" aria-label="Loading"></span>`;
  } else {
    btn.classList.remove("loading");
    btn.innerHTML = btn.dataset.originalHtml;
  }
}

function setContainerLoading(containerEl, isLoading, text = "Loading...") {
  if (!containerEl) return;

  // create loader node once
  let loader = containerEl.querySelector(".sheet-list-loading");
  if (!loader) {
    loader = document.createElement("div");
    loader.className = "sheet-list-loading";
    loader.innerHTML = `
      <span class="sheet-loader-inline" aria-label="Loading"></span>
      <span class="sheet-list-loading-text"></span>
    `;
    containerEl.prepend(loader);
  }

  loader.querySelector(".sheet-list-loading-text").textContent = text;
  loader.style.display = isLoading ? "flex" : "none";
}
/* --------------------------------------------------------------- */

async function createSheetList() {
  ensureSheetLoaderStyles();

  const sheetListContainer = document.createElement("div");
  sheetListContainer.className = "sheet-list-container hidden";
  const sheetListHtmlUrl = chrome.runtime.getURL("assets/html/sheetlist.html");

  try {
    // show loader while fetching HTML
    setContainerLoading(sheetListContainer, true, "Preparing sheet picker...");

    const response = await fetch(sheetListHtmlUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet list HTML: ${response.statusText}`);
    }
    const html = await response.text();
    sheetListContainer.innerHTML = html;
    document.body.appendChild(sheetListContainer);

    // if sheetlist.html already has its own loader area you can remove this line
    setContainerLoading(sheetListContainer, false);
  } catch (error) {
    console.error("Error creating sheet list:", error);
  }

  try {
    LoadsheetJS();
  } catch (error) {
    console.error("Error loading sheet list:", error);
  }
}

function createSheetItems(data, parentNode) {
  return data.map((sheet) => {
    let sheetItem = document.createElement("li");
    sheetItem.dataset.id = sheet.id;
    sheetItem.style.display = "flex";
    sheetItem.style.alignItems = "center";
    sheetItem.style.gap = "10px";
    sheetItem.style.padding = "8px";
    sheetItem.style.borderBottom = "1px solid #ddd";

    sheetItem.innerHTML = `
      <img 
        src="https://cdn.gmass.us/img2017/google-sheets.png" 
        alt="Google Sheets Icon" 
        width="50" 
        height="50"
        style="border-radius: 4px;"
      >
      <span style="font-size: 16px; font-weight: 500; color: #333;">
        ${sheet.name}
      </span>
      <span style="font-size: 14px; color: #86888A; white-space: nowrap; margin-left: auto;">
        ${new Date(sheet.createdTime)
          .toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
          .replace(/ /g, " ")}
      </span>
    `;
    parentNode.appendChild(sheetItem);

    return sheetItem;
  });
}

function createSheetNames(data, parentNode) {
  return data.map((sheet) => {
    let sheetItem = document.createElement("li");
    sheetItem.dataset.id = sheet;
    sheetItem.style.display = "flex";
    sheetItem.style.alignItems = "center";
    sheetItem.style.gap = "10px";
    sheetItem.style.padding = "8px";
    sheetItem.style.borderBottom = "1px solid #ddd";

    sheetItem.innerHTML = `
      <img 
        src="https://cdn.gmass.us/img2017/google-sheets.png" 
        alt="Google Sheets Icon" 
        width="50" 
        height="50"
        style="border-radius: 4px;"
      >
      <span style="font-size: 16px; font-weight: 500; color: #333;">
        ${sheet}
      </span>
    `;
    parentNode.appendChild(sheetItem);

    return sheetItem;
  });
}

async function fetchAndDisplaySheetNames() {
  let sheetNameResponseData;
  const container = document.querySelector(".sheet-list-container");

  try {
    setContainerLoading(container, true, "Loading sheet tabs...");
    console.log(
      "https://10xsend.in/api/get-sheet-names?sender=" +
        encodeURIComponent(sessionStorage.getItem("sender")) +
        "&spreadsheetId=" +
        sessionStorage.getItem("spreadsheetId")
    );

    const sheetNameResponse = await fetch(
      "https://10xsend.in/api/get-sheet-names?sender=" +
        encodeURIComponent(sessionStorage.getItem("sender")) +
        "&spreadsheetId=" +
        sessionStorage.getItem("spreadsheetId")
    );

    if (!sheetNameResponse.ok) {
      throw new Error(
        "Sheet Name Network response was not ok " + sheetNameResponse.statusText
      );
    }

    sheetNameResponseData = await sheetNameResponse.json();
  } catch (error) {
    sheetNameResponseData = { sheetNames: ["Sheet1"] };
    console.error("Error fetching sheet names:", error);
  } finally {
    setContainerLoading(container, false);
  }

  const sheet_dropdown_list = document.querySelector("#sheet-dropdown-list");
  sheet_dropdown_list.innerHTML = "";
  createSheetNames(sheetNameResponseData["sheetNames"], sheet_dropdown_list);
}

async function sheetListJs() {
  const sheetList = document.querySelector("#dropdown-list"); // UL
  const L = window.LoaderUI;

  try {
    L?.list?.(sheetList, true, "Loading your Google Sheets...");

    const response = await fetch(
      "https://10xsend.in/api/list-sheets?sender=" +
        encodeURIComponent(sessionStorage.getItem("sender")),
      {
        method: "GET",
        headers: {
          "x-api-key": "priyam",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const data = await response.json();

    sheetList.innerHTML = "";
    createSheetItems(data["result"], sheetList);
  } catch (error) {
    console.error("Error fetching sheet list:", error);
    if (sheetList) {
      sheetList.innerHTML = `<li style="padding:10px;">Failed to load spreadsheets</li>`;
    }
  } finally {
    L?.list?.(sheetList, false);
  }
}

function create_headers(newHeaders) {
  fetch(
    `https://10xsend.in/api/create-headers?sender=${encodeURIComponent(
      sessionStorage.getItem("sender")
    )}&range=${encodeURIComponent(
      sessionStorage.getItem("range")
    )}&spreadsheetId=${encodeURIComponent(
      sessionStorage.getItem("spreadsheetId")
    )}&newHeaders=${newHeaders}`,
    {
      method: "GET",
      headers: {
        "x-api-key": "priyam",
        "Content-Type": "application/json",
      },
    }
  );
}

function LoadsheetJS() {
  const dropdown = document.getElementById("dropdown");
  const placeholder = document.getElementById("dropdown-placeholder");
  const searchInput = document.getElementById("dropdown-search");
  const dropdownList = document.getElementById("dropdown-list");
  const sheet_dropdown = document.getElementById("sheet-dropdown");
  const sheet_placeholder = document.getElementById("sheet-dropdown-placeholder");
  const sheet_searchInput = document.getElementById("sheet-dropdown-search");
  const sheet_dropdownList = document.getElementById("sheet-dropdown-list");

  sheet_dropdown.addEventListener("click", (event) => {
    event.stopPropagation();
    sheet_placeholder.style.display = "none";
    sheet_searchInput.style.display = "flex";
    sheet_searchInput.focus();
    sheet_dropdownList.classList.remove("hidden");
  });

  sheet_searchInput.addEventListener("input", (e) => {
    const searchValue = e.target.value.toLowerCase();
    const listItems = sheet_dropdownList.querySelectorAll("li");
    listItems.forEach((item) => {
      item.style.display = item.textContent.toLowerCase().includes(searchValue)
        ? "flex"
        : "none";
    });
  });

  sheet_dropdownList.addEventListener("click", (e) => {
    const target = e.target.closest("LI, SPAN");
    SpreadsheetSave.style.display = "block";
    if (target) {
      const selectedItem = target.tagName === "SPAN" ? target.parentElement : target;
      console.log("Selected tab:", selectedItem.textContent);
      sheet_placeholder.textContent = selectedItem.textContent;
      sessionStorage.setItem("range", selectedItem.dataset.id);
      sheet_searchInput.value = "";
      sheet_searchInput.style.display = "none";
      sheet_placeholder.style.display = "block";
      sheet_dropdownList.classList.add("hidden");
    }
  });

  const SpreadsheetSave = document.getElementById("SpreadsheetSave");
  const sheetListContainer = document.querySelector(".sheet-list-container");
  const mainContainer = document.querySelector(".main");

  dropdown.addEventListener("click", (event) => {
    event.stopPropagation();
    placeholder.style.display = "none";
    searchInput.style.display = "flex";
    searchInput.focus();
    dropdownList.classList.remove("hidden");
    sheet_dropdownList.classList.add("hidden");
  });

  searchInput.addEventListener("input", (e) => {
    const searchValue = e.target.value.toLowerCase();
    const listItems = dropdownList.querySelectorAll("li");
    listItems.forEach((item) => {
      item.style.display = item.textContent.toLowerCase().includes(searchValue)
        ? "flex"
        : "none";
    });
  });

  closeButton = document.querySelector("#close-btn");
  closeButton.addEventListener("click", () => {
    console.log("Close Button Clicked");
    sheetListContainer.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      searchInput.value = "";
      searchInput.style.display = "none";
      placeholder.style.display = "block";
    }
    if (!sheet_dropdown.contains(e.target)) {
      sheet_searchInput.value = "";
      sheet_searchInput.style.display = "none";
      sheet_placeholder.style.display = "block";
      sheet_dropdownList.classList.add("hidden");
    }
  });

  dropdownList.addEventListener("click", (e) => {
    const target = e.target.closest("LI, SPAN");
    if (target) {
      const sheetList = document.querySelector("#sheet-dropdown");
      sheetList.style.display = "flex";
      const selectedItem = target.tagName === "SPAN" ? target.parentElement : target;

      console.log(
        "Selected sheet:",
        String(selectedItem.textContent)
          .split("\n")
          .filter((item) => item.trim() !== "")
      );

      placeholder.textContent = selectedItem.textContent;
      sessionStorage.setItem("spreadsheetId", selectedItem.dataset.id.replace(/[()]/g, ""));
      searchInput.value = "";
      searchInput.style.display = "none";
      placeholder.style.display = "block";
      dropdownList.classList.add("hidden");

      try {
        fetchAndDisplaySheetNames();
      } catch (error) {
        console.error("Error fetching sheet names:", error);
      }
      sheet_dropdown.classList.remove("hidden");
    }
  });

  SpreadsheetSave.addEventListener("click", () => {
    console.log("Saving...");
    const newHeaders = [
      "Start Date",
      "End Date",
      "Opens",
      "Clicks",
      "Unsubscribed",
      "Bounced",
      "Sent",
      "Replied",
    ];
    create_headers(newHeaders);
    sheetListContainer.classList.add("hidden");

    try {
      const bodyField = document.querySelector(".Am.aiL.Al.editable.LW-avf.tS-tW");
      if (!bodyField) {
        const compose = document.querySelector(".T-I.T-I-KE.L3");
        if (compose) compose.click();
      }

      setTimeout(() => {
        fetchDataFromSheet();
      }, 1000);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  });

  sheetListContainer.addEventListener("click", () => {
    sheetListContainer.classList.toggle("hidden");
  });

  mainContainer.addEventListener("click", (event) => {
    event.stopPropagation();
    placeholder.style.display = "block";
    sheet_placeholder.style.display = "block";
    searchInput.style.display = "none";
    sheet_searchInput.style.display = "none";
    dropdownList.classList.add("hidden");
    sheet_dropdownList.classList.add("hidden");
  });
}

async function createSignUp() {
  const modalContainer = document.createElement("div");
  modalContainer.classList.add("modal", "fade", "gMassSec");
  modalContainer.id = "signGmass";
  modalContainer.setAttribute("tabindex", "-1");
  modalContainer.setAttribute("aria-labelledby", "gMasspopSec");
  modalContainer.setAttribute("aria-hidden", "true");

  modalContainer.innerHTML = `
    <div class="modal fade googleConnSec" id="connectGoogle" tabindex="-1" aria-labelledby="connectGoogleLabel"
      aria-hidden="true">
      <div class="modal-dialog">
          <div class="modal-content">
              <div class="modal-body googleInnSec">
                  <div class="GoogleSecLogo">
                      <img src="https://raw.githubusercontent.com/DrkCrypt/Dropmenu/c89c0bd91ee593350a301010a21dda91b1816747/assets/10x/google-icon.svg" class="img-fluid" alt="">
                      <span></span>
                      <img src="https://raw.githubusercontent.com/DrkCrypt/Dropmenu/c89c0bd91ee593350a301010a21dda91b1816747/assets/10x/10x-logo-green.svg" class="img-fluid" alt="">
                  </div>
                  <div class="InnerContent">
                      <h2>Connect with Google</h2>
                      <p>Seamlessly connect your Google account to automate and personalize your email campaigns.
                      </p>
                  </div>
                <div class="googlePopBtns">
                  <button type="button" class="btn btn-primary signGoogLink" style="color: white;padding-left: 2px;">Sign in to Continue</button>
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" style="padding-left: 2px;">Back</button>
                </div>
              </div>
          </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalContainer);

  document.querySelector(".signGoogLink").addEventListener("click", () => {
    try {
      createMsgBox("Initiating Google Sign-In process...");
      chrome.runtime.sendMessage({
        action: "authenticate",
        sender: sessionStorage.getItem("sender"),
      });
    } catch (error) {
      console.error("Error sending message to background script:", error);
    }

    setTimeout(() => {
      document.querySelector("#signGmass").style.display = "none";
    }, 10000);
  });

  document.querySelector("#signGmass").addEventListener("click", () => {
    document.querySelector("#signGmass").style.display = "none";
  });

  document.querySelector(".modal-dialog").addEventListener("click", (e) => {
    e.stopPropagation();
  });

  return modalContainer;
}

async function CheckSignedIn() {
  try {
    const sender = sessionStorage.getItem("sender");
    const response = await fetch(
      "https://10xsend.in/api/isUserSigned?user=" + encodeURIComponent(sender),
      {
        method: "GET",
        headers: {
          "x-api-key": "priyam",
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    const isSignedIn = data["isSignedIn"];

    if (!isSignedIn && sender && sender.toLowerCase().includes("")) {
      document.querySelector("#signGmass").style.display = "flex";
      console.log("Please sign-in with your authorized email.");
    }
    return isSignedIn;
  } catch (error) {
    console.error("Error checking sign-in status:", error);
    return false;
  }
}

const sheetObserver = new MutationObserver(() => {
  // const gmailSearch = document.querySelector(".gb_Be");

  const gmailSearch =
    document.querySelector('#aso_search_form_anchor [gh="sb"]') ||
    document.querySelector('form[role="search"][aria-label="Search mail"] [gh="sb"]');

  if (gmailSearch && !document.querySelector("#sheet-button")) {
    console.log("Searching for Gmail Search Bar...");
    let sender = document.querySelector(".gb_B.gb_Za.gb_0");
    if (sender) {
      sender = sender.getAttribute("aria-label").split("\n");
      sender = sender[sender.length - 1].replace("(", "").replace(")", "");
    }

    createSignUp();
    CheckSignedIn();
    createSheetList();

    const buttonContainer = document.createElement("div");
    const sheetButton = document.createElement("div");
    const report = document.createElement("a");

    report.href = `https://10xsend.in/:${sessionStorage.getItem("sender") || sender}`;
    report.target = "_blank";
    report.id = "reportdata";

    sheetButton.id = "sheet-button";
    sheetButton.className = "sheet-button";
    sheetButton.title = "Connect to an email list in a Google Sheet.";
    buttonContainer.className = "button-container";
    gmailSearch.parentElement.style.display = "flex";
    gmailSearch.style.width = "100%";
    buttonContainer.appendChild(sheetButton);
    buttonContainer.appendChild(report);
    gmailSearch.parentElement.insertBefore(buttonContainer, gmailSearch.nextSibling);

    sheetButton.addEventListener("click", async () => {
      ensureSheetLoaderStyles();
      setButtonLoading(sheetButton, true, "Sheets");

      try {
        const isSignedIn = await CheckSignedIn();
        if (isSignedIn) {
          createMsgBox("Checking Permissions of Google Sheet...");

          // show list container (if it exists) and show loader inside it while fetching
          const container = document.querySelector(".sheet-list-container");
          if (container) setContainerLoading(container, true, "Loading your Google Sheets...");

          await sheetListJs();

          if (container) setContainerLoading(container, false);

          document.querySelector(".sheet-list-container")?.classList.toggle("hidden");
        }
      } catch (error) {
        console.error("Error handling sheet button click:", error);
      } finally {
        setButtonLoading(sheetButton, false, "Sheets");
      }
    });

    sheetObserver.disconnect();
  }
});

sheetObserver.observe(document.body, { childList: true, subtree: true });
