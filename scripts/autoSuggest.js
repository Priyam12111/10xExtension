function removeSuggestionBox() {
  const existingBox = document.getElementById("suggestion-box");
  if (existingBox) {
    existingBox.remove();
  }
}

function autocorrectFirstName() {
  removeSuggestionBox();

  let variables;
  try {
    variables = JSON.parse(sessionStorage.getItem("variables"));
    if (!variables) {
      console.log("No variables found in sessionStorage.");
      return;
    }
  } catch (error) {
    console.error("Failed to parse variables from sessionStorage:", error);
    return;
  }

  const words = Object.keys(variables);
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  const node = range.startContainer;

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    // Get text before the cursor position
    const beforeCursor = text.substring(0, range.startOffset);
    // Check for a pattern that starts with '{' and has letters after it (e.g., "{jo")
    const pattern = /\{([a-zA-Z]*)$/;
    const match = beforeCursor.match(pattern);
    if (!match) return;

    const filterText = match[1].toLowerCase();
    // Dynamically filter words based on all characters typed after '{'
    const matchingWords = words.filter((word) =>
      word.toLowerCase().startsWith(filterText)
    );

    if (matchingWords.length === 0) {
      return;
    } else if (matchingWords.length === 1) {
      // Auto-complete if exactly one match is found
      const replacement = `{${matchingWords[0]}}`;
      const newText =
        text.substring(0, beforeCursor.length - match[0].length) +
        replacement +
        text.substring(range.startOffset);
      node.textContent = newText;

      const newCursorPosition =
        beforeCursor.length - match[0].length + replacement.length;
      const newRange = document.createRange();
      newRange.setStart(node, newCursorPosition);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      // Show suggestion box if more than one match is found
      showSuggestionBox(
        matchingWords,
        node,
        range,
        beforeCursor.length,
        match[0].length
      );
    }
  }
}

function showSuggestionBox(
  suggestions,
  textNode,
  range,
  cursorPosition,
  triggerLength
) {
  const suggestionBox = document.createElement("div");
  suggestionBox.id = "suggestion-box";
  suggestionBox.style.position = "absolute";
  suggestionBox.style.background = "#fff";
  suggestionBox.style.border = "1px solid #ccc";
  suggestionBox.style.padding = "5px";
  suggestionBox.style.zIndex = 1000;
  suggestionBox.style.fontSize = "14px";

  // Position the suggestion box based on the current range's location
  const rect = range.getBoundingClientRect();
  suggestionBox.style.top = rect.bottom + window.scrollY + "px";
  suggestionBox.style.left = rect.left + window.scrollX + "px";

  suggestions.forEach((word) => {
    const item = document.createElement("div");
    item.textContent = word;
    item.style.cursor = "pointer";
    item.style.padding = "2px 5px";
    item.addEventListener("mouseover", () => {
      item.style.backgroundColor = "#f0f0f0";
    });
    item.addEventListener("mouseout", () => {
      item.style.backgroundColor = "#fff";
    });
    item.addEventListener("click", () => {
      const replacement = `{${word}}`;
      const fullText = textNode.textContent;
      // Replace only the part that was typed (triggerLength characters starting with '{')
      const newText =
        fullText.substring(0, cursorPosition - triggerLength) +
        replacement +
        fullText.substring(cursorPosition);
      textNode.textContent = newText;

      const newCursorPosition =
        cursorPosition - triggerLength + replacement.length;
      const newRange = document.createRange();
      newRange.setStart(textNode, newCursorPosition);
      newRange.collapse(true);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(newRange);

      removeSuggestionBox();
    });
    suggestionBox.appendChild(item);
  });

  document.body.appendChild(suggestionBox);
}

function autocorrectSubject() {
  removeSuggestionBox();

  let variables;
  try {
    variables = JSON.parse(sessionStorage.getItem("variables"));
    if (!variables) {
      console.log("No variables found in sessionStorage.");
      return;
    }
  } catch (error) {
    console.error("Failed to parse variables from sessionStorage:", error);
    return;
  }

  const words = Object.keys(variables);
  const subjectInput = document.querySelector(".aoT");
  if (!subjectInput) return;

  const cursorPosition = subjectInput.selectionStart;
  const text = subjectInput.value;
  const beforeCursor = text.substring(0, cursorPosition);
  
  // Check for a pattern that starts with '{' and has letters after it (e.g., "{jo")
  const pattern = /\{([a-zA-Z]*)$/;
  const match = beforeCursor.match(pattern);
  if (!match) return;

  const filterText = match[1].toLowerCase();
  // Dynamically filter words based on all characters typed after '{'
  const matchingWords = words.filter((word) =>
    word.toLowerCase().startsWith(filterText)
  );

  if (matchingWords.length === 0) {
    return;
  } else if (matchingWords.length === 1) {
    // Auto-complete if exactly one match is found
    const replacement = `{${matchingWords[0]}}`;
    const newText =
      text.substring(0, beforeCursor.length - match[0].length) +
      replacement +
      text.substring(cursorPosition);
    subjectInput.value = newText;

    const newCursorPosition =
      beforeCursor.length - match[0].length + replacement.length;
    subjectInput.setSelectionRange(newCursorPosition, newCursorPosition);
  } else {
    // Show suggestion box if more than one match is found
    showSubjectSuggestionBox(
      matchingWords,
      subjectInput,
      cursorPosition,
      match[0].length
    );
  }
}

function showSubjectSuggestionBox(
  suggestions,
  inputElement,
  cursorPosition,
  triggerLength
) {
  const suggestionBox = document.createElement("div");
  suggestionBox.id = "suggestion-box";
  suggestionBox.style.position = "absolute";
  suggestionBox.style.background = "#fff";
  suggestionBox.style.border = "1px solid #ccc";
  suggestionBox.style.padding = "5px";
  suggestionBox.style.zIndex = 1000;
  suggestionBox.style.fontSize = "14px";

  // Position the suggestion box based on the input element's location
  const rect = inputElement.getBoundingClientRect();
  suggestionBox.style.top = rect.bottom + window.scrollY + "px";
  suggestionBox.style.left = rect.left + window.scrollX + "px";

  suggestions.forEach((word) => {
    const item = document.createElement("div");
    item.textContent = word;
    item.style.cursor = "pointer";
    item.style.padding = "2px 5px";
    item.addEventListener("mouseover", () => {
      item.style.backgroundColor = "#f0f0f0";
    });
    item.addEventListener("mouseout", () => {
      item.style.backgroundColor = "#fff";
    });
    item.addEventListener("click", () => {
      const replacement = `{${word}}`;
      const fullText = inputElement.value;
      // Replace only the part that was typed (triggerLength characters starting with '{')
      const newText =
        fullText.substring(0, cursorPosition - triggerLength) +
        replacement +
        fullText.substring(cursorPosition);
      inputElement.value = newText;

      const newCursorPosition =
        cursorPosition - triggerLength + replacement.length;
      inputElement.setSelectionRange(newCursorPosition, newCursorPosition);

      removeSuggestionBox();
    });
    suggestionBox.appendChild(item);
  });

  document.body.appendChild(suggestionBox);
}

// Modify the event listener to handle both email body and subject line
document.addEventListener("input", (event) => {
  if (event.target.classList.contains("aoT")) {
    autocorrectSubject();
  } else {
    autocorrectFirstName();
  }
});

function handleStageButtonClick(event) {
  const stageButton = event.target;
  const stageNumber = stageButton.id.replace('stage', '');
  
  // Remove the button
  stageButton.remove();
  
  // Remove the corresponding stage section
  const stageSection = document.querySelector(`.timesec.timeS${stageNumber}`);
  if (stageSection) {
    stageSection.remove();
  }
  
  // Update session storage to reflect the removed stage
  sessionStorage.removeItem(`stage${stageNumber}`);
  sessionStorage.removeItem(`draftBody${stageNumber}`);
}

// Add event listeners for stage buttons
document.addEventListener('DOMContentLoaded', () => {
  // Get all stage buttons
  const stageButtons = document.querySelectorAll('[id^="stage"]');
  
  stageButtons.forEach(button => {
    button.addEventListener('click', handleStageButtonClick);
  });
});

function handleBackspace(event) {
  if (event.key !== "Backspace") return;

  const activeElement = document.activeElement;

  // === SUBJECT LINE ===
if (activeElement && activeElement.classList.contains("aoT")) {
  const input = activeElement;
  const cursorPos = input.selectionStart;
  if (cursorPos === 0) return;

  const text = input.value;
  const textBeforeCursor = text.slice(0, cursorPos);

  // Match a token like {something something} right before cursor
  const matches = [...textBeforeCursor.matchAll(/\{[^}]*\}/g)];

  if (matches.length > 0) {
    const lastMatch = matches[matches.length - 1];
    const matchEnd = lastMatch.index + lastMatch[0].length;

    // Only delete if the match ends exactly at the cursor
    if (matchEnd === cursorPos) {
      event.preventDefault();
      const matchStart = lastMatch.index;

      const newText =
        text.slice(0, matchStart) + text.slice(cursorPos);
      input.value = newText;
      input.setSelectionRange(matchStart, matchStart);
    }
  }
  return;
}

  // === EMAIL BODY (contenteditable div) ===
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const node = range.startContainer;
  if (!node || node.nodeType !== Node.TEXT_NODE) return;

  const cursorPos = range.startOffset;
  if (cursorPos === 0) return;

  const text = node.textContent;
  const textBeforeCursor = text.slice(0, cursorPos);
  const pattern = /\{[^}]+\}$/
  const match = textBeforeCursor.match(pattern);

  if (match) {
    event.preventDefault();
    const matchStart = cursorPos - match[0].length;
    node.textContent =
      text.slice(0, matchStart) + text.slice(cursorPos);

    const newRange = document.createRange();
    newRange.setStart(node, matchStart);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
  }
}

// === Gmail loads content dynamically; wait for DOM to be ready ===
function waitForGmailReady(callback) {
  const interval = setInterval(() => {
    const subjectInput = document.querySelector(".aoT");
    const bodyDiv = document.querySelector("[aria-label='Message Body']");
    if (subjectInput && bodyDiv) {
      clearInterval(interval);
      callback();
    }
  }, 500);
}

// Attach the listener after Gmail UI is loaded
waitForGmailReady(() => {
  document.addEventListener("keydown", handleBackspace, true);
});
