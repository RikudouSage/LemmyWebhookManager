import {Component, EventEmitter, Input, Output, signal} from '@angular/core';
import {Observable} from "rxjs";
import {TranslatorService} from "../../services/translator.service";
import {AsyncPipe, NgIf} from "@angular/common";
import {MessageType} from "../../services/message.service";

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe
  ],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent {
  protected readonly MessageType = MessageType;

  public isDeleted = signal(false);

  @Input() kind: MessageType = MessageType.Success;
  @Input() message: string = '';

  @Output() deleted: Observable<void> = new EventEmitter<void>();

  constructor(
    private readonly translator: TranslatorService,
  ) {
  }


  public async remove(): Promise<void> {
    this.isDeleted.set(true);
    (this.deleted as EventEmitter<void>).next();
  }

  public get title(): Observable<string> {
    switch (this.kind) {
      case MessageType.Error:
        return this.translator.get('notification.error');
      case MessageType.Success:
        return this.translator.get('notification.success');
      case MessageType.Warning:
        return this.translator.get('notification.warning');
    }
  }
}
