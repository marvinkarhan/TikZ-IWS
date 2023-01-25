import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewChild
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TikzService } from './tikz.service';

@Component({
  selector: 'app-tikz-interactive',
  templateUrl: './tikz-interactive.component.html',
  styleUrls: ['./tikz-interactive.component.scss'],
})
export class TikzInteractiveComponent implements AfterViewInit {
  private _content = '';
  @Input() public set content(value: string) {
    this._content = value;
    setTimeout(() => this.update(value), 0);
  }
  public get content() {
    return this._content;
  }
  private _solution: string | null = null;
  @Input() public set solution(value: string | null) {
    if (value) {
      this._solution = atob(value);
    } else {
      this._solution = null;
    }
  }
  public get solution() {
    return this._solution;
  }

  // public output!: HTMLElement | null;
  public errorMessage = new BehaviorSubject<string>('');
  public showSolution = false;
  private _texOutput = '';
  private errorRegex =
    /\*\*entering extended mode.*\? Type <return> to proceed/ms;

  @ViewChild('solution') solutionEl!: ElementRef;
  @ViewChild('output') output!: ElementRef;

  constructor(
    private readonly _tikzService: TikzService,
    private _cd: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    // this.output = document.getElementById('output-container');
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
      this.errorMessage.next(
        this._texOutput.match(this.errorRegex)?.[0].trim() || ''
      );
    }
    this._cd.detectChanges();
  }

  private _debounce(fn: any, ms = 500) {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), ms);
    };
  };

  update(content: string) {
    this._debounce(this._update)(content);
  }

  private _update(content: string) {
    console.warn(this.output)
    if (!this.output) return;
    this._texOutput = '';
    const s = document.createElement('script');
    s.setAttribute('type', 'text/tikz');
    s.textContent = content;
    this.output.nativeElement.innerHTML = '';
    this.output.nativeElement.appendChild(s);
    this._tikzService.process_tikz(s);
  }
}
