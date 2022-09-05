const jwt = require("jsonwebtoken");
const nodeMailer = require("nodemailer");

const generateJwtToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const sendMail = async ({ subject, to, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      subject,
      to,
      html,
    });
    console.log(info.response);

    return { status: 200, response: info.response };
  } catch (error) {
    console.log(error);
  }
};

const generateRandomColor = () => {
  const colors = [
    "#EF4770",
    "#6F6F6F",
    "#DCB604",
    "#199393",
    "#029ACD",
    "#11C1DA",
    "#3B8FFC",
    "#18C6A0",
    "#B387FF",
    "#F75334",
  ];

  let index = Math.floor(Math.random() * colors.length);
  return colors[index];
};

const getPagination = ({ list, page, limit, total }) => {
  return {
    pageMeta: {
      limit,
      page,
      total,
      totalPages: Math.ceil(total / limit),
    },
    list,
  };
};

module.exports = {
  generateJwtToken,
  generateRandomColor,
  getPagination,
  sendMail,
};
