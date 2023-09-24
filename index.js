/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
// const { Bard } = require("googlebard");

/**
 * Registers event listeners for "issues.opened" and ["pull_request.opened", "issue_comment.created"] events.
 * If a specific command is found in the event payload, it executes the code using the Piston API and creates a comment with the executed output.
 *
 * @param {Object} app - The app instance that will handle the events
 * @return {Promise} A promise that resolves when the event handling is complete
 */
module.exports = (app) => {
  app.on("issues.opened", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    return context.octokit.issues.createComment(issueComment);
  });

  app.on(["pull_request.opened", "issue_comment.created"], async (context) => {
    const axios = require("axios");
    const payload = context.payload;
    let commandExists = false;
    let codeToExecute = "";

    if (payload.action === "opened") {
      // Check the PR title and body for the /execute command
      if (
        payload.pull_request.title.includes("/execute") ||
        payload.pull_request.body.includes("/execute")
      ) {
        commandExists = true;
        codeToExecute = payload.pull_request.body; // Extract code from PR body
      }
    } else if (payload.action === "created") {
      // Check the comment for the /execute command
      if (payload.comment.body.includes("/execute")) {
        commandExists = true;
        codeToExecute = payload.comment.body; // Extract code from comment
      }
    }

    if (!commandExists) return;

    try {
      // Execute the code using the Piston API
      const pistonResult = await axios.post(
        "https://emkc.org/api/v1/piston/execute",
        {
          language: "python", // Replace this with the detected language
          source: codeToExecute.replace("/execute", "").trim(),
        }
      );

      const pistonOutput = pistonResult.data.output;

      // Create a comment on the pull request with the executed output
      const issueComment = context.issue({
        body: `Hey 🖐️, Output of executed code: \n\`\`\`\n${pistonOutput}\n\`\`\``,
      });

      return context.octokit.issues.createComment(issueComment);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  });
};
