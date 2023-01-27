import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
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

  private _errorMessage$$ = new BehaviorSubject<string>('');
  public errorMessage$ = this._errorMessage$$.pipe(
    map((errorMessage) => {
      // filter out the start & end of the error message
      errorMessage = errorMessage.replace(this.errorStartRegex, '');
      errorMessage = errorMessage.replace(this.errorEndRegex, '');
      errorMessage = errorMessage.trim();
      // fix line number to match our input
      const lineMatch = errorMessage.match(/l\.(\d+)/g);
      if (lineMatch) {
        lineMatch.forEach((line) => {
          errorMessage = errorMessage.replace(
            line,
            `l.${+(line.match(/\d+/)?.[0] ?? 0) - 1}`
          );
        });
      }
      return errorMessage;
    })
  );
  public showSolution = false;
  private _texOutput = '';
  private errorRegex =
    /\*\*entering extended mode.*\? Type <return> to proceed/ms;
  private errorStartRegex = /.*\*\*entering extended mode/ms;
  private errorEndRegex = /(<\*> sample.tex)|(\? Type <return> to proceed).*/msg;

  @ViewChild('solution') solutionEl!: ElementRef;
  @ViewChild('output') output!: ElementRef;

  constructor(
    private readonly _tikzService: TikzService,
    private _cd: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    const log = console.log;
    console.log = (str) => {
      this.parseError(str);
      log(str);
    };

    this.solutionEl.nativeElement.innerHTML = this.solution;
  }

  parseError(log: string) {
    this._texOutput += log + '\n';
    this._errorMessage$$.next('');
    if (this._texOutput.includes('Emergency stop') && this.content.length > 0) {
      this._errorMessage$$.next(
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
  }

  update(content: string) {
    this._debounce(this._update)(content);
  }

  private _update(content: string) {
    if (!this.output) return;
    console.warn('write to tikz: ', content)
    this._texOutput = '';
    const s = document.createElement('script');
    s.setAttribute('type', 'text/tikz');
    s.textContent = content;
    this.output.nativeElement.innerHTML = '';
    this.output.nativeElement.appendChild(s);
    this._tikzService.process_tikz(s);
  }
}
