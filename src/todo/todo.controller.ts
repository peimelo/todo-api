import { Controller, Get, Logger } from '@nestjs/common';
import { TodoService } from './todo.service';

@Controller('todo')
export class TodoController {
  private logger = new Logger(TodoController.name);

  constructor(private readonly todoService: TodoService) {}

  @Get()
  findAll() {
    this.logger.log('Handling findAll request...');
    return this.todoService.findAll();
  }
}
