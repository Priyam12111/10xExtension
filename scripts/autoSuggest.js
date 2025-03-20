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
  const cursorPosition = range.startOffset;

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    if (cursorPosition >= 2) {
      const shortcut = text.substring(cursorPosition - 2, cursorPosition);
      if (shortcut[0] === "{") {
        const typedLetter = shortcut[1].toLowerCase();

        const matchingWords = words.filter(
          (word) => word[0].toLowerCase() === typedLetter
        );

        if (matchingWords.length === 0) {
          return;
        } else if (matchingWords.length === 1) {
          const replacement = `{${matchingWords[0]}}`;
          const newText =
            text.substring(0, cursorPosition - 2) +
            replacement +
            text.substring(cursorPosition);
          node.textContent = newText;

          const newCursorPosition = cursorPosition - 2 + replacement.length;
          const newRange = document.createRange();
          newRange.setStart(node, newCursorPosition);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } else {
          showSuggestionBox(matchingWords, node, range, cursorPosition);
        }
      }
    }
  }
}

function showSuggestionBox(suggestions, textNode, range, cursorPosition) {
  const suggestionBox = document.createElement("div");
  suggestionBox.id = "suggestion-box";
  suggestionBox.style.position = "absolute";
  suggestionBox.style.background = "#fff";
  suggestionBox.style.border = "1px solid #ccc";
  suggestionBox.style.padding = "5px";
  suggestionBox.style.zIndex = 1000;
  suggestionBox.style.fontSize = "14px";

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
      const text = textNode.textContent;
      const newText =
        text.substring(0, cursorPosition - 2) +
        replacement +
        text.substring(cursorPosition);
      textNode.textContent = newText;

      const newCursorPosition = cursorPosition - 2 + replacement.length;
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
