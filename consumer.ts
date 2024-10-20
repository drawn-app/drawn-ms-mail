import amqp, { Connection, Channel, Message } from "amqplib/callback_api";
import nodemailer from "nodemailer";

// Import dotenv and call the config function
import dotenv from "dotenv";
dotenv.config();

interface EmailData {
  to: string;
  subject: string;
  body: string;
}

async function sendEmail({ to, subject, body }: EmailData): Promise<void> {
  console.log("Sending email...");

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let mailOptions = {
    from: "laewtae.dental@gmail.com",
    to,
    subject,
    text: body,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent to:", to);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

amqp.connect(
  "amqp://localhost",
  function (error0: Error, connection: Connection) {
    if (error0) {
      throw error0;
    }

    connection.createChannel(function (error1: Error, channel: Channel) {
      if (error1) {
        throw error1;
      }

      const exchange = "mail_order";
      const queueName = "register_queue";
      const bindingKeys = ["#.register.#"];

      channel.assertExchange(exchange, "topic", { durable: true });
      channel.assertQueue(queueName, { durable: true });

      bindingKeys.forEach((bindingKey) => {
        channel.bindQueue(queueName, exchange, bindingKey);
      });

      channel.prefetch(1);
      console.log(
        " [*] Waiting for messages in %s. To exit press CTRL+C",
        queueName
      );

      channel.consume(
        queueName,
        async (message: Message | null) => {
          if (message?.content) {
            const emailData: EmailData = JSON.parse(message.content.toString());
            console.log(
              " [x] Received: request to send email from queue: %s",
              queueName
            );

            await sendEmail(emailData);

            channel.ack(message);
          }
        },
        {
          noAck: false,
        }
      );
    });
  }
);
