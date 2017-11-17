import {expect} from 'chai';
import {success, failure} from '../../../src/utils/try';
import {createChatTask, resourceNotFound} from '../../../src/example-chat/tasks/create-chat';
import {forbidden} from '../../../src/example-chat/core';
import {fetchChat, fetchUser, saveChat} from '../../../src/example-chat/effects';

describe('The create chat task', () => {
  const request = {
    chatId: 'some chat id',
    title: 'some chat title',
    actorId: 'user1',
  };

  it('success scenario', () => {
    const user = {
      id: request.actorId
    };
    const expectedResult = success({
      id: request.chatId,
      title: request.title,
      owner: {id: request.actorId},
      messageThreads: {},
      participants: [{id: request.actorId}],
    });

    const task = createChatTask(request);

    expect(task.next()).to.be.deep.equal({
      done: false,
      value: [
        fetchChat(request.chatId),
        fetchUser(request.actorId),
      ],
    });

    expect(task.next([user, undefined])).to.be.deep.equal({
      done: false,
      value: saveChat(expectedResult.result),
    });

    expect(task.next({ok: true})).to.be.deep.equal({
      done: true,
      value: expectedResult,
    });
  });

  describe('failure scenarios', () => {
    it('given the actor does not exist, then a resource not found error is returned', () => {
      const task = createChatTask(request);

      task.next();

      expect(task.next([undefined, undefined])).to.be.deep.equal({
        done: true,
        value: failure(
          resourceNotFound({
            resourceType: 'ACTOR',
            resourceId: request.actorId,
          })
        ),
      });
    });

    it('given the business logic returns a failure, then it will be returned as it is', () => {
      const actor = {id: request.actorId};
      const chat = {
        id: request.chatId,
        title: request.title,
        owner: {id: 'not the actor'},
        messageThreads: {},
        participants: [{id: request.actorId}],
      };
      const task = createChatTask(request);

      task.next();

      expect(task.next([actor, chat])).to.be.deep.equal({
        done: true,
        value: failure(forbidden(actor))
      });
    });

    it('given that there was an error thrown fetching the chat or the actor, then it will be rethrown', () => {
      const error = 'error with db';
      const task = createChatTask(request);

      task.next();

      expect(() => task.throw(error)).to.throw(error);
    });

    it('given that there was an error thrown saving the chat, then it will be rethrown', () => {
      const error = 'error with db';
      const task = createChatTask(request);

      task.next();

      task.next([{id: request.actorId}, undefined]);

      expect(() => task.throw(error)).to.throw(error);
    });
  });
});
