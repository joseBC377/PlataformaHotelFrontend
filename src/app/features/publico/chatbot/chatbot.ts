import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatResponse } from '../../../core/services/chatbot';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  transcription?: string;
  toolCall?: any;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.scss'
})
export class Chatbot {
  isOpen = false;
  isRecording = false;
  loading = false;
  inputText = '';

  messages: Message[] = [
    { sender: 'assistant', text: '¡Hola! Bienvenido al Hotel Royal Suites. ¿En qué puedo ayudarte hoy?' }
  ];

  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor(private chatbotService: ChatbotService) {}

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.processAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      this.mediaRecorder.start();
      this.isRecording = true;
    } catch (err) {
      console.error('Error al acceder al micrófono:', err);
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  processAudio(blob: Blob): void {
    this.loading = true;
    this.chatbotService.enviarAudio(blob).subscribe({
      next: (res: ChatResponse) => {
        this.messages.push({
          sender: 'user',
          text: res.transcription || 'Mensaje de voz recibido',
          transcription: res.transcription
        });
        this.messages.push({
          sender: 'assistant',
          text: res.response,
          toolCall: res.toolCall
        });
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  sendMessage(): void {
    if (!this.inputText.trim()) return;
    const msg = this.inputText.trim();
    this.messages.push({ sender: 'user', text: msg });
    this.inputText = '';
    this.loading = true;

    this.chatbotService.enviarTexto(msg).subscribe({
      next: (res: ChatResponse) => {
        this.messages.push({
          sender: 'assistant',
          text: res.response,
          toolCall: res.toolCall
        });
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }
}