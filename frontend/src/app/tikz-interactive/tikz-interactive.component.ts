import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
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
export class TikzInteractiveComponent implements OnInit, AfterViewInit {
  private _content = '';
  @Input() public set content(value: string) {
    this._content = value;
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

  @Input() public templateCode = '';

  @Input() public id: number | undefined = undefined;

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
            `l.${+(line.match(/\d+/)?.[0] ?? 0)} - 1`
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
  private errorEndRegex =
    /(<\*> sample.tex)|(\? Type <return> to proceed).*/gms;

  @ViewChild('solution') solutionEl!: ElementRef;
  @ViewChild('output') output!: ElementRef;

  constructor(
    private readonly _tikzService: TikzService,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // read from local storage if available
    if (this.id !== undefined) {
      const code = localStorage.getItem(`tikz-code-${this.id}`);
      if (code) {
        this.content = code;
      }
    }
  }

  ngAfterViewInit(): void {
    const log = console.log;
    console.log = (str) => {
      this.parseError(str);
      log(str);
    };

    if (this.solution) {
      this.solutionEl.nativeElement.innerHTML = this.solution;
    }
  }

  parseError(log: string) {
    // filter library calls
    if (typeof log === 'string' && log.includes('tikzlibrary')) return;
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

  update(content?: string) {
    this._debounce(this._update)(content || this.content);
  }

  private _update(content: string) {
    if (!this.output) return;
    if (this.id !== undefined) {
      localStorage.setItem(`tikz-code-${this.id}`, content);
    }
    this._errorMessage$$.next('');
    this._texOutput = '';
    const s = document.createElement('script');
    s.setAttribute('type', 'text/tikz');
    // add tikzlibarys
    s.setAttribute('data-tikz-libraries', 'positioning,shapes,quotes,graphs,arrows');
    // enable loging to capture errors
    s.setAttribute('data-show-console', 'true');
    s.textContent = content;
    this.output.nativeElement.innerHTML = '';
    this.output.nativeElement.appendChild(s);
    this._tikzService.process_tikz(s);
  }

  reset() {
    if (confirm('Are you sure you want to reset?') && this.id !== undefined && this.templateCode) {
      localStorage.removeItem(`tikz-code-${this.id}`);
      this.content = this.templateCode;
    }
  }
}
