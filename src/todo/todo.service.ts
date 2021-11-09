import { Injectable } from '@nestjs/common';
import { Todo } from './todo.interface';

@Injectable()
export class TodoService {
  private storage: Todo[] = [];

  findAll() {
    return this.storage;
  }

  create(todo: Todo) {
    const currentMaxId = Math.max(...this.storage.map((t) => t.id));
    todo.id = currentMaxId > 0 ? currentMaxId + 1 : 1;
    this.storage.push(todo);
  }

  findOne(id: number) {
    return this.storage.find((t) => t.id === id);
  }

  update(id: number, todo: Todo) {
    const index = this.storage.findIndex((t) => t.id === id);
    this.storage[index] = todo;
  }

  remove(id: number) {
    const index = this.storage.findIndex((t) => t.id === id);
    this.storage.splice(index, 1);
  }
}
