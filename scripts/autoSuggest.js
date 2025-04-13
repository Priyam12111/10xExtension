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
      console.error("No variables found in sessionStorage.");
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

document.addEventListener("input", autocorrectFirstName);
