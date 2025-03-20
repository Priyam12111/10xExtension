function fetchDataFromSheet() {
  if (!sessionStorage.getItem("spreadsheetId")) {
    sheetListJs();
  }
  const sheetList = document.querySelector(".sheet-list-container");
  const spreadsheetId = sessionStorage.getItem("spreadsheetId");
  const sender = sessionStorage.getItem("sender");
  const sheetName = sessionStorage.getItem("range") || "Sheet1";
  const range = `${sheetName}!A:Z`;
  const endpoint = `https://10xsend.in/api/sheet-data`;
  if (!spreadsheetId) {
    sheetList.classList.remove("hidden");
    return;
  }

  fetch(`${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender,
      spreadsheetId,
      range,
    }),
  })
    .then((response) =>
      response.ok
        ? response.json()
        : Promise.reject(`HTTP error! status: ${response.status}`)
    )
    .then((data) => {
      if (data.values && data.values.length > 0) {
        const [headers, ...allData] = data.values;
        const { storedData, variables } = processData(headers, allData);
        sessionStorage.setItem("variables", JSON.stringify(variables));
        sessionStorage.setItem(
          "emails",
          JSON.stringify(storedData["Email"] || [])
        );
        try {
          if (storedData["Email"] && storedData["Email"].length > 0) {
            setEmailDetails(storedData["Email"], "", "");
          }
        } catch (error) {
          console.log("Error setting email details:", error);
        }
      }
    })
    .catch((error) => {
      createMsgBox("Error fetching data. Please try again.");
      console.log("Error fetching data:", error);
    });
}

function processData(headers, allData) {
  let storedData = { Email: [] };
  let variables = {};
  const emailColumns = headers.reduce((acc, header, index) => {
    if (header.toLowerCase().includes("email")) {
      acc.push(index);
    }
    return acc;
  }, []);

  const emailColumnIndices = new Set(emailColumns);
  const emailSet = new Set();
  storedData["Email"] = storedData["Email"] || [];

  allData.forEach((row) => {
    const isMissingEmail = emailColumns.some((index) => {
      const value = row[index];
      return typeof value !== "string" || value.trim() === "";
    });

    if (isMissingEmail) return;

    const hasDuplicateEmail = emailColumns.some((index) => {
      const email = row[index]?.trim().toLowerCase();
      return email && emailSet.has(email);
    });

    if (hasDuplicateEmail) return;

    emailColumns.forEach((index) => {
      const email = row[index]?.trim().toLowerCase();
      if (email) {
        storedData["Email"].push(email);
        emailSet.add(email);
      }
    });

    headers.forEach((header, index) => {
      if (!emailColumnIndices.has(index)) {
        const value = row[index];
        if (typeof value === "string" && value.trim() !== "") {
          variables[header] = variables[header] || [];
          variables[header].push(value);
        } else if (value.trim() === "") {
          variables[header] = variables[header] || [];
          variables[header].push("User");
        }
      }
    });
  });
  return { storedData, variables };
}

function setEmailDetails(emails, subject, body) {
  const emailField = document.querySelector(".agP");
  const senderField = document.querySelector(".aGb.mS5Pff");

  if (
    emailField &&
    emailField.getAttribute("aria-label") === "To recipients" &&
    senderField.textContent == ""
  ) {
    emailField.focus();
    emailField.value = `${emails.length}-recipients@10x.in`;
    // emailField.dispatchEvent(new Event("input", { bubbles: true }));
    try {
      document.querySelector(".agJ.aFw").click();
    } catch (error) {
      setTimeout(() => {
        try {
          document.querySelector(".agJ.aFw").click();
        } catch (error) {
          console.log("Error clicking on send button after retry:", error);
        }
      }, 1000);
    }
    const emailDescription = `Emails: ${emails.slice(0, 3).join(", ")}${
      emails.length > 3 ? ", ..." : ""
    } | Total: ${emails.length}`;
    if (senderField.textContent == "") {
      createMsgBox(emailDescription);
      const subjectField = document.querySelector(".aoT");
      if (subjectField) {
        subjectField.value +=
          subjectField.getAttribute("aria-label") === "To recipients"
            ? `${emails.length}-recipients@10x.in`
            : subject;
      }
    }
  }

  const bodyField = document.querySelector(".Am.aiL.Al.editable.LW-avf.tS-tW");
  if (bodyField) {
    bodyField.innerHTML += body;
  }
}

async function sendMails() {
  const track = JSON.parse(sessionStorage.getItem("tracking") || "false");
  const DelayCheckbox = sessionStorage.getItem("DelayCheckbox") || 0;
  const sendingAnimation = createSendingAnimation("Processing...");
  document.body.appendChild(sendingAnimation);

  try {
    const sender = sessionStorage.getItem("sender");
    const subject = document.querySelector(".aoT").value + " - " + sender;
    const uploadId = await fetch(
      `https://10xsend.in/api/latest_id?subject=${subject}`
    )
      .then((res) => res.text())
      .then((id) => JSON.parse(id).Latest_id + 1);
    const body = document.querySelector(
      ".Am.aiL.Al.editable.LW-avf.tS-tW"
    ).innerHTML;

    console.log("Uploading Mail Data...");
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
    const now = new Date();
    const schedule = sessionStorage.getItem("schedule") || "";
    let current_schedule =
      schedule === ""
        ? formatIST(new Date(now.getTime() + 1 * 60 * 1000))
        : schedule;
    const uploadResponse = await uploadMailData(
      sender,
      uploadId,
      subject,
      body,
      current_schedule,
      DelayCheckbox
    );
    handleUploadResponse(uploadResponse, schedule, DelayCheckbox);
    setTimeout(() => sendingAnimation.remove(), 4000);
  } catch (error) {
    console.log("Error:", error);
    setTimeout(() => sendingAnimation.remove(), 5000);
    createMsgBox("An Error Occurred. Please check the console for details.");
  } finally {
    try {
      sendingAnimation.classList.remove("sending");
    } catch (e) {
      console.log(e);
    }
  }
}

function createSendingAnimation(msg) {
  const div = document.createElement("div");
  div.classList.add("sending-animation-container");
  div.innerHTML = `
    <div class="sending-animation">
      <p class="send-text">${msg || "Sending..."}</p>
      <div class="loading-dots">
        <span>.</span><span>.</span><span>.</span>
      </div>
    </div>
  `;
  document.body.appendChild(div);
  return div;
}

async function createMsgBox(msg, duration = 3000) {
  return new Promise((resolve) => {
    const msgBox = document.createElement("div");
    msgBox.classList.add("msg-box");
    msgBox.innerHTML = `
      <p class="msg-title">Notification</p>
      <p class="msg-text">${msg || "Unknown Message"}</p>
    `;
    document.body.appendChild(msgBox);

    let removeTimeout = setTimeout(() => {
      msgBox.remove();
      resolve();
    }, duration);

    msgBox.addEventListener("mouseenter", () => {
      clearTimeout(removeTimeout);
    });

    msgBox.addEventListener("mouseleave", () => {
      removeTimeout = setTimeout(() => {
        msgBox.remove();
        resolve();
      }, 500);
    });
  });
}

async function sendEmailRequest(sender, uploadId, subject, body, track) {
  const emails = JSON.parse(sessionStorage.getItem("emails") || "[]");
  const variables = JSON.parse(sessionStorage.getItem("variables") || "{}");

  const emailData = emails.map((email, index) => ({
    email,
    variables: Object.keys(variables).reduce((acc, key) => {
      if (variables[key] && variables[key][index])
        acc[key] = variables[key][index];
      return acc;
    }, {}),
  }));

  return fetch("https://10xsend.in/api/send-mails", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender,
      uploadId,
      subject,
      body,
      emails: emailData,
      tracking: track,
      DelayCheckbox: parseInt(sessionStorage.getItem("DelayCheckbox") || 0),
    }),
  }).then((res) => res.json());
}

function uploadMailData(
  sender,
  uploadId,
  subject,
  body,
  schedule,
  DelayCheckbox
) {
  const emails = JSON.parse(sessionStorage.getItem("emails") || "[]");
  const variables = JSON.parse(sessionStorage.getItem("variables") || "{}");
  const stage1 = JSON.parse(sessionStorage.getItem("stage1") || false);
  const stage2 = JSON.parse(sessionStorage.getItem("stage2") || false);
  const stage3 = JSON.parse(sessionStorage.getItem("stage3") || false);
  const stage4 = JSON.parse(sessionStorage.getItem("stage4") || false);
  const stage5 = JSON.parse(sessionStorage.getItem("stage5") || false);
  const spreadsheetId = sessionStorage.getItem("spreadsheetId") || false;
  const SendDaysOn = JSON.parse(sessionStorage.getItem("SendDaysOn") || false);
  const followuptime = sessionStorage.getItem("followuptime") || [];
  const fullName = sessionStorage.getItem("fullName") || "";
  const unsubMarker = JSON.parse(
    sessionStorage.getItem("unsubMarker") || false
  );
  let skipHolidays;
  let followUpTime2 = JSON.parse(sessionStorage.getItem("followuptime")) || [];
  let nonEmptyCount = followUpTime2.filter((item) => item !== "").length;
  let headers = [
    "Start Date",
    "End Date",
    "Opens",
    "Clicks",
    "Unsubscribed",
    "Bounced",
    "Sent",
    "Replied",
  ];
  try {
    skipHolidays = JSON.parse(sessionStorage.getItem("skipHolidays") || false);
  } catch (error) {
    console.log(error);
    skipHolidays = false;
  }

  const range = sessionStorage.getItem("range") || false;
  let MailConditions;
  try {
    MailConditions = JSON.parse(
      sessionStorage.getItem("MailConditions") || [false, false, false]
    );
  } catch (error) {
    console.log(error);
    MailConditions = [false, false, false];
  }
  document.querySelectorAll(".form-check-input")[3];
  const draftBodies = [
    "draftBody1",
    "draftBody2",
    "draftBody3",
    "draftBody4",
    "draftBody5",
  ].map((key) => sessionStorage.getItem(key) || "");
  let checkedDays, stageData;
  if (SendDaysOn) {
    checkedDays = JSON.parse(sessionStorage.getItem("checkedDays") || "[]");
  } else {
    checkedDays = [];
  }
  if (
    typeof stage1 === "number" ||
    typeof stage2 === "number" ||
    typeof stage3 === "number" ||
    typeof stage4 === "number" ||
    typeof stage5 === "number"
  ) {
    console.log(
      "Getting Stage Value",
      sessionStorage.getItem("stagetextarea-values")
    );
    stageData = JSON.parse(
      sessionStorage.getItem("stagetextarea-values") || "[]"
    );
  } else {
    stageData = [];
  }
  const emailData = emails.map((email, index) => ({
    email,
    variables: Object.keys(variables).reduce((acc, key) => {
      if (variables[key] && variables[key][index])
        acc[key] = variables[key][index];
      return acc;
    }, {}),
  }));

  for (let i = 0; i < nonEmptyCount; i++) {
    headers.push(`Follow ${i + 1}`);
  }
  if (headers.length > 0) {
    create_headers(headers);
  }
  return fetch("https://10xsend.in/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender,
      uploadId,
      subject,
      body,
      schedule,
      stageData,
      stage1,
      stage2,
      stage3,
      stage4,
      stage5,
      checkedDays,
      spreadsheetId,
      range,
      fullName,
      draftBodies,
      unsubMarker,
      emails: emailData,
      skipHolidays: skipHolidays,
      MailConditions: MailConditions,
      date: "currentdate",
      status: "Ready",
      followuptime: followuptime,
      tracking: JSON.parse(sessionStorage.getItem("tracking") || false),
      MaxEmails: parseInt(sessionStorage.getItem("MaxEmails") || 0),
      DelayCheckbox: parseInt(DelayCheckbox),
    }),
  });
}

function handleUploadResponse(response, schedule, DelayCheckbox) {
  if (response.ok) {
    console.log("Upload Success:", response);
    followuptime = JSON.parse(sessionStorage.getItem("followuptime") || "[]");
    var msg = `Mail has been scheduled ${
      schedule ? `on ${schedule}` : "immediately"
    } ${
      DelayCheckbox
        ? `with a delay of ${parseInt(DelayCheckbox, 0) * 5} seconds`
        : ""
    }`;
    followuptime.forEach((time, index) => {
      if (time !== "") {
        msg += `\nFollowup ${index + 1} will be sent on ${time} `;
      }
    });
  } else {
    var msg = `Mail has not been Scheduled`;
    console.log("Upload Failed:", response);
  }
  createMsgBox(msg, 5000);
}

function sendTestMail(testEmail) {
  console.log("Sending Test Email");
  const emails = [testEmail];
  const variables = JSON.parse(sessionStorage.getItem("variables") || "{}");
  const emailData = emails.map((email, index) => ({
    email,
    variables: Object.keys(variables).reduce((acc, key) => {
      if (variables[key] && variables[key][index])
        acc[key] = variables[key][index];
      return acc;
    }, {}),
  }));
  const sender = sessionStorage.getItem("sender");
  const subject = document.querySelector(".aoT").value || "Testing Subject";
  const Testbody =
    document.querySelector(".Am.aiL.Al.editable.LW-avf.tS-tW").innerHTML ||
    "Testing Mail Body";
  const uploadId = fetch(`https://10xsend.in/api/latest_id?subject=${subject}`)
    .then((res) => res.text())
    .then((id) => JSON.parse(id).Latest_id + 1);
  fetch("https://10xsend.in/api/send-mails", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender,
      uploadId,
      subject: subject,
      body: Testbody,
      emails: emailData,
      tracking: false,
      DelayCheckbox: 0,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      createMsgBox(
        `Test mail sent successfully to ${testEmail}. Check your inbox!`
      );
    })
    .catch((error) => {
      console.log("Error:", error);
      createMsgBox(
        `Test mail failed to send to ${testEmail}. Please try again or check your internet connection.`
      );
    });
}
