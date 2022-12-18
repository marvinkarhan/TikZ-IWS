import { Component } from '@angular/core';
import tasksJSON from '../assets/tasks.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public title = 'IWS';
  public tasks = tasksJSON.tasks;
}
