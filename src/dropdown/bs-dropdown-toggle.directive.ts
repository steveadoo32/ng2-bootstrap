import {
  Directive, ElementRef, HostBinding, HostListener, OnDestroy, Input
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { BsDropdownState } from './bs-dropdown.state';

@Directive({
  selector: '[bsDropdownToggle],[dropdownToggle]',
  exportAs: 'bs-dropdown-toggle',
  host: {
    '[attr.aria-haspopup]': 'true'
  }
})
export class BsDropdownToggleDirective implements OnDestroy {
	
  @Input('dropdownToggleIgnore')
  ignoredElements: string | string[];  
	
  @HostBinding('attr.disabled')
  isDisabled: boolean = null;

  // @HostBinding('class.active')
  @HostBinding('attr.aria-expanded') isOpen: boolean;

  @HostListener('click')
  onClick(): void {
    if (this.isDisabled) {
      return;
    }
    this._state.toggleClick.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any): void {
    if (this._state.autoClose && event.button !== 2 &&
      !this._element.nativeElement.contains(event.target) &&
	  !this.targetIsIgnoredElement(event.target)) {
      this._state.toggleClick.emit(false);
    }
  }

  @HostListener('keyup.esc')
  onEsc(): void {
    if (this._state.autoClose) {
      this._state.toggleClick.emit(false);
    }
  }

  private _subscriptions: Subscription[] = [];

  constructor(private _state: BsDropdownState,
              private _element: ElementRef) {
    // sync is open value with state
    this._subscriptions.push(this._state
      .isOpenChange.subscribe((value: boolean) => this.isOpen = value));
    // populate disabled state
    this._subscriptions.push(this._state
      .isDisabledChange
      .subscribe((value: boolean) => this.isDisabled = value || null));
  }
  
  private targetIsIgnoredElement(target: any): boolean {
	  if (this.ignoredElements == null) {
		  return false;
	  }
	  if (!Array.isArray(this.ignoredElements)) {
		  this.ignoredElements = [this.ignoredElements];
	  }
	  for(let i = 0; i < this.ignoredElements.length; i++) {
		  if (target.id === this.ignoredElements[i]) {
			  return true;
		  }
	  }
	  return false;
  }

  ngOnDestroy(): void {
    for (const sub of this._subscriptions) {
      sub.unsubscribe();
    }
  }
}
