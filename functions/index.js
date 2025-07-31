const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const sgMail = require("@sendgrid/mail");

const sendgridKey = functions.config().sendgrid.key;
sgMail.setApiKey(sendgridKey);

exports.sendAuctionEmail = functions.https.onCall(async (data, context) => {
  const { to, subject, text } = data;

  const msg = {
    to,
    from: "silentauctiongrp3@gmail.com",
    subject,
    text,
  };

  try {
    await sgMail.send(msg);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("SendGrid Error:", error);
    if (error.response) {
      console.error("SendGrid Response Error:", error.response.body);
    }
    // Throw an HttpsError for client to catch
    throw new functions.https.HttpsError(
      "internal",
      "Failed to send email"
    );
  }
});
