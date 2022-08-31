const sgMail = require("@sendgrid/mail");

const sendgridAPIKey = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(sendgridAPIKey);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "mdmusaibali@gmail.com",
    subject: "Thanks for joining in!",
    text: `Welcome to the app, ${name}. Let me know how you get along with the app`,
  });
};

const sendCancelEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "mdmusaibali@gmail.com",
    subject: "Sad to see you leave us😥",
    text: `Why leave us ${name}?`,
  });
};

module.exports = { sendWelcomeEmail, sendCancelEmail };
