const { promisify } = require("es6-promisify");
const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

exports.sendVerification = async (options) => {
  const mailOptions = {
    from: "LinkSaver Support <someemail@somedomain.com>",
    to: options.email,
    subject: "Welcome to LinkSaver!",
    html: `<p>Welcome to LinkSaver! Please verify your email by clicking <a href="${process.env.UI_URL}/verify/${options.token}">here</a>.</p>`,
  };

  const sendMail = promisify(transport.sendMail.bind(transport));

  return sendMail(mailOptions);
};
