console.log("Executing Content Script");
function createSendButton() {
  const sendButton = document.createElement("div");
  sendButton.setAttribute("role", "button");
  sendButton.textContent = "10xSend";
  sendButton.id = "send-button";

  sendButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    let Composebox = document.querySelectorAll(".agP");
    if (
      Composebox[Composebox.length - 1].value == "developer@10x.com" ||
      Composebox[0].value == "developer@10x.in"
    ) {
      createDraft();
    } else {
      sendMails();
      setTimeout(() => {
        sessionStorage.removeItem("DelayCheckbox");
        sessionStorage.removeItem("followuptime");
        sessionStorage.removeItem("stagetextarea-values");
        sessionStorage.removeItem("sender");
        sessionStorage.removeItem("MaxEmails");
        sessionStorage.removeItem("schedule");
        ["stage1", "stage2", "stage3", "stage4", "stage5"].forEach(
          (stage, index) => {
            sessionStorage.removeItem(stage);
            sessionStorage.removeItem(`draftBody${index + 1}`);
          }
        );
      }, 20000);
    }
    setTimeout(() => {
      const deleteBtn = document.querySelectorAll(".og.T-I-J3");
      deleteBtn[deleteBtn.length - 1].click();
    }, 5000);
  });
  return sendButton;
}

function createDraft() {
  const createDraft = async () => {
    const url = "https://10xsend.in/api/create_draft";
    const subject = document.querySelectorAll(".aoT");
    const emailBody = window.document.querySelectorAll(
      ".Am.aiL.Al.editable.LW-avf.tS-tW"
    );
    const draftData = {
      sender: sessionStorage.getItem("sender"),
      recipient: "developer@10x.com",
      subject: subject[subject.length - 1]?.value + " True" || "",
      body: emailBody[emailBody.length - 1]?.innerHTML || "",
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draftData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Draft created successfully:", result);
        createMsgBox("Draft Created Successfully");
      } else {
        const error = await response.json();
        console.error("Error creating draft:", error);
      }
    } catch (err) {
      console.error("Network or unexpected error:", err);
    }
  };

  createDraft();
}

function createButton(id) {
  const button = document.createElement("button");
  const dropupMenu = document.createElement("div");

  button.id = id;
  button.innerHTML = `
      <button class="arrow-btn" id="rotateBtn">
        <svg class="arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>`;
  button.style.marginLeft = "0px";
  button.style.position = "relative";
  dropupMenu.style.position = "fixed";
  dropupMenu.style.display = "none";
  dropupMenu.style.zIndex = "9999";
  try {
    fetchAndInjectDropupMenu(dropupMenu);
  } catch (error) {
    console.log("Error fetching and injecting dropup menu:", error);
  }

  document.addEventListener("click", () => {
    if (dropupMenu.style.display === "block") {
      toggleDropupMenu(dropupMenu);
    }
  });

  dropupMenu.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleDropupMenu(dropupMenu);
  });
  return { button, dropupMenu };
}
function fetchAndInjectDropupMenu(dropupMenu) {
  const htmlUrl = chrome.runtime.getURL("assets/html/dropmenu.html");
  fetch(htmlUrl)
    .then((response) => response.text())
    .then((htmlContent) => {
      const iframe = document.createElement("iframe");
      iframe.style.border = "none";
      dropupMenu.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(htmlContent);
      doc.close();

      iframe.onload = () => {
        const doc = iframe.contentWindow.document;
        try {
          dropupJs(doc);
        } catch (error) {
          console.error("Error:", error);
        }
        try {
          emailFunctionalities(doc);
        } catch (error) {
          console.error("Error:", error);
        }
      };
    })
    .catch((error) => {
      console.error("Error loading the HTML:", error);
    });
}

function toggleDropupMenu(dropupMenu) {
  const arrow = document.querySelector(".arrow");
  if (arrow) {
    arrow.classList.toggle("rotate");
  }
  dropupMenu.style.display =
    dropupMenu.style.display === "none" ? "block" : "none";
}

// function createEmailForm() {
//   const container = document.createElement("div");
//   container.style.display = "none";

//   const containerContent = document.createElement("div");
//   containerContent.style.display = "none";
//   containerContent.innerHTML = `
//     <div class="form-container containerContent">
//       <div class="template">
//         <button id="close-button" aria-label="Close">×</button>
//         <div class="form-content">
//           <input
//             type="text"
//             id="email-subject"
//             placeholder="Subject"
//             aria-label="Email Subject"
//           />
//           <textarea
//             id="email-body"
//             placeholder="Email Body"
//             aria-label="Email Body"
//           ></textarea>
//           <button id="save-button">Save</button>
//         </div>
//       </div>
//     </div>
//   `;

//   container.appendChild(containerContent);
//   document.body.appendChild(container);

//   document.addEventListener("keydown", (event) => {
//     if (event.key === "Escape") {
//       const trackingElement = document.querySelector("#iyEIROpenTracking");
//       const followUpElement = document.querySelector("#followup");

//       console.log(!trackingElement);
//       if (!trackingElement) {
//         sessionStorage.setItem("tracking", false);
//       }
//       if (!followUpElement) {
//         sessionStorage.setItem("followup", 0);
//       }
//       try {
//         container.style.display = "none";
//         containerContent.style.display = "none";
//       } catch (e) {
//         console.error("Error handling Escape key:", e);
//       }
//     }
//   });

//   const saveButton = document.getElementById("save-button");
//   saveButton.addEventListener("click", () => saveEmailForm(containerContent));

//   return { containerbox: container, containerContentbox: containerContent };
// }

function saveEmailForm(containerContent) {
  const emailSubjectInput = document.getElementById("email-subject");
  const emailBodyInput = document.getElementById("email-body");

  localStorage.setItem("Subject", emailSubjectInput.value);
  localStorage.setItem("EmailBody", emailBodyInput.value);

  containerContent.style.display = "none";
}

function appendConnectButton() {
  const connect = document.createElement("span");
  connect.id = "connect-button";
  connect.className = "aB gQ pE";
  connect.textContent = "Connect";
  connect.addEventListener("click", () => {
    createMsgBox("Fetching data from Google Sheet...");
    fetchDataFromSheet();
  });

  const targetElement = document.querySelector(".baT");
  const existingConnectButton = targetElement.querySelector("#connect-button");
  if (targetElement && !existingConnectButton) {
    targetElement.appendChild(connect);
  } else if (!targetElement) {
    console.error("Element with class '.baT' not found");
  }
}

function toggleContainerDisplay(container, containerContent) {
  const dropdown = container.style.display === "block" ? "none" : "block";
  containerContent.style.display = dropdown;
  container.style.display = dropdown;
  const closeButton = document.querySelector("#close-button");
  if (!closeButton.hasAttribute("data-event-attached")) {
    closeButton.setAttribute("data-event-attached", "true");
    closeButton.addEventListener("click", () => {
      console.log("Close Button Clicked");
      container.style.display = "none";
      containerContent.style.display = "none";
    });
  }
}
function composeDraft() {
  document.querySelector(".T-I.T-I-KE.L3").click();
  setTimeout(() => {
    let SubjectBox = document.querySelectorAll(".aoT");
    let sendButtons = document.querySelectorAll("#send-button");
    sendButtons[sendButtons.length - 1].textContent = `Save`;
    const gmailSend = document.querySelectorAll(
      ".T-I.J-J5-Ji.aoO.v7.T-I-atl.L3"
    );
    const emailBody = window.document.querySelectorAll(
      ".Am.aiL.Al.editable.LW-avf.tS-tW"
    );
    const TTLS = document.querySelectorAll(".T-I.J-J5-Ji.aoO.v7.T-I-atl.L3");
    const lastTTL = TTLS[TTLS.length - 1];
    lastTTL.style.pointerEvents = "none";
    lastTTL.style.width = "10px";
    lastTTL.style.minWidth = "0px";
    gmailSend[gmailSend.length - 1].textContent = ":";

    SubjectBox[SubjectBox.length - 1].value = "Auto Page Template 1";
    emailBody[
      emailBody.length - 1
    ].innerHTML = `<p>Replace this entire message (including this line) with your template, and set a Subject to later identify this template.<br><br>Compose the message to be used as your auto follow-up template. You can use <strong>fonts, colors, images, attachments, and any personalization variables</strong> from your original campaign message.<br><br>The address in the To field is a special address to save auto follow-up templates, so don't change that.<br><br>When you're done, <strong>click the GMass button just to save the auto follow-up template</strong> into your account. No emails will be sent when you hit the GMass button.<br><br>Then go back to your original campaign, <strong>refresh the Auto Followup dropdown</strong> and select this message. <a target="_blog" href="https://www.gmass.co/blog/rich-content-auto-follow-up-email-sequence/">More instructions here</a>, including a <a href="https://youtu.be/zBHzOe0BDf0" target="_blog">video</a> of this process.</p>`;
  }, 10);
  setTimeout(() => {
    let Composebox = document.querySelectorAll(".agP");
    Composebox[Composebox.length - 1].value = "developer@10x.com";
    Composebox[Composebox.length - 1].setAttribute("readonly", "true");
  }, 1000);
}

function viewAllDrafts(slectMessage, droupOpenSec) {
  slectMessage.addEventListener("click", () => {
    droupOpenSec.classList.toggle("hidden");
  });
}

function fetchDrafts(
  listmesaageshow,
  slectMessage,
  droupOpenSec,
  index,
  reload = false
) {
  fetch(
    `https://10xsend.in/api/drafts?sender=${sessionStorage.getItem("sender")}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.drafts && Array.isArray(data.drafts)) {
        const uniqueDrafts = [];
        const seenIds = new Set();

        data.drafts.forEach((draft) => {
          if (!seenIds.has(draft.subject)) {
            uniqueDrafts.push(draft);
            seenIds.add(draft.subject);
          }
        });

        const draftsToShow = uniqueDrafts.slice(0, 5);
        const emailBody = document.querySelectorAll(".email-body")[index];
        const emailHeader = document.querySelectorAll(".email-header")[index];
        listmesaageshow.innerHTML = "";
        if (listmesaageshow.childNodes.length === 0 || reload) {
          draftsToShow.forEach((draft) => {
            const draftLi = document.createElement("li");
            const subject = draft.subject.replace("True", "");

            draftLi.setAttribute("data-body", draft.body);
            if (draft.subject.includes("True")) {
              draftLi.innerHTML = `
                <span>${subject || "No Subject"}</span>
              `;

              listmesaageshow.appendChild(draftLi);
              draftLi.addEventListener("click", (e) => {
                e.stopPropagation();
                emailHeader.textContent = subject || "No Subject";
                emailBody.innerHTML = "<br>" + draft.body + "<br><hr>";
                slectMessage.textContent = subject || "No Subject";
                droupOpenSec.classList.add("hidden");
                sessionStorage.setItem(`draftBody${index + 1}`, draft.body);
              });
            }
          });
        }
      } else {
        console.log("No drafts found in the response");
      }
    })
    .catch((error) => {
      console.error("Error fetching drafts:", error);
    });
}
function showDraft(listMessageShow, selectMessage, droUpOpenSec) {
  listMessageShow.forEach((list, index) => {
    viewAllDrafts(selectMessage[index], droUpOpenSec[index]);
    fetchDrafts(list, selectMessage[index], droUpOpenSec[index], index);
  });
}

function draftButtons(document, listMessageShow, selectMessage, droUpOpenSec) {
  refresIcon = document.querySelectorAll(".refresIcon");
  refresIcon.forEach((icon, index) => {
    icon.addEventListener("click", () => {
      fetchDrafts(
        listMessageShow[index],
        selectMessage[index],
        droUpOpenSec[index],
        index,
        true
      );
      createMsgBox("Drafts Refreshed Successfully");
    });
  });
}

function viewFollowup(document) {
  const followContainer = window.document.querySelector(".followUpContainer");
  if (followContainer) {
    const seeButtons = document.querySelectorAll(".viewfollowup");
    seeButtons.forEach((seeButton, index) => {
      seeButton.addEventListener("click", () => {
        followContainer.classList.remove("hidden");
        const mainContainer = window.document.querySelector(
          `.followUpContainer${index + 1}`
        );

        mainContainer.classList.toggle("hidden");
        if (mainContainer) {
          hideFollowUpSectionOnClickOutside(mainContainer);
        }
      });
    });
    return;
  }
  const seeButtons = document.querySelectorAll(".viewfollowup");
  const followUpSectionContainer = document.createElement("div");
  followUpSectionContainer.classList.add("followUpContainer");
  followUpSectionContainer.classList.add("hidden");

  followUpSectionContainer.innerHTML = `
      <div class="followUpContainer1 hidden">
        <div class="email-container">
          <div class="email-header"></div>
            <div class="email-body"></div>
          </div>
        </div>
      </div>
      <div class="followUpContainer2 hidden">
        <div class="email-container">
          <div class="email-header"></div>
            <div class="email-body"></div>
          </div>
        </div>
      </div>
      <div class="followUpContainer3 hidden">
        <div class="email-container">
          <div class="email-header"></div>
            <div class="email-body"></div>
          </div>
        </div>
      </div>
      <div class="followUpContainer4 hidden">
        <div class="email-container">
          <div class="email-header"></div>
            <div class="email-body"></div>
          </div>
        </div>
      </div>
      <div class="followUpContainer5 hidden">
        <div class="email-container">
          <div class="email-header"></div>
            <div class="email-body"></div>
          </div>
        </div>
      </div>
  `;
  followUpSectionContainer.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  window.document.body.appendChild(followUpSectionContainer);

  seeButtons.forEach((seeButton, index) => {
    seeButton.addEventListener("click", () => {
      followUpSectionContainer.classList.remove("hidden");
      const mainContainer = window.document.querySelector(
        `.followUpContainer${index + 1}`
      );

      mainContainer.classList.toggle("hidden");
      if (mainContainer) {
        hideFollowUpSectionOnClickOutside(mainContainer);
      }
    });
  });
}

function populateVariablesList(dropdownContent, variables) {
  const Fields = dropdownContent.querySelector(".personalize-list");
  const lists = document.createElement("li");
  Fields.innerHTML = "";
  const uniqueVariables = Array.from(
    new Set(Object.keys(variables).map((key) => key))
  );
  if (uniqueVariables.length > 0) {
    uniqueVariables.forEach((key) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `<span>${key}</span>`;
      Fields.appendChild(listItem);
      listItem.addEventListener("click", () => {
        navigator.clipboard.writeText(`{${key}}`);
        createMsgBox(`Copied ${key} to clipboard`);
      });
    });
  } else {
    lists.innerHTML = `
    <li><span>No variables found</span></li>
    `;
    Fields.appendChild(lists);
  }
}

function handleDayItemClick(trigger, dropdowndays, item) {
  return function () {
    console.log("item clicked");
    trigger.querySelector("span").textContent = item.textContent;
    dropdowndays.classList.add("hidden");
  };
}

function setupDaysDropdown(trigger, dropdowndays, items) {
  items.forEach((item) => {
    item.addEventListener(
      "click",
      handleDayItemClick(trigger, dropdowndays, item)
    );
  });
}

const toggleDropdown = (dropdownContent) => () => {
  dropdownContent.style.display =
    dropdownContent.style.display === "block" ? "none" : "block";
};

const filterListItems = (listItems) => (event) => {
  const filter = event.target.value.toLowerCase();
  listItems.forEach((item) => {
    if (item.textContent.toLowerCase().includes(filter)) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
};

const setupDropdown = (dropdownHeader, dropdownContent) => {
  const searchInput = dropdownContent.querySelector("input");
  const listItems = Array.from(
    dropdownContent.querySelectorAll(".dropdown-list li")
  );
  dropdownHeader.addEventListener("click", toggleDropdown(dropdownContent));
  searchInput.addEventListener("input", filterListItems(listItems));
};

function setupAccordionToggle(accordionTitles) {
  accordionTitles.forEach((title) => {
    title.addEventListener("click", () => {
      const content = title.nextElementSibling;
      if (content.classList.contains("buttonshowpice")) {
        content.classList.toggle("hidden");
        content.nextElementSibling.classList.toggle("active");
      } else {
        content.classList.toggle("active");
      }
    });
  });
}
function dropupJs(document) {
  const accordionTitles = document.querySelectorAll(".g_accordian_title");
  const SendDaysOn = document.querySelector("#EUYaSSendDaysOn");
  const skipHolidays = document.querySelector("#EUYaSSkipHolidays");
  const dropdowndays = document.getElementById("listsecOpenDays");
  const triggerdays = document.querySelector(".senddays");
  const droPosisionDays = document.querySelector(".droPosisionDays");
  const itemsdays = document.querySelectorAll(
    ".listdaysShow label.form-check-label"
  );
  const checkboxes = droPosisionDays.querySelectorAll(".form-check-input");
  const sendButton = document.getElementById("test-send");
  const testInput = document.getElementById("test-input");
  const dropdownHeader = document.querySelector(".dropdown-header");
  const dropdownContent = document.querySelector(".dropdown-content");
  const variables = JSON.parse(sessionStorage.getItem("variables") || "{}");
  const createDrafts = document.querySelectorAll(".CreateDrafts");
  const listMessageShow = document.querySelectorAll(".listmesaageshow");
  const selectMessage = Array.from(document.querySelectorAll(".slectMessage"));
  const droUpOpenSec = Array.from(document.querySelectorAll(".droupOpenSec"));
  const refreshBtn = document.querySelector("#refreshBtn");

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      if (dropdownContent) {
        populateVariablesList(dropdownContent, variables);
      }
    });
  }

  if (skipHolidays) {
    skipHolidays.addEventListener("change", () => {
      sessionStorage.setItem("skipHolidays", skipHolidays.checked);
    });
  }
  if (createDrafts) {
    createDrafts.forEach((draft) => {
      draft.addEventListener("click", () => composeDraft());
    });
  }

  draftButtons(document, listMessageShow, selectMessage, droUpOpenSec);
  showDraft(listMessageShow, selectMessage, droUpOpenSec);

  setupDaysDropdown(triggerdays, dropdowndays, itemsdays);
  if (dropdownHeader && dropdownContent) {
    setupDropdown(dropdownHeader, dropdownContent);
  }

  setupAccordionToggle(accordionTitles);
  viewFollowup(document);
  document.addEventListener("click", (event) => {
    if (dropdownHeader && dropdownContent) {
      const isClickInside =
        dropdownHeader.contains(event.target) ||
        dropdownContent.contains(event.target);
      if (!isClickInside) {
        dropdownContent.style.display = "none";
      }
    }
  });
  SendDaysOn.addEventListener("change", () => {
    triggerdays.classList.toggle("hidden");
    sessionStorage.setItem("SendDaysOn", SendDaysOn.checked);
  });

  triggerdays.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdowndays.classList.toggle("hidden");
  });
  document.addEventListener("click", (e) => {
    if (
      !dropdowndays.contains(e.target) &&
      !triggerdays.contains(e.target) &&
      !selectMessage.some((el) => el.contains(e.target))
    ) {
      dropdowndays.classList.add("hidden");
      droUpOpenSec.forEach((section) => section.classList.add("hidden"));
    }
  });

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const updatedCheckedDays = Array.from(checkboxes)
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);
      sessionStorage.setItem("checkedDays", JSON.stringify(updatedCheckedDays));
    });
  });

  if (sendButton && testInput) {
    sendButton.addEventListener("click", () => {
      const email = testInput.value;
      sendTestMail(email);
    });
  }
}
function updateSchedule(value, scheduleinput) {
  const now = new Date();
  let datetime;

  const formatIST = (date) => {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(date);
  };

  switch (value) {
    case "Now":
      datetime = new Date(now.getTime() + 10 * 1000);
      break;
    case "FiveMinutes":
      datetime = new Date(now.getTime() + 5 * 60 * 1000);
      break;
    case "OneHour":
      datetime = new Date(now.getTime() + 60 * 60 * 1000);
      break;
    case "ThreeHours":
      datetime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
      break;
    case "TomorrowMor":
      datetime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        8,
        0,
        0
      );
      break;
    case "TomorrowAft":
      datetime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        13,
        0,
        0
      );
      break;
    case "TomorrowEve":
      datetime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        19,
        0,
        0
      );
      break;
    case "Custom":
      scheduleinput.disabled = false;
      scheduleinput.value = formatIST(datetime);
      scheduleinput.addEventListener("change", () => {
        const datetime = new Date(scheduleinput.value);
        const formattedDatetime = `${datetime.getDate()}/${
          datetime.getMonth() + 1
        }/${datetime.getFullYear()}, ${datetime.toLocaleTimeString("en-IN", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
        })}`;
        sessionStorage.setItem("schedule", formattedDatetime);
      });
      return;
    default:
      console.warn("Unexpected schedule value:", value);
      return;
  }

  const formattedDatetime = formatIST(datetime);
  sessionStorage.setItem("schedule", formattedDatetime);
  scheduleinput.value = formattedDatetime;
  scheduleinput.disabled = true;
}

const lockOriginalBox = (document, stageBody, valuesArray) => {
  stageBody.forEach((stage, index) => {
    document.querySelector(stage).addEventListener("change", () => {
      setTimeout(() => {
        const orgTextBox = document.querySelector(`#w3reviewS${index + 1}`);
        orgTextBox.value = "";
        const storedValues = valuesArray;
        storedValues[index] = "";
        sessionStorage.setItem(
          `stagetextarea-values`,
          JSON.stringify(storedValues)
        );
        orgTextBox.disabled = true;
        orgTextBox.classList.add("disabletextarea");
      }, 0);
    });
  });
};
function emailFunctionalities(document) {
  const schedule = document.querySelector("#EUYaSGMassDateDropdown");
  const followUpElement = document.querySelector("#followup");
  const inputDays = document.querySelector("#days");
  const trackingElement = document.querySelector("#iyEIROpenTracking");
  const UrlTrack = document.querySelector("#iyEIROpenClick");
  const unsubLink = document.querySelector("#unsubLink");
  const copyunsub = document.querySelector(".copy-content");

  const MaxEmails = document.querySelector("#bqpifMaxEmails");
  const DelayCheckbox = document.querySelector("#bqpifDelayCheckbox");
  const PauseSeconds = document.querySelector("#bqpifPauseSeconds");

  const scheduleinput = document.querySelector("#EUYaSGMassDateTime");
  const followuptime1 = document.querySelector("#daysS1");
  const followuptime2 = document.querySelector("#daysS2");
  const followuptime3 = document.querySelector("#daysS3");
  const followuptime4 = document.querySelector("#daysS4");
  const followuptime5 = document.querySelector("#daysS5");

  const showButtons = document.querySelectorAll(".showP");
  const ClickShowPiece = document.querySelector(".ClickShowPiece");
  const OpenShowPiece = document.querySelector(".OpenShowPiece");
  const pauseShowPice = document.querySelector(".pauseShowPice");

  const MailConditions = document.querySelectorAll(".norepselect");
  const stagetextarea = document.querySelectorAll(".stagetextarea");
  const valuesArray = Array(stagetextarea.length).fill("");
  const unsubMarker = document.querySelector("#unsubMarker")?.checked || false;
  sessionStorage.setItem("unsubMarker", JSON.stringify(unsubMarker));
  const stages = [];
  const times = [];
  const stageContainers = [];
  const stageInputs = [];
  const stagebody = [];

  for (let i = 1; i <= 5; i++) {
    stages.push(`stage${i}`);
    times.push(`.timeS${i}`);
    stageContainers.push(`.S${i}`);
    stageInputs.push(`.stageNumberinputS${i}`);
    stagebody.push(`.sendoris${i}`);
  }

  try {
    lockOriginalBox(document, stagebody, valuesArray);
  } catch (error) {
    console.log("Error locking original boxes:", error);
  }
  copyunsub.addEventListener("click", () => {
    createMsgBox("Copied to clipboard");
    navigator.clipboard.writeText(
      "https://10xsend.in/api/unsubscribe?Email=#&userID=#"
    );
  });
  const setFollowUpTime = (index, value) => {
    const followuptime = JSON.parse(
      sessionStorage.getItem("followuptime") || '["", "", "", "", ""]'
    );
    followuptime[index] = value;
    sessionStorage.setItem("followuptime", JSON.stringify(followuptime));
  };

  // Event listeners for Followups
  [
    followuptime1,
    followuptime2,
    followuptime3,
    followuptime4,
    followuptime5,
  ].forEach((followuptime, index) => {
    followuptime.addEventListener("change", () => {
      setFollowUpTime(index, followuptime.value);
    });
  });

  const setTime = document.querySelectorAll(".settime");
  setTime.forEach((time, index) => {
    time.addEventListener("click", () => {
      const formCheck = document.querySelector(`${times[index]} .form-check`);
      if (formCheck) {
        formCheck.classList.toggle("hidden");
      } else {
        console.error(
          `Element not found for selector: ${times[index]} .form-check`
        );
      }
      try {
        const currentTime = new Date();
        document.querySelectorAll('input[type="time"]').forEach((x, i) => {
          if (i === index) {
            const hours = String(currentTime.getHours()).padStart(2, "0"); // Ensures two digits
            const minutes = String(currentTime.getMinutes()).padStart(2, "0"); // Ensures two digits
            x.value = `${hours}:${minutes}`;
          }
        });
      } catch (error) {
        console.log("Error in setting default times:", error);
      }
    });
  });
  MaxEmails.addEventListener("change", () => {
    sessionStorage.setItem("MaxEmails", MaxEmails.value);
  });

  const updateDelaySetting = () => {
    pauseShowPice.classList.toggle("hidden", !DelayCheckbox.checked);
    sessionStorage.setItem(
      "DelayCheckbox",
      DelayCheckbox.checked ? PauseSeconds.value : "0"
    );
  };
  DelayCheckbox.addEventListener("change", updateDelaySetting);
  PauseSeconds.addEventListener("change", updateDelaySetting);

  if (schedule) {
    schedule.addEventListener("change", (e) => {
      if (e.target.value !== "Now") {
        document
          .querySelector(".gmass-expand-field")
          .classList.remove("hidden");
      } else {
        document.querySelector(".gmass-expand-field").classList.add("hidden");
      }
      updateSchedule(e.target.value, scheduleinput);
    });
  }

  if (trackingElement) {
    trackingElement.addEventListener("change", () => {
      OpenShowPiece.classList.toggle("hidden", !trackingElement.checked);
      sessionStorage.setItem("tracking", trackingElement.checked);
    });
  }
  if (UrlTrack) {
    UrlTrack.addEventListener("change", () => {
      ClickShowPiece.classList.toggle("hidden", !UrlTrack.checked);
    });
  }

  if (followUpElement && inputDays) {
    const updateFollowUp = () => {
      sessionStorage.setItem(
        "followup",
        followUpElement.checked ? parseInt(inputDays.value) || 0 : ""
      );
    };
    followUpElement.addEventListener("click", updateFollowUp);
    inputDays.addEventListener("change", updateFollowUp);
  }

  stages.forEach((stageId, index) => {
    const stage = document.querySelector(`#${stageId}`);
    const timeSelector = document.querySelector(times[index]);
    const stageInput = document.querySelector(stageInputs[index]);
    if (index < stages.length - 1) {
      var nextStageContainer = document.querySelector(
        stageContainers[index + 1]
      );
    }

    if (stage) {
      stage.addEventListener("change", () => {
        console.log(`Index: ${index}`);
        if (stage.checked && index > 0) {
          const stageTextareaValues = JSON.parse(
            sessionStorage.getItem("stagetextarea-values") || "[]"
          );
          const followupTimes = JSON.parse(
            sessionStorage.getItem("followuptime") || false
          );

          if (
            !sessionStorage.getItem(`draftBody${index}`) &&
            !stageTextareaValues[index - 1]
          ) {
            stage.checked = false;
            createMsgBox(
              "You need to select the previous stage's body or fill the previous stage's body text"
            );
            return;
          } else if (
            !sessionStorage.getItem(`draftBody${index}`) &&
            stageTextareaValues[index - 1] === ""
          ) {
            stage.checked = false;
            createMsgBox(
              "You need to fill the previous stage's body text or select the previous stage's body"
            );
            return;
          }
          try {
            if (
              sessionStorage.getItem(stages[index - 1]) === "0" &&
              (!followupTimes || followupTimes[index - 1] === "")
            ) {
              stage.checked = false;
              createMsgBox(
                "You need to select a valid time for the previous stage"
              );
              return;
            }
          } catch (error) {}
        }

        timeSelector.style.display = stage.checked ? "block" : "none";
        showButtons[index].classList.toggle("hidden", !stage.checked);

        if (nextStageContainer) {
          nextStageContainer.classList.toggle("hidden", !stage.checked);
        }
        sessionStorage.setItem(
          stageId,
          stage.checked
            ? stageInput.value === ""
              ? "0"
              : stageInput.value
            : ""
        );
      });
      stageInput.addEventListener("change", () => {
        sessionStorage.setItem(stageId, stage.checked ? stageInput.value : "0");
      });
    }
  });
  const sendTextConfirm = document.querySelectorAll(".sendoriginal");
  sendTextConfirm.forEach((checkbox, index) => {
    checkbox.addEventListener("change", () => {
      const textarea = document.querySelectorAll(".stagetextarea")[index];

      console.log("Checkbox checked :", checkbox.checked);
      textarea.disabled = !checkbox.checked;
      textarea.classList.toggle("disabletextarea", !checkbox.checked);
      stageValues = sessionStorage.getItem(`stagetextarea-values`);
      if (stageValues) {
        stageValues = JSON.parse(stageValues);
        stageValues[index] = textarea.value;
        sessionStorage.setItem(
          `stagetextarea-values`,
          JSON.stringify(stageValues)
        );
      }
    });
  });

  if (stagetextarea) {
    stagetextarea.forEach((textarea, index) => {
      textarea.addEventListener("input", () => {
        valuesArray[index] = textarea.value;
        sessionStorage.setItem(
          "stagetextarea-values",
          JSON.stringify(valuesArray)
        );
      });
    });
  }
  MailConditions.forEach((condition, index) => {
    condition.addEventListener("change", () => {
      sessionStorage.setItem(
        `MailConditions`,
        JSON.stringify(
          Array.from(MailConditions).map((condition) => condition.value)
        )
      );
    });
  });
}
["stage1", "stage2", "stage3", "stage4", "stage5"].forEach((stage, index) => {
  sessionStorage.removeItem(stage);
  sessionStorage.removeItem(`draftBody${index + 1}`);
});
sessionStorage.setItem("tracking", true);
sessionStorage.removeItem("schedule");
sessionStorage.removeItem("DelayCheckbox");
sessionStorage.removeItem("followuptime");
sessionStorage.removeItem("stagetextarea-values");
sessionStorage.removeItem("sender");
sessionStorage.removeItem("checkedDays");
sessionStorage.removeItem("MaxEmails");

function hideFollowUpSectionOnClickOutside(followUpSectionContainer) {
  const email_container =
    followUpSectionContainer.querySelector(".email-container");
  const handler = (event) => {
    if (!email_container.contains(event.target)) {
      followUpSectionContainer.parentElement.classList.add("hidden");
      document.querySelectorAll(".email-container").forEach((container) => {
        container.parentElement.classList.add("hidden");
      });
    }
  };
  followUpSectionContainer.addEventListener("click", handler);
  email_container.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  document.addEventListener("click", handler);
}

const observer = new MutationObserver(() => {
  const composeToolbars = document.querySelectorAll(".gU.Up");
  let sender = document.querySelector(".gb_B.gb_Za.gb_0");

  if (sender && !sessionStorage.getItem("sender")) {
    sender = sender.getAttribute("aria-label").split("\n");
    fullName = sender[0].split(":")[1].trim();
    sender = sender[sender.length - 1].replace("(", "").replace(")", "");
    sessionStorage.setItem("fullName", fullName);
    sessionStorage.setItem("sender", sender);
  }

  composeToolbars.forEach((composeToolbar) => {
    if (!composeToolbar.querySelector("#cmail-button")) {
      const { button, dropupMenu } = createButton("cmail-button");
      const sendButton = createSendButton();

      composeToolbar.appendChild(sendButton);
      composeToolbar.appendChild(button);
      composeToolbar.appendChild(dropupMenu);

      appendConnectButton();
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });
