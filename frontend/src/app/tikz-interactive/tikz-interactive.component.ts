import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { TikzService } from './tikz.service';

@Component({
  selector: 'app-tikz-interactive',
  templateUrl: './tikz-interactive.component.html',
  styleUrls: ['./tikz-interactive.component.scss'],
})
export class TikzInteractiveComponent implements AfterViewInit {

  @Input() public content = '';
  private _solution: string | null = null;
  @Input() public set solution (value: string | null) {
    if (value) {
      this._solution = atob(value);
    } else {
      this._solution = null;
    }
  }
  public get solution() {
    console.warn('get solution: ', this._solution)
    return this._solution;
  }

  public output!: HTMLElement | null;
  public errorMessage = new BehaviorSubject<string>('');
  public showSolution = false;
  private _texOutput = '';
  private errorRegex =
    /\*\*entering extended mode.*\? Type <return> to proceed/ms;

  @ViewChild('solution') solutionEl!: ElementRef;

  constructor(
    private readonly _tikzService: TikzService,
    private _cd: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.output = document.getElementById('output-container');
    const log = console.log;
    console.log = (str) => {
      this.parseError(str);
      log(str);
    };

    this.solutionEl.nativeElement.innerHTML = this.solution;
  }

  parseError(log: string) {
    this._texOutput += log + '\n';
    this.errorMessage.next('');
    if (this._texOutput.includes('Emergency stop') && this.content.length > 0) {
      this.errorMessage.next(this._texOutput.match(this.errorRegex)?.[0].trim() || '');
    }
    this._cd.detectChanges();
  }

  update(content: string) {
    if (!this.output) return;
    this._texOutput = '';
    const s = document.createElement('script');
    s.setAttribute('type', 'text/tikz');
    s.textContent = content;
    this.output.innerHTML = '';
    this.output.appendChild(s);
    this._tikzService.process_tikz(s);
  }
}
