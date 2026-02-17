class AppError extends Error{
    constructor(errors = null,statusCode = 500 ,message){
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true;
        Error.captureStackTrace(this,this.constructor);
    }
}

export default AppError;