import { Injectable } from '@angular/core';
import '../../assets/scripts/tikzjax.js';


declare global {
  interface Window { process_tikz: any; }
}

window.process_tikz = window.process_tikz || {};

@Injectable({
  providedIn: 'root'
})
export class TikzService {

  constructor() { }

  public async process_tikz(s: HTMLScriptElement) {
    while(typeof window.process_tikz !== 'function') {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    window.process_tikz(s);
  }
}
