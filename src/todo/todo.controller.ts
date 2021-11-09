import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { Todo } from './todo.interface';
import { TodoService } from './todo.service';

@Controller('todo')
export class TodoController {
  private logger = new Logger(TodoController.name);

  constructor(private readonly todoService: TodoService) {}

  @Get()
  findAll() {
    this.logger.log('Handling findAll() request...');
    return this.todoService.findAll();
  }

  @Post()
  create(@Body() todo: Todo) {
    this.logger.log('Handling create() request...');
    this.todoService.create(todo);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log('Handling findOne() request for id=' + id + '...');
    return this.todoService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() todo: Todo) {
    this.logger.log('Handling update() request...');
    this.todoService.update(id, todo);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    this.logger.log('Handling remove() request for id=' + id + '...');
    this.todoService.remove(id);
  }
}
