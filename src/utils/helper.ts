import { Response } from "express";
import { HttpStatusCode } from "./enum";
import { APIError } from "./api-error";
import { UnauthenticatedError } from "./unauthenticated-error";
const bycrpt = require("bcrypt")
const saltRound = 10;
const jwt = require( 'jsonwebtoken' );
export function create_json_response(data: any = {}, success: boolean = true, message: string = "") {
    return {
        data: data,
        success: success,
        message: message
    }
}


export const handleError = (error: any, res: Response, context: string) => {
    console.error(`---[${context}]--- Error:`, error);
    if (error instanceof APIError) {
      return res
        .status(error.httpCode)
        .json(
          create_json_response(
            {},
            false,
            error.user_description
          )
        );
    }
    
    if (error instanceof UnauthenticatedError) {
      return res
        .status(error.httpCode)
        .json(
          create_json_response(
            {},
            false,
            error.message
          )
        );
    }
    
    return res
      .status(HttpStatusCode.INTERNAL_SERVER)
      .json(
        create_json_response(
          {},
          false,
          "Internal server error"
        )
      );
  };