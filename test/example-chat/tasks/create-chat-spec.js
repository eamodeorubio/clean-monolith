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

    const {done: done1, value: [fetchChatEffect, fetchActorEffect]} = task.next();

    expect(done1).to.be.not.ok;
    expect(fetchChatEffect).to.be.deep.equal(fetchChat(request.chatId));
    expect(fetchActorEffect).to.be.deep.equal(fetchUser(request.actorId));

    const {done: done2, value: saveChatEffect} = task.next([user, undefined]);
    expect(done2).to.be.not.ok;

    expect(saveChatEffect).to.be.deep.equal(saveChat(expectedResult.result));

    const {done: done3, value: result} = task.next({ok: true});
    expect(done3).to.be.ok;
    expect(result).to.be.deep.equal(expectedResult);
  });

  describe('failure scenarios', () => {
    it('given the actor does not exist, then a resource not found error is returned', () => {
      const task = createChatTask(request);

      task.next();

      const {done, value} = task.next([undefined, undefined]);
      expect(done).to.be.ok;
      expect(value).to.be.deep.equal(failure(
        resourceNotFound({resourceType: 'ACTOR', resourceId: request.actorId})
      ));
    });

    it('given the business logic returns a failure, then it will be returned as it is', () => {
      const actor = {id: request.actorId};
      const task = createChatTask(request);

      task.next();

      const {done, value} = task.next([actor, {
        id: request.chatId,
        title: request.title,
        owner: {id: 'not the actor'},
        messageThreads: {},
        participants: [{id: request.actorId}],
      }]);
      expect(done).to.be.ok;
      expect(value).to.be.deep.equal(failure(forbidden(actor)));
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
