import { isWebSocketCloseEvent, WebSocket } from 'https://deno.land/std/ws/mod.ts';
import { v4 } from 'https://deno.land/std/uuid/mod.ts';
import { IUser, IUserGroup, IEventMsgData} from './model/index.ts';

/**
 * userId: {
 *  name: string,
 *  groupName: string,
 *  ws: WebSocket
 * }
 */
const userMap: Map<string, IUser> = new Map();
/**
 * groupName: [user1, user2]
 * {
 *  userId: string,
 *  name: string,
 *  ws: WebSocket
 * }
 */
const groupsMap: Map<string, IUserGroup[]> = new Map();
export default async function chat(ws: WebSocket) {
  console.log('connected');

  const userId: string = v4.generate();

  for await (let data of ws) {
    if (isWebSocketCloseEvent(data)) {
      console.log("Close Connect ...")
      const userObj = userMap.get(userId);

      let users: IUserGroup[] = groupsMap.get(userObj!.groupName) || [];
      users = users.filter((usr) => usr.userId !== userId);

      groupsMap.set(userObj!.groupName, users);
      userMap.delete(userId);

      emitEvent(userObj!.groupName);

      break;
    }
    const tmp: IEventMsgData = typeof data === 'string' ? JSON.parse(data) : { ...data };
    if (!tmp.event) {
      break;
    }
    const event: IEventMsgData = tmp;

    switch (event.event) {
      case 'join':
        const userObj = {
          userId,
          name: event.name,
          groupName: event.groupName,
          ws
        };
        userMap.set(userId, userObj);

        const users = groupsMap.get(event.groupName) || [];

        users.push(userObj);
        groupsMap.set(event.groupName, users);

        emitEvent(event.groupName);
        break;

      default:
        break;
    }
  }
}

function emitEvent(groupName: string) {
  const users = groupsMap.get(groupName) || [];
  for (const user of users) {
    const event = {
      event: 'users',
      data: getDisplayUser(groupName)
    };
    user.ws.send(JSON.stringify(event));
  }
}

function getDisplayUser(groupName: string) {
  const users = groupsMap.get(groupName) || [];

  return users.map((u) => {
    return { userId: u.userId, name: u.name };
  });
}
