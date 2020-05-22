import { WebSocket } from 'https://deno.land/std/ws/mod.ts';

export interface IUserGroup {
  userId: string;
  name: string;
  groupName: string;
  ws: WebSocket;
}
export interface IEventMsgData {
  event: string;
  groupName: string;
  name: string;
  data?: string
}

export interface IEventMsgError {
  code: string;
  reason: string;
}

export interface IMessagesData {
  userId: string;
  name: string;
  message?: string;
  sender?: string;
}