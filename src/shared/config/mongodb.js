import mongoose from "mongoose";
import logger from "./logger";
import config from "./index";


class MongoConnection{
    constructor(){
        this.connection = null;
    }

     async connect(){
        try {
            if(this.connection){
                logger.info("MongoDB already connected");
                return this.connection;
            }
            await mongoose.connect(config.mongo.uri,{
                dbName: config.mongo.dbName
            })

            this.connection = mongoose.connection;
            
            logger.info(`MongoDB connected: ${config.mongo.uri}`);

            this.connection.on("error",err =>{
                logger.error("MongoDB Connection Error ", err);
            })

            this.connection.on("disconnected",err =>{
                logger.error("MongoDB Disconnected");
            })

            return this.connection;
        } catch (error) {
            logger.error("Failed to connect MongoDB: ",error);
            throw error;
        }
     }


     async disconnect(){
        try {
            if(this.connection){
                await mongoose.disconnect();
                this.connection = null;
                logger.info("MongoDB Disconnected");
            }
        } catch (error) {
            logger.error("Failed to Disconnect MongoDB: ",error);
            throw error;
        }
     }


     getConnection(){
        return this.connection;
     }
}

export default MongoConnection;