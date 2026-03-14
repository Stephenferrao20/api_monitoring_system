import logger from "../../../shared/config/logger.js";
import { APPLICATION_ROLES, isValidClientRole } from "../../../shared/constants/roles.js";
import AppError from "../../../shared/utils/AppError.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export class ClientService{
    constructor(dependencies){
        if(!dependencies){
            throw new Error("Dependencies are required");
        };

        if(!dependencies.clientRepository){
            throw new Error("Client Repository Dependencies are required");
        }

        if(!dependencies.apiKeyRepository){
            throw new Error("API Key Repository Dependencies are required");
        }

        if(!dependencies.userRepository){
            throw new Error("User Repository Dependencies are required");
        }

        this.clientRepository = dependencies.clientRepository;
        this.apiKeyRepository = dependencies.apiKeyRepository;
        this.userRepository = dependencies.userRepository;

    };

    formatClientForResponse(user){
        const userObj = user.toObject ? user.toObject() : { ...user };
        delete userObj.password;
        return userObj;
    }

    generateSlug(name){
        return name.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
    }

    async createClient(clientData , adminUser){
        try {
            const { name , email , description , website } = clientData;

            const slug = this.generateSlug(name);

            const existingClient = await this.clientRepository.findBySlug(slug);

            if(existingClient){
                throw new AppError(`Client with slug ${slug} already exists `, 400);
            }

            const client = await this.clientRepository.create({
                name,
                slug,
                email,
                description,
                website,
                createdBy: adminUser.userId
            });

            return client;
        } catch (error) {
            logger.error("Error creating client: ", error);
        }
    }


    canUserAccessClient(user , clientId){
        if(user.role === APPLICATION_ROLES.SUPER_ADMIN){
            return true;
        }
        return user.clientId && user.clientId.toString() === clientId.toString(); 
    }


    async createClientUser(clientId , userData , adminUser){
        try {
            if(!this.canUserAccessClient(adminUser , clientId)){
                throw new AppError(null,403,"Access Denied");
            }

            const { username , email , password , role = APPLICATION_ROLES.CLINET_VIEWER} = userData;

            if(!isValidClientRole(role)){
                throw new AppError(null , 400 , "Invalid role for client user")
            }

            const client = await this.clientRepository.findById(clientId);

            if(!client){
                throw new AppError(null , 404 , "Client not found");
            }

            let permissions = {
                canCreateApiKeys: false,
                canManageUsers: false,
                canViewAnalytics: true,
                canExportData: false
            };

            if(role === APPLICATION_ROLES.CLIENT_ADMIN){
                permissions = {
                canCreateApiKeys: true,
                canManageUsers: true,
                canViewAnalytics: true,
                canExportData: true
            };
            }

            const user = await this.userRepository.create({
                username,
                email,
                password,
                role,
                clientId,
                permissions
            })

            logger.info("Client user created ", {
                clientId,
                userId: user._id,
                role
            });

            return this.formatClientForResponse(user)
        } catch (error) {
            logger.error("Error creating client user : ", error);
            throw error;
        }
    }

    generateApiKey(){

        const prefix = "apim";
        const randomBytes = crypto.randomBytes(20).toString("hex");
        return `${prefix}-${randomBytes}`;
    }

    async createApiKey(clientId , keyData , adminUser){
        try {
            const client = await this.clientRepository.findById(clientId);

        if(!client){
                throw new AppError(null , 404 , "Client not found");
        }

        if(!this.canUserAccessClient(adminUser , clientId)){
                throw new AppError(null,403,"Access Denied");
        }

        if(!(adminUser.role === APPLICATION_ROLES.SUPER_ADMIN || adminUser.role === APPLICATION_ROLES.CLIENT_ADMIN)){
            throw new AppError(null , 403 ,"Access Denied - Only Super Admin and Client Admin can create API Key");
        }

        const { name , description , environment = "production" } = keyData;
        const keyId = uuidv4();
        const keyValue = this.generateApiKey();

        const apiKey = await this.apiKeyRepository.create({
            keyId,
            keyValue,
            clientId,
            name,
            description,
            environment,
            createdBy: adminUser.userId
        })

        logger.info("API Key created ", {
                apiKey
        });
        return apiKey;
        } catch (error) {
            logger.error("Error creating API Key : ", error);
            throw error;
        }
    }

    async getClientApiKey(clientId , user){
        try {
            
            if(!this.canUserAccessClient(user,clientId)){
                throw new AppError(null , 403 , "Access denied to this client");
            }

            const apiKey = await this.apiKeyRepository.findByClientId(clientId);
            const formattedResponse = apiKey.map(key => {
                const keyObj = key.toObject ? key.toObject() : key;
                delete keyObj.keyValue;
                return keyObj;
            });

            return formattedResponse;
            
        } catch (error) {
            logger.error("Error getting client API Key: ", error);
            throw error;
        }
    }
}