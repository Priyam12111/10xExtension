chrome.action.onClicked.addListener((tab) => {
  chrome.windows.create({
    url: "popup.html",
    type: "popup",
    width: 800,
    height: 600,
  });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js", "sendMail.js", "connectSheet.js", "autoSuggest.js"],
  });
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "authenticate") {
    authenticateWithGoogle(message.sender);
  }
});
function authenticateWithGoogle(sender) {
  const clientId =
    "1028647389622-ae8028g4n8det2fcd32q8qlq4368oqc0.apps.googleusercontent.com";
  const redirectUri = "http://localhost:8080/api/oauth/callback";

  const scopes = [
    "https://www.googleapis.com/auth/drive.metadata.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/spreadsheets",
  ].join(" ");

  // Encode sender into the state parameter
  const state = encodeURIComponent(
    JSON.stringify({
      extension: chrome.runtime.id,
      sender: sender,
    })
  );

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&state=${state}&access_type=offline&prompt=consent`;

  chrome.identity.launchWebAuthFlow({
    url: authUrl,
    interactive: true,
  });
}
