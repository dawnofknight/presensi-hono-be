import { Context } from "hono";
import { AuthPayload } from "./lib/auth";

declare module "hono" {
  interface ContextVariableMap {
    user: AuthPayload;
  }
}