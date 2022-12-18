import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { TikzService } from './tikz.service';

@Component({
  selector: 'app-tikz-interactive',
  templateUrl: './tikz-interactive.component.html',
  styleUrls: ['./tikz-interactive.component.scss'],
})
export class TikzInteractiveComponent implements AfterViewInit {
  public textarea!: HTMLTextAreaElement | null;
  public output!: HTMLElement | null;
  public errorMessage = new BehaviorSubject<string>('');
  private _texOutput = '';
  private errorRegex = /(?<=\*\*entering extended mode).*(?=\? Type <return> to proceed)/ms;

  @ViewChild('outputContainer') outputContainer!: ElementRef;

  constructor(private readonly _tikzService: TikzService, private _cd: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.textarea = document.getElementById('tikz-code') as HTMLTextAreaElement;
    this.output = document.getElementById('output-container');
    const log = console.log;
    console.log = (str) => {
      this.parseError(str);
      log(str);
    };
    fromEvent(this.textarea, 'keyup')
      .pipe(debounceTime(300))
      .subscribe(() => this.update());
  }

  parseError(log: string) {
    this._texOutput += log + '\n';
    this.errorMessage.next('');
    const hasError =
      this._texOutput.includes('Emergency stop') &&
      this.textarea &&
      this.textarea.value.length > 0;
    if (hasError) {
      this.errorMessage.next(this._texOutput.match(this.errorRegex)?.[0] || '');
    }
    this._cd.detectChanges();
  }

  update() {
    if (!this.output || !this.textarea) return;
    this._texOutput = '';
    const s = document.createElement('script');
    s.setAttribute('type', 'text/tikz');
    s.textContent = `${this.textarea.value}`;
    this.output.innerHTML = '';
    this.output.appendChild(s);
    this._tikzService.process_tikz(s);
  }
}
