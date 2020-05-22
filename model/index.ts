import { WebSocket } from 'https://deno.land/std/ws/mod.ts';

export interface IUser {
  name: string;
  groupName: string;
  ws: WebSocket;
}
export interface IUserGroup {
  userId: string,
  name: string,
  ws: WebSocket
}
export interface IEventMsgData {
  event: string,
  groupName: string,
  name: string
}

export interface IEventMsgError {
  code: string,
  reason: string
}