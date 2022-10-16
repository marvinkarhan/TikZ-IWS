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

  public process_tikz(s: HTMLScriptElement) {
    window.process_tikz(s);
  }
}
