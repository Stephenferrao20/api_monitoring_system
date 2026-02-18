import amqp from "amqplib";
import logger from "./logger.js";
import config from "./index.js";

class RabbitmqConnection{
    constructor(){
        this.connection = null;
        this.channel = null;
        this.isConnecting = false;
    }

    async connect(retries = 12, delay = 5000) {
    if (this.channel) return this.channel;

    if (this.isConnecting) {
        await new Promise(resolve => {
            const interval = setInterval(() => {
                if (!this.isConnecting) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
        return this.channel;
    }

    this.isConnecting = true;

    while (retries > 0) {
        try {
            logger.info(`Connecting to RabbitMQ: ${config.rabbitmq.url}`);

            this.connection = await amqp.connect(config.rabbitmq.url);
            this.channel = await this.connection.createChannel();

            const dlqName = `${config.rabbitmq.queue}.dlq`;

            await this.channel.assertQueue(dlqName, { durable: true });

            await this.channel.assertQueue(config.rabbitmq.queue, {
                durable: true,
                arguments: {
                    "x-dead-letter-exchange": "",
                    "x-dead-letter-routing-key": dlqName
                }
            });

            logger.info(`RabbitMQ Connected, Queue: ${config.rabbitmq.queue}`);

            this.connection.on("close", () => {
                logger.warn("RabbitMQ connection closed");
                this.connection = null;
                this.channel = null;
            });

            this.connection.on("error", (error) => {
                logger.error("RabbitMQ connection error", error);
                this.connection = null;
                this.channel = null;
            });

            this.isConnecting = false;
            return this.channel;

        } catch (error) {
            retries--;
            logger.warn(`RabbitMQ not ready. Retrying in ${delay/1000}s... (${retries} retries left)`);

            await new Promise(res => setTimeout(res, delay));
        }
    }

    this.isConnecting = false;
    throw new Error("RabbitMQ connection failed after retries");
}


    getChannel(){
        return this.channel;
    }

    getStatus(){
         if (!this.connection) return "disconnected";
         if (this.connection.closing) return "closing";
         return "connected";
    }

    async close(){
        try {
            if(this.channel){
                await this.channel.close();
                this.channel = null;
            }

            if(this.connection){
                await this.connection.close();
                this.connection = null;
            }

            logger.info("RabbitMQ Connection closed");
        } catch (error) {
            logger.error("Error in closing RabbitMQ ", error);
        }
    }
}

export default new RabbitmqConnection();