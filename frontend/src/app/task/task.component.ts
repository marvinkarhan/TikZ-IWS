import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent {

  @Input() public question = 'Das ist eine Frage?';
  @Input() public questionNr: number | null = null;
  @Input() public solution: string | null = null;

  constructor() { }
}
