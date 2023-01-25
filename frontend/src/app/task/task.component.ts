import { Component, Input, OnInit } from '@angular/core';
import { Task } from './task.interface';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent {

  @Input() public questionNr: number | null = null;
  @Input() public task: Task | null = null;

  constructor() { }
}
