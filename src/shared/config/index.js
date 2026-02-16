import dotenv from "dotenv"

dotenv.config()

const config = {
    // Server Config 
    node_env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || "5000", 10),
    
    // MongDb Config 
    mongo: {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017/api_monitoring',
        dbName: process.env.MONGO_DB_NAME || 'api_monitoring'
    },

    // Postgresql Config 
    postgres: {
        host: process.env.PG_HOST || 'localhost',
        port: process.env.PG_PORT || parseInt('5432',10),
        database: process.env.PG_DATABASE || 'api_monitoring',
        user: process.env.PG_USER || 'postgres',
        password: process.env.PG_PASSWORD || 'postgres'
    },

    // Rabbitmq Config 
    rabbitmq: {
        url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
        queue: process.env.RABBITMQ_QUEUE || 'api_hits',
        publisherConfirms: process.env.RABBITMQ_PUBLISHER_CONFIRMS === 'true' || false,
        retryAttempts: parseInt(process.env.RABBITMQ_RETRY_ATTEMPTS || '3',10),
        retryDelay: parseInt(process.env.RABBITMQ_RETRY_DELAY || '1000',10) , 
    },

    // Jsonwebtoken Config 
    jwt: {
        secret: process.env.JWT_SECRET || 'jwt_secret_key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },

    // Rate Limit Config 
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, '900000',10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS , '1000',10)
    }
}

export default config;