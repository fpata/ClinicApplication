import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Message, MessageType } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class MessageService {
  
    private subject = new Subject<Message>();
    private defaultId:number = 1;

    // enable subscribing to alerts observable
    onMessage(id = this.defaultId): Observable<Message> {
        return this.subject.asObservable().pipe(filter(x => x && x.id === id));
    }

    // convenience methods
    success(message: string, options?: any) {
        this.message(new Message({ ...options, type: MessageType.Success, message }));
    }

    error(message: string, options?: any) {
        this.message(new Message({ ...options, type: MessageType.Error, message, autoClose: false }));
    }

    info(message: string, options?: any) {
        this.message(new Message({ ...options, type: MessageType.Info, message, autoClose: true, autoCloseTimeout: 10000 }));
    }

    warn(message: string, options?: any) {
        this.message(new Message({ ...options, type: MessageType.Warning, message, autoClose: true, autoCloseTimeout: 15000 }));
    }

    // main alert method    
    message(message: Message) {
        message.id = message.id || this.defaultId;
        this.subject.next(message);
    }

    // clear alerts
    clear(id = this.defaultId) {
        this.subject.next(new Message({ id }));
    }

    sendMessage(email: string) {
    //throw new Error('Method not implemented.');
    }
}
