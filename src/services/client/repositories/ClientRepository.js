import BaseClientRepository from "./BaseClientRepository.js";
import Client from "../../../shared/models/Client.js";
import logger from "../../../shared/config/logger.js";

class MongoClientRepository extends BaseClientRepository{
    constructor(){
        super(Client);
    }

    async create(clientData){
        try {
            const client = new this.model(clientData);
            await client.save();

            await client.populate({
                        path: "createdBy",
                        select: "-password"
                    });

            logger.info("Client created in MongoDB",{
                mongoId : client._id,
                slug : client.slug
            })

            return client;
        } catch (error) {
            logger.error("Error creating client in mongodb ", error);
            throw error;
        }
    }

    async findById(clientId){
        try {
            const client = await this.model.findById(clientId);
           
            logger.info("Client details from MongoDB",client)

            return client;
        } catch (error) {
            logger.error("Error finding client in mongodb by id ", error);
            throw error;
        }
    }

    async findBySlug(slug){
        try {
            const client = await this.model.findOne({ slug });
           
            logger.info("Client details from MongoDB using slug ",client)

            return client;
        } catch (error) {
            logger.error("Error finding client in mongodb by slug ", error);
            throw error;
        }
    }

    async find(filters = {} , options = {}){
        try {
            const { limit = 50 , skip = 0 , sort = { createdAt: -1 }} = options;

            const clients = await this.model.find(filters)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .select('-__v');
           
            logger.info("Client details from MongoDB",clients)
            return clients;
        } catch (error) {
            logger.error("Error finding client ", error);
            throw error;
        }
    }

    async count(filters = {}){
        try {
            const count = await this.model.countDocuments(filters);
            return count;
        } catch (error) {
            logger.error("Error counting clients ", error);
            throw error;
        }
    }
}

export default new MongoClientRepository();