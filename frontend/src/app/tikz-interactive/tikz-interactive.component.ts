import { AfterViewInit, Component } from '@angular/core';
import { TikzService } from './tikz.service';

@Component({
  selector: 'app-tikz-interactive',
  templateUrl: './tikz-interactive.component.html',
  styleUrls: ['./tikz-interactive.component.scss']
})
export class TikzInteractiveComponent implements AfterViewInit {

  textarea!: HTMLTextAreaElement | null;
  output!: HTMLElement | null;

  constructor(private readonly _tikzService: TikzService) { }

  ngAfterViewInit(): void {
    this.textarea = document.getElementById('tikz-code') as HTMLTextAreaElement;
    this.output = document.getElementById('output-container');

    this.textarea?.addEventListener('keyup', () => {
      this.debounce(() => this.update())();
    });
  }

  update() {
    if (!this.output || !this.textarea) return;
    const s = document.createElement('script');
    s.setAttribute('type', 'text/tikz');
    s.textContent = `${this.textarea.value}`;
    this.output.innerHTML = '';
    this.output.appendChild(s);
    this._tikzService.process_tikz(s);
  }

  debounce(fn: () => any, delay = 300) {
    let timeoutID: any;
    return () => {
      if (timeoutID) clearTimeout(timeoutID);
      timeoutID = setTimeout(() => fn(), delay);
    };
  }
}
