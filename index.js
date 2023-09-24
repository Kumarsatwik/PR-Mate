/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  // Your code here
  module.exports = (app) => {
    app.on("pull_request", async (context) => {
      const pr = context.payload.pull_request;
      console.log("Pull request");
      console.log(pr);

      // Check commits for "/execute" command
      const commitMessages = await context.github.pulls.listCommits(
        context.repo({ pull_number: pr.number })
      );
      const hasExecuteCommandInCommits = commitMessages.data.some((commit) =>
        commit.commit.message.includes("/execute")
      );

      // Check comments for "/execute" command
      const comments = await context.github.issues.listComments(
        context.repo({ issue_number: pr.number })
      );
      const hasExecuteCommandInComments = comments.data.some((comment) =>
        comment.body.includes("/execute")
      );

      if (hasExecuteCommandInCommits || hasExecuteCommandInComments) {
        // Execute your code here
        console.log("Executing code for /execute command in pull request.");

        // You can add your logic to trigger code execution here.
      }
    });
  };

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
