import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../service/chat.service';

@Component({
  selector: 'app-chat-bubble',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-bubble.component.html',
  styleUrl: './chat-bubble.component.scss',
})
export class ChatBubbleComponent implements AfterViewChecked {
  chatService = inject(ChatService);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  inputMessage: string = '';
  private shouldScrollToBottom: boolean = false;

  get messages() {
    return this.chatService.messages();
  }

  get isTyping() {
    return this.chatService.isTyping();
  }

  get isOpen() {
    return this.chatService.isOpen();
  }

  get suggestions() {
    return this.chatService.suggestions;
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  toggleChat(): void {
    this.chatService.toggleChat();
    if (this.isOpen) {
      this.shouldScrollToBottom = true;
    }
  }

  closeChat(): void {
    this.chatService.closeChat();
  }

  clearChat(): void {
    this.chatService.clearChat();
  }

  onSendMessage(): void {
    if (!this.inputMessage.trim() || this.isTyping) return;
    this.chatService.sendMessage(this.inputMessage);
    this.inputMessage = '';
    this.shouldScrollToBottom = true;
  }

  onSelectSuggestion(prompt: string): void {
    if (this.isTyping) return;
    this.chatService.sendMessage(prompt);
    this.shouldScrollToBottom = true;
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSendMessage();
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch {
      // Ignorar si el contenedor no está disponible aún
    }
  }
}
