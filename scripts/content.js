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
      if (createDraft(" (Auto Followup)")) {
        createMsgBox("Draft Created Successfully");
      }
      setTimeout(() => {
        const deleteBtn = document.querySelectorAll(".og.T-I-J3");
        deleteBtn[deleteBtn.length - 1].click();
      }, 1000);
    } else {
      sendMails();
      setTimeout(() => {
        sessionStorage.removeItem("RescheduleTiming");
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
      const subject = document.querySelector(".aoT").value;
      console.log(subject);

      if (subject) {
        createDraft(" (Template)");
      }
      setTimeout(() => {
        const deleteBtn = document.querySelectorAll(".og.T-I-J3");
        deleteBtn[deleteBtn.length - 1].click();
      }, 5000);
    }
  });
  return sendButton;
}

const createDraft = async (identifier) => {
  const url = "https://10xsend.in/api/create_draft";
  const subject = document.querySelectorAll(".aoT");
  const emailBody = window.document.querySelectorAll(
    ".Am.aiL.Al.editable.LW-avf.tS-tW"
  );

  let final_subject = subject[subject.length - 1]?.value;
  if (final_subject.includes(identifier)) {
    final_subject = final_subject.replace(identifier, "");
  } else {
    final_subject += identifier;
  }
  const draftData = {
    sender: sessionStorage.getItem("sender"),
    recipient: "developer@10x.com",
    subject: final_subject || "",
    body: emailBody[emailBody.length - 1]?.innerHTML || "",
  };

  try {

    let variables;
    try {
      variables = JSON.parse(sessionStorage.getItem("variables") || "{}");
    } catch (e) {
      console.error("Failed to parse variables:", e);
    }
    const isValid = validatePlaceholdersAgainstKeys(draftData.subject, draftData.body, variables)
  
    if(isValid) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(draftData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Draft Saved Successfully", result);
      return true;
    } else {
      const error = await response.json();
      console.log("Error creating draft:", error);
      return false;
    }}
  else {
    createMsgBox("Error: Please check the dynamic variables.");
  }
  } catch (err) {
    console.error("Network or unexpected error:", err);
  }
  return false;
};
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
  dropupMenu.style.display = "block";
  dropupMenu.style.zIndex = "9999";
  try {
    fetchAndInjectDropupMenu(dropupMenu);
  } catch (error) {
    console.log("Error fetching and injecting dropup menu:", error);
  }

  document.addEventListener("click", () => {
    if (
      dropupMenu &&
      dropupMenu.firstElementChild &&
      dropupMenu.firstElementChild.classList.contains("open")
    ) {
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
      iframe.id = "dropupMenu";
      // iframe.style.maxHeight = "0px";
      dropupMenu.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(htmlContent);
      doc.close();

      iframe.onload = () => {
        const doc = iframe.contentWindow.document;
        dropupJs(doc);
        emailFunctionalities(doc);
        minimise(doc, iframe);
        rescheduler(doc);
      };
    })
    .catch((error) => {
      console.error("Error loading the HTML:", error);
    });
}

const rescheduler = (document) => {
  const rescheduleSlider = document.querySelector(".Campaigntoggle-row input");
  const timingOptions = document.querySelector(".timing-options");
  const radios = document.getElementsByName("rescheduleTiming");
  const afterDays = document.querySelector(".dayInput");
  const rescheduleTiming2 = document.querySelector("#rescheduleTiming2");
  if (afterDays) {
    afterDays.addEventListener("input", () => {
      if (rescheduleTiming2.checked) {
        sessionStorage.setItem("RescheduleTiming", afterDays.value);
      }
    });
  }
  if (radios && radios.length > 0) {
    radios.forEach?.((radio, index) => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          if (index === 0) {
            sessionStorage.setItem("RescheduleTiming", "0");
          } else {
            if (!afterDays) return;
            sessionStorage.setItem("RescheduleTiming", afterDays.value);
          }
        }
      });
    });
  }

  if (rescheduleSlider && timingOptions) {
    rescheduleSlider.addEventListener("click", () => {
      timingOptions.classList.toggle("open");
    });
  }
};

const minimise = (document, iframe) => {
  const minimise = document.querySelector(".minimise");
  const arrow = window.document.querySelector(".arrow");

  if (minimise) {
    minimise.addEventListener("click", () => {
      if (iframe.classList.contains("open")) {
        arrow.classList.toggle("rotate");
        iframe.classList.remove("open");
      }
    });
  }
};
function toggleDropupMenu(dropupMenu) {
  const arrow = document.querySelector("svg.arrow");
  if (arrow) {
    arrow.classList.toggle("rotate");
  }
  if (dropupMenu.firstElementChild) {
    dropupMenu.firstElementChild.classList.toggle("open");
  }
}

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
  reload = false,
  size = 50
) {
  fetch(
    `https://10xsend.in/api/drafts?sender=${sessionStorage.getItem(
      "sender"
    )}&&size=${size}`,
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
        const seenIds = new Set(
          Array.from(listmesaageshow.children).map((li) =>
            li.getAttribute("data-subject")
          )
        );
        data.drafts.forEach((draft) => {
          if (!seenIds.has(draft.subject)) {
            uniqueDrafts.push(draft);
            seenIds.add(draft.subject);
          }
        });

        const draftsToShow = uniqueDrafts.slice(0, 50);
        const emailBody = document.querySelectorAll(".email-body")[index];
        const emailHeader = document.querySelectorAll(".email-header")[index];
        // listmesaageshow.innerHTML = "";
        if (listmesaageshow.childNodes.length === 0 || reload) {
          draftsToShow.forEach((draft) => {
            const draftLi = document.createElement("li");
            const subject = draft.subject.replace("(Auto Followup)", "");

            draftLi.setAttribute("data-body", draft.body);
            draftLi.setAttribute("data-subject", draft.subject);
            if (draft.subject.includes("(Auto Followup)")) {
              draftLi.innerHTML = `
                <span>${subject || "No Subject"}</span>
              `;

              listmesaageshow.appendChild(draftLi);
              draftLi.addEventListener("click", (e) => {
                e.stopPropagation();
                emailHeader.textContent = subject || "No Subject";
                emailBody.innerHTML = "<br>" + draft.body + "<br><hr>";
                slectMessage.firstElementChild.textContent = subject || "";
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
      console.log("Error fetching drafts:", error);
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
        true,
        2
      );
      createMsgBox("Please wait a moment", 8000);
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
      listItem.innerHTML = `<input type="radio" name="personalize" checked=""></input><span>${key}</span>`;
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
      title.querySelector(".accordion-button").classList.toggle("activeTitle");
    });
  });
}

function toggleTracking(document) {
  try {
    const trackingShowPiece = document.querySelectorAll(".trackingShowPiece");
    const SettingBtn = document.querySelector(".SettingSecBtn");

    trackingShowPiece.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        console.log(item);
        SettingBtn.classList.toggle("show");
      });
    });
  } catch (e) {}
}

function openAccordion(document) {
  try {
    const accordionButton = document.querySelector(
      '.accordion-button[data-bs-target="#tenX-collapseThree"]'
    );
    const accordionCollapse = document.getElementById("tenX-collapseThree");

    if (accordionButton && accordionCollapse) {
      // Add click event listener to the button
      accordionButton.addEventListener("click", function () {
        // Check if the collapse is currently shown
        console.log("accordionCollapse", accordionCollapse);

        const isShown = accordionCollapse.classList.contains("show");

        if (isShown) {
          // If shown, hide it
          accordionCollapse.classList.remove("show");
          accordionButton.setAttribute("aria-expanded", "false");
          accordionCollapse.style.overflow = "hidden";
          accordionCollapse.style.maxHeight = "0px";
          accordionCollapse.style.transition = "max-height 0.5s ease-in-out";
          setTimeout(() => {
            accordionButton.style.borderWidth = "1px";
          }, 1000);
        } else {
          // If hidden, show it
          accordionCollapse.classList.add("show");
          accordionButton.setAttribute("aria-expanded", "true");
          accordionCollapse.style.maxHeight = "500px";
          accordionCollapse.style.transition = "max-height 0.5s ease-in-out";
          accordionButton.style.borderWidth = "0";
        }

        // Scroll down to the bottom of the page
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  } catch (error) {}
}
function pauseBetweenMails(document) {
  const DelayCheckbox = document.querySelector("#bqpifDelayCheckbox");
  const PauseSeconds = document.querySelector("#bqpifPauseSeconds");

  const updatePauseSeconds = () => {
    if (DelayCheckbox && PauseSeconds) {
      PauseSeconds.disabled = !DelayCheckbox.checked;
    }
  };
  if (DelayCheckbox) {
    DelayCheckbox.addEventListener("change", updatePauseSeconds);
    updatePauseSeconds();
  }
}
function searchBar(document) {
  const searchInput = document.querySelectorAll(".droupSec input");
  if (!searchInput) return;
  searchInput.forEach((input) => {
    input.addEventListener("input", () => {
      console.log(input, input.value);
      const searchValue = input.value.toLowerCase();
      const listItems =
        input.parentElement.nextElementSibling.querySelectorAll("li");
      listItems.forEach((item) => {
        item.style.display = item.textContent
          .toLowerCase()
          .includes(searchValue)
          ? "flex"
          : "none";
      });
    });
  });
}

function dropupJs(document) {
  const accordionTitles = document.querySelectorAll(".g_accordian_title");
  const skipHolidays = document.querySelector("#EUYaSSkipHolidays");
  const allDays = document.querySelector("#EUYaSSkipHolidays2");
  const sendButton = document.getElementById("test-send");
  const testInput = document.getElementById("test-input");
  const dropdownHeader = document.querySelector(".dropdown-header");
  const dropdownContent = document.querySelector(".dropdown-content");
  const createDrafts = document.querySelectorAll(".CreateDrafts");
  const listMessageShow = document.querySelectorAll(".listmesaageshow");
  const selectMessage = Array.from(document.querySelectorAll(".slectMessage"));
  const droUpOpenSec = Array.from(document.querySelectorAll(".droupOpenSec"));

  toggleTracking(document);
  openAccordion(document);
  pauseBetweenMails(document);
  searchBar(document);
  try {
    if (skipHolidays) {
      skipHolidays.addEventListener("change", () => {
        sessionStorage.setItem("skipHolidays", skipHolidays.checked);
      });
    }
    if (allDays) {
      allDays.addEventListener("change", () => {
        sessionStorage.setItem("skipHolidays", skipHolidays.checked);
      });
    }
  } catch (e) {}
  try {
    if (createDrafts) {
      createDrafts.forEach((draft) => {
        draft.addEventListener("click", () => composeDraft());
      });
    }
  } catch (e) {}

  draftButtons(document, listMessageShow, selectMessage, droUpOpenSec);
  showDraft(listMessageShow, selectMessage, droUpOpenSec);

  try {
    if (dropdownHeader && dropdownContent) {
      setupDropdown(dropdownHeader, dropdownContent);
    }
  } catch (e) {}

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

  // document.addEventListener("click", (e) => {
  //   if (!selectMessage.some((el) => el.contains(e.target))) {
  //     droUpOpenSec.forEach((section) => section.classList.add("hidden"));
  //   }
  // });

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

function timePicker(document, index) {
  const timeInput = document.querySelector("#timeInput");
  const timePicker = document.querySelector("#timePicker");
  const hand = document.querySelector("#hand");
  const hourDisplay = document.querySelector("#hourDisplay");
  const minuteDisplay = document.querySelector("#minuteDisplay");
  const amBtn = document.querySelector("#amBtn");
  const pmBtn = document.querySelector("#pmBtn");
  const okBtn = document.querySelector("#okBtn");
  const cancelBtn = document.querySelector("#cancelBtn");
  const clock = document.querySelector("#clock");

  let selectedHour = 7;
  let selectedMinute = 0;
  let isAM = true;
  let selectingMinutes = false;

  timeInput.addEventListener("click", (e) => {
    e.stopPropagation();
    timePicker.classList.add("show");
    drawClock();
  });

  cancelBtn.addEventListener("click", () => {
    timePicker.classList.remove("show");
  });

  okBtn.addEventListener("click", () => {
    let hour24;
    if (isAM) {
      hour24 = selectedHour === 12 ? 0 : selectedHour;
    } else {
      hour24 = selectedHour === 12 ? 12 : selectedHour + 12;
    }

    const formattedHour = hour24.toString().padStart(2, "0");
    const formattedMinute = selectedMinute.toString().padStart(2, "0");

    timeInput.firstElementChild.value = `${formattedHour}:${formattedMinute}`;
    setFollowUpTime(index, timeInput.firstElementChild.value);
    timePicker.classList.remove("show");
  });

  amBtn.addEventListener("click", () => {
    isAM = true;
    amBtn.classList.add("activebluetext");
    pmBtn.classList.remove("activebluetext");
  });

  pmBtn.addEventListener("click", () => {
    isAM = false;
    pmBtn.classList.add("activebluetext");
    amBtn.classList.remove("activebluetext");
  });

  hourDisplay.addEventListener("click", (e) => {
    selectingMinutes = false;
    drawClock();
  });

  minuteDisplay.addEventListener("click", (e) => {
    selectingMinutes = true;
    drawClock();
  });

  minuteDisplay.addEventListener("change", (e) => {
    const value = parseInt(e.target.value, 10);
    selectedMinute = value;
    drawClock();
  });

  hourDisplay.addEventListener("change", (e) => {
    const value = parseInt(e.target.value, 10);
    selectedHour = value;
    drawClock();
  });
  function drawClock() {
    clock.querySelectorAll(".hour-marker").forEach((e) => e.remove());
    let max = 12; //selectingMinutes ? 60 : 12;
    for (let i = 0; i < max; i++) {
      let val = selectingMinutes ? i * 5 : i + 1;

      // Use 6° per step for minutes, 30° per step for hours
      const degreePerStep = selectingMinutes ? 6 : 30;

      // Offset the starting position (like 12 o'clock at the top)
      const offset = selectingMinutes ? 15 : 3;

      const angle = ((val - offset) * degreePerStep * Math.PI) / 180;

      const x = 100 + 80 * Math.cos(angle);
      const y = 100 + 80 * Math.sin(angle);

      const div = window.document.createElement("div");
      div.className = "hour-marker";
      if (
        (!selectingMinutes && val === selectedHour) ||
        (selectingMinutes && val === selectedMinute)
      ) {
        div.classList.add("selected");
      }
      div.textContent = val.toString().padStart(2, "0");
      div.style.left = `${x}px`;
      div.style.top = `${y}px`;

      div.addEventListener("click", (e) => {
        e.stopPropagation();
        if (selectingMinutes) {
          selectedMinute = val;
          minuteDisplay.value = val.toString().padStart(2, "0");
        } else {
          selectedHour = val;
          hourDisplay.value = val;
          rotateHand(val);
        }
        drawClock();
      });
      clock.appendChild(div);
    }
    rotateHand(selectingMinutes ? selectedMinute / 5 : selectedHour);
  }

  const setFollowUpTime = (index, value) => {
    const followuptime = JSON.parse(
      sessionStorage.getItem("followuptime") || '["", "", "", "", ""]'
    );
    followuptime[index] = value;
    sessionStorage.setItem("followuptime", JSON.stringify(followuptime));
  };

  function rotateHand(unit) {
    const angle = (unit % 12) * 30;
    hand.style.transform = `rotate(${angle}deg)`;
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".time-picker-wrapper")) {
      timePicker.classList.remove("show");
    }
  });
}

function emailFunctionalities(document) {
  const schedule = document.querySelector("#EUYaSGMassDateDropdown");
  const followUpElement = document.querySelector("#followup");
  const inputDays = document.querySelector("#days");
  const trackingElement = document.querySelector("#iyEIROpenTracking");
  const UrlTrack = document.querySelector("#iyEIROpenClick");
  const MaxEmails = document.querySelector("#bqpifMaxEmails");
  const DelayCheckbox = document.querySelector("#bqpifDelayCheckbox");
  const PauseSeconds = document.querySelector("#bqpifPauseSeconds");

  const scheduleinput = document.querySelector("#EUYaSGMassDateTime");

  const ClickShowPiece = document.querySelector(".ClickShowPiece");
  const OpenShowPiece = document.querySelector(".OpenShowPiece");

  const MailConditions = document.querySelectorAll(".norepselect");
  const stagetextarea = document.querySelectorAll(".stagetextarea");
  const valuesArray = Array(stagetextarea.length).fill("");
  const unsubMarker = document.querySelector("#unsubMarker");

  const stages = [];
  const times = [];
  const stageContainers = [];
  const stageInputs = [];
  const stagebody = [];

  const followuptime1 = document.querySelector("#daysS1");
  const followuptime2 = document.querySelector("#daysS2");
  const followuptime3 = document.querySelector("#daysS3");
  const followuptime4 = document.querySelector("#daysS4");
  const followuptime5 = document.querySelector("#daysS5");
  // Event listeners for Followups
  [
    followuptime1,
    followuptime2,
    followuptime3,
    followuptime4,
    followuptime5,
  ].forEach((followuptime, index) => {
    if (followuptime && followuptime.parentElement) {
      timePicker(followuptime.parentElement.parentElement, index);
    }
  });

  if (unsubMarker) {
    unsubMarker.addEventListener("change", () => {
      const unsubMarkerState = unsubMarker.checked;
      sessionStorage.setItem("unsubMarker", JSON.stringify(unsubMarkerState));
    });

    const unsubMarkerState =
      JSON.parse(sessionStorage.getItem("unsubMarker")) || false;
    unsubMarker.checked = unsubMarkerState;
  } else {
    console.log("unsubMarker not found");
  }
  for (let i = 1; i <= 5; i++) {
    stages.push(`stage${i}`);
    times.push(`.timeS${i}`);
    stageContainers.push(`.S${i}`);
    stageInputs.push(`.stageNumberinputS${i}`);
    stagebody.push(`.sendoris${i}`);
  }

  const setTime = document.querySelectorAll(".settime");
  setTime.forEach((time, index) => {
    time.addEventListener("click", () => {
      const formCheck = document.querySelectorAll(`.timeS1 .form-check`)[1];
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
  if (MaxEmails) {
    MaxEmails.addEventListener("change", () => {
      sessionStorage.setItem("MaxEmails", MaxEmails.value);
    });
  } else {
    console.log("MaxEmails not found");
  }
  const updateDelaySetting = () => {
    sessionStorage.setItem(
      "DelayCheckbox",
      DelayCheckbox.checked ? PauseSeconds.value : "0"
    );
  };

  if (DelayCheckbox && PauseSeconds) {
    DelayCheckbox.addEventListener("change", updateDelaySetting);
    PauseSeconds.addEventListener("change", updateDelaySetting);
  }

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
    let stage = document.querySelector(`#${stageId}`);
    const timeSelector = document.querySelector(times[index]);
    const stageInput = document.querySelector(stageInputs[index]);
    if (index < stages.length - 1) {
      var nextStageContainer = document.querySelector(
        stageContainers[index + 1]
      );
    }

    if (stage) {
      stage.addEventListener("click", () => {
        stage = document.querySelector(`.${stageId}`);
        stage.click();
        console.log(stage);

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

        timeSelector.style.maxHeight = stage.checked ? "500px" : "0px";
        timeSelector.style.overflow = stage.checked ? "visible" : "hidden";

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
sessionStorage.removeItem("RescheduleTiming");

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
    fullName = sender[0]
      .split(":")[1]
      .trim()
      .replace("Google Account", "")
      .trim();
    sender = sender[sender.length - 1]
      .replace("(", "")
      .replace(")", "")
      .replace("Google Account", "")
      .trim();
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
