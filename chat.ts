import { isWebSocketCloseEvent, WebSocket } from 'https://deno.land/std/ws/mod.ts';
import { v4 } from 'https://deno.land/std/uuid/mod.ts';
import { IUserGroup, IEventMsgData, IMessagesData } from './model/index.ts';

/**
 * userId: {
 *  name: string,
 *  groupName: string,
 *  ws: WebSocket
 * }
 */
const userMap: Map<string, IUserGroup> = new Map();
/**
 * groupName: [user1, user2]
 * {
 *  userId: string,
 *  name: string,
 *  ws: WebSocket
 * }
 */
const groupsMap: Map<string, IUserGroup[]> = new Map();
/**
 * groupName: [message1,message2,...]
 * 
 * {
 *  userId: string,
 *  name: string,
 *  message: string
 * }
 */
const messagesMap: Map<string, IMessagesData[]> = new Map();


export default async function chat(ws: WebSocket) {
  console.log('connected');

  const userId: string = v4.generate();

  for await (let data of ws) {
    if (isWebSocketCloseEvent(data)) {
      console.log("Close Connect ...");

      const userObj = userMap.get(userId);
      if (!userObj) {
        break;
      }
      let users: IUserGroup[] = groupsMap.get(userObj!.groupName) || [];
      users = users.filter((usr) => usr.userId !== userId);

      groupsMap.set(userObj!.groupName, users);
      userMap.delete(userId);

      emitUserList(userObj!.groupName);

      break;
    }
    const tmp: IEventMsgData = typeof data === 'string' ? JSON.parse(data) : { ...data };
    if (!tmp.event) {
      break;
    }
    const event: IEventMsgData = tmp;
    let userObj: IUserGroup | undefined;
    switch (event.event) {
      case 'join':
        userObj = {
          userId,
          name: event.name,
          groupName: event.groupName,
          ws
        };
        userMap.set(userId, userObj);

        const users = groupsMap.get(event.groupName) || [];

        users.push(userObj);
        groupsMap.set(event.groupName, users);

        emitUserList(event.groupName);
        emitPreviousMessage(event.groupName, ws)
        break;
      case 'message':
        userObj = userMap.get(userId);
        const message: IMessagesData = {
          userId,
          name: userObj!.name,
          message: event.data,
        }
        const messages = messagesMap.get(userObj!.groupName) || [];
        messages.push(message);
        messagesMap.set(userObj!.groupName, messages);
        emitMessage(userObj!.groupName, message, userId);
        break;
      default:
        break;
    }
  }
}
async function emitMessage(groupName: string, message: IMessagesData, senderId: string) {
  const users = groupsMap.get(groupName) || [];

  for await (const user of users) {
    const tmpMessage = {
      ...message,
      sender: user.userId === senderId ? 'me' : senderId
    }
    const event = {
      event: 'message',
      data: tmpMessage
    };
    user.ws.send(JSON.stringify(event));
  }
}
async function emitUserList(groupName: string) {
  const users = groupsMap.get(groupName) || [];
  for await (const user of users) {
    const event = {
      event: 'users',
      data: getDisplayUser(groupName)
    };
    user.ws.send(JSON.stringify(event));
  }
}
async function emitPreviousMessage(groupName: string, ws: WebSocket) {
  const messages = messagesMap.get(groupName) || [];

  const event = {
    event: 'previousMessages',
    data: messages
  }

  ws.send(JSON.stringify(event));
}

function getDisplayUser(groupName: string) {
  const users = groupsMap.get(groupName) || [];

  return users.map((u) => {
    return { userId: u.userId, name: u.name };
  });
}
