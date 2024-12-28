const { parse } = require("node-html-parser");

const getPercentage = (totalAmount, partialAmount) => {
  if (totalAmount === 0 || partialAmount === 0 || totalAmount < partialAmount) {
    return 0; // Avoid division by zero
  }

  const percentage = (partialAmount / totalAmount) * 100;
  return Math.floor(percentage);
};

const convertHtmlToText = (html, fallbackText = "") => {
  try {
    // Handle null or undefined input
    if (!html) {
      return fallbackText;
    }

    // Parse HTML
    const root = parse(html);

    // Remove script and style tags
    root.querySelectorAll("script, style").forEach((el) => el.remove());

    // Handle special cases before getting text

    // Add spacing after paragraphs to ensure text doesn't get squished together
    root.querySelectorAll("p").forEach((p) => {
      p.set_content(p.text.trim() + "\n\n");
    });

    // Replace <br> with newlines
    root.querySelectorAll("br").forEach((el) => {
      el.replaceWith("\n");
    });

    // Handle lists
    root.querySelectorAll("ul, ol").forEach((list) => {
      list.querySelectorAll("li").forEach((item, index) => {
        item.set_content(`${index + 1}. ${item.text.trim()}\n`);
      });
    });

    // Replace horizontal rules
    root.querySelectorAll("hr").forEach((el) => {
      el.replaceWith("\n---\n");
    });

    // Get text content
    let text = root.text;

    // Clean up the text
    text = text
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, "\n\n") // Replace multiple newlines with double newline
      .trim(); // Remove leading/trailing whitespace

    return text || fallbackText;
  } catch (error) {
    console.warn("Error converting HTML to text:", error);
    // If anything fails, return the fallback text
    return fallbackText;
  }
};

module.exports = { getPercentage, convertHtmlToText };
