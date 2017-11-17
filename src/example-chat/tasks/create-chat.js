import {success, failure} from '../../utils/try';
import {saveChat, fetchChat, fetchUser} from '../effects';
import {create} from '../core';

export const resourceNotFound = ({resourceType, resourceId}) => ({
  error: 'RESOURCE_NOT_FOUND',
  resourceType,
  resourceId
});

export function* createChatTask({chatId, title, actorId}) {
  const [actor, currentChat] = yield [
    fetchChat(chatId),
    fetchUser(actorId),
  ];

  if (!actor) {
    return failure(resourceNotFound({
      resourceId: actorId,
      resourceType: 'ACTOR',
    }));
  }

  const {ok, result: newChat, errors} = create(currentChat, {
    id: chatId,
    title,
    actor
  });

  if (!ok) {
    return {ok, errors};
  }

  yield saveChat(newChat);

  return success(newChat);
}
