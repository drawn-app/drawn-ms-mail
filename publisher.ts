#!/usr/bin/env node

import amqp, { Connection, Channel } from "amqplib/callback_api";
import dotenv from "dotenv";
dotenv.config();

interface MailMessage {
  to: string;
  subject: string;
  body: string;
}

const mailMessage: MailMessage = {
  to: "wbook12514@gmail.com",
  subject: "Confirmation Emaill",
  body: "Please click the confirmation link to complete the registration process",
};

amqp.connect(
  "amqp://localhost",
  function (error0: Error | null, connection: Connection) {
    if (error0) {
      throw error0;
    }

    connection.createChannel(function (error1: Error | null, channel: Channel) {
      if (error1) {
        throw error1;
      }

      const exchange = "mail_order";
      const routingKey = "email.register";

      channel.assertExchange(exchange, "topic", {
        durable: true,
      });

      channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(mailMessage))
      );
      console.log(
        " [x] Sent '%s' with routing key: '%s'",
        JSON.stringify(mailMessage),
        routingKey
      );
    });
  }
);
