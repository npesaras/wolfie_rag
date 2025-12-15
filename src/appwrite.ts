import { Client, Databases, Account, Users, Storage } from "node-appwrite";

// Server-side Appwrite client (with API key for admin operations)
export const createAdminClient = () => {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://sfo.cloud.appwrite.io/v1")
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "68d50c4200125f38a48d")
    .setKey(process.env.APPWRITE_API_KEY || "standard_6e28b3e099faa55ed1565be8d441db1382c2f8b767b30a231f8b6e983644503b73e7d5cebe24b10c2e774e6e8bcf9adc158a3812be982098548d2ca3185daab6cc6f421493a56d8d3df81e37b4231f0631432ad6c621b9c4e346d7e1e06dd8f60ea35def37a6e1bc19f8ea68234ae7b0ded0a672dd1a0b8db8bef6ae3263e81c");

  return {
    client,
    databases: new Databases(client),
    account: new Account(client),
    users: new Users(client),
    storage: new Storage(client),
  };
};

// Client-side Appwrite client (for browser usage)
export const createSessionClient = () => {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://sfo.cloud.appwrite.io/v1")
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "68d50c4200125f38a48d");

  return {
    client,
    databases: new Databases(client),
    account: new Account(client),
  };
};
