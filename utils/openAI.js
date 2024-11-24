const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});
const model = "gpt-4o-mini";
const defaultTokens = 60;

const executePrompt = async ({ systemPrompt, prompt, maxTokens }) => {
  try {
    let messages = [
      {
        role: "user",
        content: prompt,
      },
    ];

    if (systemPrompt) {
      messages.unshift({
        role: "system",
        content: systemPrompt,
      });
    }
    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      max_tokens: maxTokens || defaultTokens,
    });

    const responseParsed = response.choices[0].message.content.trim();
    return responseParsed;
  } catch (error) {
    console.error("Error during API call:", error);
  }
};

module.exports = { executePrompt };
